package com.carebridge.admin.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import com.carebridge.doctor.entity.Doctor;
import com.carebridge.doctor.enums.DoctorApprovalStatus;
import com.carebridge.doctor.enums.DoctorSpecialization;

public class AdminDoctorResponse {

	private Long id;
	private Long userId;

	private String fullName;
	private String email;
	private String phoneNumber;

	private DoctorSpecialization specialization;
	private String qualification;
	private Integer experienceYears;
	private BigDecimal consultationFee;

	private String about;
	private String clinicAddress;
	private String availableDays;

	private LocalTime startTime;
	private LocalTime endTime;

	private DoctorApprovalStatus approvalStatus;
	private boolean enabled;

	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public AdminDoctorResponse(Doctor doctor) {

		this.id = doctor.getId();
		this.userId = doctor.getUser().getId();

		this.fullName = doctor.getUser().getFullName();
		this.email = doctor.getUser().getEmail();
		this.phoneNumber = doctor.getUser().getPhoneNumber();

		this.specialization = doctor.getSpecialization();
		this.qualification = doctor.getQualification();
		this.experienceYears = doctor.getExperienceYears();
		this.consultationFee = doctor.getConsultationFee();

		this.about = doctor.getAbout();
		this.clinicAddress = doctor.getClinicAddress();
		this.availableDays = doctor.getAvailableDays();

		this.startTime = doctor.getStartTime();
		this.endTime = doctor.getEndTime();

		this.approvalStatus = doctor.getApprovalStatus();
		this.enabled = doctor.getUser().isEnabled();

		this.createdAt = doctor.getCreatedAt();
		this.updatedAt = doctor.getUpdatedAt();
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

	public DoctorSpecialization getSpecialization() {
		return specialization;
	}

	public String getQualification() {
		return qualification;
	}

	public Integer getExperienceYears() {
		return experienceYears;
	}

	public BigDecimal getConsultationFee() {
		return consultationFee;
	}

	public String getAbout() {
		return about;
	}

	public String getClinicAddress() {
		return clinicAddress;
	}

	public String getAvailableDays() {
		return availableDays;
	}

	public LocalTime getStartTime() {
		return startTime;
	}

	public LocalTime getEndTime() {
		return endTime;
	}

	public DoctorApprovalStatus getApprovalStatus() {
		return approvalStatus;
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