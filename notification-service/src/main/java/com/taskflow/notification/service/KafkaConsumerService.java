package com.taskflow.notification.service;

import com.taskflow.notification.model.Notification;
import com.taskflow.notification.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class KafkaConsumerService {

    @Autowired
    private NotificationRepository notificationRepository;

    @KafkaListener(topics = "task-events", groupId = "notification-group")
    public void consumeTaskEvent(Map<String, Object> event) {
        try {
            String eventType = (String) event.get("eventType");
            String taskTitle = (String) event.get("taskTitle");
            String status = (String) event.get("status");
            Object employeeIdObj = event.get("assignedEmployeeId");
            Long assignedEmployeeId = employeeIdObj != null ? Long.valueOf(employeeIdObj.toString()) : null;

            String message = String.format("Task '%s' was updated (Event: %s, Status: %s)", taskTitle, eventType, status);

            Notification notification = new Notification(assignedEmployeeId, message, eventType);
            notificationRepository.save(notification);
        } catch (Exception e) {
            System.err.println("Error processing Kafka task event: " + e.getMessage());
        }
    }
}
