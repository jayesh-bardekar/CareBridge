package com.carebridge.patient.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.carebridge.patient.entity.Patient;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByUserEmail(String email);

    boolean existsByUserEmail(String email);

}