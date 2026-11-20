package com.carebridge.patient.service;

import com.carebridge.patient.dto.PatientRequest;
import com.carebridge.patient.dto.PatientResponse;

public interface PatientService {

    PatientResponse createPatientProfile(
            String email, PatientRequest request);

    PatientResponse getPatientProfile(String email);

    PatientResponse updatePatientProfile(
            String email, PatientRequest request);
}