package com.carebridge.audit.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.carebridge.audit.entity.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // Retrieve all audit logs, newest first
    List<AuditLog> findAllByOrderByCreatedAtDesc();

}