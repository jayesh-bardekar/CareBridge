package com.carebridge.admin.controller;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.carebridge.admin.dto.AdminLabOrderResponse;
import com.carebridge.admin.service.AdminLabOrderService;
import com.carebridge.laboratory.enums.LabOrderStatus;
import com.carebridge.laboratory.dto.AssignLabStaffRequest;
import jakarta.validation.Valid;
import com.carebridge.laboratory.dto.LabReportResponse;

@RestController
@RequestMapping("/api/admin/lab-orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminLabOrderController {

	private final AdminLabOrderService adminLabOrderService;

	public AdminLabOrderController(AdminLabOrderService adminLabOrderService) {
		this.adminLabOrderService = adminLabOrderService;
	}

	// Get all laboratory orders with optional filters
	@GetMapping
	public List<AdminLabOrderResponse> getAllLabOrders(@RequestParam(required = false) LabOrderStatus status,
			@RequestParam(required = false) String keyword) {

		return adminLabOrderService.getAllLabOrders(status, keyword);
	}

	// Get laboratory order details
	@GetMapping("/{orderId}")
	public AdminLabOrderResponse getLabOrderById(@PathVariable Long orderId) {

		return adminLabOrderService.getLabOrderById(orderId);
	}

	// Assign laboratory staff
	@PatchMapping("/{orderId}/assign")
	public AdminLabOrderResponse assignLabStaff(@PathVariable Long orderId,
			@Valid @RequestBody AssignLabStaffRequest request) {

		return adminLabOrderService.assignLabStaff(orderId, request.labStaffId());
	}

	// Get laboratory report (Admin view only)
	@GetMapping("/{orderId}/report")
	public LabReportResponse getLabReport(@PathVariable Long orderId) {
		return adminLabOrderService.getLabReport(orderId);
	}
}