package com.carebridge.appointment.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.carebridge.appointment.dto.AppointmentRequest;
import com.carebridge.appointment.dto.AppointmentResponse;
import com.carebridge.appointment.entity.Appointment;
import com.carebridge.appointment.enums.AppointmentStatus;
import com.carebridge.appointment.repository.AppointmentRepository;
import com.carebridge.common.exception.ResourceNotFoundException;
import com.carebridge.doctor.entity.Doctor;
import com.carebridge.doctor.repository.DoctorRepository;
import com.carebridge.notification.enums.NotificationType;
import com.carebridge.notification.service.NotificationService;
import com.carebridge.patient.entity.Patient;
import com.carebridge.patient.repository.PatientRepository;

@Service
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

	private static final int APPOINTMENT_DURATION_MINUTES = 30;

	private final AppointmentRepository appointmentRepository;
	private final PatientRepository patientRepository;
	private final DoctorRepository doctorRepository;
	private final NotificationService notificationService;

	public AppointmentServiceImpl(AppointmentRepository appointmentRepository, PatientRepository patientRepository,
			DoctorRepository doctorRepository, NotificationService notificationService) {

		this.appointmentRepository = appointmentRepository;
		this.patientRepository = patientRepository;
		this.doctorRepository = doctorRepository;
		this.notificationService = notificationService;
	}

	// =================================
	// BOOK APPOINTMENT
	// =================================

	@Override
	public AppointmentResponse bookAppointment(String patientEmail, AppointmentRequest request) {

		Patient patient = patientRepository.findByUserEmail(patientEmail)
				.orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

		Doctor doctor = doctorRepository.findById(request.getDoctorId())
				.orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

		LocalDate appointmentDate = request.getAppointmentDate();

		LocalTime startTime = request.getAppointmentTime();

		LocalTime endTime = startTime.plusMinutes(APPOINTMENT_DURATION_MINUTES);

		if (appointmentDate.isEqual(LocalDate.now()) && !startTime.isAfter(LocalTime.now())) {

			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment time must be in the future");
		}

		if (appointmentDate.isBefore(LocalDate.now())) {

			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment date cannot be in the past");
		}

		// Check doctor's available day

		DayOfWeek day = appointmentDate.getDayOfWeek();

		Set<String> availableDays = Set.of(doctor.getAvailableDays().toUpperCase().replace(" ", "").split(","));

		if (!availableDays.contains(day.name())) {

			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Doctor is not available on " + day);
		}

		// Check doctor's working hours

		if (startTime.isBefore(doctor.getStartTime()) || endTime.isAfter(doctor.getEndTime())) {

			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment is outside doctor's working hours");
		}

		// Check overlapping appointments

		List<AppointmentStatus> activeStatuses = List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED);

		long conflictingAppointments = appointmentRepository
				.countByDoctorIdAndAppointmentDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(doctor.getId(),
						appointmentDate, activeStatuses, endTime, startTime);

		if (conflictingAppointments > 0) {

			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Doctor already has an appointment during this time");
		}

		Appointment appointment = new Appointment();

		appointment.setPatient(patient);
		appointment.setDoctor(doctor);
		appointment.setAppointmentDate(appointmentDate);
		appointment.setStartTime(startTime);
		appointment.setEndTime(endTime);
		appointment.setReason(request.getReason());
		appointment.setStatus(AppointmentStatus.PENDING);

		Appointment savedAppointment = appointmentRepository.save(appointment);

		return convertToResponse(savedAppointment);
	}

	// =================================
	// GET PATIENT APPOINTMENTS
	// =================================

	@Override
	@Transactional(readOnly = true)
	public List<AppointmentResponse> getPatientAppointments(String patientEmail) {

		List<Appointment> appointments = appointmentRepository
				.findAllByPatientUserEmailOrderByAppointmentDateDescStartTimeDesc(patientEmail);

		return appointments.stream().map(this::convertToResponse).toList();
	}

	// =================================
	// GET DOCTOR APPOINTMENTS
	// =================================

	@Override
	@Transactional(readOnly = true)
	public List<AppointmentResponse> getDoctorAppointments(String doctorEmail) {

		List<Appointment> appointments = appointmentRepository
				.findAllByDoctorUserEmailOrderByAppointmentDateDescStartTimeDesc(doctorEmail);

		return appointments.stream().map(this::convertToResponse).toList();
	}

	// =================================
	// UPDATE APPOINTMENT STATUS
	// =================================

	@Override
	public AppointmentResponse updateAppointmentStatus(String doctorEmail, Long appointmentId,
			AppointmentStatus status) {

		Appointment appointment = appointmentRepository.findById(appointmentId)
				.orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

		if (!appointment.getDoctor().getUser().getEmail().equals(doctorEmail)) {

			throw new AccessDeniedException("You cannot update another doctor's appointment");
		}

		if (status != AppointmentStatus.CONFIRMED && status != AppointmentStatus.REJECTED
				&& status != AppointmentStatus.COMPLETED) {

			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid appointment status for doctor");
		}

		if (appointment.getStatus() != AppointmentStatus.PENDING
				&& !(appointment.getStatus() == AppointmentStatus.CONFIRMED && status == AppointmentStatus.COMPLETED)) {

			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment status cannot be changed");
		}

		if (status == AppointmentStatus.COMPLETED && appointment.getEndTime().isAfter(LocalTime.now())
				&& appointment.getAppointmentDate().isEqual(LocalDate.now())) {

			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Appointment cannot be completed before its end time");
		}

		if (status == AppointmentStatus.COMPLETED && appointment.getAppointmentDate().isAfter(LocalDate.now())) {

			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Future appointment cannot be completed");
		}

		appointment.setStatus(status);

		Appointment updatedAppointment = appointmentRepository.save(appointment);

		// =================================
		// NOTIFY PATIENT
		// =================================

		String patientEmail = appointment.getPatient().getUser().getEmail();

		String doctorName = appointment.getDoctor().getUser().getFullName();

		String appointmentDetails = appointment.getAppointmentDate() + " at " + appointment.getStartTime();

		if (status == AppointmentStatus.CONFIRMED) {

			notificationService.createNotification(patientEmail, "Appointment Confirmed",
					"Your appointment with Dr. " + doctorName + " on " + appointmentDetails + " has been confirmed.",
					NotificationType.APPOINTMENT_CONFIRMED, "/appointments/" + appointmentId);
		}

		if (status == AppointmentStatus.REJECTED) {

			notificationService.createNotification(patientEmail, "Appointment Rejected",
					"Your appointment with " + doctorName + " on " + appointmentDetails + " has been rejected.",
					NotificationType.APPOINTMENT_REJECTED, "/appointments/" + appointmentId);
		}

		return convertToResponse(updatedAppointment);
	}

	// =================================
	// CANCEL APPOINTMENT
	// =================================

	@Override
	public AppointmentResponse cancelAppointment(String patientEmail, Long appointmentId) {

		Appointment appointment = appointmentRepository.findById(appointmentId)
				.orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

		if (!appointment.getPatient().getUser().getEmail().equals(patientEmail)) {

			throw new AccessDeniedException("You cannot cancel another patient's appointment");
		}

		if (appointment.getStatus() != AppointmentStatus.PENDING
				&& appointment.getStatus() != AppointmentStatus.CONFIRMED) {

			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This appointment cannot be cancelled");
		}

		if (appointment.getAppointmentDate().isBefore(LocalDate.now())
				|| (appointment.getAppointmentDate().isEqual(LocalDate.now())
						&& !appointment.getStartTime().isAfter(LocalTime.now()))) {

			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Past or started appointment cannot be cancelled");
		}

		appointment.setStatus(AppointmentStatus.CANCELLED);

		Appointment cancelledAppointment = appointmentRepository.save(appointment);

		// =================================
		// NOTIFY DOCTOR
		// =================================

		String doctorEmail = appointment.getDoctor().getUser().getEmail();

		String patientName = appointment.getPatient().getUser().getFullName();

		String appointmentDetails = appointment.getAppointmentDate() + " at " + appointment.getStartTime();

		notificationService.createNotification(doctorEmail, "Appointment Cancelled",
				patientName + " has cancelled the appointment scheduled for " + appointmentDetails + ".",
				NotificationType.APPOINTMENT_CANCELLED, "/appointments/" + appointmentId);

		return convertToResponse(cancelledAppointment);
	}

	// =================================
	// CONVERT ENTITY TO RESPONSE
	// =================================

	private AppointmentResponse convertToResponse(Appointment appointment) {

		AppointmentResponse response = new AppointmentResponse();

		Patient patient = appointment.getPatient();

		Doctor doctor = appointment.getDoctor();

		response.setId(appointment.getId());

		response.setPatientId(patient.getId());
		response.setPatientName(patient.getUser().getFullName());
		response.setPatientEmail(patient.getUser().getEmail());

		response.setDoctorId(doctor.getId());
		response.setDoctorName(doctor.getUser().getFullName());
		response.setDoctorEmail(doctor.getUser().getEmail());
		response.setSpecialization(doctor.getSpecialization().name());

		response.setAppointmentDate(appointment.getAppointmentDate());

		response.setStartTime(appointment.getStartTime());

		response.setEndTime(appointment.getEndTime());

		response.setReason(appointment.getReason());

		response.setStatus(appointment.getStatus());

		response.setCreatedAt(appointment.getCreatedAt());

		response.setUpdatedAt(appointment.getUpdatedAt());

		return response;
	}
}