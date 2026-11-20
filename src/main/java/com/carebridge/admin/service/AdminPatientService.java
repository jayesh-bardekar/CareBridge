package com.carebridge.admin.service;

import java.util.List;
import com.carebridge.admin.dto.AdminPatientResponse;

public interface AdminPatientService {

	List<AdminPatientResponse> getAllPatients(String gender, String bloodGroup, String keyword);

	AdminPatientResponse getPatientById(Long patientId);

	AdminPatientResponse updatePatientAccountStatus(Long patientId, boolean enabled);

	void deletePatient(Long patientId);
}