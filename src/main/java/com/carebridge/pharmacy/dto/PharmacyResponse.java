package com.carebridge.pharmacy.dto;

import java.time.LocalDateTime;
import com.carebridge.pharmacy.enums.PharmacyStatus;

public record PharmacyResponse(

		Long id,

		Long pharmacistId,

		String pharmacistName,

		String pharmacistEmail,

		String pharmacyName,

		String licenseNumber,

		String phoneNumber,

		String contactEmail,

		String address,

		String city,

		String state,

		String pincode,

		PharmacyStatus status,

		LocalDateTime createdAt,

		LocalDateTime updatedAt

) {
}