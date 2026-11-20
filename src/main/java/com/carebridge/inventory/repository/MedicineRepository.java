package com.carebridge.inventory.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.carebridge.inventory.entity.Medicine;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {

	List<Medicine> findAllByPharmacyIdOrderByMedicineNameAsc(Long pharmacyId);

	Optional<Medicine> findByIdAndPharmacyId(Long id, Long pharmacyId);

	boolean existsByPharmacyIdAndBatchNumberIgnoreCase(Long pharmacyId, String batchNumber);

	boolean existsByPharmacyIdAndBatchNumberIgnoreCaseAndIdNot(Long pharmacyId, String batchNumber, Long id);

	List<Medicine> findAllByPharmacyIdAndMedicineNameContainingIgnoreCaseOrderByMedicineNameAsc(Long pharmacyId,
			String medicineName);

	@Query("""
			    SELECT m
			    FROM Medicine m
			    WHERE m.pharmacy.id = :pharmacyId
			    AND m.active = true
			    AND m.quantity <= m.minimumStockLevel
			    ORDER BY m.quantity ASC
			""")
	List<Medicine> findLowStockMedicines(@Param("pharmacyId") Long pharmacyId);

}