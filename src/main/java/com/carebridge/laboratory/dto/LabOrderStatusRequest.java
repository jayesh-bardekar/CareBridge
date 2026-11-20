package com.carebridge.laboratory.dto;

import com.carebridge.laboratory.enums.LabOrderStatus;
import jakarta.validation.constraints.NotNull;

public record LabOrderStatusRequest(

		@NotNull LabOrderStatus status

) {
}