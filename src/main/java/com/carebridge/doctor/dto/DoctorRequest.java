package com.carebridge.doctor.dto;

import java.math.BigDecimal;
import java.time.LocalTime;
import com.carebridge.doctor.enums.DoctorSpecialization;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class DoctorRequest {

	@NotNull(message = "Specialization is required")
	private DoctorSpecialization specialization;

	@NotBlank(message = "Qualification is required")
	@Size(max = 150, message = "Qualification cannot exceed 150 characters")
	private String qualification;

	@NotNull(message = "Experience is required")
	@Min(value = 0, message = "Experience cannot be negative")
	private Integer experienceYears;

	@NotNull(message = "Consultation fee is required")
	@DecimalMin(value = "0.0", message = "Consultation fee cannot be negative")
	private BigDecimal consultationFee;

	@Size(max = 1000, message = "About cannot exceed 1000 characters")
	private String about;

	@NotBlank(message = "Clinic address is required")
	@Size(max = 500, message = "Clinic address cannot exceed 500 characters")
	private String clinicAddress;

	@NotBlank(message = "Available days are required")
	@Size(max = 150, message = "Available days cannot exceed 150 characters")
	private String availableDays;

	@NotNull(message = "Start time is required")
	private LocalTime startTime;

	@NotNull(message = "End time is required")
	private LocalTime endTime;

	// Getters and Setters

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
}