package com.carebridge.inventory.service;

import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.carebridge.inventory.dto.MedicineDispenseRequest;
import com.carebridge.inventory.dto.MedicineRequest;
import com.carebridge.inventory.dto.MedicineResponse;
import com.carebridge.inventory.dto.StockUpdateRequest;
import com.carebridge.inventory.entity.Medicine;
import com.carebridge.inventory.repository.MedicineRepository;
import com.carebridge.notification.enums.NotificationType;
import com.carebridge.notification.service.NotificationService;
import com.carebridge.pharmacy.entity.Pharmacy;
import com.carebridge.pharmacy.enums.PharmacyStatus;
import com.carebridge.pharmacy.repository.PharmacyRepository;

@Service
@Transactional
public class MedicineServiceImpl implements MedicineService {

	private final MedicineRepository medicineRepository;
	private final PharmacyRepository pharmacyRepository;
	private final NotificationService notificationService;

	public MedicineServiceImpl(MedicineRepository medicineRepository, PharmacyRepository pharmacyRepository,
			NotificationService notificationService) {

		this.medicineRepository = medicineRepository;
		this.pharmacyRepository = pharmacyRepository;
		this.notificationService = notificationService;
	}

	private Pharmacy getApprovedPharmacy(String email) {

		Pharmacy pharmacy = pharmacyRepository.findByUserEmail(email)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pharmacy profile not found"));

		if (pharmacy.getStatus() != PharmacyStatus.APPROVED) {
			throw new AccessDeniedException("Only approved pharmacies can manage medicine inventory");
		}

		return pharmacy;
	}

