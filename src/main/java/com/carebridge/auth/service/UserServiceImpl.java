package com.carebridge.auth.service;

import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.carebridge.auth.dto.UserRegistrationRequest;
import com.carebridge.auth.dto.UserResponse;
import com.carebridge.auth.entity.User;
import com.carebridge.auth.enums.UserRole;
import com.carebridge.auth.repository.UserRepository;
import com.carebridge.common.exception.EmailAlreadyExistsException;

@Service
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {

		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public Optional<UserResponse> getUserByEmail(String email) {

		Optional<User> user = userRepository.findByEmail(email);

		return user.map(this::convertToResponse);
	}

	@Override
	public boolean isEmailRegistered(String email) {

		return userRepository.existsByEmail(email);
	}

	@Override
	public UserResponse registerUser(UserRegistrationRequest request) {

		// Check whether email already exists
		if (userRepository.existsByEmail(request.getEmail())) {
		    throw new EmailAlreadyExistsException("Email is already registered");
		}

		// Create new user
		User user = new User();

		user.setFullName(request.getFullName());
		user.setEmail(request.getEmail());

		// Encrypt password using BCrypt
		user.setPassword(passwordEncoder.encode(request.getPassword()));

		user.setPhoneNumber(request.getPhoneNumber());

		// Assign PATIENT role by default
		user.setRole(UserRole.PATIENT);

		user.setEnabled(true);

		// Save user in database
		User savedUser = userRepository.save(user);

		return convertToResponse(savedUser);
	}

	// Convert User entity into UserResponse DTO
	private UserResponse convertToResponse(User user) {

		return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getPhoneNumber(),
				user.getRole(), user.isEnabled(), user.getCreatedAt());
	}
}