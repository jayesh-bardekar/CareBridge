package com.carebridge.notification.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.carebridge.notification.dto.NotificationResponse;
import com.carebridge.notification.dto.UnreadNotificationCountResponse;
import com.carebridge.notification.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

	private final NotificationService notificationService;

	public NotificationController(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	@GetMapping
	public ResponseEntity<List<NotificationResponse>> getMyNotifications(Authentication authentication) {

		return ResponseEntity.ok(notificationService.getMyNotifications(authentication.getName()));
	}

	@GetMapping("/recent")
	public ResponseEntity<List<NotificationResponse>> getRecentNotifications(Authentication authentication) {

		return ResponseEntity.ok(notificationService.getRecentNotifications(authentication.getName()));
	}

	@GetMapping("/unread-count")
	public ResponseEntity<UnreadNotificationCountResponse> getUnreadCount(Authentication authentication) {

		return ResponseEntity.ok(notificationService.getUnreadCount(authentication.getName()));
	}

	@PatchMapping("/{notificationId}/read")
	public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long notificationId,
			Authentication authentication) {

		return ResponseEntity.ok(notificationService.markAsRead(notificationId, authentication.getName()));
	}

	@PatchMapping("/read-all")
	public ResponseEntity<Void> markAllAsRead(Authentication authentication) {

		notificationService.markAllAsRead(authentication.getName());

		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/{notificationId}")
	public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId, Authentication authentication) {

		notificationService.deleteNotification(notificationId, authentication.getName());

		return ResponseEntity.noContent().build();
	}
}