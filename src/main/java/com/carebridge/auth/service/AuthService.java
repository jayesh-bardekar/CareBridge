package com.carebridge.auth.service;

import com.carebridge.auth.dto.LoginResponse;
import com.carebridge.auth.dto.UserLoginRequest;

public interface AuthService {

    LoginResponse login(UserLoginRequest request);

}