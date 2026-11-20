package com.carebridge.admin.service;

import java.util.List;
import com.carebridge.admin.dto.AdminLabOrderResponse;
import com.carebridge.laboratory.enums.LabOrderStatus;
import com.carebridge.laboratory.dto.LabReportResponse;

public interface AdminLabOrderService {

    List<AdminLabOrderResponse> getAllLabOrders(
            LabOrderStatus status,
            String keyword
    );

    AdminLabOrderResponse getLabOrderById(Long orderId);

    AdminLabOrderResponse assignLabStaff(
            Long orderId,
            Long labStaffId
    );
    LabReportResponse getLabReport(Long orderId);
}