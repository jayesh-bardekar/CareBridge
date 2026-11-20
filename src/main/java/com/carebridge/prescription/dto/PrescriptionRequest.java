package com.carebridge.prescription.dto;

import java.time.LocalDate;
import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record PrescriptionRequest(

		@NotNull @Positive Long patientId,

		@NotBlank @Size(max = 1000) String diagnosis,

		@Size(max = 2000) String instructions,

		@NotNull @FutureOrPresent LocalDate validUntil,

		@NotEmpty List<@Valid PrescriptionMedicineRequest> medicines

) {
}