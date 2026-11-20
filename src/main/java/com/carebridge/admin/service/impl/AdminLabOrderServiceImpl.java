package com.carebridge.admin.service.impl;

import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.carebridge.admin.dto.AdminLabOrderResponse;
import com.carebridge.admin.service.AdminLabOrderService;
import com.carebridge.laboratory.dto.AssignLabStaffRequest;
import com.carebridge.laboratory.dto.LabReportResponse;
import com.carebridge.laboratory.entity.LabOrder;
import com.carebridge.laboratory.enums.LabOrderStatus;
import com.carebridge.laboratory.repository.LabOrderRepository;
import com.carebridge.laboratory.repository.LabReportRepository;
import com.carebridge.laboratory.service.LabOrderService;

@Service
@Transactional
public class AdminLabOrderServiceImpl implements AdminLabOrderService {

	private final LabOrderRepository labOrderRepository;
	private final LabReportRepository labReportRepository;
	private final LabOrderService labOrderService;

	public AdminLabOrderServiceImpl(LabOrderRepository labOrderRepository, LabReportRepository labReportRepository,
			LabOrderService labOrderService) {

		this.labOrderRepository = labOrderRepository;
		this.labReportRepository = labReportRepository;
		this.labOrderService = labOrderService;
	}

	@Override
	@Transactional(readOnly = true)
	public List<AdminLabOrderResponse> getAllLabOrders(LabOrderStatus status, String keyword) {

		String searchKeyword = keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT);

		return labOrderRepository.findAll().stream().filter(order -> status == null || order.getStatus() == status)
				.filter(order -> matchesKeyword(order, searchKeyword))
				.sorted((a, b) -> b.getOrderedAt().compareTo(a.getOrderedAt())).map(this::convertToResponse).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public AdminLabOrderResponse getLabOrderById(Long orderId) {

		LabOrder order = labOrderRepository.findById(orderId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Laboratory order not found"));

		return convertToResponse(order);
	}

	@Override
	public AdminLabOrderResponse assignLabStaff(Long orderId, Long labStaffId) {

		labOrderService.assignLabStaff(orderId, new AssignLabStaffRequest(labStaffId));

		return getLabOrderById(orderId);
	}

	private boolean matchesKeyword(LabOrder order, String keyword) {

		if (keyword.isEmpty()) {
			return true;
		}

		return contains(order.getPatient().getUser().getFullName(), keyword)
				|| contains(order.getPatient().getUser().getEmail(), keyword)
				|| contains(order.getDoctor().getUser().getFullName(), keyword)
				|| contains(order.getDoctor().getUser().getEmail(), keyword)
				|| contains(order.getLabTest().getTestName(), keyword)
				|| (order.getAssignedLabStaff() != null && (contains(order.getAssignedLabStaff().getFullName(), keyword)
						|| contains(order.getAssignedLabStaff().getEmail(), keyword)));
	}

	private boolean contains(String value, String keyword) {

		return value != null && value.toLowerCase(Locale.ROOT).contains(keyword);
	}

	private AdminLabOrderResponse convertToResponse(LabOrder order) {

		boolean reportAvailable = labReportRepository.existsByLabOrderId(order.getId());

		return new AdminLabOrderResponse(order.getId(),

				order.getPatient().getId(), order.getPatient().getUser().getFullName(),
				order.getPatient().getUser().getEmail(),

				order.getDoctor().getId(), order.getDoctor().getUser().getFullName(),
				order.getDoctor().getUser().getEmail(),

				order.getLabTest().getId(), order.getLabTest().getTestName(), order.getLabTest().getCategory().name(),

				order.getAssignedLabStaff() == null ? null : order.getAssignedLabStaff().getId(),

				order.getAssignedLabStaff() == null ? null : order.getAssignedLabStaff().getFullName(),

				order.getAssignedLabStaff() == null ? null : order.getAssignedLabStaff().getEmail(),

				order.getStatus(), order.getNotes(),

				order.getOrderedAt(), order.getAssignedAt(), order.getSampleCollectedAt(), order.getCompletedAt(),

				reportAvailable);
	}

	@Override
	@Transactional(readOnly = true)
	public LabReportResponse getLabReport(Long orderId) {

		return labReportRepository.findByLabOrderId(orderId)
				.map(report -> new LabReportResponse(report.getId(), report.getLabOrder().getId(),
						report.getLabOrder().getLabTest().getTestName(),
						report.getLabOrder().getPatient().getUser().getFullName(),
						report.getLabOrder().getDoctor().getUser().getFullName(), report.getResultSummary(),
						report.getFindings(), null, report.getUploadedBy().getFullName(),
						report.getUploadedAt()))
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Laboratory report not found"));
	}
}