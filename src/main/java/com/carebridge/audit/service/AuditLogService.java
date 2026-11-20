package com.carebridge.audit.service;

import java.util.List;
import com.carebridge.audit.entity.AuditLog;
import com.carebridge.audit.enums.AuditAction;

public interface AuditLogService {

    void logActivity(
            String userEmail,
            AuditAction action,
            String description,
            String ipAddress
    );

    // Retrieve all audit logs
    List<AuditLog> getAllAuditLogs();

}