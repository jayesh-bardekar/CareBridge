package com.carebridge.auth.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import com.carebridge.auth.dto.LoginResponse;
import com.carebridge.auth.dto.UserLoginRequest;
import com.carebridge.auth.dto.UserResponse;
import com.carebridge.common.exception.ResourceNotFoundException;
import com.carebridge.security.JwtService;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;

    public AuthServiceImpl(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserService userService) {

        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @Override
    public LoginResponse login(UserLoginRequest request) {

        // Authenticate email and password
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Generate JWT token
        String token = jwtService.generateToken(authentication.getName());

        // Fetch authenticated user's details
        UserResponse user = userService.getUserByEmail(authentication.getName())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        // Return token and user details
        return new LoginResponse(token, "Bearer", user);
    }
}