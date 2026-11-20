package com.carebridge.laboratory.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.carebridge.laboratory.dto.AssignLabStaffRequest;
import com.carebridge.laboratory.dto.LabOrderRequest;
import com.carebridge.laboratory.dto.LabOrderResponse;
import com.carebridge.laboratory.dto.LabOrderStatusRequest;
import com.carebridge.laboratory.dto.LabReportRequest;
import com.carebridge.laboratory.dto.LabReportResponse;
import com.carebridge.laboratory.service.LabOrderService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/lab-orders")
public class LabOrderController {

	private final LabOrderService labOrderService;

	public LabOrderController(LabOrderService labOrderService) {
		this.labOrderService = labOrderService;
	}

	// Doctor creates laboratory order

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public LabOrderResponse createLabOrder(Authentication authentication, @Valid @RequestBody LabOrderRequest request) {

		return labOrderService.createLabOrder(authentication.getName(), request);
	}

	// Patient views own laboratory orders

	@GetMapping("/patient")
	public List<LabOrderResponse> getPatientLabOrders(Authentication authentication) {

		return labOrderService.getPatientLabOrders(authentication.getName());
	}

	// Doctor views laboratory orders

	@GetMapping("/doctor")
	public List<LabOrderResponse> getDoctorLabOrders(Authentication authentication) {

		return labOrderService.getDoctorLabOrders(authentication.getName());
	}

	// Lab staff views assigned orders

	@GetMapping("/staff")
	public List<LabOrderResponse> getAssignedLabOrders(Authentication authentication) {

		return labOrderService.getAssignedLabOrders(authentication.getName());
	}

	// Admin assigns laboratory staff

	@PatchMapping("/{orderId}/assign")
	public LabOrderResponse assignLabStaff(@PathVariable Long orderId,
			@Valid @RequestBody AssignLabStaffRequest request) {

		return labOrderService.assignLabStaff(orderId, request);
	}

	// Assigned staff updates laboratory order status

	@PatchMapping("/{orderId}/status")
	public LabOrderResponse updateLabOrderStatus(Authentication authentication, @PathVariable Long orderId,
			@Valid @RequestBody LabOrderStatusRequest request) {

		return labOrderService.updateLabOrderStatus(authentication.getName(), orderId, request);
	}

	// Assigned staff uploads laboratory report

	@PostMapping("/{orderId}/report")
	@ResponseStatus(HttpStatus.CREATED)
	public LabReportResponse uploadLabReport(Authentication authentication, @PathVariable Long orderId,
			@Valid @RequestBody LabReportRequest request) {

		return labOrderService.uploadLabReport(authentication.getName(), orderId, request);
	}

	// Patient views own laboratory report

	@GetMapping("/patient/{orderId}/report")
	public LabReportResponse getPatientLabReport(Authentication authentication, @PathVariable Long orderId) {

		return labOrderService.getPatientLabReport(authentication.getName(), orderId);
	}

	// Doctor views laboratory report

	@GetMapping("/doctor/{orderId}/report")
	public LabReportResponse getDoctorLabReport(Authentication authentication, @PathVariable Long orderId) {

		return labOrderService.getDoctorLabReport(authentication.getName(), orderId);
	}

	// Assigned staff views laboratory report

	@GetMapping("/staff/{orderId}/report")
	public LabReportResponse getStaffLabReport(Authentication authentication, @PathVariable Long orderId) {

		return labOrderService.getStaffLabReport(authentication.getName(), orderId);
	}
}