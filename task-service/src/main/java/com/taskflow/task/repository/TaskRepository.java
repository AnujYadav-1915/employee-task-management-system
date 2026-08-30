package com.taskflow.task.repository;

import com.taskflow.task.model.Priority;
import com.taskflow.task.model.Task;
import com.taskflow.task.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByStatus(TaskStatus status);
    List<Task> findByPriority(Priority priority);
    List<Task> findByAssignedEmployeeId(Long employeeId);
}
