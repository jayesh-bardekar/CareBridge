package com.carebridge.admin.service.impl;

import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.carebridge.admin.dto.AdminAppointmentResponse;
import com.carebridge.admin.service.AdminAppointmentService;
import com.carebridge.appointment.entity.Appointment;
import com.carebridge.appointment.enums.AppointmentStatus;
import com.carebridge.appointment.repository.AppointmentRepository;
import com.carebridge.common.exception.ResourceNotFoundException;

@Service
@Transactional
public class AdminAppointmentServiceImpl implements AdminAppointmentService {

	private final AppointmentRepository appointmentRepository;

	public AdminAppointmentServiceImpl(AppointmentRepository appointmentRepository) {

		this.appointmentRepository = appointmentRepository;
	}

	// GET ALL APPOINTMENTS WITH FILTER AND SEARCH

	@Override
	@Transactional(readOnly = true)
	public List<AdminAppointmentResponse> getAllAppointments(AppointmentStatus status, String keyword) {

		return appointmentRepository.findAll().stream()

				.filter(appointment -> status == null || appointment.getStatus() == status)

				.filter(appointment -> matchesKeyword(appointment, keyword))

				.sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))

				.map(AdminAppointmentResponse::new)

				.toList();
	}

	// GET APPOINTMENT BY ID

	@Override
	@Transactional(readOnly = true)
	public AdminAppointmentResponse getAppointmentById(Long appointmentId) {

		Appointment appointment = appointmentRepository.findById(appointmentId)
				.orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

		return new AdminAppointmentResponse(appointment);
	}

	// UPDATE APPOINTMENT STATUS

	@Override
	public AdminAppointmentResponse updateAppointmentStatus(Long appointmentId, AppointmentStatus status) {

		Appointment appointment = appointmentRepository.findById(appointmentId)
				.orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

		if (status == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment status is required");
		}

		if (appointment.getStatus() == AppointmentStatus.COMPLETED
				|| appointment.getStatus() == AppointmentStatus.REJECTED
				|| appointment.getStatus() == AppointmentStatus.CANCELLED) {

			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Final appointment status cannot be changed");
		}

		if (status != AppointmentStatus.CANCELLED) {

			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin can only cancel appointments");
		}

		appointment.setStatus(AppointmentStatus.CANCELLED);

		Appointment updatedAppointment = appointmentRepository.save(appointment);

		return new AdminAppointmentResponse(updatedAppointment);
	}

	// SEARCH APPOINTMENTS

	private boolean matchesKeyword(Appointment appointment, String keyword) {

		if (keyword == null || keyword.isBlank()) {
			return true;
		}

		String search = keyword.toLowerCase(Locale.ROOT).trim();

		String patientName = appointment.getPatient().getUser().getFullName();

		String patientEmail = appointment.getPatient().getUser().getEmail();

		String doctorName = appointment.getDoctor().getUser().getFullName();

		String doctorEmail = appointment.getDoctor().getUser().getEmail();

		String specialization = appointment.getDoctor().getSpecialization().name();

		return contains(patientName, search) || contains(patientEmail, search) || contains(doctorName, search)
				|| contains(doctorEmail, search) || contains(specialization, search)
				|| contains(appointment.getReason(), search);
	}

	private boolean contains(String value, String search) {

		return value != null && value.toLowerCase(Locale.ROOT).contains(search);
	}
}