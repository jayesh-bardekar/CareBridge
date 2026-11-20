package com.carebridge.laboratory.dto;

import java.time.LocalDateTime;
import com.carebridge.laboratory.enums.LabOrderStatus;

public record LabOrderResponse(

		Long id,

		Long patientId, String patientName, String patientEmail,

		Long doctorId, String doctorName, String doctorEmail,

		Long labTestId, String testName, String category,

		Long assignedLabStaffId, String assignedLabStaffName,

		LabOrderStatus status,

		String notes,

		LocalDateTime orderedAt, LocalDateTime assignedAt, LocalDateTime sampleCollectedAt, LocalDateTime completedAt

) {
}