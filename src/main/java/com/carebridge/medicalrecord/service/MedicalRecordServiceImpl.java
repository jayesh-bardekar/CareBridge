package com.carebridge.medicalrecord.service;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.carebridge.appointment.enums.AppointmentStatus;
import com.carebridge.appointment.repository.AppointmentRepository;
import com.carebridge.common.exception.ResourceNotFoundException;
import com.carebridge.doctor.entity.Doctor;
import com.carebridge.doctor.repository.DoctorRepository;
import com.carebridge.medicalrecord.dto.MedicalRecordRequest;
import com.carebridge.medicalrecord.dto.MedicalRecordResponse;
import com.carebridge.medicalrecord.entity.MedicalRecord;
import com.carebridge.medicalrecord.repository.MedicalRecordRepository;
import com.carebridge.patient.entity.Patient;
import com.carebridge.patient.repository.PatientRepository;

@Service
@Transactional
public class MedicalRecordServiceImpl implements MedicalRecordService {

	private final MedicalRecordRepository medicalRecordRepository;
	private final PatientRepository patientRepository;
	private final DoctorRepository doctorRepository;
	private final AppointmentRepository appointmentRepository;

	public MedicalRecordServiceImpl(MedicalRecordRepository medicalRecordRepository,
			PatientRepository patientRepository, DoctorRepository doctorRepository,
			AppointmentRepository appointmentRepository) {

		this.medicalRecordRepository = medicalRecordRepository;
		this.patientRepository = patientRepository;
		this.doctorRepository = doctorRepository;
		this.appointmentRepository = appointmentRepository;
	}

	@Override
	public MedicalRecordResponse createMedicalRecord(String doctorEmail, MedicalRecordRequest request) {

		Doctor doctor = doctorRepository.findByUserEmail(doctorEmail)
				.orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

		Patient patient = patientRepository.findById(request.getPatientId())
				.orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

		boolean hasValidAppointment = appointmentRepository.existsByDoctorIdAndPatientIdAndStatusIn(doctor.getId(),
				patient.getId(), List.of(AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED));

		if (!hasValidAppointment) {
			throw new AccessDeniedException(
					"You can create medical records only for your confirmed or completed patients");
		}

		MedicalRecord medicalRecord = new MedicalRecord();

		medicalRecord.setDoctor(doctor);
		medicalRecord.setPatient(patient);
		medicalRecord.setTitle(request.getTitle());
		medicalRecord.setDiagnosis(request.getDiagnosis());
		medicalRecord.setSymptoms(request.getSymptoms());
		medicalRecord.setTreatment(request.getTreatment());
		medicalRecord.setNotes(request.getNotes());
		medicalRecord.setRecordDate(request.getRecordDate());

		MedicalRecord savedRecord = medicalRecordRepository.save(medicalRecord);

		return convertToResponse(savedRecord);
	}

	@Override
	@Transactional(readOnly = true)
	public List<MedicalRecordResponse> getPatientMedicalRecords(String patientEmail) {

		Patient patient = patientRepository.findByUserEmail(patientEmail)
				.orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

		return medicalRecordRepository.findAllByPatientIdOrderByRecordDateDesc(patient.getId()).stream()
				.map(this::convertToResponse).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public List<MedicalRecordResponse> getDoctorMedicalRecords(String doctorEmail) {

		Doctor doctor = doctorRepository.findByUserEmail(doctorEmail)
				.orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

		return medicalRecordRepository.findAllByDoctorIdOrderByRecordDateDesc(doctor.getId()).stream()
				.map(this::convertToResponse).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public MedicalRecordResponse getPatientMedicalRecordById(String patientEmail, Long recordId) {

		Patient patient = patientRepository.findByUserEmail(patientEmail)
				.orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

		MedicalRecord medicalRecord = medicalRecordRepository.findByIdAndPatientId(recordId, patient.getId())
				.orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));

		return convertToResponse(medicalRecord);
	}

	@Override
	public MedicalRecordResponse updateMedicalRecord(String doctorEmail, Long recordId, MedicalRecordRequest request) {

		Doctor doctor = doctorRepository.findByUserEmail(doctorEmail)
				.orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

		MedicalRecord medicalRecord = medicalRecordRepository.findByIdAndDoctorId(recordId, doctor.getId())
				.orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));

		if (!medicalRecord.getPatient().getId().equals(request.getPatientId())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Patient cannot be changed for an existing medical record");
		}

		medicalRecord.setTitle(request.getTitle());
		medicalRecord.setDiagnosis(request.getDiagnosis());
		medicalRecord.setSymptoms(request.getSymptoms());
		medicalRecord.setTreatment(request.getTreatment());
		medicalRecord.setNotes(request.getNotes());

		if (request.getRecordDate() != null) {
			medicalRecord.setRecordDate(request.getRecordDate());
		}

		MedicalRecord updatedRecord = medicalRecordRepository.save(medicalRecord);

		return convertToResponse(updatedRecord);
	}

	private MedicalRecordResponse convertToResponse(MedicalRecord medicalRecord) {

		MedicalRecordResponse response = new MedicalRecordResponse();

		response.setId(medicalRecord.getId());

		response.setPatientId(medicalRecord.getPatient().getId());
		response.setPatientName(medicalRecord.getPatient().getUser().getFullName());
		response.setPatientEmail(medicalRecord.getPatient().getUser().getEmail());

		response.setDoctorId(medicalRecord.getDoctor().getId());
		response.setDoctorName(medicalRecord.getDoctor().getUser().getFullName());
		response.setDoctorEmail(medicalRecord.getDoctor().getUser().getEmail());

		response.setTitle(medicalRecord.getTitle());
		response.setDiagnosis(medicalRecord.getDiagnosis());
		response.setSymptoms(medicalRecord.getSymptoms());
		response.setTreatment(medicalRecord.getTreatment());
		response.setNotes(medicalRecord.getNotes());

		response.setRecordDate(medicalRecord.getRecordDate());
		response.setCreatedAt(medicalRecord.getCreatedAt());
		response.setUpdatedAt(medicalRecord.getUpdatedAt());

		return response;
	}
}