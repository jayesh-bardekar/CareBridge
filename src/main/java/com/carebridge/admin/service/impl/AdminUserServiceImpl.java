package com.carebridge.admin.service.impl;

import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.carebridge.admin.dto.AdminUserResponse;
import com.carebridge.admin.service.AdminUserService;
import com.carebridge.auth.entity.User;
import com.carebridge.auth.enums.UserRole;
import com.carebridge.auth.repository.UserRepository;

@Service
@Transactional
public class AdminUserServiceImpl implements AdminUserService {

	private final UserRepository userRepository;

	public AdminUserServiceImpl(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	// Get all users with optional role and search filters
	@Override
	@Transactional(readOnly = true)
	public List<AdminUserResponse> getAllUsers(String role, String keyword) {

		UserRole selectedRole = null;

		if (role != null && !role.isBlank()) {
			try {
				selectedRole = UserRole.valueOf(role.trim().toUpperCase(Locale.ROOT));
			} catch (IllegalArgumentException exception) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user role.");
			}
		}

		final UserRole filterRole = selectedRole;

		String searchKeyword = keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT);

		return userRepository.findAll().stream().filter(user -> filterRole == null || user.getRole() == filterRole)
				.filter(user -> {
					if (searchKeyword.isBlank()) {
						return true;
					}

					return (user.getFullName() != null
							&& user.getFullName().toLowerCase(Locale.ROOT).contains(searchKeyword))
							|| (user.getEmail() != null
									&& user.getEmail().toLowerCase(Locale.ROOT).contains(searchKeyword))
							|| (user.getPhoneNumber() != null
									&& user.getPhoneNumber().toLowerCase(Locale.ROOT).contains(searchKeyword));
				}).map(AdminUserResponse::new).toList();
	}

	// Get user details by ID
	@Override
	@Transactional(readOnly = true)
	public AdminUserResponse getUserById(Long userId) {

		User user = findUser(userId);

		return new AdminUserResponse(user);
	}

	// Activate or deactivate a user account
	@Override
	public AdminUserResponse updateUserStatus(Long userId, boolean enabled) {

		User user = findUser(userId);

		// Prevent admin from deactivating their own account
		if (!enabled && isCurrentUser(user)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,
					"You cannot deactivate your own administrator account.");
		}

		// Prevent deactivation of the last active administrator
		if (!enabled && user.isEnabled() && user.getRole() == UserRole.ADMIN) {

			checkLastActiveAdmin();
		}

		user.setEnabled(enabled);

		User updatedUser = userRepository.save(user);

		return new AdminUserResponse(updatedUser);
	}

	// Soft delete user account
	@Override
	public void deleteUser(Long userId) {

		User user = findUser(userId);

		if (!user.isEnabled()) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "User account is already inactive.");
		}

		// Prevent admin from deleting their own account
		if (isCurrentUser(user)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,
					"You cannot delete your own administrator account.");
		}

		// Prevent deletion of the last active administrator
		if (user.getRole() == UserRole.ADMIN) {
			checkLastActiveAdmin();
		}

		// Soft delete to preserve healthcare history
		user.setEnabled(false);

		userRepository.save(user);
	}

	// Prevent removal of the last active administrator
	private void checkLastActiveAdmin() {

		long activeAdmins = userRepository.findAll().stream()
				.filter(existingUser -> existingUser.getRole() == UserRole.ADMIN && existingUser.isEnabled()).count();

		if (activeAdmins <= 1) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot deactivate the last active administrator.");
		}
	}

	// Check whether the target user is the logged-in user
	private boolean isCurrentUser(User user) {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()) {
			return false;
		}

		return user.getEmail().equalsIgnoreCase(authentication.getName());
	}

	// Common user lookup
	private User findUser(Long userId) {

		return userRepository.findById(userId).orElseThrow(
				() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with ID: " + userId));
	}
}
