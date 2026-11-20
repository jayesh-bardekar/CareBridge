package com.carebridge.inventory.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.carebridge.inventory.dto.MedicineDispenseRequest;
import com.carebridge.inventory.dto.MedicineRequest;
import com.carebridge.inventory.dto.MedicineResponse;
import com.carebridge.inventory.dto.StockUpdateRequest;
import com.carebridge.inventory.service.MedicineService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/inventory/medicines")
public class MedicineController {

	private final MedicineService medicineService;

	public MedicineController(MedicineService medicineService) {
		this.medicineService = medicineService;
	}

	// Add Medicine

	@PostMapping
	public ResponseEntity<MedicineResponse> addMedicine(Authentication authentication,
			@Valid @RequestBody MedicineRequest request) {

		return ResponseEntity.status(HttpStatus.CREATED)
				.body(medicineService.addMedicine(authentication.getName(), request));
	}

	// Get All Medicines

	@GetMapping
	public ResponseEntity<List<MedicineResponse>> getAllMedicines(Authentication authentication) {

		return ResponseEntity.ok(medicineService.getAllMedicines(authentication.getName()));
	}

	// Search Medicines

	@GetMapping("/search")
	public ResponseEntity<List<MedicineResponse>> searchMedicines(Authentication authentication,
			@RequestParam String name) {

		return ResponseEntity.ok(medicineService.searchMedicines(authentication.getName(), name));
	}

	// Get Low Stock Medicines

	@GetMapping("/low-stock")
	public ResponseEntity<List<MedicineResponse>> getLowStockMedicines(Authentication authentication) {

		return ResponseEntity.ok(medicineService.getLowStockMedicines(authentication.getName()));
	}

	// Get Medicine By ID

	@GetMapping("/{medicineId}")
	public ResponseEntity<MedicineResponse> getMedicineById(Authentication authentication,
			@PathVariable Long medicineId) {

		return ResponseEntity.ok(medicineService.getMedicineById(authentication.getName(), medicineId));
	}

	// Update Medicine

	@PutMapping("/{medicineId}")
	public ResponseEntity<MedicineResponse> updateMedicine(Authentication authentication, @PathVariable Long medicineId,
			@Valid @RequestBody MedicineRequest request) {

		return ResponseEntity.ok(medicineService.updateMedicine(authentication.getName(), medicineId, request));
	}

	// Update Stock

	@PatchMapping("/{medicineId}/stock")
	public ResponseEntity<MedicineResponse> updateStock(Authentication authentication, @PathVariable Long medicineId,
			@Valid @RequestBody StockUpdateRequest request) {

		return ResponseEntity.ok(medicineService.updateStock(authentication.getName(), medicineId, request));
	}

	// Dispense Medicine

	@PatchMapping("/{medicineId}/dispense")
	public ResponseEntity<MedicineResponse> dispenseMedicine(Authentication authentication,
			@PathVariable Long medicineId, @Valid @RequestBody MedicineDispenseRequest request) {

		return ResponseEntity.ok(medicineService.dispenseMedicine(authentication.getName(), medicineId, request));
	}

	// Delete Medicine

	@DeleteMapping("/{medicineId}")
	public ResponseEntity<Void> deleteMedicine(Authentication authentication, @PathVariable Long medicineId) {

		medicineService.deleteMedicine(authentication.getName(), medicineId);

		return ResponseEntity.noContent().build();
	}
}