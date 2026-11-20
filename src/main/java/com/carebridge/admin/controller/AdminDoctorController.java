package com.carebridge.admin.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.carebridge.admin.dto.AdminDoctorResponse;
import com.carebridge.admin.dto.AdminUserStatusRequest;
import com.carebridge.admin.service.AdminDoctorService;

@RestController
@RequestMapping("/api/admin/doctors")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDoctorController {

	private final AdminDoctorService adminDoctorService;

	public AdminDoctorController(AdminDoctorService adminDoctorService) {

		this.adminDoctorService = adminDoctorService;
	}

	// Get all doctors with optional filters
	@GetMapping
	public ResponseEntity<List<AdminDoctorResponse>> getAllDoctors(
			@RequestParam(required = false) String specialization,
			@RequestParam(required = false) String approvalStatus, @RequestParam(required = false) String keyword) {

		List<AdminDoctorResponse> doctors = adminDoctorService.getAllDoctors(specialization, approvalStatus, keyword);

		return ResponseEntity.ok(doctors);
	}

	// Get doctor details
	@GetMapping("/{doctorId}")
	public ResponseEntity<AdminDoctorResponse> getDoctorById(@PathVariable Long doctorId) {

		AdminDoctorResponse doctor = adminDoctorService.getDoctorById(doctorId);

		return ResponseEntity.ok(doctor);
	}

	// Approve or reject doctor
	@PatchMapping("/{doctorId}/approval")
	public ResponseEntity<AdminDoctorResponse> updateDoctorApproval(@PathVariable Long doctorId,
			@RequestBody DoctorApprovalRequest request) {

		AdminDoctorResponse doctor = adminDoctorService.updateDoctorApproval(doctorId, request.getApprovalStatus());

		return ResponseEntity.ok(doctor);
	}

	// Activate or deactivate doctor account
	@PatchMapping("/{doctorId}/status")
	public ResponseEntity<AdminDoctorResponse> updateDoctorAccountStatus(@PathVariable Long doctorId,
			@RequestBody AdminUserStatusRequest request) {

		AdminDoctorResponse doctor = adminDoctorService.updateDoctorAccountStatus(doctorId, request.isEnabled());

		return ResponseEntity.ok(doctor);
	}

	// Approval request DTO
	public static class DoctorApprovalRequest {

		private String approvalStatus;

		public String getApprovalStatus() {
			return approvalStatus;
		}

		public void setApprovalStatus(String approvalStatus) {
			this.approvalStatus = approvalStatus;
		}
	}
}