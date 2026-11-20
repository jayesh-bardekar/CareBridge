package com.carebridge.admin.dto;

public record PrescriptionStatisticsResponse(

        long total,

        long issued,

        long verified,

        long partiallyDispensed,

        long dispensed,

        long cancelled,

        long expired

) {}