package com.taskflow.task.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.task.event.TaskEvent;
import com.taskflow.task.model.Comment;
import com.taskflow.task.model.Task;
import com.taskflow.task.model.TaskStatus;
import com.taskflow.task.repository.CommentRepository;
import com.taskflow.task.repository.TaskRepository;
import com.taskflow.task.service.KafkaProducerService;
import com.taskflow.task.service.RedisCacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private KafkaProducerService kafkaProducerService;

    @Autowired
    private RedisCacheService redisCacheService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        return taskRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Task createTask(@RequestBody Task task) {
        if (task.getStatus() == null) {
            task.setStatus(TaskStatus.PENDING);
        }
        Task savedTask = taskRepository.save(task);

        redisCacheService.evictCache("taskflow:dashboard:stats");

        TaskEvent event = new TaskEvent(
                "TASK_CREATED",
                savedTask.getId(),
                savedTask.getTitle(),
                savedTask.getAssignedEmployeeId(),
                savedTask.getAssignedEmployeeName(),
                savedTask.getStatus().name()
        );
        kafkaProducerService.sendTaskEvent(event);

        return savedTask;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task details) {
        return taskRepository.findById(id)
                .map(task -> {
                    task.setTitle(details.getTitle());
                    task.setDescription(details.getDescription());
                    task.setStatus(details.getStatus());
                    task.setPriority(details.getPriority());
                    task.setAssignedEmployeeId(details.getAssignedEmployeeId());
                    task.setAssignedEmployeeName(details.getAssignedEmployeeName());
                    task.setDueDate(details.getDueDate());
                    Task updated = taskRepository.save(task);

                    redisCacheService.evictCache("taskflow:dashboard:stats");

                    TaskEvent event = new TaskEvent(
                            "TASK_UPDATED",
                            updated.getId(),
                            updated.getTitle(),
                            updated.getAssignedEmployeeId(),
                            updated.getAssignedEmployeeName(),
                            updated.getStatus().name()
                    );
                    kafkaProducerService.sendTaskEvent(event);

                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatusStr = body.get("status");
        if (newStatusStr == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            TaskStatus newStatus = TaskStatus.valueOf(newStatusStr.toUpperCase());
            return taskRepository.findById(id)
                    .map(task -> {
                        task.setStatus(newStatus);
                        Task updated = taskRepository.save(task);

                        redisCacheService.evictCache("taskflow:dashboard:stats");

                        String eventType = (newStatus == TaskStatus.COMPLETED) ? "TASK_COMPLETED" : "TASK_STATUS_CHANGED";
                        TaskEvent event = new TaskEvent(
                                eventType,
                                updated.getId(),
                                updated.getTitle(),
                                updated.getAssignedEmployeeId(),
                                updated.getAssignedEmployeeName(),
                                updated.getStatus().name()
                        );
                        kafkaProducerService.sendTaskEvent(event);

                        return ResponseEntity.ok(updated);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            redisCacheService.evictCache("taskflow:dashboard:stats");
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/comments")
    public List<Comment> getCommentsByTaskId(@PathVariable Long id) {
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(id);
    }

    @PostMapping("/{id}/comments")
    public Comment addComment(@PathVariable Long id, @RequestBody Comment comment) {
        comment.setTaskId(id);
        return commentRepository.save(comment);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        String cacheKey = "taskflow:dashboard:stats";
        String cachedJson = redisCacheService.getCachedValue(cacheKey);

        if (cachedJson != null) {
            try {
                Map<String, Object> stats = objectMapper.readValue(cachedJson, Map.class);
                return ResponseEntity.ok(stats);
            } catch (Exception e) {
            }
        }

        long total = taskRepository.count();
        long pending = taskRepository.findByStatus(TaskStatus.PENDING).size();
        long inProgress = taskRepository.findByStatus(TaskStatus.IN_PROGRESS).size();
        long completed = taskRepository.findByStatus(TaskStatus.COMPLETED).size();
        long onHold = taskRepository.findByStatus(TaskStatus.ON_HOLD).size();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTasks", total);
        stats.put("pendingTasks", pending);
        stats.put("inProgressTasks", inProgress);
        stats.put("completedTasks", completed);
        stats.put("onHoldTasks", onHold);

        try {
            String jsonStr = objectMapper.writeValueAsString(stats);
            redisCacheService.cacheValue(cacheKey, jsonStr, 300);
        } catch (Exception e) {
        }

        return ResponseEntity.ok(stats);
    }
}
