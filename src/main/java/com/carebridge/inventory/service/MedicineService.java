package com.carebridge.inventory.service;

import java.util.List;
import com.carebridge.inventory.dto.MedicineDispenseRequest;
import com.carebridge.inventory.dto.MedicineRequest;
import com.carebridge.inventory.dto.MedicineResponse;
import com.carebridge.inventory.dto.StockUpdateRequest;

public interface MedicineService {

	MedicineResponse addMedicine(String pharmacistEmail, MedicineRequest request);

	List<MedicineResponse> getAllMedicines(String pharmacistEmail);

	MedicineResponse getMedicineById(String pharmacistEmail, Long medicineId);

	MedicineResponse updateMedicine(String pharmacistEmail, Long medicineId, MedicineRequest request);

	MedicineResponse updateStock(String pharmacistEmail, Long medicineId, StockUpdateRequest request);

	MedicineResponse dispenseMedicine(String pharmacistEmail, Long medicineId, MedicineDispenseRequest request);

	void deleteMedicine(String pharmacistEmail, Long medicineId);

	List<MedicineResponse> searchMedicines(String pharmacistEmail, String medicineName);

	List<MedicineResponse> getLowStockMedicines(String pharmacistEmail);

}