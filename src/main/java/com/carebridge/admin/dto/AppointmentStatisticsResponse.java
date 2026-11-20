package com.carebridge.admin.dto;

public record AppointmentStatisticsResponse(

        long total,

        long pending,

        long confirmed,

        long rejected,

        long cancelled,

        long completed

) {}