package com.carebridge.admin.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import com.carebridge.patient.entity.Patient;

public class AdminPatientResponse {

	private Long id;
	private Long userId;

	private String fullName;
	private String email;
	private String phoneNumber;

	private LocalDate dateOfBirth;
	private String gender;
	private String bloodGroup;
	private String address;

	private String emergencyContactName;
	private String emergencyContactPhone;

	private boolean enabled;

	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public AdminPatientResponse(Patient patient) {

		this.id = patient.getId();

		this.userId = patient.getUser().getId();
		this.fullName = patient.getUser().getFullName();
		this.email = patient.getUser().getEmail();
		this.phoneNumber = patient.getUser().getPhoneNumber();

		this.dateOfBirth = patient.getDateOfBirth();
		this.gender = patient.getGender();
		this.bloodGroup = patient.getBloodGroup();
		this.address = patient.getAddress();

		this.emergencyContactName = patient.getEmergencyContactName();
		this.emergencyContactPhone = patient.getEmergencyContactPhone();

		this.enabled = patient.getUser().isEnabled();

		this.createdAt = patient.getCreatedAt();
		this.updatedAt = patient.getUpdatedAt();
	}

	public Long getId() {
		return id;
	}

	public Long getUserId() {
		return userId;
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

	public LocalDate getDateOfBirth() {
		return dateOfBirth;
	}

	public String getGender() {
		return gender;
	}

	public String getBloodGroup() {
		return bloodGroup;
	}

	public String getAddress() {
		return address;
	}

	public String getEmergencyContactName() {
		return emergencyContactName;
	}

	public String getEmergencyContactPhone() {
		return emergencyContactPhone;
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