	private Medicine getMedicine(Long medicineId, Long pharmacyId) {

		return medicineRepository.findByIdAndPharmacyId(medicineId, pharmacyId).orElseThrow(
				() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Medicine not found in your pharmacy"));
	}

	@Override
	public MedicineResponse addMedicine(String pharmacistEmail, MedicineRequest request) {

		Pharmacy pharmacy = getApprovedPharmacy(pharmacistEmail);

		if (medicineRepository.existsByPharmacyIdAndBatchNumberIgnoreCase(pharmacy.getId(), request.batchNumber())) {

			throw new ResponseStatusException(HttpStatus.CONFLICT, "Batch number already exists in this pharmacy");
		}

		Medicine medicine = new Medicine();

		medicine.setPharmacy(pharmacy);

		updateMedicineFields(medicine, request);

		Medicine savedMedicine = medicineRepository.save(medicine);

		sendInventoryNotifications(savedMedicine, false, false);

		return convertToResponse(savedMedicine);
	}

	@Override
	@Transactional(readOnly = true)
	public List<MedicineResponse> getAllMedicines(String pharmacistEmail) {

		Pharmacy pharmacy = getApprovedPharmacy(pharmacistEmail);

		return medicineRepository.findAllByPharmacyIdOrderByMedicineNameAsc(pharmacy.getId()).stream()
				.map(this::convertToResponse).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public MedicineResponse getMedicineById(String pharmacistEmail, Long medicineId) {

		Pharmacy pharmacy = getApprovedPharmacy(pharmacistEmail);

		Medicine medicine = getMedicine(medicineId, pharmacy.getId());

		return convertToResponse(medicine);
	}

	@Override
	public MedicineResponse updateMedicine(String pharmacistEmail, Long medicineId, MedicineRequest request) {

		Pharmacy pharmacy = getApprovedPharmacy(pharmacistEmail);

		Medicine medicine = getMedicine(medicineId, pharmacy.getId());

		boolean duplicateBatch = medicineRepository.existsByPharmacyIdAndBatchNumberIgnoreCaseAndIdNot(pharmacy.getId(),
				request.batchNumber(), medicineId);

		if (duplicateBatch) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Batch number already exists in this pharmacy");
		}

		boolean wasLowStock = isLowStock(medicine);
		boolean wasExpiring = isExpiringSoon(medicine.getExpiryDate());

		updateMedicineFields(medicine, request);

		Medicine savedMedicine = medicineRepository.save(medicine);

		sendInventoryNotifications(savedMedicine, wasLowStock, wasExpiring);

		return convertToResponse(savedMedicine);
	}

	@Override
	public MedicineResponse updateStock(String pharmacistEmail, Long medicineId, StockUpdateRequest request) {

		Pharmacy pharmacy = getApprovedPharmacy(pharmacistEmail);

		Medicine medicine = getMedicine(medicineId, pharmacy.getId());

		boolean wasLowStock = isLowStock(medicine);

		medicine.setQuantity(request.quantity());

		Medicine savedMedicine = medicineRepository.save(medicine);

		sendLowStockNotification(savedMedicine, wasLowStock);

		return convertToResponse(savedMedicine);
	}

	@Override
	public MedicineResponse dispenseMedicine(String pharmacistEmail, Long medicineId, MedicineDispenseRequest request) {

		Pharmacy pharmacy = getApprovedPharmacy(pharmacistEmail);

		Medicine medicine = getMedicine(medicineId, pharmacy.getId());

		if (!medicine.isActive()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Medicine is not active");
		}

		if (medicine.getExpiryDate().isBefore(LocalDate.now())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expired medicines cannot be dispensed");
		}

		if (medicine.getQuantity() < request.quantity()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient medicine stock");
		}

		boolean wasLowStock = isLowStock(medicine);

		medicine.setQuantity(medicine.getQuantity() - request.quantity());

		Medicine savedMedicine = medicineRepository.save(medicine);

		sendLowStockNotification(savedMedicine, wasLowStock);

		return convertToResponse(savedMedicine);
	}

	@Override
	public void deleteMedicine(String pharmacistEmail, Long medicineId) {

		Pharmacy pharmacy = getApprovedPharmacy(pharmacistEmail);

		Medicine medicine = getMedicine(medicineId, pharmacy.getId());

		medicineRepository.delete(medicine);
	}

	@Override
	@Transactional(readOnly = true)
	public List<MedicineResponse> searchMedicines(String pharmacistEmail, String medicineName) {

		Pharmacy pharmacy = getApprovedPharmacy(pharmacistEmail);

		return medicineRepository
				.findAllByPharmacyIdAndMedicineNameContainingIgnoreCaseOrderByMedicineNameAsc(pharmacy.getId(),
						medicineName)
				.stream().map(this::convertToResponse).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public List<MedicineResponse> getLowStockMedicines(String pharmacistEmail) {

		Pharmacy pharmacy = getApprovedPharmacy(pharmacistEmail);

		return medicineRepository.findLowStockMedicines(pharmacy.getId()).stream().map(this::convertToResponse)
				.toList();
	}

	private void sendInventoryNotifications(Medicine medicine, boolean wasLowStock, boolean wasExpiring) {

		sendLowStockNotification(medicine, wasLowStock);

		if (!wasExpiring && isExpiringSoon(medicine.getExpiryDate())) {

			notificationService.createNotification(medicine.getPharmacy().getUser().getEmail(), "Medicine Expiry Alert",
					medicine.getMedicineName() + " (Batch: " + medicine.getBatchNumber() + ") will expire on "
							+ medicine.getExpiryDate() + ". Please review the stock.",
					NotificationType.MEDICINE_EXPIRY, "/inventory/medicines/" + medicine.getId());
		}
	}

	private void sendLowStockNotification(Medicine medicine, boolean wasLowStock) {

		if (!wasLowStock && isLowStock(medicine)) {

			notificationService.createNotification(medicine.getPharmacy().getUser().getEmail(),
					"Low Medicine Stock Alert",
					medicine.getMedicineName() + " stock is low. Available quantity: " + medicine.getQuantity()
							+ ", Minimum stock level: " + medicine.getMinimumStockLevel() + ".",
					NotificationType.LOW_STOCK, "/inventory/medicines/" + medicine.getId());
		}
	}

	private boolean isLowStock(Medicine medicine) {

		return medicine.getQuantity() <= medicine.getMinimumStockLevel();
	}

	private boolean isExpiringSoon(LocalDate expiryDate) {

		LocalDate today = LocalDate.now();

		return !expiryDate.isBefore(today) && !expiryDate.isAfter(today.plusDays(30));
	}

	private void updateMedicineFields(Medicine medicine, MedicineRequest request) {

		medicine.setMedicineName(request.medicineName());
		medicine.setManufacturer(request.manufacturer());
		medicine.setCategory(request.category());
		medicine.setBatchNumber(request.batchNumber());
		medicine.setPrice(request.price());
		medicine.setQuantity(request.quantity());
		medicine.setMinimumStockLevel(request.minimumStockLevel());
		medicine.setExpiryDate(request.expiryDate());
		medicine.setDescription(request.description());
		medicine.setActive(request.active());
	}

	private MedicineResponse convertToResponse(Medicine medicine) {

		return new MedicineResponse(medicine.getId(), medicine.getPharmacy().getId(),
				medicine.getPharmacy().getPharmacyName(), medicine.getMedicineName(), medicine.getManufacturer(),
				medicine.getCategory(), medicine.getBatchNumber(), medicine.getPrice(), medicine.getQuantity(),
				medicine.getMinimumStockLevel(), medicine.getExpiryDate(), medicine.getDescription(),
				medicine.isActive(), medicine.getQuantity() <= medicine.getMinimumStockLevel(), medicine.getCreatedAt(),
				medicine.getUpdatedAt());
	}
}
