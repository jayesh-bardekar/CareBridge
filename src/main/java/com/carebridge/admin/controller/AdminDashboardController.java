package com.carebridge.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.carebridge.admin.dto.AdminDashboardResponse;
import com.carebridge.admin.service.AdminDashboardService;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

	private final AdminDashboardService adminDashboardService;

	public AdminDashboardController(AdminDashboardService adminDashboardService) {

		this.adminDashboardService = adminDashboardService;
	}

	@GetMapping
	public ResponseEntity<AdminDashboardResponse> getDashboard() {

		AdminDashboardResponse response = adminDashboardService.getDashboard();

		return ResponseEntity.ok(response);
	}
}