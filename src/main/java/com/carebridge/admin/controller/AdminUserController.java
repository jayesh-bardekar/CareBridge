package com.carebridge.admin.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.carebridge.admin.dto.AdminUserResponse;
import com.carebridge.admin.dto.AdminUserStatusRequest;
import com.carebridge.admin.service.AdminUserService;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

	private final AdminUserService adminUserService;

	public AdminUserController(AdminUserService adminUserService) {
		this.adminUserService = adminUserService;
	}

	// Get all users with optional search and role filters
	@GetMapping
	public ResponseEntity<List<AdminUserResponse>> getAllUsers(@RequestParam(required = false) String role,
			@RequestParam(required = false) String keyword) {

		List<AdminUserResponse> users = adminUserService.getAllUsers(role, keyword);

		return ResponseEntity.ok(users);
	}

	// Get user details by ID
	@GetMapping("/{userId}")
	public ResponseEntity<AdminUserResponse> getUserById(@PathVariable Long userId) {

		AdminUserResponse user = adminUserService.getUserById(userId);

		return ResponseEntity.ok(user);
	}

	// Activate or deactivate a user
	@PatchMapping("/{userId}/status")
	public ResponseEntity<AdminUserResponse> updateUserStatus(@PathVariable Long userId,
			@RequestBody AdminUserStatusRequest request) {

		AdminUserResponse updatedUser = adminUserService.updateUserStatus(userId, request.isEnabled());

		return ResponseEntity.ok(updatedUser);
	}

	// Soft delete a user account
	@DeleteMapping("/{userId}")
	public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {

		adminUserService.deleteUser(userId);

		return ResponseEntity.noContent().build();
	}
}