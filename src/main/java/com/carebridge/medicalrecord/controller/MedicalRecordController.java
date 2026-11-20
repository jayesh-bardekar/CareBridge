package com.carebridge.medicalrecord.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.carebridge.medicalrecord.dto.MedicalRecordRequest;
import com.carebridge.medicalrecord.dto.MedicalRecordResponse;
import com.carebridge.medicalrecord.service.MedicalRecordService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

	private final MedicalRecordService medicalRecordService;

	public MedicalRecordController(MedicalRecordService medicalRecordService) {
		this.medicalRecordService = medicalRecordService;
	}

	// Doctor creates medical record
	@PostMapping
	public ResponseEntity<MedicalRecordResponse> createMedicalRecord(Authentication authentication,
			@Valid @RequestBody MedicalRecordRequest request) {

		MedicalRecordResponse response = medicalRecordService.createMedicalRecord(authentication.getName(), request);

		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	// Patient views own medical records
	@GetMapping("/patient")
	public ResponseEntity<List<MedicalRecordResponse>> getPatientMedicalRecords(Authentication authentication) {

		return ResponseEntity.ok(medicalRecordService.getPatientMedicalRecords(authentication.getName()));
	}

	// Doctor views records created by them
	@GetMapping("/doctor")
	public ResponseEntity<List<MedicalRecordResponse>> getDoctorMedicalRecords(Authentication authentication) {

		return ResponseEntity.ok(medicalRecordService.getDoctorMedicalRecords(authentication.getName()));
	}

	// Patient views a specific medical record
	@GetMapping("/patient/{recordId}")
	public ResponseEntity<MedicalRecordResponse> getPatientMedicalRecordById(Authentication authentication,
			@PathVariable Long recordId) {

		return ResponseEntity.ok(medicalRecordService.getPatientMedicalRecordById(authentication.getName(), recordId));
	}

	// Doctor updates their medical record
	@PutMapping("/{recordId}")
	public ResponseEntity<MedicalRecordResponse> updateMedicalRecord(Authentication authentication,
			@PathVariable Long recordId, @Valid @RequestBody MedicalRecordRequest request) {

		return ResponseEntity.ok(medicalRecordService.updateMedicalRecord(authentication.getName(), recordId, request));
	}
}