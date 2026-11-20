package com.carebridge.audit.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.carebridge.audit.entity.AuditLog;
import com.carebridge.audit.service.AuditLogService;

@RestController
@RequestMapping("/api/admin/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    // Get all audit logs (Admin only)
    @GetMapping
    public ResponseEntity<List<AuditLog>> getAllAuditLogs() {

        List<AuditLog> auditLogs =
                auditLogService.getAllAuditLogs();

        return ResponseEntity.ok(auditLogs);
    }
}