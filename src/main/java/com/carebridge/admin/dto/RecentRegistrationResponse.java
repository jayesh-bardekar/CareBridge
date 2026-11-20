package com.carebridge.admin.dto;

import java.time.LocalDateTime;
import com.carebridge.auth.enums.UserRole;

public record RecentRegistrationResponse(

        Long id,

        String fullName,

        String email,

        UserRole role,

        LocalDateTime createdAt

) {}