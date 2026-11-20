package com.carebridge.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.carebridge.admin.dto.AdminProfileResponse;
import com.carebridge.admin.dto.AdminProfileUpdateRequest;
import com.carebridge.admin.service.AdminProfileService;

@RestController
@RequestMapping("/api/admin/profile")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProfileController {

	private final AdminProfileService adminProfileService;

	public AdminProfileController(AdminProfileService adminProfileService) {
		this.adminProfileService = adminProfileService;
	}

	// GET ADMIN PROFILE

	@GetMapping
	public ResponseEntity<AdminProfileResponse> getMyProfile(Authentication authentication) {

		AdminProfileResponse response = adminProfileService.getMyProfile(authentication.getName());

		return ResponseEntity.ok(response);
	}

	// UPDATE ADMIN PROFILE

	@PutMapping
	public ResponseEntity<AdminProfileResponse> updateMyProfile(Authentication authentication,
			@Valid @RequestBody AdminProfileUpdateRequest request) {

		AdminProfileResponse response = adminProfileService.updateMyProfile(authentication.getName(), request);

		return ResponseEntity.ok(response);
	}
}