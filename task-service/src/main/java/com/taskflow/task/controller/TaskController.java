package com.taskflow.task.controller;

import com.taskflow.task.model.Comment;
import com.taskflow.task.model.Task;
import com.taskflow.task.model.TaskStatus;
import com.taskflow.task.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        Task task = taskService.getTaskById(id);
        return task != null ? ResponseEntity.ok(task) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public Task createTask(@RequestBody Task task) {
        return taskService.createTask(task);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task details) {
        Task updated = taskService.updateTask(id, details);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatusStr = body.get("status");
        if (newStatusStr == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            TaskStatus newStatus = TaskStatus.valueOf(newStatusStr.toUpperCase());
            Task updated = taskService.updateTaskStatus(id, newStatus);
            return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/progress")
    public ResponseEntity<Task> updateTaskProgress(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Object progressObj = body.get("progressPercentage");
        if (progressObj == null) {
            return ResponseEntity.badRequest().build();
        }

        int progress;
        try {
            progress = Integer.parseInt(progressObj.toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }

        String note = (String) body.get("note");
        String authorName = (String) body.get("authorName");

        Task updated = taskService.updateTaskProgress(id, progress, note, authorName);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        return taskService.deleteTask(id) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/comments")
    public List<Comment> getCommentsByTaskId(@PathVariable Long id) {
        return taskService.getComments(id);
    }

    @PostMapping("/{id}/comments")
    public Comment addComment(@PathVariable Long id, @RequestBody Comment comment) {
        return taskService.addComment(id, comment);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(taskService.getTaskStats());
    }
}
