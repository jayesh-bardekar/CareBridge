package com.carebridge.admin.dto;

import java.util.List;

public record AdminDashboardResponse(

        UserStatisticsResponse users,

        AppointmentStatisticsResponse appointments,

        PrescriptionStatisticsResponse prescriptions,

        LabOrderStatisticsResponse labOrders,

        PharmacyStatisticsResponse pharmacies,

        long totalMedicalRecords,

        long totalMedicines,

        long totalLabTests,

        List<RecentRegistrationResponse> recentRegistrations

) {}