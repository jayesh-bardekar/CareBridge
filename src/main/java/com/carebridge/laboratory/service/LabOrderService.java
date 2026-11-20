package com.carebridge.laboratory.service;

import java.util.List;
import com.carebridge.laboratory.dto.AssignLabStaffRequest;
import com.carebridge.laboratory.dto.LabOrderRequest;
import com.carebridge.laboratory.dto.LabOrderResponse;
import com.carebridge.laboratory.dto.LabOrderStatusRequest;
import com.carebridge.laboratory.dto.LabReportRequest;
import com.carebridge.laboratory.dto.LabReportResponse;

public interface LabOrderService {

	LabOrderResponse createLabOrder(String doctorEmail, LabOrderRequest request);

	List<LabOrderResponse> getPatientLabOrders(String patientEmail);

	List<LabOrderResponse> getDoctorLabOrders(String doctorEmail);

	List<LabOrderResponse> getAssignedLabOrders(String staffEmail);

	LabOrderResponse assignLabStaff(Long orderId, AssignLabStaffRequest request);

	LabOrderResponse updateLabOrderStatus(String staffEmail, Long orderId, LabOrderStatusRequest request);

	LabReportResponse uploadLabReport(String staffEmail, Long orderId, LabReportRequest request);

	LabReportResponse getPatientLabReport(String patientEmail, Long orderId);

	LabReportResponse getDoctorLabReport(String doctorEmail, Long orderId);

	LabReportResponse getStaffLabReport(String staffEmail, Long orderId);

}