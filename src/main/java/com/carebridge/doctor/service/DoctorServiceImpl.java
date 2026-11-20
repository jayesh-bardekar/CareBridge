package com.carebridge.doctor.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carebridge.auth.entity.User;
import com.carebridge.auth.enums.UserRole;
import com.carebridge.auth.repository.UserRepository;
import com.carebridge.common.exception.ResourceNotFoundException;
import com.carebridge.doctor.dto.DoctorRequest;
import com.carebridge.doctor.dto.DoctorResponse;
import com.carebridge.doctor.entity.Doctor;
import com.carebridge.doctor.repository.DoctorRepository;
import java.util.List;
import com.carebridge.doctor.enums.DoctorApprovalStatus;

@Service
@Transactional
public class DoctorServiceImpl implements DoctorService {

	private final DoctorRepository doctorRepository;
	private final UserRepository userRepository;

	public DoctorServiceImpl(DoctorRepository doctorRepository, UserRepository userRepository) {

		this.doctorRepository = doctorRepository;
		this.userRepository = userRepository;
	}

	// Create Doctor Profile
	@Override
	public DoctorResponse createDoctorProfile(String email, DoctorRequest request) {

		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

		if (user.getRole() != UserRole.DOCTOR) {
			throw new AccessDeniedException("Only doctors can create doctor profiles");
		}

		if (doctorRepository.existsByUserEmail(email)) {
			throw new IllegalStateException("Doctor profile already exists");
		}

		Doctor doctor = new Doctor();

		doctor.setUser(user);
		doctor.setSpecialization(request.getSpecialization());
		doctor.setQualification(request.getQualification());
		doctor.setExperienceYears(request.getExperienceYears());
		doctor.setConsultationFee(request.getConsultationFee());
		doctor.setAbout(request.getAbout());
		doctor.setClinicAddress(request.getClinicAddress());
		doctor.setAvailableDays(request.getAvailableDays());
		doctor.setStartTime(request.getStartTime());
		doctor.setEndTime(request.getEndTime());

		Doctor savedDoctor = doctorRepository.save(doctor);

		return convertToResponse(savedDoctor);
	}

	// Get Doctor Profile
	@Override
	@Transactional(readOnly = true)
	public DoctorResponse getDoctorProfile(String email) {

		Doctor doctor = doctorRepository.findByUserEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

		return convertToResponse(doctor);
	}

	// Update Doctor Profile
	@Override
	public DoctorResponse updateDoctorProfile(String email, DoctorRequest request) {

		Doctor doctor = doctorRepository.findByUserEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

		if (doctor.getUser().getRole() != UserRole.DOCTOR) {
			throw new AccessDeniedException("Only doctors can update doctor profiles");
		}

		doctor.setSpecialization(request.getSpecialization());
		doctor.setQualification(request.getQualification());
		doctor.setExperienceYears(request.getExperienceYears());
		doctor.setConsultationFee(request.getConsultationFee());
		doctor.setAbout(request.getAbout());
		doctor.setClinicAddress(request.getClinicAddress());
		doctor.setAvailableDays(request.getAvailableDays());
		doctor.setStartTime(request.getStartTime());
		doctor.setEndTime(request.getEndTime());

		Doctor updatedDoctor = doctorRepository.save(doctor);

		return convertToResponse(updatedDoctor);
	}

	// Get All Approved Doctors
	@Override
	@Transactional(readOnly = true)
	public List<DoctorResponse> getApprovedDoctors() {

		return doctorRepository.findAllByApprovalStatus(DoctorApprovalStatus.APPROVED).stream()
				.map(this::convertToResponse).toList();
	}

	// Convert Doctor Entity to Doctor Response
	private DoctorResponse convertToResponse(Doctor doctor) {

		DoctorResponse response = new DoctorResponse();

		response.setId(doctor.getId());
		response.setFullName(doctor.getUser().getFullName());
		response.setEmail(doctor.getUser().getEmail());
		response.setPhoneNumber(doctor.getUser().getPhoneNumber());
		response.setApprovalStatus(doctor.getApprovalStatus());
		response.setSpecialization(doctor.getSpecialization());
		response.setQualification(doctor.getQualification());
		response.setExperienceYears(doctor.getExperienceYears());
		response.setConsultationFee(doctor.getConsultationFee());
		response.setAbout(doctor.getAbout());
		response.setClinicAddress(doctor.getClinicAddress());
		response.setAvailableDays(doctor.getAvailableDays());
		response.setStartTime(doctor.getStartTime());
		response.setEndTime(doctor.getEndTime());

		response.setCreatedAt(doctor.getCreatedAt());
		response.setUpdatedAt(doctor.getUpdatedAt());

		return response;
	}
}