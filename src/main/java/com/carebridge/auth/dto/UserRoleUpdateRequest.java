package com.carebridge.auth.dto;

import com.carebridge.auth.enums.UserRole;

public class UserRoleUpdateRequest {

    private UserRole role;

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }
}