package com.carebridge.laboratory.service;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.carebridge.laboratory.dto.LabTestRequest;
import com.carebridge.laboratory.dto.LabTestResponse;
import com.carebridge.laboratory.entity.LabTest;
import com.carebridge.laboratory.repository.LabTestRepository;

@Service
@Transactional
public class LabTestServiceImpl implements LabTestService {

	private final LabTestRepository labTestRepository;

	public LabTestServiceImpl(LabTestRepository labTestRepository) {
		this.labTestRepository = labTestRepository;
	}

	@Override
	public LabTestResponse createLabTest(LabTestRequest request) {

		if (labTestRepository.existsByTestNameIgnoreCase(request.testName())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Laboratory test already exists");
		}

		LabTest labTest = new LabTest();

		updateLabTestFields(labTest, request);

		return convertToResponse(labTestRepository.save(labTest));
	}

	@Override
	public LabTestResponse updateLabTest(Long testId, LabTestRequest request) {

		LabTest labTest = labTestRepository.findById(testId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Laboratory test not found"));

		labTestRepository.findByTestNameIgnoreCase(request.testName())
				.filter(existing -> !existing.getId().equals(testId)).ifPresent(existing -> {
					throw new ResponseStatusException(HttpStatus.CONFLICT,
							"Another laboratory test already uses this name");
				});

		updateLabTestFields(labTest, request);

		return convertToResponse(labTestRepository.save(labTest));
	}

	@Override
	public List<LabTestResponse> getAllLabTests() {
		return labTestRepository.findAllByActiveTrueOrderByTestNameAsc().stream().map(this::convertToResponse).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public LabTestResponse getLabTestById(Long testId) {

		LabTest labTest = labTestRepository.findById(testId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Laboratory test not found"));

		return convertToResponse(labTest);
	}

	private void updateLabTestFields(LabTest labTest, LabTestRequest request) {

		labTest.setTestName(request.testName());
		labTest.setCategory(request.category());
		labTest.setDescription(request.description());
		labTest.setPrice(request.price());
		labTest.setSampleType(request.sampleType());
		labTest.setPreparationInstructions(request.preparationInstructions());
		labTest.setActive(request.active());
	}

	private LabTestResponse convertToResponse(LabTest labTest) {

		return new LabTestResponse(labTest.getId(), labTest.getTestName(), labTest.getCategory(),
				labTest.getDescription(), labTest.getPrice(), labTest.getSampleType(),
				labTest.getPreparationInstructions(), labTest.isActive(), labTest.getCreatedAt(),
				labTest.getUpdatedAt());
	}
}