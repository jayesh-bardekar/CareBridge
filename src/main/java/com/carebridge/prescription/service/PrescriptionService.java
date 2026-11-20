package com.carebridge.prescription.service;

import java.util.List;
import com.carebridge.prescription.dto.PrescriptionRequest;
import com.carebridge.prescription.dto.PrescriptionResponse;

public interface PrescriptionService {

	PrescriptionResponse createPrescription(String doctorEmail, PrescriptionRequest request);

	List<PrescriptionResponse> getPatientPrescriptions(String patientEmail);

	List<PrescriptionResponse> getDoctorPrescriptions(String doctorEmail);

	PrescriptionResponse getPatientPrescriptionById(String patientEmail, Long prescriptionId);

	PrescriptionResponse getDoctorPrescriptionById(String doctorEmail, Long prescriptionId);

	List<PrescriptionResponse> getPrescriptionsForVerification();

	PrescriptionResponse verifyPrescription(Long prescriptionId);
}