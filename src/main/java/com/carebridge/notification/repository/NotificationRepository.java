package com.carebridge.notification.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.carebridge.notification.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

	List<Notification> findAllByUserEmailOrderByCreatedAtDesc(String email);

	List<Notification> findTop10ByUserEmailOrderByCreatedAtDesc(String email);

	Optional<Notification> findByIdAndUserEmail(Long id, String email);

	long countByUserEmailAndReadFalse(String email);
}