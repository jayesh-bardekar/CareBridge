package com.carebridge.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.carebridge.inventory.enums.MedicineCategory;

public record MedicineResponse(

		Long id,

		Long pharmacyId,

		String pharmacyName,

		String medicineName,

		String manufacturer,

		MedicineCategory category,

		String batchNumber,

		BigDecimal price,

		Integer quantity,

		Integer minimumStockLevel,

		LocalDate expiryDate,

		String description,

		boolean active,

		boolean lowStock,

		LocalDateTime createdAt,

		LocalDateTime updatedAt

) {
}