package com.carebridge.doctor.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.carebridge.doctor.entity.Doctor;
import com.carebridge.doctor.enums.DoctorApprovalStatus;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

	Optional<Doctor> findByUserEmail(String email);

	boolean existsByUserEmail(String email);

	List<Doctor> findAllByApprovalStatus(DoctorApprovalStatus approvalStatus);
}