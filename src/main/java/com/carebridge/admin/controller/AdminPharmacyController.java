package com.carebridge.admin.controller;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.carebridge.admin.dto.AdminPharmacyResponse;
import com.carebridge.admin.service.AdminPharmacyService;
import com.carebridge.pharmacy.dto.PharmacyStatusRequest;
import com.carebridge.pharmacy.enums.PharmacyStatus;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/pharmacies")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPharmacyController {

	private final AdminPharmacyService adminPharmacyService;

	public AdminPharmacyController(AdminPharmacyService adminPharmacyService) {
		this.adminPharmacyService = adminPharmacyService;
	}

	// Get All Pharmacies With Optional Filters

	@GetMapping
	public List<AdminPharmacyResponse> getAllPharmacies(@RequestParam(required = false) PharmacyStatus status,
			@RequestParam(required = false) String keyword) {

		return adminPharmacyService.getAllPharmacies(status, keyword);
	}

	// Get Pharmacy Details By ID

	@GetMapping("/{pharmacyId}")
	public AdminPharmacyResponse getPharmacyById(@PathVariable Long pharmacyId) {

		return adminPharmacyService.getPharmacyById(pharmacyId);
	}

	// Update Pharmacy Status

	@PatchMapping("/{pharmacyId}/status")
	public AdminPharmacyResponse updatePharmacyStatus(@PathVariable Long pharmacyId,
			@Valid @RequestBody PharmacyStatusRequest request) {

		return adminPharmacyService.updatePharmacyStatus(pharmacyId, request.status());
	}
}