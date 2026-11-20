package com.carebridge.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import com.carebridge.inventory.enums.MedicineCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MedicineRequest(

		@NotBlank @Size(min = 2, max = 150) String medicineName,

		@Size(max = 150) String manufacturer,

		@NotNull MedicineCategory category,

		@NotBlank @Size(max = 100) String batchNumber,

		@NotNull @DecimalMin("0.01") BigDecimal price,

		@NotNull @Min(0) Integer quantity,

		@NotNull @Min(0) Integer minimumStockLevel,

		@NotNull LocalDate expiryDate,

		@Size(max = 1000) String description,

		@NotNull Boolean active

) {
}