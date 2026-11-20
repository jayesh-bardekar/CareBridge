package com.carebridge.notification.dto;

import java.time.LocalDateTime;
import com.carebridge.notification.enums.NotificationType;

public record NotificationResponse(

		Long id,

		String title,

		String message,

		NotificationType type,

		String targetUrl,

		boolean read,

		LocalDateTime readAt,

		LocalDateTime createdAt

) {
}