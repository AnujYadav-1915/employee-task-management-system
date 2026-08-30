package com.taskflow.notification.controller;

import com.taskflow.notification.model.Notification;
import com.taskflow.notification.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/user/{userId}")
    public List<Notification> getNotificationsForUser(@PathVariable Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return notificationRepository.findById(id)
                .map(notification -> {
                    notification.setReadStatus(true);
                    return ResponseEntity.ok(notificationRepository.save(notification));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
