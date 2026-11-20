package com.carebridge.laboratory.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.carebridge.laboratory.dto.LabTestRequest;
import com.carebridge.laboratory.dto.LabTestResponse;
import com.carebridge.laboratory.service.LabTestService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/lab-tests")
public class LabTestController {

	private final LabTestService labTestService;

	public LabTestController(LabTestService labTestService) {
		this.labTestService = labTestService;
	}

	// Admin creates laboratory test

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public LabTestResponse createLabTest(@Valid @RequestBody LabTestRequest request) {

		return labTestService.createLabTest(request);
	}

	// Admin updates laboratory test

	@PutMapping("/{testId}")
	public LabTestResponse updateLabTest(@PathVariable Long testId, @Valid @RequestBody LabTestRequest request) {

		return labTestService.updateLabTest(testId, request);
	}

	// View all laboratory tests

	@GetMapping
	public List<LabTestResponse> getAllLabTests() {

		return labTestService.getAllLabTests();
	}

	// View laboratory test by ID

	@GetMapping("/{testId}")
	public LabTestResponse getLabTestById(@PathVariable Long testId) {

		return labTestService.getLabTestById(testId);
	}
}