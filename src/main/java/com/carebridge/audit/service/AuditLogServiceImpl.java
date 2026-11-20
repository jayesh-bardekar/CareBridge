package com.carebridge.audit.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carebridge.audit.entity.AuditLog;
import com.carebridge.audit.enums.AuditAction;
import com.carebridge.audit.repository.AuditLogRepository;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional
    public void logActivity(
            String userEmail,
            AuditAction action,
            String description,
            String ipAddress) {

        AuditLog auditLog = new AuditLog();

        auditLog.setUserEmail(userEmail);
        auditLog.setAction(action);
        auditLog.setDescription(description);
        auditLog.setIpAddress(ipAddress);

        auditLogRepository.save(auditLog);
    }

    // Retrieve all audit logs
    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getAllAuditLogs() {

        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }
}