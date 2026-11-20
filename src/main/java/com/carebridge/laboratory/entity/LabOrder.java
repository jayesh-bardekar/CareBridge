package com.carebridge.laboratory.entity;

import java.time.LocalDateTime;
import com.carebridge.auth.entity.User;
import com.carebridge.doctor.entity.Doctor;
import com.carebridge.laboratory.enums.LabOrderStatus;
import com.carebridge.patient.entity.Patient;
import jakarta.persistence.*;

@Entity
@Table(name = "lab_orders")
public class LabOrder {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "patient_id", nullable = false)
	private Patient patient;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "doctor_id", nullable = false)
	private Doctor doctor;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "lab_test_id", nullable = false)
	private LabTest labTest;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "assigned_lab_staff_id")
	private User assignedLabStaff;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private LabOrderStatus status;

	@Column(length = 1000)
	private String notes;

	private LocalDateTime orderedAt;

	private LocalDateTime assignedAt;

	private LocalDateTime sampleCollectedAt;

	private LocalDateTime completedAt;

	@PrePersist
	protected void onCreate() {
		orderedAt = LocalDateTime.now();

		if (status == null) {
			status = LabOrderStatus.ORDERED;
		}
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Patient getPatient() {
		return patient;
	}

	public void setPatient(Patient patient) {
		this.patient = patient;
	}

	public Doctor getDoctor() {
		return doctor;
	}

	public void setDoctor(Doctor doctor) {
		this.doctor = doctor;
	}

	public LabTest getLabTest() {
		return labTest;
	}

	public void setLabTest(LabTest labTest) {
		this.labTest = labTest;
	}

	public User getAssignedLabStaff() {
		return assignedLabStaff;
	}

	public void setAssignedLabStaff(User assignedLabStaff) {
		this.assignedLabStaff = assignedLabStaff;
	}

	public LabOrderStatus getStatus() {
		return status;
	}

	public void setStatus(LabOrderStatus status) {
		this.status = status;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}

	public LocalDateTime getOrderedAt() {
		return orderedAt;
	}

	public LocalDateTime getAssignedAt() {
		return assignedAt;
	}

	public void setAssignedAt(LocalDateTime assignedAt) {
		this.assignedAt = assignedAt;
	}

	public LocalDateTime getSampleCollectedAt() {
		return sampleCollectedAt;
	}

	public void setSampleCollectedAt(LocalDateTime sampleCollectedAt) {
		this.sampleCollectedAt = sampleCollectedAt;
	}

	public LocalDateTime getCompletedAt() {
		return completedAt;
	}

	public void setCompletedAt(LocalDateTime completedAt) {
		this.completedAt = completedAt;
	}
}