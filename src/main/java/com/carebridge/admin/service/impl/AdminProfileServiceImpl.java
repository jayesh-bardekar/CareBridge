package com.carebridge.admin.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carebridge.admin.dto.AdminProfileResponse;
import com.carebridge.admin.dto.AdminProfileUpdateRequest;
import com.carebridge.admin.service.AdminProfileService;
import com.carebridge.auth.entity.User;
import com.carebridge.auth.repository.UserRepository;
import com.carebridge.common.exception.ResourceNotFoundException;

@Service
@Transactional
public class AdminProfileServiceImpl implements AdminProfileService {

	private final UserRepository userRepository;

	public AdminProfileServiceImpl(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	@Transactional(readOnly = true)
	public AdminProfileResponse getMyProfile(String email) {

		User admin = getAdminByEmail(email);

		return mapToResponse(admin);
	}

	@Override
	public AdminProfileResponse updateMyProfile(String email, AdminProfileUpdateRequest request) {

		User admin = getAdminByEmail(email);

		admin.setFullName(request.getFullName().trim());
		admin.setPhoneNumber(request.getPhoneNumber().trim());

		User updatedAdmin = userRepository.save(admin);

		return mapToResponse(updatedAdmin);
	}

	private User getAdminByEmail(String email) {

		User admin = userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("Admin profile not found"));

		if (!"ADMIN".equals(admin.getRole().name())) {
			throw new IllegalStateException("Access denied. Admin account required.");
		}

		return admin;
	}

	private AdminProfileResponse mapToResponse(User admin) {

		return new AdminProfileResponse(admin.getId(), admin.getFullName(), admin.getEmail(), admin.getPhoneNumber(),
				admin.getRole().name(), admin.isEnabled(), admin.getCreatedAt());
	}
}