package com.carebridge.appointment.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.carebridge.appointment.dto.AppointmentRequest;
import com.carebridge.appointment.dto.AppointmentResponse;
import com.carebridge.appointment.dto.AppointmentStatusRequest;
import com.carebridge.appointment.service.AppointmentService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

	private final AppointmentService appointmentService;

	public AppointmentController(AppointmentService appointmentService) {

		this.appointmentService = appointmentService;
	}

	// Book Appointment
	@PostMapping
	public ResponseEntity<AppointmentResponse> bookAppointment(Authentication authentication,
			@Valid @RequestBody AppointmentRequest request) {

		AppointmentResponse response = appointmentService.bookAppointment(authentication.getName(), request);

		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	// Get Patient Appointments
	@GetMapping("/patient")
	public ResponseEntity<List<AppointmentResponse>> getPatientAppointments(Authentication authentication) {

		List<AppointmentResponse> response = appointmentService.getPatientAppointments(authentication.getName());

		return ResponseEntity.ok(response);
	}

	// Get Doctor Appointments
	@GetMapping("/doctor")
	public ResponseEntity<List<AppointmentResponse>> getDoctorAppointments(Authentication authentication) {

		List<AppointmentResponse> response = appointmentService.getDoctorAppointments(authentication.getName());

		return ResponseEntity.ok(response);
	}

	// Update Appointment Status
	@PatchMapping("/{appointmentId}/status")
	public ResponseEntity<AppointmentResponse> updateAppointmentStatus(Authentication authentication,
			@PathVariable Long appointmentId, @Valid @RequestBody AppointmentStatusRequest request) {

		AppointmentResponse response = appointmentService.updateAppointmentStatus(authentication.getName(),
				appointmentId, request.getStatus());

		return ResponseEntity.ok(response);
	}

	// Cancel Appointment
	@PatchMapping("/{appointmentId}/cancel")
	public ResponseEntity<AppointmentResponse> cancelAppointment(Authentication authentication,
			@PathVariable Long appointmentId) {

		AppointmentResponse response = appointmentService.cancelAppointment(authentication.getName(), appointmentId);

		return ResponseEntity.ok(response);
	}
}