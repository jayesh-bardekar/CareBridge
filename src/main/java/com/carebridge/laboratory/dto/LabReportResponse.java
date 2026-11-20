package com.carebridge.laboratory.dto;

import java.time.LocalDateTime;

public record LabReportResponse(

		Long id,

		Long labOrderId,

		String testName,

		String patientName,

		String doctorName,

		String resultSummary,

		String findings,

		String reportFileUrl,

		String uploadedBy,

		LocalDateTime uploadedAt

) {
}