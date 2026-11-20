package com.carebridge.admin.service.impl;

import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carebridge.admin.dto.AdminPatientResponse;
import com.carebridge.admin.service.AdminPatientService;
import com.carebridge.patient.entity.Patient;
import com.carebridge.patient.repository.PatientRepository;
import com.carebridge.auth.repository.UserRepository;

@Service
@Transactional
public class AdminPatientServiceImpl implements AdminPatientService {

	private final PatientRepository patientRepository;
	private final UserRepository userRepository;

	public AdminPatientServiceImpl(PatientRepository patientRepository, UserRepository userRepository) {

		this.patientRepository = patientRepository;
		this.userRepository = userRepository;
	}

	@Override
	@Transactional(readOnly = true)
	public List<AdminPatientResponse> getAllPatients(String gender, String bloodGroup, String keyword) {

		return patientRepository.findAll().stream()
				.filter(patient -> gender == null || gender.isBlank()
						|| (patient.getGender() != null && patient.getGender().equalsIgnoreCase(gender)))
				.filter(patient -> bloodGroup == null || bloodGroup.isBlank()
						|| (patient.getBloodGroup() != null && patient.getBloodGroup().equalsIgnoreCase(bloodGroup)))
				.filter(patient -> matchesKeyword(patient, keyword)).map(AdminPatientResponse::new).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public AdminPatientResponse getPatientById(Long patientId) {

		Patient patient = findPatient(patientId);

		return new AdminPatientResponse(patient);
	}

	@Override
	public AdminPatientResponse updatePatientAccountStatus(Long patientId, boolean enabled) {

		Patient patient = findPatient(patientId);

		patient.getUser().setEnabled(enabled);

		userRepository.save(patient.getUser());

		return new AdminPatientResponse(patient);
	}

	@Override
	public void deletePatient(Long patientId) {

		Patient patient = findPatient(patientId);

		// Soft delete: deactivate the linked user account.
		patient.getUser().setEnabled(false);

		userRepository.save(patient.getUser());
	}

	private Patient findPatient(Long patientId) {

		return patientRepository.findById(patientId)
				.orElseThrow(() -> new IllegalArgumentException("Patient not found with ID: " + patientId));
	}

	private boolean matchesKeyword(Patient patient, String keyword) {

		if (keyword == null || keyword.isBlank()) {
			return true;
		}

		String search = keyword.toLowerCase(Locale.ROOT);

		return contains(patient.getUser().getFullName(), search) || contains(patient.getUser().getEmail(), search)
				|| contains(patient.getUser().getPhoneNumber(), search) || contains(patient.getBloodGroup(), search)
				|| contains(patient.getAddress(), search);
	}

	private boolean contains(String value, String search) {

		return value != null && value.toLowerCase(Locale.ROOT).contains(search);
	}
}