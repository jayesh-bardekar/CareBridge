package com.carebridge.pharmacy.service;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.carebridge.auth.entity.User;
import com.carebridge.auth.enums.UserRole;
import com.carebridge.auth.repository.UserRepository;
import com.carebridge.pharmacy.dto.PharmacyRequest;
import com.carebridge.pharmacy.dto.PharmacyResponse;
import com.carebridge.pharmacy.entity.Pharmacy;
import com.carebridge.pharmacy.enums.PharmacyStatus;
import com.carebridge.pharmacy.repository.PharmacyRepository;

@Service
@Transactional
public class PharmacyServiceImpl implements PharmacyService {

	private final PharmacyRepository pharmacyRepository;
	private final UserRepository userRepository;

	public PharmacyServiceImpl(PharmacyRepository pharmacyRepository, UserRepository userRepository) {

		this.pharmacyRepository = pharmacyRepository;
		this.userRepository = userRepository;
	}

	// Register Pharmacy

	@Override
	public PharmacyResponse registerPharmacy(String pharmacistEmail, PharmacyRequest request) {

		User pharmacist = userRepository.findByEmail(pharmacistEmail)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pharmacist not found"));

		if (pharmacist.getRole() != UserRole.PHARMACIST) {
			throw new AccessDeniedException("Only pharmacists can register a pharmacy");
		}

		if (!pharmacist.isEnabled()) {
			throw new AccessDeniedException("Disabled pharmacists cannot register a pharmacy");
		}

		if (pharmacyRepository.existsByUserEmail(pharmacistEmail)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Pharmacy profile already exists");
		}

		if (pharmacyRepository.existsByLicenseNumberIgnoreCase(request.licenseNumber())) {

			throw new ResponseStatusException(HttpStatus.CONFLICT, "Pharmacy license number already exists");
		}

		Pharmacy pharmacy = new Pharmacy();

		pharmacy.setUser(pharmacist);

		updatePharmacyFields(pharmacy, request);

		pharmacy.setStatus(PharmacyStatus.PENDING);

		Pharmacy savedPharmacy = pharmacyRepository.save(pharmacy);

		return convertToResponse(savedPharmacy);
	}

	// Get Own Pharmacy

	@Override
	@Transactional(readOnly = true)
	public PharmacyResponse getMyPharmacy(String pharmacistEmail) {

		Pharmacy pharmacy = pharmacyRepository.findByUserEmail(pharmacistEmail)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pharmacy profile not found"));

		return convertToResponse(pharmacy);
	}

	// Update Pharmacy

	@Override
	public PharmacyResponse updatePharmacy(String pharmacistEmail, PharmacyRequest request) {

		Pharmacy pharmacy = pharmacyRepository.findByUserEmail(pharmacistEmail)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pharmacy profile not found"));

		if (pharmacy.getStatus() == PharmacyStatus.SUSPENDED) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Suspended pharmacy cannot be updated");
		}

		if (pharmacyRepository.existsByLicenseNumberIgnoreCaseAndIdNot(request.licenseNumber(), pharmacy.getId())) {

			throw new ResponseStatusException(HttpStatus.CONFLICT, "Pharmacy license number already exists");
		}

		updatePharmacyFields(pharmacy, request);

		// Changes require fresh admin approval.
		pharmacy.setStatus(PharmacyStatus.PENDING);

		Pharmacy updatedPharmacy = pharmacyRepository.save(pharmacy);

		return convertToResponse(updatedPharmacy);
	}

	// Get All Approved Pharmacies

	@Override
	@Transactional(readOnly = true)
	public List<PharmacyResponse> getApprovedPharmacies() {

		return pharmacyRepository.findAllByStatusOrderByPharmacyNameAsc(PharmacyStatus.APPROVED).stream()
				.map(this::convertToResponse).toList();
	}

	// Get Approved Pharmacy By ID

	@Override
	@Transactional(readOnly = true)
	public PharmacyResponse getApprovedPharmacyById(Long pharmacyId) {

		Pharmacy pharmacy = pharmacyRepository.findByIdAndStatus(pharmacyId, PharmacyStatus.APPROVED)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Approved pharmacy not found"));

		return convertToResponse(pharmacy);
	}

	// Admin Updates Pharmacy Status

	@Override
	public PharmacyResponse updatePharmacyStatus(Long pharmacyId, PharmacyStatus status) {

		Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pharmacy not found"));

		pharmacy.setStatus(status);

		Pharmacy updatedPharmacy = pharmacyRepository.save(pharmacy);

		return convertToResponse(updatedPharmacy);
	}

	// Update Pharmacy Fields

	private void updatePharmacyFields(Pharmacy pharmacy, PharmacyRequest request) {

		pharmacy.setPharmacyName(request.pharmacyName().trim());

		pharmacy.setLicenseNumber(request.licenseNumber().trim());

		pharmacy.setPhoneNumber(request.phoneNumber());

		pharmacy.setContactEmail(request.contactEmail());

		pharmacy.setAddress(request.address());

		pharmacy.setCity(request.city());

		pharmacy.setState(request.state());

		pharmacy.setPincode(request.pincode());
	}

	// Convert Entity To Response

	private PharmacyResponse convertToResponse(Pharmacy pharmacy) {

		User pharmacist = pharmacy.getUser();

		return new PharmacyResponse(

				pharmacy.getId(),

				pharmacist.getId(),

				pharmacist.getFullName(),

				pharmacist.getEmail(),

				pharmacy.getPharmacyName(),

				pharmacy.getLicenseNumber(),

				pharmacy.getPhoneNumber(),

				pharmacy.getContactEmail(),

				pharmacy.getAddress(),

				pharmacy.getCity(),

				pharmacy.getState(),

				pharmacy.getPincode(),

				pharmacy.getStatus(),

				pharmacy.getCreatedAt(),

				pharmacy.getUpdatedAt());
	}
}