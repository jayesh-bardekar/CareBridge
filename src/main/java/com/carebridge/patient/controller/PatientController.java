package com.carebridge.patient.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.carebridge.patient.dto.PatientRequest;
import com.carebridge.patient.dto.PatientResponse;
import com.carebridge.patient.service.PatientService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/patients/profile")
public class PatientController {

	private final PatientService patientService;

	public PatientController(PatientService patientService) {
		this.patientService = patientService;
	}

	// Create Patient Profile
	@PostMapping
	public ResponseEntity<PatientResponse> createProfile(@Valid @RequestBody PatientRequest request,
			Authentication authentication) {

		PatientResponse response = patientService.createPatientProfile(authentication.getName(), request);

		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	// Get Patient Profile
	@GetMapping
	public ResponseEntity<PatientResponse> getProfile(Authentication authentication) {

		PatientResponse response = patientService.getPatientProfile(authentication.getName());

		return ResponseEntity.ok(response);
	}

	// Update Patient Profile
	@PutMapping
	public ResponseEntity<PatientResponse> updateProfile(@Valid @RequestBody PatientRequest request,
			Authentication authentication) {

		PatientResponse response = patientService.updatePatientProfile(authentication.getName(), request);

		return ResponseEntity.ok(response);
	}
}