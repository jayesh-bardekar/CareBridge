package com.carebridge.prescription.service;

import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.carebridge.appointment.enums.AppointmentStatus;
import com.carebridge.appointment.repository.AppointmentRepository;
import com.carebridge.doctor.entity.Doctor;
import com.carebridge.doctor.repository.DoctorRepository;
import com.carebridge.patient.entity.Patient;
import com.carebridge.patient.repository.PatientRepository;
import com.carebridge.prescription.dto.PrescriptionMedicineRequest;
import com.carebridge.prescription.dto.PrescriptionMedicineResponse;
import com.carebridge.prescription.dto.PrescriptionRequest;
import com.carebridge.prescription.dto.PrescriptionResponse;
import com.carebridge.prescription.entity.Prescription;
import com.carebridge.prescription.entity.PrescriptionItem;
import com.carebridge.prescription.enums.PrescriptionStatus;
import com.carebridge.prescription.repository.PrescriptionRepository;
import com.carebridge.notification.enums.NotificationType;
import com.carebridge.notification.service.NotificationService;

@Service
@Transactional
public class PrescriptionServiceImpl implements PrescriptionService {

	private final PrescriptionRepository prescriptionRepository;
	private final PatientRepository patientRepository;
	private final DoctorRepository doctorRepository;
	private final AppointmentRepository appointmentRepository;
	private final NotificationService notificationService;

	public PrescriptionServiceImpl(PrescriptionRepository prescriptionRepository, PatientRepository patientRepository,
			DoctorRepository doctorRepository, AppointmentRepository appointmentRepository,
			NotificationService notificationService) {

		this.prescriptionRepository = prescriptionRepository;
		this.patientRepository = patientRepository;
		this.doctorRepository = doctorRepository;
		this.appointmentRepository = appointmentRepository;
		this.notificationService = notificationService;
	}

	// Doctor creates a prescription

	@Override
	public PrescriptionResponse createPrescription(String doctorEmail, PrescriptionRequest request) {

		Doctor doctor = doctorRepository.findByUserEmail(doctorEmail)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor profile not found"));

		Patient patient = patientRepository.findById(request.patientId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));

		boolean hasValidAppointment = appointmentRepository.existsByDoctorIdAndPatientIdAndStatusIn(doctor.getId(),
				patient.getId(), List.of(AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED));

		if (!hasValidAppointment) {
			throw new AccessDeniedException(
					"You can create prescriptions only for your confirmed or completed patients");
		}

		LocalDate today = LocalDate.now();

		if (request.validUntil().isBefore(today)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Prescription validity date cannot be in the past");
		}

		Prescription prescription = new Prescription();

		prescription.setPatient(patient);
		prescription.setDoctor(doctor);
		prescription.setDiagnosis(request.diagnosis());
		prescription.setInstructions(request.instructions());
		prescription.setPrescriptionDate(today);
		prescription.setValidUntil(request.validUntil());
		prescription.setStatus(PrescriptionStatus.ISSUED);

		for (PrescriptionMedicineRequest medicineRequest : request.medicines()) {

			PrescriptionItem item = new PrescriptionItem();

			item.setPrescription(prescription);
			item.setMedicineName(medicineRequest.medicineName());
			item.setDosage(medicineRequest.dosage());
			item.setFrequency(medicineRequest.frequency());
			item.setDurationDays(medicineRequest.durationDays());
			item.setQuantity(medicineRequest.quantity());
			item.setInstructions(medicineRequest.instructions());

			prescription.getMedicines().add(item);
		}

		Prescription savedPrescription = prescriptionRepository.save(prescription);

		// Notify patient when prescription is issued

		notificationService.createNotification(patient.getUser().getEmail(), "New Prescription Issued",
				  doctor.getUser().getFullName() + " has issued a new prescription for your diagnosis: "
						+ prescription.getDiagnosis(),
				NotificationType.PRESCRIPTION_ISSUED, "/prescriptions/patient/" + savedPrescription.getId());

