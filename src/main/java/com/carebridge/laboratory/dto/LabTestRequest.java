package com.carebridge.laboratory.dto;

import java.math.BigDecimal;
import com.carebridge.laboratory.enums.LabTestCategory;
import jakarta.validation.constraints.*;

public record LabTestRequest(

		@NotBlank @Size(max = 150) String testName,

		@NotNull LabTestCategory category,

		@Size(max = 1000) String description,

		@NotNull @DecimalMin("0.0") BigDecimal price,

		@NotBlank @Size(max = 100) String sampleType,

		@Size(max = 1000) String preparationInstructions,

		boolean active) {
}