package com.carebridge.doctor.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import com.carebridge.auth.entity.User;
import com.carebridge.doctor.enums.DoctorSpecialization;
import jakarta.persistence.*;
import com.carebridge.doctor.enums.DoctorApprovalStatus;

@Entity
@Table(name = "doctors")
public class Doctor {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false, unique = true)
	private User user;

	@Enumerated(EnumType.STRING)
	@Column(name = "approval_status", nullable = false, length = 20, columnDefinition = "varchar(20) default 'PENDING'")
	private DoctorApprovalStatus approvalStatus = DoctorApprovalStatus.PENDING;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private DoctorSpecialization specialization;

	@Column(nullable = false, length = 150)
	private String qualification;

	@Column(nullable = false)
	private Integer experienceYears;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal consultationFee;

	@Column(length = 1000)
	private String about;

	@Column(length = 500)
	private String clinicAddress;

	@Column(length = 150)
	private String availableDays;
	private LocalTime startTime;
	private LocalTime endTime;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	@PrePersist
	protected void onCreate() {

		createdAt = LocalDateTime.now();
		updatedAt = LocalDateTime.now();
	}

	@PreUpdate
	protected void onUpdate() {

		updatedAt = LocalDateTime.now();
	}

	// Getters and Setters

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public DoctorSpecialization getSpecialization() {
		return specialization;
	}

	public void setSpecialization(DoctorSpecialization specialization) {
		this.specialization = specialization;
	}

	public String getQualification() {
		return qualification;
	}

	public void setQualification(String qualification) {
		this.qualification = qualification;
	}

	public Integer getExperienceYears() {
		return experienceYears;
	}

	public void setExperienceYears(Integer experienceYears) {
		this.experienceYears = experienceYears;
	}

	public BigDecimal getConsultationFee() {
		return consultationFee;
	}

	public void setConsultationFee(BigDecimal consultationFee) {
		this.consultationFee = consultationFee;
	}

	public String getAbout() {
		return about;
	}

	public void setAbout(String about) {
		this.about = about;
	}

	public String getClinicAddress() {
		return clinicAddress;
	}

	public void setClinicAddress(String clinicAddress) {
		this.clinicAddress = clinicAddress;
	}

	public String getAvailableDays() {
		return availableDays;
	}

	public void setAvailableDays(String availableDays) {
		this.availableDays = availableDays;
	}

	public LocalTime getStartTime() {
		return startTime;
	}

	public void setStartTime(LocalTime startTime) {
		this.startTime = startTime;
	}

	public LocalTime getEndTime() {
		return endTime;
	}

	public void setEndTime(LocalTime endTime) {
		this.endTime = endTime;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public DoctorApprovalStatus getApprovalStatus() {
		return approvalStatus;
	}

	public void setApprovalStatus(DoctorApprovalStatus approvalStatus) {
		this.approvalStatus = approvalStatus;
	}
}