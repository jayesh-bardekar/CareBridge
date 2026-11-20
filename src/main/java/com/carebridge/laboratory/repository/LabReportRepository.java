package com.carebridge.laboratory.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.carebridge.laboratory.entity.LabReport;

public interface LabReportRepository extends JpaRepository<LabReport, Long> {

	Optional<LabReport> findByLabOrderId(Long labOrderId);

	boolean existsByLabOrderId(Long labOrderId);

}