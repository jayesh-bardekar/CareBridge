package com.carebridge.laboratory.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.carebridge.laboratory.entity.LabOrder;
import com.carebridge.laboratory.enums.LabOrderStatus;

public interface LabOrderRepository extends JpaRepository<LabOrder, Long> {

	List<LabOrder> findAllByPatientIdOrderByOrderedAtDesc(Long patientId);

	List<LabOrder> findAllByDoctorIdOrderByOrderedAtDesc(Long doctorId);

	List<LabOrder> findAllByAssignedLabStaffEmailOrderByOrderedAtDesc(String email);

	Optional<LabOrder> findByIdAndPatientId(Long id, Long patientId);

	Optional<LabOrder> findByIdAndDoctorId(Long id, Long doctorId);

	Optional<LabOrder> findByIdAndAssignedLabStaffEmail(Long id, String email);

	long countByStatus(LabOrderStatus status);

}