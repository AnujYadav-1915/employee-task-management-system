package com.taskflow.service.impl;

import com.taskflow.model.Comment;
import com.taskflow.model.Notification;
import com.taskflow.model.Task;
import com.taskflow.model.TaskStatus;
import com.taskflow.repository.CommentRepository;
import com.taskflow.repository.NotificationRepository;
import com.taskflow.repository.TaskRepository;
import com.taskflow.service.TaskService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final CommentRepository commentRepository;
    private final NotificationRepository notificationRepository;

    public TaskServiceImpl(TaskRepository taskRepository,
                           CommentRepository commentRepository,
                           NotificationRepository notificationRepository) {
        this.taskRepository = taskRepository;
        this.commentRepository = commentRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Task getTaskById(Long id) {
        return taskRepository.findById(id).orElse(null);
    }

    @Override
    public Task createTask(Task task) {
        if (task.getStatus() == null) {
            task.setStatus(TaskStatus.PENDING);
        }
        if (task.getCreatedAt() == null) {
            task.setCreatedAt(LocalDateTime.now());
        }
        task.setUpdatedAt(LocalDateTime.now());

        Task saved = taskRepository.save(task);

        String message = String.format("Task '%s' was created and assigned to %s",
                saved.getTitle(),
                saved.getAssignedEmployeeName() != null ? saved.getAssignedEmployeeName() : "employee");
        notificationRepository.save(new Notification(saved.getAssignedEmployeeId(), message, "TASK_CREATED"));

        return saved;
    }

    @Override
    public Task updateTask(Long id, Task details) {
        return taskRepository.findById(id).map(task -> {
            task.setTitle(details.getTitle());
            task.setDescription(details.getDescription());
            task.setStatus(details.getStatus());
            task.setPriority(details.getPriority());
            task.setAssignedEmployeeId(details.getAssignedEmployeeId());
            task.setAssignedEmployeeName(details.getAssignedEmployeeName());
            task.setDueDate(details.getDueDate());
            if (details.getAllocatedHours() != null) {
                task.setAllocatedHours(details.getAllocatedHours());
            }
            if (details.getProgressPercentage() != null) {
                task.setProgressPercentage(details.getProgressPercentage());
                if (details.getProgressPercentage() == 100) {
                    task.setStatus(TaskStatus.COMPLETED);
                }
            }
            task.setUpdatedAt(LocalDateTime.now());
            Task updated = taskRepository.save(task);

            String message = String.format("Task '%s' details updated", updated.getTitle());
            notificationRepository.save(new Notification(updated.getAssignedEmployeeId(), message, "TASK_UPDATED"));

            return updated;
        }).orElse(null);
    }

    @Override
    public Task updateTaskStatus(Long id, TaskStatus status) {
        return taskRepository.findById(id).map(task -> {
            task.setStatus(status);
            if (status == TaskStatus.COMPLETED) {
                task.setProgressPercentage(100);
            }
            task.setUpdatedAt(LocalDateTime.now());
            Task updated = taskRepository.save(task);

            String message = String.format("Task '%s' status changed to %s", updated.getTitle(), status);
            notificationRepository.save(new Notification(updated.getAssignedEmployeeId(), message, "TASK_STATUS_CHANGED"));

            return updated;
        }).orElse(null);
    }

    @Override
    public Task updateTaskProgress(Long id, int progressPercentage, String note, String authorName) {
        int boundedProgress = Math.max(0, Math.min(100, progressPercentage));
        String author = (authorName != null && !authorName.trim().isEmpty()) ? authorName.trim() : "Employee";

        return taskRepository.findById(id).map(task -> {
            task.setProgressPercentage(boundedProgress);
            if (boundedProgress == 100) {
                task.setStatus(TaskStatus.COMPLETED);
            } else if (boundedProgress > 0 && task.getStatus() == TaskStatus.PENDING) {
                task.setStatus(TaskStatus.IN_PROGRESS);
            }
            task.setUpdatedAt(LocalDateTime.now());
            Task updated = taskRepository.save(task);

            if (note != null && !note.trim().isEmpty()) {
                String commentText = String.format("[Progress: %d%%] %s", boundedProgress, note.trim());
                commentRepository.save(new Comment(updated.getId(), author, commentText));
            }

            String message = String.format("Task '%s' progress updated to %d%%", updated.getTitle(), boundedProgress);
            notificationRepository.save(new Notification(updated.getAssignedEmployeeId(), message, "TASK_PROGRESS_UPDATED"));

            return updated;
        }).orElse(null);
    }

    @Override
    public boolean deleteTask(Long id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Comment> getComments(Long taskId) {
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId);
    }

    @Override
    public Comment addComment(Long taskId, Comment comment) {
        comment.setTaskId(taskId);
        if (comment.getCreatedAt() == null) {
            comment.setCreatedAt(LocalDateTime.now());
        }
        return commentRepository.save(comment);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getTaskStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTasks", taskRepository.count());
        stats.put("pendingTasks", taskRepository.findByStatus(TaskStatus.PENDING).size());
        stats.put("inProgressTasks", taskRepository.findByStatus(TaskStatus.IN_PROGRESS).size());
        stats.put("completedTasks", taskRepository.findByStatus(TaskStatus.COMPLETED).size());
        stats.put("onHoldTasks", taskRepository.findByStatus(TaskStatus.ON_HOLD).size());
        return stats;
    }
}
