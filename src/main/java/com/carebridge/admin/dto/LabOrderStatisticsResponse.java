package com.carebridge.admin.dto;

public record LabOrderStatisticsResponse(

        long total,

        long ordered,

        long assigned,

        long sampleCollected,

        long inProgress,

        long completed,

        long cancelled

) {}