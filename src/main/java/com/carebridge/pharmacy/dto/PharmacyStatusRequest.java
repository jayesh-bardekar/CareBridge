package com.carebridge.pharmacy.dto;

import com.carebridge.pharmacy.enums.PharmacyStatus;
import jakarta.validation.constraints.NotNull;

public record PharmacyStatusRequest(

		@NotNull PharmacyStatus status

) {
}