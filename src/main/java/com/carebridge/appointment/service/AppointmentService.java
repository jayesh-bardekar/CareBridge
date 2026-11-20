package com.carebridge.appointment.service;

import java.util.List;
import com.carebridge.appointment.dto.AppointmentRequest;
import com.carebridge.appointment.dto.AppointmentResponse;
import com.carebridge.appointment.enums.AppointmentStatus;

public interface AppointmentService {

	AppointmentResponse bookAppointment(String patientEmail, AppointmentRequest request);

	List<AppointmentResponse> getPatientAppointments(String patientEmail);

	List<AppointmentResponse> getDoctorAppointments(String doctorEmail);

	AppointmentResponse updateAppointmentStatus(String doctorEmail, Long appointmentId, AppointmentStatus status);

	AppointmentResponse cancelAppointment(String patientEmail, Long appointmentId);
}