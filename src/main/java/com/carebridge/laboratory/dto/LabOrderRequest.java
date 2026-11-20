package com.carebridge.laboratory.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LabOrderRequest(

		@NotNull Long patientId,

		@NotNull Long labTestId,

		@Size(max = 1000) String notes

) {
}