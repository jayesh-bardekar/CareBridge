package com.carebridge.prescription.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.carebridge.prescription.dto.PrescriptionRequest;
import com.carebridge.prescription.dto.PrescriptionResponse;
import com.carebridge.prescription.service.PrescriptionService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

	private final PrescriptionService prescriptionService;

	public PrescriptionController(PrescriptionService prescriptionService) {
		this.prescriptionService = prescriptionService;
	}

	// Doctor creates a prescription
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public PrescriptionResponse createPrescription(@Valid @RequestBody PrescriptionRequest request,
			Authentication authentication) {

		return prescriptionService.createPrescription(authentication.getName(), request);
	}

	// Patient views their prescriptions
	@GetMapping("/patient")
	public List<PrescriptionResponse> getPatientPrescriptions(Authentication authentication) {

		return prescriptionService.getPatientPrescriptions(authentication.getName());
	}

	// Doctor views prescriptions they issued
	@GetMapping("/doctor")
	public List<PrescriptionResponse> getDoctorPrescriptions(Authentication authentication) {

		return prescriptionService.getDoctorPrescriptions(authentication.getName());
	}

	// Patient views a specific prescription
	@GetMapping("/patient/{prescriptionId}")
	public PrescriptionResponse getPatientPrescriptionById(@PathVariable Long prescriptionId,
			Authentication authentication) {

		return prescriptionService.getPatientPrescriptionById(authentication.getName(), prescriptionId);
	}

	// Doctor views a specific prescription
	@GetMapping("/doctor/{prescriptionId}")
	public PrescriptionResponse getDoctorPrescriptionById(@PathVariable Long prescriptionId,
			Authentication authentication) {

		return prescriptionService.getDoctorPrescriptionById(authentication.getName(), prescriptionId);
	}

	// Pharmacist views prescriptions awaiting verification
	@GetMapping("/pharmacist")
	public List<PrescriptionResponse> getPrescriptionsForVerification() {

		return prescriptionService.getPrescriptionsForVerification();
	}

	// Pharmacist verifies a prescription
	@PatchMapping("/{prescriptionId}/verify")
	public PrescriptionResponse verifyPrescription(@PathVariable Long prescriptionId) {

		return prescriptionService.verifyPrescription(prescriptionId);
	}
}