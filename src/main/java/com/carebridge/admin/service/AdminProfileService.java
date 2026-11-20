package com.carebridge.admin.service;

import com.carebridge.admin.dto.AdminProfileResponse;
import com.carebridge.admin.dto.AdminProfileUpdateRequest;

public interface AdminProfileService {

	AdminProfileResponse getMyProfile(String email);

	AdminProfileResponse updateMyProfile(String email, AdminProfileUpdateRequest request);
}