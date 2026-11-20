package com.carebridge.laboratory.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.carebridge.laboratory.entity.LabTest;

public interface LabTestRepository extends JpaRepository<LabTest, Long> {

	Optional<LabTest> findByTestNameIgnoreCase(String testName);

	boolean existsByTestNameIgnoreCase(String testName);

	List<LabTest> findAllByActiveTrueOrderByTestNameAsc();

}