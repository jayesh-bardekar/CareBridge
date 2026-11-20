package com.carebridge.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.carebridge.audit.enums.AuditAction;
import com.carebridge.audit.service.AuditLogService;
import com.carebridge.auth.dto.LoginResponse;
import com.carebridge.auth.dto.UserLoginRequest;
import com.carebridge.auth.dto.UserRegistrationRequest;
import com.carebridge.auth.dto.UserResponse;
import com.carebridge.auth.service.AuthService;
import com.carebridge.auth.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.authentication.BadCredentialsException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final UserService userService;
	private final AuthService authService;
	private final AuditLogService auditLogService;

	public AuthController(UserService userService, AuthService authService, AuditLogService auditLogService) {

		this.userService = userService;
		this.authService = authService;
		this.auditLogService = auditLogService;
	}

	// User Registration API
	@PostMapping("/register")
	public ResponseEntity<UserResponse> registerUser(@Valid @RequestBody UserRegistrationRequest request,
			HttpServletRequest httpRequest) {

		UserResponse response = userService.registerUser(request);

		// Record registration activity
		auditLogService.logActivity(response.getEmail(), AuditAction.USER_REGISTERED,
				"New patient registered successfully", httpRequest.getRemoteAddr());

		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	// User Login API
	@PostMapping("/login")
	public ResponseEntity<LoginResponse> loginUser(
	        @Valid @RequestBody UserLoginRequest request,
	        HttpServletRequest httpRequest) {

	    try {

	        LoginResponse response = authService.login(request);

	        // Record successful login activity
	        auditLogService.logActivity(
	                response.getUser().getEmail(),
	                AuditAction.USER_LOGIN,
	                "User logged in successfully",
	                httpRequest.getRemoteAddr()
	        );

	        return ResponseEntity.ok(response);

	    } catch (BadCredentialsException exception) {

	        // Record failed login activity
	        auditLogService.logActivity(
	                request.getEmail(),
	                AuditAction.LOGIN_FAILED,
	                "Failed login attempt",
	                httpRequest.getRemoteAddr()
	        );

	        throw exception;
	    }
	}
}