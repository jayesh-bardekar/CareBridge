package com.carebridge.pharmacy.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.carebridge.pharmacy.entity.Pharmacy;
import com.carebridge.pharmacy.enums.PharmacyStatus;

public interface PharmacyRepository extends JpaRepository<Pharmacy, Long> {

	Optional<Pharmacy> findByUserEmail(String email);

	boolean existsByUserEmail(String email);

	boolean existsByLicenseNumberIgnoreCase(String licenseNumber);

	boolean existsByLicenseNumberIgnoreCaseAndIdNot(String licenseNumber, Long id);

	List<Pharmacy> findAllByStatusOrderByPharmacyNameAsc(PharmacyStatus status);

	Optional<Pharmacy> findByIdAndStatus(Long id, PharmacyStatus status);

	long countByStatus(PharmacyStatus status);
}