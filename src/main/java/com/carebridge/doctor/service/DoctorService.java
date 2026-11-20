package com.carebridge.doctor.service;

import java.util.List;
import com.carebridge.doctor.dto.DoctorRequest;
import com.carebridge.doctor.dto.DoctorResponse;

public interface DoctorService {

	DoctorResponse createDoctorProfile(String email, DoctorRequest request);

	DoctorResponse getDoctorProfile(String email);

	DoctorResponse updateDoctorProfile(String email, DoctorRequest request);

	List<DoctorResponse> getApprovedDoctors();
}