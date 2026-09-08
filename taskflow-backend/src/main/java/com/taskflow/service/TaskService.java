package com.taskflow.service;

import com.taskflow.model.Comment;
import com.taskflow.model.Task;
import com.taskflow.model.TaskStatus;

import java.util.List;
import java.util.Map;

public interface TaskService {
    List<Task> getAllTasks();
    Task getTaskById(Long id);
    Task createTask(Task task);
    Task updateTask(Long id, Task details);
    Task updateTaskStatus(Long id, TaskStatus status);
    Task updateTaskProgress(Long id, int progressPercentage, String note, String authorName);
    boolean deleteTask(Long id);
    List<Comment> getComments(Long taskId);
    Comment addComment(Long taskId, Comment comment);
    Map<String, Object> getTaskStats();
}
