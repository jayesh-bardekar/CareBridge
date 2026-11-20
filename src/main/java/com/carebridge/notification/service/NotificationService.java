package com.carebridge.notification.service;

import java.util.List;
import com.carebridge.notification.dto.NotificationResponse;
import com.carebridge.notification.dto.UnreadNotificationCountResponse;
import com.carebridge.notification.enums.NotificationType;

public interface NotificationService {

	void createNotification(String recipientEmail, String title, String message, NotificationType type,
			String targetUrl);

	List<NotificationResponse> getMyNotifications(String email);

	List<NotificationResponse> getRecentNotifications(String email);

	UnreadNotificationCountResponse getUnreadCount(String email);

	NotificationResponse markAsRead(Long notificationId, String email);

	void markAllAsRead(String email);

	void deleteNotification(Long notificationId, String email);
}