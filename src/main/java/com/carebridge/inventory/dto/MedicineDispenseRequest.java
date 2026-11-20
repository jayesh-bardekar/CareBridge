package com.carebridge.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record MedicineDispenseRequest(

		@NotNull @Min(1) Integer quantity

) {
}