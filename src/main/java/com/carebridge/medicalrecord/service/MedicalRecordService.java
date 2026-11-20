package com.carebridge.medicalrecord.service;

import java.util.List;
import com.carebridge.medicalrecord.dto.MedicalRecordRequest;
import com.carebridge.medicalrecord.dto.MedicalRecordResponse;

public interface MedicalRecordService {

	MedicalRecordResponse createMedicalRecord(String doctorEmail, MedicalRecordRequest request);

	List<MedicalRecordResponse> getPatientMedicalRecords(String patientEmail);

	List<MedicalRecordResponse> getDoctorMedicalRecords(String doctorEmail);

	MedicalRecordResponse getPatientMedicalRecordById(String patientEmail, Long recordId);

	MedicalRecordResponse updateMedicalRecord(String doctorEmail, Long recordId, MedicalRecordRequest request);
}