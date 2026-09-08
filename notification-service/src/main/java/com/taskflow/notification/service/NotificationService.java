package com.taskflow.notification.service;

import com.taskflow.notification.model.Notification;

import java.util.List;

public interface NotificationService {
    List<Notification> getAllNotifications();
    List<Notification> getNotificationsForUser(Long userId);
    Notification createNotification(Notification notification);
    Notification markAsRead(Long id);
}
