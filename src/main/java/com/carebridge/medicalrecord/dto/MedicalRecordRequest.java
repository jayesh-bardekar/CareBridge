package com.carebridge.medicalrecord.dto;

import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

public class MedicalRecordRequest {

	@NotNull(message = "Patient ID is required")
	private Long patientId;

	@NotBlank(message = "Title is required")
	@Size(max = 150, message = "Title cannot exceed 150 characters")
	private String title;

	@NotBlank(message = "Diagnosis is required")
	@Size(max = 1000, message = "Diagnosis cannot exceed 1000 characters")
	private String diagnosis;

	@Size(max = 1000, message = "Symptoms cannot exceed 1000 characters")
	private String symptoms;

	@Size(max = 2000, message = "Treatment cannot exceed 2000 characters")
	private String treatment;

	@Size(max = 2000, message = "Notes cannot exceed 2000 characters")
	private String notes;

	@PastOrPresent(message = "Record date cannot be in the future")
	private LocalDate recordDate;

	public Long getPatientId() {
		return patientId;
	}

	public void setPatientId(Long patientId) {
		this.patientId = patientId;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDiagnosis() {
		return diagnosis;
	}

	public void setDiagnosis(String diagnosis) {
		this.diagnosis = diagnosis;
	}

	public String getSymptoms() {
		return symptoms;
	}

	public void setSymptoms(String symptoms) {
		this.symptoms = symptoms;
	}

	public String getTreatment() {
		return treatment;
	}

	public void setTreatment(String treatment) {
		this.treatment = treatment;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}

	public LocalDate getRecordDate() {
		return recordDate;
	}

	public void setRecordDate(LocalDate recordDate) {
		this.recordDate = recordDate;
	}
}