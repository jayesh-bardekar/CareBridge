package com.carebridge.pharmacy.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.carebridge.pharmacy.dto.PharmacyRequest;
import com.carebridge.pharmacy.dto.PharmacyResponse;
import com.carebridge.pharmacy.dto.PharmacyStatusRequest;
import com.carebridge.pharmacy.service.PharmacyService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/pharmacy")
public class PharmacyController {

	private final PharmacyService pharmacyService;

	public PharmacyController(PharmacyService pharmacyService) {
		this.pharmacyService = pharmacyService;
	}

	// Pharmacist Registers Pharmacy

	@PostMapping("/profile")
	@ResponseStatus(HttpStatus.CREATED)
	public PharmacyResponse registerPharmacy(@Valid @RequestBody PharmacyRequest request,
			Authentication authentication) {

		return pharmacyService.registerPharmacy(authentication.getName(), request);
	}

	// Pharmacist Views Own Pharmacy

	@GetMapping("/profile")
	public PharmacyResponse getMyPharmacy(Authentication authentication) {

		return pharmacyService.getMyPharmacy(authentication.getName());
	}

	// Pharmacist Updates Own Pharmacy

	@PutMapping("/profile")
	public PharmacyResponse updatePharmacy(@Valid @RequestBody PharmacyRequest request, Authentication authentication) {

		return pharmacyService.updatePharmacy(authentication.getName(), request);
	}

	// View All Approved Pharmacies

	@GetMapping
	public List<PharmacyResponse> getApprovedPharmacies() {

		return pharmacyService.getApprovedPharmacies();
	}

	// View Specific Approved Pharmacy

	@GetMapping("/{pharmacyId}")
	public PharmacyResponse getApprovedPharmacyById(@PathVariable Long pharmacyId) {

		return pharmacyService.getApprovedPharmacyById(pharmacyId);
	}

	// Admin Approves / Rejects / Suspends Pharmacy

	@PatchMapping("/{pharmacyId}/status")
	public PharmacyResponse updatePharmacyStatus(@PathVariable Long pharmacyId,
			@Valid @RequestBody PharmacyStatusRequest request) {

		return pharmacyService.updatePharmacyStatus(pharmacyId, request.status());
	}
}