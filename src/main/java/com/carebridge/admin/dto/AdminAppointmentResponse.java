package com.carebridge.admin.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import com.carebridge.appointment.entity.Appointment;
import com.carebridge.appointment.enums.AppointmentStatus;

public class AdminAppointmentResponse {

	private Long id;

	private Long patientId;
	private String patientName;
	private String patientEmail;

	private Long doctorId;
	private String doctorName;
	private String doctorEmail;
	private String specialization;

	private LocalDate appointmentDate;
	private LocalTime startTime;
	private LocalTime endTime;

	private String reason;

	private AppointmentStatus status;

	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public AdminAppointmentResponse(Appointment appointment) {

		this.id = appointment.getId();

		this.patientId = appointment.getPatient().getId();
		this.patientName = appointment.getPatient().getUser().getFullName();
		this.patientEmail = appointment.getPatient().getUser().getEmail();

		this.doctorId = appointment.getDoctor().getId();
		this.doctorName = appointment.getDoctor().getUser().getFullName();
		this.doctorEmail = appointment.getDoctor().getUser().getEmail();
		this.specialization = appointment.getDoctor().getSpecialization().name();

		this.appointmentDate = appointment.getAppointmentDate();
		this.startTime = appointment.getStartTime();
		this.endTime = appointment.getEndTime();

		this.reason = appointment.getReason();

		this.status = appointment.getStatus();

		this.createdAt = appointment.getCreatedAt();
		this.updatedAt = appointment.getUpdatedAt();
	}

	public Long getId() {
		return id;
	}

	public Long getPatientId() {
		return patientId;
	}

	public String getPatientName() {
		return patientName;
	}

	public String getPatientEmail() {
		return patientEmail;
	}

	public Long getDoctorId() {
		return doctorId;
	}

	public String getDoctorName() {
		return doctorName;
	}

	public String getDoctorEmail() {
		return doctorEmail;
	}

	public String getSpecialization() {
		return specialization;
	}

	public LocalDate getAppointmentDate() {
		return appointmentDate;
	}

	public LocalTime getStartTime() {
		return startTime;
	}

	public LocalTime getEndTime() {
		return endTime;
	}

	public String getReason() {
		return reason;
	}

	public AppointmentStatus getStatus() {
		return status;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}
}