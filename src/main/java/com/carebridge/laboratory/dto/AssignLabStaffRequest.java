package com.carebridge.laboratory.dto;

import jakarta.validation.constraints.NotNull;

public record AssignLabStaffRequest(

		@NotNull Long labStaffId

) {
}