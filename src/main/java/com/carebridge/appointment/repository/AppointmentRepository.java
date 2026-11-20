package com.carebridge.appointment.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Collection;
import org.springframework.data.jpa.repository.JpaRepository;
import com.carebridge.appointment.entity.Appointment;
import com.carebridge.appointment.enums.AppointmentStatus;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

	List<Appointment> findAllByPatientUserEmailOrderByAppointmentDateDescStartTimeDesc(String email);

	List<Appointment> findAllByDoctorUserEmailOrderByAppointmentDateDescStartTimeDesc(String email);

	long countByDoctorIdAndAppointmentDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(Long doctorId,
			LocalDate appointmentDate, Collection<AppointmentStatus> statuses, LocalTime requestedEndTime,
			LocalTime requestedStartTime);

	boolean existsByDoctorIdAndPatientIdAndStatusIn(
			Long doctorId,
			Long patientId,
			Collection<AppointmentStatus> statuses);

	long countByStatus(AppointmentStatus status);
}