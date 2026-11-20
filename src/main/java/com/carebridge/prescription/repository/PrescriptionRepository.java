package com.carebridge.prescription.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.carebridge.prescription.entity.Prescription;
import com.carebridge.prescription.enums.PrescriptionStatus;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

	List<Prescription> findAllByPatientUserEmailOrderByPrescriptionDateDesc(String email);

	List<Prescription> findAllByDoctorUserEmailOrderByPrescriptionDateDesc(String email);

	Optional<Prescription> findByIdAndPatientUserEmail(Long id, String email);

	Optional<Prescription> findByIdAndDoctorUserEmail(Long id, String email);

	List<Prescription> findAllByStatusOrderByPrescriptionDateDesc(PrescriptionStatus status);

	long countByStatus(PrescriptionStatus status);
}