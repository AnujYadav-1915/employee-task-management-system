package com.taskflow.service;

import com.taskflow.model.Notification;

import java.util.List;

public interface NotificationService {
    List<Notification> getAllNotifications();
    List<Notification> getNotificationsForUser(Long userId);
    Notification markAsRead(Long id);
}
