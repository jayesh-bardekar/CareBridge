package com.carebridge.admin.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.carebridge.admin.dto.AdminAppointmentResponse;
import com.carebridge.admin.service.AdminAppointmentService;
import com.carebridge.appointment.dto.AppointmentStatusRequest;
import com.carebridge.appointment.enums.AppointmentStatus;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/appointments")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAppointmentController {

	private final AdminAppointmentService adminAppointmentService;

	public AdminAppointmentController(AdminAppointmentService adminAppointmentService) {

		this.adminAppointmentService = adminAppointmentService;
	}

	// GET ALL APPOINTMENTS

	@GetMapping
	public ResponseEntity<List<AdminAppointmentResponse>> getAllAppointments(

			@RequestParam(required = false) AppointmentStatus status,

			@RequestParam(required = false) String keyword) {

		return ResponseEntity.ok(adminAppointmentService.getAllAppointments(status, keyword));
	}

	// GET APPOINTMENT BY ID

	@GetMapping("/{appointmentId}")
	public ResponseEntity<AdminAppointmentResponse> getAppointmentById(@PathVariable Long appointmentId) {

		return ResponseEntity.ok(adminAppointmentService.getAppointmentById(appointmentId));
	}

	// UPDATE APPOINTMENT STATUS

	@PatchMapping("/{appointmentId}/status")
	public ResponseEntity<AdminAppointmentResponse> updateAppointmentStatus(

			@PathVariable Long appointmentId,

			@Valid @RequestBody AppointmentStatusRequest request) {

		return ResponseEntity.ok(adminAppointmentService.updateAppointmentStatus(appointmentId, request.getStatus()));
	}
}