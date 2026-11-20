package com.carebridge.admin.dto;

import java.time.LocalDateTime;

public class AdminProfileResponse {

	private Long id;
	private String fullName;
	private String email;
	private String phoneNumber;
	private String role;
	private boolean enabled;
	private LocalDateTime createdAt;

	public AdminProfileResponse() {
	}

	public AdminProfileResponse(Long id, String fullName, String email, String phoneNumber, String role,
			boolean enabled, LocalDateTime createdAt) {

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

	public String getRole() {
		return role;
	}

	public boolean isEnabled() {
		return enabled;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
}