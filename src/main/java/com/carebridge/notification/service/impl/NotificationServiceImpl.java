package com.carebridge.notification.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.carebridge.auth.entity.User;
import com.carebridge.auth.repository.UserRepository;
import com.carebridge.notification.dto.NotificationResponse;
import com.carebridge.notification.dto.UnreadNotificationCountResponse;
import com.carebridge.notification.entity.Notification;
import com.carebridge.notification.enums.NotificationType;
import com.carebridge.notification.repository.NotificationRepository;
import com.carebridge.notification.service.NotificationService;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

	private final NotificationRepository notificationRepository;
	private final UserRepository userRepository;

	public NotificationServiceImpl(NotificationRepository notificationRepository, UserRepository userRepository) {
		this.notificationRepository = notificationRepository;
		this.userRepository = userRepository;
	}

	@Override
	public void createNotification(String recipientEmail, String title, String message, NotificationType type,
			String targetUrl) {

		User user = userRepository.findByEmail(recipientEmail)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

		Notification notification = new Notification();
		notification.setUser(user);
		notification.setTitle(title);
		notification.setMessage(message);
		notification.setType(type);
		notification.setTargetUrl(targetUrl);
		notification.setRead(false);

		notificationRepository.save(notification);
	}

	@Override
	@Transactional(readOnly = true)
	public List<NotificationResponse> getMyNotifications(String email) {
		return notificationRepository.findAllByUserEmailOrderByCreatedAtDesc(email).stream().map(this::mapToResponse)
				.toList();
	}

	@Override
	@Transactional(readOnly = true)
	public List<NotificationResponse> getRecentNotifications(String email) {
		return notificationRepository.findTop10ByUserEmailOrderByCreatedAtDesc(email).stream().map(this::mapToResponse)
				.toList();
	}

	@Override
	@Transactional(readOnly = true)
	public UnreadNotificationCountResponse getUnreadCount(String email) {
		long count = notificationRepository.countByUserEmailAndReadFalse(email);

		return new UnreadNotificationCountResponse(count);
	}

	@Override
	public NotificationResponse markAsRead(Long notificationId, String email) {
		Notification notification = findUserNotification(notificationId, email);

		notification.setRead(true);
		notification.setReadAt(LocalDateTime.now());

		Notification updatedNotification = notificationRepository.save(notification);

		return mapToResponse(updatedNotification);
	}

	@Override
	public void markAllAsRead(String email) {
		List<Notification> notifications = notificationRepository.findAllByUserEmailOrderByCreatedAtDesc(email);

		LocalDateTime now = LocalDateTime.now();

		notifications.stream().filter(notification -> !notification.isRead()).forEach(notification -> {
			notification.setRead(true);
			notification.setReadAt(now);
		});

		notificationRepository.saveAll(notifications);
	}

	@Override
	public void deleteNotification(Long notificationId, String email) {
		Notification notification = findUserNotification(notificationId, email);

		notificationRepository.delete(notification);
	}

	private Notification findUserNotification(Long notificationId, String email) {
		return notificationRepository.findByIdAndUserEmail(notificationId, email)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
	}

	private NotificationResponse mapToResponse(Notification notification) {
		return new NotificationResponse(notification.getId(), notification.getTitle(), notification.getMessage(),
				notification.getType(), notification.getTargetUrl(), notification.isRead(), notification.getReadAt(),
				notification.getCreatedAt());
	}
}