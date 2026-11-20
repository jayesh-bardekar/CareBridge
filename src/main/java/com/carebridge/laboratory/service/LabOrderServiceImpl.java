package com.carebridge.laboratory.service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.carebridge.appointment.enums.AppointmentStatus;
import com.carebridge.appointment.repository.AppointmentRepository;
import com.carebridge.auth.entity.User;
import com.carebridge.auth.enums.UserRole;
import com.carebridge.auth.repository.UserRepository;
import com.carebridge.doctor.entity.Doctor;
import com.carebridge.doctor.repository.DoctorRepository;
import com.carebridge.laboratory.dto.AssignLabStaffRequest;
import com.carebridge.laboratory.dto.LabOrderRequest;
import com.carebridge.laboratory.dto.LabOrderResponse;
import com.carebridge.laboratory.dto.LabOrderStatusRequest;
import com.carebridge.laboratory.dto.LabReportRequest;
import com.carebridge.laboratory.dto.LabReportResponse;
import com.carebridge.laboratory.entity.LabOrder;
import com.carebridge.laboratory.entity.LabReport;
import com.carebridge.laboratory.entity.LabTest;
import com.carebridge.laboratory.enums.LabOrderStatus;
import com.carebridge.laboratory.repository.LabOrderRepository;
import com.carebridge.laboratory.repository.LabReportRepository;
import com.carebridge.laboratory.repository.LabTestRepository;
import com.carebridge.patient.entity.Patient;
import com.carebridge.patient.repository.PatientRepository;
import com.carebridge.notification.enums.NotificationType;
import com.carebridge.notification.service.NotificationService;

@Service
@Transactional
public class LabOrderServiceImpl implements LabOrderService {

	private final LabOrderRepository labOrderRepository;
	private final LabTestRepository labTestRepository;
	private final LabReportRepository labReportRepository;
	private final PatientRepository patientRepository;
	private final DoctorRepository doctorRepository;
	private final UserRepository userRepository;
	private final AppointmentRepository appointmentRepository;
	private final NotificationService notificationService;

	public LabOrderServiceImpl(LabOrderRepository labOrderRepository, LabTestRepository labTestRepository,
			LabReportRepository labReportRepository, PatientRepository patientRepository,
			DoctorRepository doctorRepository, UserRepository userRepository,
			AppointmentRepository appointmentRepository, NotificationService notificationService) {

		this.labOrderRepository = labOrderRepository;
		this.labTestRepository = labTestRepository;
		this.labReportRepository = labReportRepository;
		this.patientRepository = patientRepository;
		this.doctorRepository = doctorRepository;
		this.userRepository = userRepository;
		this.appointmentRepository = appointmentRepository;
		this.notificationService = notificationService;
	}

	// Create laboratory test order

	@Override
	public LabOrderResponse createLabOrder(String doctorEmail, LabOrderRequest request) {

		Doctor doctor = doctorRepository.findByUserEmail(doctorEmail)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor profile not found"));

		Patient patient = patientRepository.findById(request.patientId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));

		LabTest labTest = labTestRepository.findById(request.labTestId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Laboratory test not found"));

		if (!labTest.isActive()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This laboratory test is currently unavailable");
		}

		boolean hasValidAppointment = appointmentRepository.existsByDoctorIdAndPatientIdAndStatusIn(doctor.getId(),
				patient.getId(), List.of(AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED));

		if (!hasValidAppointment) {
			throw new AccessDeniedException(
					"You can order laboratory tests only for your confirmed or completed patients");
		}

		LabOrder labOrder = new LabOrder();

		labOrder.setPatient(patient);
		labOrder.setDoctor(doctor);
		labOrder.setLabTest(labTest);
		labOrder.setNotes(request.notes());
		labOrder.setStatus(LabOrderStatus.ORDERED);

		return convertToOrderResponse(labOrderRepository.save(labOrder));
	}

	// Patient views own laboratory orders