		return convertToResponse(savedPrescription);
	}

	// Patient views own prescriptions

	@Override
	@Transactional(readOnly = true)
	public List<PrescriptionResponse> getPatientPrescriptions(String patientEmail) {

		return prescriptionRepository.findAllByPatientUserEmailOrderByPrescriptionDateDesc(patientEmail).stream()
				.map(this::convertToResponse).toList();
	}

	// Doctor views prescriptions created by them

	@Override
	@Transactional(readOnly = true)
	public List<PrescriptionResponse> getDoctorPrescriptions(String doctorEmail) {

		return prescriptionRepository.findAllByDoctorUserEmailOrderByPrescriptionDateDesc(doctorEmail).stream()
				.map(this::convertToResponse).toList();
	}

	// Patient views a specific prescription

	@Override
	@Transactional(readOnly = true)
	public PrescriptionResponse getPatientPrescriptionById(String patientEmail, Long prescriptionId) {

		Prescription prescription = prescriptionRepository.findByIdAndPatientUserEmail(prescriptionId, patientEmail)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription not found"));

		return convertToResponse(prescription);
	}

	// Doctor views a specific prescription

	@Override
	@Transactional(readOnly = true)
	public PrescriptionResponse getDoctorPrescriptionById(String doctorEmail, Long prescriptionId) {

		Prescription prescription = prescriptionRepository.findByIdAndDoctorUserEmail(prescriptionId, doctorEmail)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription not found"));

		return convertToResponse(prescription);
	}

	// Pharmacist views prescriptions awaiting verification

	@Override
	@Transactional(readOnly = true)
	public List<PrescriptionResponse> getPrescriptionsForVerification() {

		return prescriptionRepository.findAllByStatusOrderByPrescriptionDateDesc(PrescriptionStatus.ISSUED).stream()
				.filter(prescription -> !prescription.getValidUntil().isBefore(LocalDate.now()))
				.map(this::convertToResponse).toList();
	}

	// Pharmacist verifies a prescription

	@Override
	public PrescriptionResponse verifyPrescription(Long prescriptionId) {

		Prescription prescription = prescriptionRepository.findById(prescriptionId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription not found"));

		if (prescription.getValidUntil().isBefore(LocalDate.now())) {

			prescription.setStatus(PrescriptionStatus.EXPIRED);

			Prescription expiredPrescription = prescriptionRepository.save(prescription);

			return convertToResponse(expiredPrescription);
		}

		if (prescription.getStatus() != PrescriptionStatus.ISSUED) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only issued prescriptions can be verified");
		}

		prescription.setStatus(PrescriptionStatus.VERIFIED);

		Prescription updatedPrescription = prescriptionRepository.save(prescription);

		return convertToResponse(updatedPrescription);
	}

	// Convert entity to response DTO

	private PrescriptionResponse convertToResponse(Prescription prescription) {

		List<PrescriptionMedicineResponse> medicines = prescription.getMedicines().stream()
				.map(this::convertMedicineToResponse).toList();

		return new PrescriptionResponse(prescription.getId(), prescription.getPatient().getId(),
				prescription.getPatient().getUser().getFullName(), prescription.getPatient().getUser().getEmail(),
				prescription.getDoctor().getId(), prescription.getDoctor().getUser().getFullName(),
				prescription.getDoctor().getUser().getEmail(), prescription.getDiagnosis(),
				prescription.getInstructions(), prescription.getPrescriptionDate(), prescription.getValidUntil(),
				prescription.getStatus(), medicines, prescription.getCreatedAt(), prescription.getUpdatedAt());
	}

	private PrescriptionMedicineResponse convertMedicineToResponse(PrescriptionItem item) {

		return new PrescriptionMedicineResponse(item.getId(), item.getMedicineName(), item.getDosage(),
				item.getFrequency(), item.getDurationDays(), item.getQuantity(), item.getInstructions());
	}
}