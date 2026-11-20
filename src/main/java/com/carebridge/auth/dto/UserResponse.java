package com.carebridge.auth.dto;

import java.time.LocalDateTime;
import com.carebridge.auth.enums.UserRole;

public class UserResponse {

	private Long id;
	private String fullName;
	private String email;
	private String phoneNumber;
	private UserRole role;
	private boolean enabled;
	private LocalDateTime createdAt;

	public UserResponse(Long id, String fullName, String email, String phoneNumber, UserRole role, boolean enabled,
			LocalDateTime createdAt) {

		this.id = id;
		this.fullName = fullName;
		this.email = email;
		this.phoneNumber = phoneNumber;
		this.role = role;
		this.enabled = enabled;
		this.createdAt = createdAt;
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
}