	@Override
	@Transactional(readOnly = true)
	public List<LabOrderResponse> getPatientLabOrders(String patientEmail) {

		Patient patient = patientRepository.findByUserEmail(patientEmail)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient profile not found"));

		return labOrderRepository.findAllByPatientIdOrderByOrderedAtDesc(patient.getId()).stream()
				.map(this::convertToOrderResponse).toList();
	}

	// Doctor views their laboratory orders

	@Override
	@Transactional(readOnly = true)
	public List<LabOrderResponse> getDoctorLabOrders(String doctorEmail) {

		Doctor doctor = doctorRepository.findByUserEmail(doctorEmail)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor profile not found"));

		return labOrderRepository.findAllByDoctorIdOrderByOrderedAtDesc(doctor.getId()).stream()
				.map(this::convertToOrderResponse).toList();
	}

	// Lab staff views assigned orders

	@Override
	@Transactional(readOnly = true)
	public List<LabOrderResponse> getAssignedLabOrders(String staffEmail) {

		return labOrderRepository.findAllByAssignedLabStaffEmailOrderByOrderedAtDesc(staffEmail).stream()
				.map(this::convertToOrderResponse).toList();
	}

	// Admin assigns laboratory staff

	@Override
	public LabOrderResponse assignLabStaff(Long orderId, AssignLabStaffRequest request) {

		LabOrder labOrder = findLabOrder(orderId);

		User labStaff = userRepository.findById(request.labStaffId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Laboratory staff not found"));

		if (labStaff.getRole() != UserRole.LAB_STAFF) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected user is not laboratory staff");
		}

		if (!labStaff.isEnabled()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected laboratory staff account is disabled");
		}

		if (labOrder.getStatus() != LabOrderStatus.ORDERED) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Staff can only be assigned to an ordered test");
		}

		labOrder.setAssignedLabStaff(labStaff);
		labOrder.setAssignedAt(LocalDateTime.now());
		labOrder.setStatus(LabOrderStatus.ASSIGNED);

