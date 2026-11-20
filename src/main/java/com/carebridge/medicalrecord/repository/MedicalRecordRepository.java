package com.carebridge.medicalrecord.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.carebridge.medicalrecord.entity.MedicalRecord;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

	List<MedicalRecord> findAllByPatientIdOrderByRecordDateDesc(Long patientId);

	List<MedicalRecord> findAllByDoctorIdOrderByRecordDateDesc(Long doctorId);

	Optional<MedicalRecord> findByIdAndPatientId(Long id, Long patientId);

	Optional<MedicalRecord> findByIdAndDoctorId(Long id, Long doctorId);

}