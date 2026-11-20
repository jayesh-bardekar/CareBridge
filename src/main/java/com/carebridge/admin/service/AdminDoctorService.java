package com.carebridge.admin.service;

import java.util.List;
import com.carebridge.admin.dto.AdminDoctorResponse;

public interface AdminDoctorService {

	// Get all doctors with optional filters
	List<AdminDoctorResponse> getAllDoctors(String specialization, String approvalStatus, String keyword);

	// Get doctor details by ID
	AdminDoctorResponse getDoctorById(Long doctorId);

	// Approve or reject doctor profile
	AdminDoctorResponse updateDoctorApproval(Long doctorId, String approvalStatus);

	// Activate or deactivate doctor account
	AdminDoctorResponse updateDoctorAccountStatus(Long doctorId, boolean enabled);
}