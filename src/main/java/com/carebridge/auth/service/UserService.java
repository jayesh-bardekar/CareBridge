package com.carebridge.auth.service;

import java.util.Optional;
import com.carebridge.auth.dto.UserRegistrationRequest;
import com.carebridge.auth.dto.UserResponse;

public interface UserService {

	Optional<UserResponse> getUserByEmail(String email);

	boolean isEmailRegistered(String email);

	UserResponse registerUser(UserRegistrationRequest request);
}