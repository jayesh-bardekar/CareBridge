package com.carebridge.auth.controller;

import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.carebridge.audit.enums.AuditAction;
import com.carebridge.audit.service.AuditLogService;
import com.carebridge.auth.dto.UserResponse;
import com.carebridge.auth.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.carebridge.auth.dto.UserRoleUpdateRequest;

@RestController
@RequestMapping("/api/users")
public class UserController {

	private final UserService userService;
	private final AuditLogService auditLogService;

	public UserController(UserService userService, AuditLogService auditLogService) {

		this.userService = userService;
		this.auditLogService = auditLogService;
	}

	@GetMapping("/{email}")
	public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email, Authentication authentication,
			HttpServletRequest httpRequest) {

		String loggedInEmail = authentication.getName();

		boolean isAdmin = authentication.getAuthorities().stream()
				.anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

		// Record-level authorization
		if (!isAdmin && !loggedInEmail.equalsIgnoreCase(email)) {

			// Record unauthorized access attempt
			auditLogService.logActivity(
					loggedInEmail,
					AuditAction.ACCESS_DENIED,
					"Unauthorized profile access attempt",
					httpRequest.getRemoteAddr());

			throw new AccessDeniedException(
					"You are not authorized to access this user's profile");
		}

		Optional<UserResponse> user = userService.getUserByEmail(email);

		if (user.isEmpty()) {
			return ResponseEntity.notFound().build();
		}

		// Record successful profile access
		auditLogService.logActivity(loggedInEmail, AuditAction.PROFILE_ACCESSED, "User profile accessed successfully",
				httpRequest.getRemoteAddr());

		return ResponseEntity.ok(user.get());
	}

	@PutMapping("/{email}/role")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<UserResponse> updateUserRole(
			@PathVariable String email,
			@RequestBody UserRoleUpdateRequest request,
			Authentication authentication,
			HttpServletRequest httpRequest) {

		UserResponse updatedUser = userService.updateUserRole(
				email, request.getRole());

		auditLogService.logActivity(
				authentication.getName(),
				AuditAction.PROFILE_ACCESSED,
				"User role updated to " + request.getRole(),
				httpRequest.getRemoteAddr());

		return ResponseEntity.status(HttpStatus.OK).body(updatedUser);
	}
}