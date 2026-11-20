package com.carebridge.admin.service.impl;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carebridge.admin.dto.AdminDashboardResponse;
import com.carebridge.admin.dto.AppointmentStatisticsResponse;
import com.carebridge.admin.dto.LabOrderStatisticsResponse;
import com.carebridge.admin.dto.PharmacyStatisticsResponse;
import com.carebridge.admin.dto.PrescriptionStatisticsResponse;
import com.carebridge.admin.dto.RecentRegistrationResponse;
import com.carebridge.admin.dto.UserStatisticsResponse;
import com.carebridge.admin.service.AdminDashboardService;
import com.carebridge.auth.enums.UserRole;
import com.carebridge.auth.repository.UserRepository;
import com.carebridge.appointment.enums.AppointmentStatus;
import com.carebridge.appointment.repository.AppointmentRepository;
import com.carebridge.prescription.enums.PrescriptionStatus;
import com.carebridge.prescription.repository.PrescriptionRepository;
import com.carebridge.laboratory.enums.LabOrderStatus;
import com.carebridge.laboratory.repository.LabOrderRepository;
import com.carebridge.laboratory.repository.LabTestRepository;
import com.carebridge.pharmacy.enums.PharmacyStatus;
import com.carebridge.pharmacy.repository.PharmacyRepository;
import com.carebridge.inventory.repository.MedicineRepository;
import com.carebridge.medicalrecord.repository.MedicalRecordRepository;

@Service
@Transactional(readOnly = true)
public class AdminDashboardServiceImpl implements AdminDashboardService {

	private final UserRepository userRepository;
	private final AppointmentRepository appointmentRepository;
	private final PrescriptionRepository prescriptionRepository;
	private final LabOrderRepository labOrderRepository;
	private final PharmacyRepository pharmacyRepository;
	private final MedicineRepository medicineRepository;
	private final MedicalRecordRepository medicalRecordRepository;
	private final LabTestRepository labTestRepository;

	public AdminDashboardServiceImpl(UserRepository userRepository, AppointmentRepository appointmentRepository,
			PrescriptionRepository prescriptionRepository, LabOrderRepository labOrderRepository,
			PharmacyRepository pharmacyRepository, MedicineRepository medicineRepository,
			MedicalRecordRepository medicalRecordRepository, LabTestRepository labTestRepository) {

		this.userRepository = userRepository;
		this.appointmentRepository = appointmentRepository;
		this.prescriptionRepository = prescriptionRepository;
		this.labOrderRepository = labOrderRepository;
		this.pharmacyRepository = pharmacyRepository;
		this.medicineRepository = medicineRepository;
		this.medicalRecordRepository = medicalRecordRepository;
		this.labTestRepository = labTestRepository;
	}

	@Override
	public AdminDashboardResponse getDashboard() {

		// User statistics
		UserStatisticsResponse users = new UserStatisticsResponse(userRepository.count(),
				userRepository.countByRole(UserRole.ADMIN), userRepository.countByRole(UserRole.PATIENT),
				userRepository.countByRole(UserRole.DOCTOR), userRepository.countByRole(UserRole.LAB_STAFF),
				userRepository.countByRole(UserRole.PHARMACIST));

		// Appointment statistics
		AppointmentStatisticsResponse appointments = new AppointmentStatisticsResponse(appointmentRepository.count(),
				appointmentRepository.countByStatus(AppointmentStatus.PENDING),
				appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED),
				appointmentRepository.countByStatus(AppointmentStatus.REJECTED),
				appointmentRepository.countByStatus(AppointmentStatus.CANCELLED),
				appointmentRepository.countByStatus(AppointmentStatus.COMPLETED));

		// Prescription statistics
		PrescriptionStatisticsResponse prescriptions = new PrescriptionStatisticsResponse(
				prescriptionRepository.count(), prescriptionRepository.countByStatus(PrescriptionStatus.ISSUED),
				prescriptionRepository.countByStatus(PrescriptionStatus.VERIFIED),
				prescriptionRepository.countByStatus(PrescriptionStatus.PARTIALLY_DISPENSED),
				prescriptionRepository.countByStatus(PrescriptionStatus.DISPENSED),
				prescriptionRepository.countByStatus(PrescriptionStatus.CANCELLED),
				prescriptionRepository.countByStatus(PrescriptionStatus.EXPIRED));

		// Laboratory order statistics
		LabOrderStatisticsResponse labOrders = new LabOrderStatisticsResponse(labOrderRepository.count(),
				labOrderRepository.countByStatus(LabOrderStatus.ORDERED),
				labOrderRepository.countByStatus(LabOrderStatus.ASSIGNED),
				labOrderRepository.countByStatus(LabOrderStatus.SAMPLE_COLLECTED),
				labOrderRepository.countByStatus(LabOrderStatus.IN_PROGRESS),
				labOrderRepository.countByStatus(LabOrderStatus.COMPLETED),
				labOrderRepository.countByStatus(LabOrderStatus.CANCELLED));

		// Pharmacy statistics
		PharmacyStatisticsResponse pharmacies = new PharmacyStatisticsResponse(pharmacyRepository.count(),
				pharmacyRepository.countByStatus(PharmacyStatus.PENDING),
				pharmacyRepository.countByStatus(PharmacyStatus.APPROVED),
				pharmacyRepository.countByStatus(PharmacyStatus.REJECTED),
				pharmacyRepository.countByStatus(PharmacyStatus.SUSPENDED));

		// Recent registrations
		List<RecentRegistrationResponse> recentRegistrations = userRepository.findTop10ByOrderByCreatedAtDesc().stream()
				.map(user -> new RecentRegistrationResponse(user.getId(), user.getFullName(), user.getEmail(),
						user.getRole(), user.getCreatedAt()))
				.toList();

		// Complete dashboard response
		return new AdminDashboardResponse(users, appointments, prescriptions, labOrders, pharmacies,
				medicalRecordRepository.count(), medicineRepository.count(), labTestRepository.count(),
				recentRegistrations);
	}
}