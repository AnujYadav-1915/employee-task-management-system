package com.taskflow.controller;

import com.taskflow.model.Comment;
import com.taskflow.model.Notification;
import com.taskflow.model.Task;
import com.taskflow.model.TaskStatus;
import com.taskflow.repository.CommentRepository;
import com.taskflow.repository.NotificationRepository;
import com.taskflow.repository.TaskRepository;
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
    private NotificationRepository notificationRepository;

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

        String msg = String.format("Task '%s' was created and assigned to %s", savedTask.getTitle(), savedTask.getAssignedEmployeeName() != null ? savedTask.getAssignedEmployeeName() : "employee");
        notificationRepository.save(new Notification(savedTask.getAssignedEmployeeId(), msg, "TASK_CREATED"));

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

                    String msg = String.format("Task '%s' details updated", updated.getTitle());
                    notificationRepository.save(new Notification(updated.getAssignedEmployeeId(), msg, "TASK_UPDATED"));

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

                        String msg = String.format("Task '%s' status changed to %s", updated.getTitle(), newStatus);
                        notificationRepository.save(new Notification(updated.getAssignedEmployeeId(), msg, "TASK_STATUS_CHANGED"));

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
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
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

        return ResponseEntity.ok(stats);
    }
}
