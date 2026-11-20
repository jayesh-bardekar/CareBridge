package com.carebridge.patient.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carebridge.auth.entity.User;
import com.carebridge.auth.repository.UserRepository;
import com.carebridge.common.exception.ResourceNotFoundException;
import com.carebridge.patient.dto.PatientRequest;
import com.carebridge.patient.dto.PatientResponse;
import com.carebridge.patient.entity.Patient;
import com.carebridge.patient.repository.PatientRepository;

@Service
@Transactional
public class PatientServiceImpl implements PatientService {

	private final PatientRepository patientRepository;
	private final UserRepository userRepository;

	public PatientServiceImpl(PatientRepository patientRepository, UserRepository userRepository) {

		this.patientRepository = patientRepository;
		this.userRepository = userRepository;
	}

	@Override
	public PatientResponse createPatientProfile(String email, PatientRequest request) {

		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		if (patientRepository.existsByUserEmail(email)) {
			throw new IllegalStateException("Patient profile already exists");
		}

		Patient patient = new Patient();

		patient.setUser(user);
		patient.setDateOfBirth(request.getDateOfBirth());
		patient.setGender(request.getGender());
		patient.setBloodGroup(request.getBloodGroup());
		patient.setAddress(request.getAddress());
		patient.setEmergencyContactName(request.getEmergencyContactName());
		patient.setEmergencyContactPhone(request.getEmergencyContactPhone());

		Patient savedPatient = patientRepository.save(patient);

		return convertToResponse(savedPatient);
	}

	@Override
	@Transactional(readOnly = true)
	public PatientResponse getPatientProfile(String email) {

		Patient patient = patientRepository.findByUserEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

		return convertToResponse(patient);
	}

	@Override
	public PatientResponse updatePatientProfile(String email, PatientRequest request) {

		Patient patient = patientRepository.findByUserEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

		patient.setDateOfBirth(request.getDateOfBirth());
		patient.setGender(request.getGender());
		patient.setBloodGroup(request.getBloodGroup());
		patient.setAddress(request.getAddress());
		patient.setEmergencyContactName(request.getEmergencyContactName());
		patient.setEmergencyContactPhone(request.getEmergencyContactPhone());

		Patient updatedPatient = patientRepository.save(patient);

		return convertToResponse(updatedPatient);
	}

	private PatientResponse convertToResponse(Patient patient) {

		PatientResponse response = new PatientResponse();

		response.setId(patient.getId());

		response.setFullName(patient.getUser().getFullName());
		response.setEmail(patient.getUser().getEmail());
		response.setPhoneNumber(patient.getUser().getPhoneNumber());

		response.setDateOfBirth(patient.getDateOfBirth());
		response.setGender(patient.getGender());
		response.setBloodGroup(patient.getBloodGroup());
		response.setAddress(patient.getAddress());

		response.setEmergencyContactName(patient.getEmergencyContactName());
		response.setEmergencyContactPhone(patient.getEmergencyContactPhone());

		response.setCreatedAt(patient.getCreatedAt());
		response.setUpdatedAt(patient.getUpdatedAt());

		return response;
	}
}