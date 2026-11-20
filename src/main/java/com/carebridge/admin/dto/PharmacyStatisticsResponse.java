package com.carebridge.admin.dto;

public record PharmacyStatisticsResponse(

        long total,

        long pending,

        long approved,

        long rejected,

        long suspended

) {}