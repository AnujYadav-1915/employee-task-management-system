package com.taskflow.task.service;

import com.taskflow.task.event.TaskEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private static final String TOPIC = "task-events";

    @Autowired(required = false)
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void sendTaskEvent(TaskEvent event) {
        if (kafkaTemplate != null) {
            try {
                kafkaTemplate.send(TOPIC, event.getTaskId() != null ? event.getTaskId().toString() : "task", event);
            } catch (Exception ignored) {
            }
        }
    }
}