		return convertToOrderResponse(labOrderRepository.save(labOrder));
	}

	// Lab staff updates test status

	@Override
	public LabOrderResponse updateLabOrderStatus(String staffEmail, Long orderId, LabOrderStatusRequest request) {

		LabOrder labOrder = labOrderRepository.findByIdAndAssignedLabStaffEmail(orderId, staffEmail).orElseThrow(
				() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assigned laboratory order not found"));

		LabOrderStatus currentStatus = labOrder.getStatus();
		LabOrderStatus newStatus = request.status();

		if (currentStatus == LabOrderStatus.ASSIGNED && newStatus == LabOrderStatus.SAMPLE_COLLECTED) {

			labOrder.setSampleCollectedAt(LocalDateTime.now());

		} else if (currentStatus == LabOrderStatus.SAMPLE_COLLECTED && newStatus == LabOrderStatus.IN_PROGRESS) {

			// Sample processing started.

		} else {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid laboratory order status transition");
		}

		labOrder.setStatus(newStatus);

		return convertToOrderResponse(labOrderRepository.save(labOrder));
	}

	// Lab staff uploads completed test report

	@Override
	public LabReportResponse uploadLabReport(String staffEmail, Long orderId, LabReportRequest request) {

		LabOrder labOrder = labOrderRepository.findByIdAndAssignedLabStaffEmail(orderId, staffEmail).orElseThrow(
				() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assigned laboratory order not found"));

		if (labOrder.getStatus() != LabOrderStatus.IN_PROGRESS) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Report can only be uploaded when the test is in progress");
		}

		if (labReportRepository.existsByLabOrderId(orderId)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Laboratory report already exists for this order");
		}

		User staff = userRepository.findByEmail(staffEmail).orElseThrow(
				() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Laboratory staff account not found"));

		LabReport report = new LabReport();

		report.setLabOrder(labOrder);
		report.setResultSummary(request.resultSummary());
		report.setFindings(request.findings());
		report.setReportFileUrl(request.reportFileUrl());
		report.setUploadedBy(staff);

		labOrder.setStatus(LabOrderStatus.COMPLETED);
		labOrder.setCompletedAt(LocalDateTime.now());

		labOrderRepository.save(labOrder);

		LabReport savedReport = labReportRepository.save(report);

		// Notify patient when laboratory report becomes available

		String patientEmail = labOrder.getPatient().getUser().getEmail();
		String testName = labOrder.getLabTest().getTestName();

		notificationService.createNotification(patientEmail, "Laboratory Report Available",
				"Your laboratory report for " + testName + " is now available.", NotificationType.LAB_REPORT_AVAILABLE,
				"/lab-orders/" + orderId + "/report");

		return convertToReportResponse(savedReport);
	}

	// Patient views own laboratory report

	@Override
	@Transactional(readOnly = true)
	public LabReportResponse getPatientLabReport(String patientEmail, Long orderId) {

		LabOrder labOrder = labOrderRepository.findById(orderId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Laboratory order not found"));

		if (!labOrder.getPatient().getUser().getEmail().equals(patientEmail)) {
			throw new AccessDeniedException("You cannot access another patient's laboratory report");
		}

		return getReportByOrderId(orderId);
	}

	// Doctor views reports for their own orders

	@Override
	@Transactional(readOnly = true)
	public LabReportResponse getDoctorLabReport(String doctorEmail, Long orderId) {

		LabOrder labOrder = labOrderRepository.findById(orderId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Laboratory order not found"));

		if (!labOrder.getDoctor().getUser().getEmail().equals(doctorEmail)) {
			throw new AccessDeniedException("You cannot access another doctor's laboratory report");
		}

		return getReportByOrderId(orderId);
	}

	// Assigned laboratory staff views report

	@Override
	@Transactional(readOnly = true)
	public LabReportResponse getStaffLabReport(String staffEmail, Long orderId) {

		LabOrder labOrder = labOrderRepository.findByIdAndAssignedLabStaffEmail(orderId, staffEmail).orElseThrow(
				() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assigned laboratory order not found"));

		return getReportByOrderId(labOrder.getId());
	}

	// Find laboratory order

	private LabOrder findLabOrder(Long orderId) {

		return labOrderRepository.findById(orderId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Laboratory order not found"));
	}

	// Find report

	private LabReportResponse getReportByOrderId(Long orderId) {

		LabReport report = labReportRepository.findByLabOrderId(orderId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Laboratory report not found"));

		return convertToReportResponse(report);
	}

	// Convert order entity to response

	private LabOrderResponse convertToOrderResponse(LabOrder order) {

		User assignedStaff = order.getAssignedLabStaff();

		return new LabOrderResponse(order.getId(),

				order.getPatient().getId(), order.getPatient().getUser().getFullName(),
				order.getPatient().getUser().getEmail(),

				order.getDoctor().getId(), order.getDoctor().getUser().getFullName(),
				order.getDoctor().getUser().getEmail(),

				order.getLabTest().getId(), order.getLabTest().getTestName(), order.getLabTest().getCategory().name(),

				assignedStaff != null ? assignedStaff.getId() : null,
				assignedStaff != null ? assignedStaff.getFullName() : null,

				order.getStatus(), order.getNotes(),

				order.getOrderedAt(), order.getAssignedAt(), order.getSampleCollectedAt(), order.getCompletedAt());
	}

	// Convert report entity to response

	private LabReportResponse convertToReportResponse(LabReport report) {

		LabOrder order = report.getLabOrder();

		return new LabReportResponse(report.getId(), order.getId(), order.getLabTest().getTestName(),
				order.getPatient().getUser().getFullName(), order.getDoctor().getUser().getFullName(),
				report.getResultSummary(), report.getFindings(), report.getReportFileUrl(),
				report.getUploadedBy().getFullName(), report.getUploadedAt());
	}
}