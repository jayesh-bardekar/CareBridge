package com.carebridge.doctor.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.carebridge.doctor.dto.DoctorRequest;
import com.carebridge.doctor.dto.DoctorResponse;
import com.carebridge.doctor.service.DoctorService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

	private final DoctorService doctorService;

	public DoctorController(DoctorService doctorService) {
		this.doctorService = doctorService;
	}

	// Create Doctor Profile
	@PostMapping("/profile")
	public ResponseEntity<DoctorResponse> createProfile(@Valid @RequestBody DoctorRequest request,
			Authentication authentication) {

		DoctorResponse response = doctorService.createDoctorProfile(authentication.getName(), request);

		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	// Get Logged-in Doctor Profile
	@GetMapping("/profile")
	public ResponseEntity<DoctorResponse> getProfile(Authentication authentication) {

		DoctorResponse response = doctorService.getDoctorProfile(authentication.getName());

		return ResponseEntity.ok(response);
	}

	// Update Doctor Profile
	@PutMapping("/profile")
	public ResponseEntity<DoctorResponse> updateProfile(@Valid @RequestBody DoctorRequest request,
			Authentication authentication) {

		DoctorResponse response = doctorService.updateDoctorProfile(authentication.getName(), request);

		return ResponseEntity.ok(response);
	}

	// Get All Approved Doctors
	@GetMapping
	public ResponseEntity<List<DoctorResponse>> getApprovedDoctors() {

		List<DoctorResponse> doctors = doctorService.getApprovedDoctors();

		return ResponseEntity.ok(doctors);
	}
}