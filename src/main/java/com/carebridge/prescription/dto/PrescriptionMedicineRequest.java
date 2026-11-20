package com.carebridge.prescription.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record PrescriptionMedicineRequest(

		@NotBlank @Size(max = 150) String medicineName,

		@NotBlank @Size(max = 100) String dosage,

		@NotBlank @Size(max = 150) String frequency,

		@NotNull @Positive Integer durationDays,

		@NotNull @Positive Integer quantity,

		@Size(max = 500) String instructions

) {
}