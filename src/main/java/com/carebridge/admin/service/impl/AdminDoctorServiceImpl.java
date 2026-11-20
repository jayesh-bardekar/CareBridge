package com.carebridge.admin.service.impl;

import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.carebridge.admin.dto.AdminDoctorResponse;
import com.carebridge.admin.service.AdminDoctorService;
import com.carebridge.auth.entity.User;
import com.carebridge.auth.repository.UserRepository;
import com.carebridge.doctor.entity.Doctor;
import com.carebridge.doctor.enums.DoctorApprovalStatus;
import com.carebridge.doctor.enums.DoctorSpecialization;
import com.carebridge.doctor.repository.DoctorRepository;

@Service
@Transactional
public class AdminDoctorServiceImpl implements AdminDoctorService {

	private final DoctorRepository doctorRepository;
	private final UserRepository userRepository;

	public AdminDoctorServiceImpl(DoctorRepository doctorRepository, UserRepository userRepository) {

		this.doctorRepository = doctorRepository;
		this.userRepository = userRepository;
	}

	// Get all doctors with optional filters
	@Override
	@Transactional(readOnly = true)
	public List<AdminDoctorResponse> getAllDoctors(String specialization, String approvalStatus, String keyword) {

		DoctorSpecialization selectedSpecialization = null;

		if (specialization != null && !specialization.isBlank()) {
			try {
				selectedSpecialization = DoctorSpecialization.valueOf(specialization.trim().toUpperCase(Locale.ROOT));
			} catch (IllegalArgumentException exception) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid doctor specialization.");
			}
		}

		DoctorApprovalStatus selectedStatus = null;

		if (approvalStatus != null && !approvalStatus.isBlank()) {
			try {
				selectedStatus = DoctorApprovalStatus.valueOf(approvalStatus.trim().toUpperCase(Locale.ROOT));
			} catch (IllegalArgumentException exception) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid doctor approval status.");
			}
		}

		final DoctorSpecialization filterSpecialization = selectedSpecialization;

		final DoctorApprovalStatus filterStatus = selectedStatus;

		String searchKeyword = keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT);

		return doctorRepository.findAll().stream()

				.filter(doctor -> filterSpecialization == null || doctor.getSpecialization() == filterSpecialization)

				.filter(doctor -> filterStatus == null || doctor.getApprovalStatus() == filterStatus)

				.filter(doctor -> {
					if (searchKeyword.isBlank()) {
						return true;
					}

					User user = doctor.getUser();

					return contains(user.getFullName(), searchKeyword) || contains(user.getEmail(), searchKeyword)
							|| contains(user.getPhoneNumber(), searchKeyword)
							|| contains(doctor.getQualification(), searchKeyword);
				})

				.map(AdminDoctorResponse::new).toList();
	}

	// Get doctor details by ID
	@Override
	@Transactional(readOnly = true)
	public AdminDoctorResponse getDoctorById(Long doctorId) {

		Doctor doctor = findDoctor(doctorId);

		return new AdminDoctorResponse(doctor);
	}

	// Approve or reject doctor profile
	@Override
	public AdminDoctorResponse updateDoctorApproval(Long doctorId, String approvalStatus) {

		Doctor doctor = findDoctor(doctorId);

		if (approvalStatus == null || approvalStatus.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Approval status is required.");
		}

		DoctorApprovalStatus status;

		try {
			status = DoctorApprovalStatus.valueOf(approvalStatus.trim().toUpperCase(Locale.ROOT));
		} catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid doctor approval status.");
		}

		doctor.setApprovalStatus(status);

		Doctor updatedDoctor = doctorRepository.save(doctor);

		return new AdminDoctorResponse(updatedDoctor);
	}

	// Activate or deactivate doctor account
	@Override
	public AdminDoctorResponse updateDoctorAccountStatus(Long doctorId, boolean enabled) {

		Doctor doctor = findDoctor(doctorId);

		User user = doctor.getUser();

		user.setEnabled(enabled);

		userRepository.save(user);

		return new AdminDoctorResponse(doctor);
	}

	// Common doctor lookup
	private Doctor findDoctor(Long doctorId) {

		return doctorRepository.findById(doctorId).orElseThrow(
				() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found with ID: " + doctorId));
	}

	// Safe case-insensitive search
	private boolean contains(String value, String keyword) {

		return value != null && value.toLowerCase(Locale.ROOT).contains(keyword);
	}
}