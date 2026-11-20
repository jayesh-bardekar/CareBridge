package com.carebridge.admin.service;

import java.util.List;
import com.carebridge.admin.dto.AdminUserResponse;

public interface AdminUserService {

	// Get all users with optional role and search filters
	List<AdminUserResponse> getAllUsers(String role, String keyword);

	// Get user details by ID
	AdminUserResponse getUserById(Long userId);

	// Activate or deactivate a user account
	AdminUserResponse updateUserStatus(Long userId, boolean enabled);

	// Delete a user account
	void deleteUser(Long userId);
}