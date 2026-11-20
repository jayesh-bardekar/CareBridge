package com.carebridge.admin.dto;

import java.time.LocalDateTime;
import com.carebridge.auth.entity.User;
import com.carebridge.auth.enums.UserRole;

public class AdminUserResponse {

	private Long id;

	private String fullName;

	private String email;

	private String phoneNumber;

	private UserRole role;

	private boolean enabled;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	public AdminUserResponse(User user) {

		this.id = user.getId();
		this.fullName = user.getFullName();
		this.email = user.getEmail();
		this.phoneNumber = user.getPhoneNumber();
		this.role = user.getRole();
		this.enabled = user.isEnabled();
		this.createdAt = user.getCreatedAt();
		this.updatedAt = user.getUpdatedAt();
	}

	public Long getId() {
		return id;
	}

	public String getFullName() {
		return fullName;
	}

	public String getEmail() {
		return email;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public UserRole getRole() {
		return role;
	}

	public boolean isEnabled() {
		return enabled;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}
}