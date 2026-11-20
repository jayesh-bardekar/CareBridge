package com.carebridge.prescription.dto;

public record PrescriptionMedicineResponse(

        Long id,
        String medicineName,
        String dosage,
        String frequency,
        Integer durationDays,
        Integer quantity,
        String instructions

) {
}