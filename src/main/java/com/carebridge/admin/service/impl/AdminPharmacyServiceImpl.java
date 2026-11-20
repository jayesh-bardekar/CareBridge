package com.carebridge.admin.service.impl;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.carebridge.admin.dto.AdminPharmacyResponse;
import com.carebridge.admin.service.AdminPharmacyService;
import com.carebridge.pharmacy.entity.Pharmacy;
import com.carebridge.pharmacy.enums.PharmacyStatus;
import com.carebridge.pharmacy.repository.PharmacyRepository;

@Service
@Transactional
public class AdminPharmacyServiceImpl implements AdminPharmacyService {

	private final PharmacyRepository pharmacyRepository;

	public AdminPharmacyServiceImpl(PharmacyRepository pharmacyRepository) {
		this.pharmacyRepository = pharmacyRepository;
	}

	// Get All Pharmacies With Filters

	@Override
	@Transactional(readOnly = true)
	public List<AdminPharmacyResponse> getAllPharmacies(PharmacyStatus status, String keyword) {

		String searchKeyword = keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT);

		return pharmacyRepository.findAll().stream()

				// Filter by pharmacy status
				.filter(pharmacy -> status == null || pharmacy.getStatus() == status)

				// Search by pharmacy and pharmacist details
				.filter(pharmacy -> matchesKeyword(pharmacy, searchKeyword))

				// Latest registrations first
				.sorted(Comparator.comparing(Pharmacy::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))

				.map(this::convertToResponse).toList();
	}

	// Get Pharmacy By ID

	@Override
	@Transactional(readOnly = true)
	public AdminPharmacyResponse getPharmacyById(Long pharmacyId) {

		Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pharmacy not found"));

		return convertToResponse(pharmacy);
	}

	// Update Pharmacy Status

	@Override
	public AdminPharmacyResponse updatePharmacyStatus(Long pharmacyId, PharmacyStatus status) {

		Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pharmacy not found"));

		pharmacy.setStatus(status);

		Pharmacy updatedPharmacy = pharmacyRepository.save(pharmacy);

		return convertToResponse(updatedPharmacy);
	}

	// Search Pharmacy Details

	private boolean matchesKeyword(Pharmacy pharmacy, String keyword) {

		if (keyword.isEmpty()) {
			return true;
		}

		String pharmacistName = pharmacy.getUser().getFullName();
		String pharmacistEmail = pharmacy.getUser().getEmail();
		String pharmacistPhone = pharmacy.getUser().getPhoneNumber();

		return contains(pharmacy.getPharmacyName(), keyword) || contains(pharmacy.getLicenseNumber(), keyword)
				|| contains(pharmacistName, keyword) || contains(pharmacistEmail, keyword)
				|| contains(pharmacistPhone, keyword) || contains(pharmacy.getPhoneNumber(), keyword)
				|| contains(pharmacy.getCity(), keyword) || contains(pharmacy.getState(), keyword);
	}

	private boolean contains(String value, String keyword) {

		return value != null && value.toLowerCase(Locale.ROOT).contains(keyword);
	}

	// Convert Entity To Admin Response

	private AdminPharmacyResponse convertToResponse(Pharmacy pharmacy) {

		var pharmacist = pharmacy.getUser();

		return new AdminPharmacyResponse(

				pharmacy.getId(),

				pharmacist.getId(),

				pharmacist.getFullName(),

				pharmacist.getEmail(),

				pharmacist.getPhoneNumber(),

				pharmacy.getPharmacyName(),

				pharmacy.getLicenseNumber(),

				pharmacy.getPhoneNumber(),

				pharmacy.getContactEmail(),

				pharmacy.getAddress(),

				pharmacy.getCity(),

				pharmacy.getState(),

				pharmacy.getPincode(),

				pharmacy.getStatus(),

				pharmacist.isEnabled(),

				pharmacy.getCreatedAt(),

				pharmacy.getUpdatedAt());
	}
}