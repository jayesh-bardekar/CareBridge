package com.carebridge.admin.service;

import java.util.List;
import com.carebridge.appointment.enums.AppointmentStatus;
import com.carebridge.admin.dto.AdminAppointmentResponse;

public interface AdminAppointmentService {

	List<AdminAppointmentResponse> getAllAppointments(AppointmentStatus status, String keyword);

	AdminAppointmentResponse getAppointmentById(Long appointmentId);

	AdminAppointmentResponse updateAppointmentStatus(Long appointmentId, AppointmentStatus status);
}