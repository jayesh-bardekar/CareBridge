package com.carebridge.laboratory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LabReportRequest(

		@NotBlank @Size(max = 2000) String resultSummary,

		@Size(max = 3000) String findings,

		@Size(max = 1000) String reportFileUrl

) {
}