package com.taskflow.task.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class NotificationClient {

    private final RestTemplate restTemplate;

    @Value("${services.notification.url:http://localhost:8084}")
    private String notificationServiceUrl;

    public NotificationClient() {
        this.restTemplate = new RestTemplate();
    }

    public void sendNotification(Long userId, String message, String type) {
        if (userId == null) {
            return;
        }
        try {
            String url = notificationServiceUrl + "/api/notifications";
            Map<String, Object> payload = new HashMap<>();
            payload.put("userId", userId);
            payload.put("message", message);
            payload.put("type", type);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(url, request, Void.class);
        } catch (Exception ignored) {
        }
    }
}
