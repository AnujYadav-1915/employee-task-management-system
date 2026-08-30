package com.taskflow.task.event;

import java.time.LocalDateTime;

public class TaskEvent {
    private String eventType; // TASK_CREATED, TASK_ASSIGNED, TASK_STATUS_CHANGED, TASK_COMPLETED
    private Long taskId;
    private String taskTitle;
    private Long assignedEmployeeId;
    private String assignedEmployeeName;
    private String status;
    private LocalDateTime timestamp;

    public TaskEvent() {
        this.timestamp = LocalDateTime.now();
    }

    public TaskEvent(String eventType, Long taskId, String taskTitle, Long assignedEmployeeId, String assignedEmployeeName, String status) {
        this.eventType = eventType;
        this.taskId = taskId;
        this.taskTitle = taskTitle;
        this.assignedEmployeeId = assignedEmployeeId;
        this.assignedEmployeeName = assignedEmployeeName;
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public String getTaskTitle() {
        return taskTitle;
    }

    public void setTaskTitle(String taskTitle) {
        this.taskTitle = taskTitle;
    }

    public Long getAssignedEmployeeId() {
        return assignedEmployeeId;
    }

    public void setAssignedEmployeeId(Long assignedEmployeeId) {
        this.assignedEmployeeId = assignedEmployeeId;
    }

    public String getAssignedEmployeeName() {
        return assignedEmployeeName;
    }

    public void setAssignedEmployeeName(String assignedEmployeeName) {
        this.assignedEmployeeName = assignedEmployeeName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
