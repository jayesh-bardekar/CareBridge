package com.carebridge.admin.dto;

import java.time.LocalDateTime;
import com.carebridge.pharmacy.enums.PharmacyStatus;

public record AdminPharmacyResponse(

        Long id,

        Long pharmacistId,

        String pharmacistName,

        String pharmacistEmail,

        String pharmacistPhone,

        String pharmacyName,

        String licenseNumber,

        String phoneNumber,

        String contactEmail,

        String address,

        String city,

        String state,

        String pincode,

        PharmacyStatus status,

        boolean pharmacistEnabled,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {
}