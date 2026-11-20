package com.carebridge.pharmacy.service;

import java.util.List;
import com.carebridge.pharmacy.dto.PharmacyRequest;
import com.carebridge.pharmacy.dto.PharmacyResponse;
import com.carebridge.pharmacy.enums.PharmacyStatus;

public interface PharmacyService {

	PharmacyResponse registerPharmacy(String pharmacistEmail, PharmacyRequest request);

	PharmacyResponse getMyPharmacy(String pharmacistEmail);

	PharmacyResponse updatePharmacy(String pharmacistEmail, PharmacyRequest request);

	List<PharmacyResponse> getApprovedPharmacies();

	PharmacyResponse getApprovedPharmacyById(Long pharmacyId);

	PharmacyResponse updatePharmacyStatus(Long pharmacyId, PharmacyStatus status);

}