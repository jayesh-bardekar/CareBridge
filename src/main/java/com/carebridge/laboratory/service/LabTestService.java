package com.carebridge.laboratory.service;

import java.util.List;
import com.carebridge.laboratory.dto.LabTestRequest;
import com.carebridge.laboratory.dto.LabTestResponse;

public interface LabTestService {

	LabTestResponse createLabTest(LabTestRequest request);

	LabTestResponse updateLabTest(Long testId, LabTestRequest request);

	List<LabTestResponse> getAllLabTests();

	LabTestResponse getLabTestById(Long testId);

}