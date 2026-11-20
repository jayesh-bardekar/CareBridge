package com.carebridge.admin.dto;

public record UserStatisticsResponse(

        long total,

        long admins,

        long patients,

        long doctors,

        long labStaff,

        long pharmacists

) {}