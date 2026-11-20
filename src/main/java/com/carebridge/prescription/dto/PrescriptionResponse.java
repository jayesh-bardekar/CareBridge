package com.carebridge.prescription.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import com.carebridge.prescription.enums.PrescriptionStatus;

public record PrescriptionResponse(

		Long id,

		Long patientId, String patientName, String patientEmail,

		Long doctorId, String doctorName, String doctorEmail,

		String diagnosis, String instructions,

		LocalDate prescriptionDate, LocalDate validUntil,

		PrescriptionStatus status,

		List<PrescriptionMedicineResponse> medicines,

		LocalDateTime createdAt, LocalDateTime updatedAt

) {
}