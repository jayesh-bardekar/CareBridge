package com.carebridge.admin.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.carebridge.admin.dto.AdminPatientResponse;
import com.carebridge.admin.dto.AdminUserStatusRequest;
import com.carebridge.admin.service.AdminPatientService;

@RestController
@RequestMapping("/api/admin/patients")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPatientController {

	private final AdminPatientService adminPatientService;

	public AdminPatientController(AdminPatientService adminPatientService) {
		this.adminPatientService = adminPatientService;
	}

	// Get all patients with optional filters
	@GetMapping
	public ResponseEntity<List<AdminPatientResponse>> getAllPatients(@RequestParam(required = false) String gender,
			@RequestParam(required = false) String bloodGroup, @RequestParam(required = false) String keyword) {

		return ResponseEntity.ok(adminPatientService.getAllPatients(gender, bloodGroup, keyword));
	}

	// Get patient details
	@GetMapping("/{patientId}")
	public ResponseEntity<AdminPatientResponse> getPatientById(@PathVariable Long patientId) {

		return ResponseEntity.ok(adminPatientService.getPatientById(patientId));
	}

	// Activate or deactivate patient account
	@PatchMapping("/{patientId}/status")
	public ResponseEntity<AdminPatientResponse> updatePatientAccountStatus(@PathVariable Long patientId,
			@RequestBody AdminUserStatusRequest request) {

		return ResponseEntity.ok(adminPatientService.updatePatientAccountStatus(patientId, request.isEnabled()));
	}

	// Soft delete patient account
	@DeleteMapping("/{patientId}")
	public ResponseEntity<Void> deletePatient(@PathVariable Long patientId) {

		adminPatientService.deletePatient(patientId);

		return ResponseEntity.noContent().build();
	}
}