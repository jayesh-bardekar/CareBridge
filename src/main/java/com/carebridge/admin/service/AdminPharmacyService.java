package com.carebridge.admin.service;

import java.util.List;
import com.carebridge.admin.dto.AdminPharmacyResponse;
import com.carebridge.pharmacy.enums.PharmacyStatus;

public interface AdminPharmacyService {

	List<AdminPharmacyResponse> getAllPharmacies(PharmacyStatus status, String keyword);

	AdminPharmacyResponse getPharmacyById(Long pharmacyId);

	AdminPharmacyResponse updatePharmacyStatus(Long pharmacyId, PharmacyStatus status);

}