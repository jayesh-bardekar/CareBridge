package com.carebridge.laboratory.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.carebridge.laboratory.enums.LabTestCategory;

public record LabTestResponse(

    Long id,
    String testName,
    LabTestCategory category,
    String description,
    BigDecimal price,
    String sampleType,
    String preparationInstructions,
    boolean active,
    LocalDateTime createdAt,
    LocalDateTime updatedAt

) {

}