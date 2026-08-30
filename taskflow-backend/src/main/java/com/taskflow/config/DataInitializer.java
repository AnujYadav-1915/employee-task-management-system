package com.taskflow.config;

import com.taskflow.model.*;
import com.taskflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            seedUserData();
        }
        if (employeeRepository.count() == 0) {
            seedEmployeeData();
        }
        if (taskRepository.count() == 0) {
            seedTaskData();
        }
    }

    private void seedUserData() {
        // Manager Anuj Account
        User manager = new User(
                "Anuj",
                "anujyadav11112003@gmail.com",
                passwordEncoder.encode("Anuj"),
                Role.ROLE_MANAGER
        );
        userRepository.save(manager);

        // Admin Account
        User admin = new User(
                "admin",
                "admin@taskflow.com",
                passwordEncoder.encode("admin123"),
                Role.ROLE_ADMIN
        );
        userRepository.save(admin);
    }

    private void seedEmployeeData() {
        List<Employee> employees = Arrays.asList(
                new Employee("Sarah Connor", "sarah.c@taskflow.com", "Senior Frontend Dev", "Engineering", "Available", "+1-555-0101"),
                new Employee("Alex Johnson", "alex.j@taskflow.com", "Backend Engineer", "Engineering", "Available", "+1-555-0102"),
                new Employee("David Miller", "david.m@taskflow.com", "UI/UX Designer", "Design", "Available", "+1-555-0103"),
                new Employee("Emily Watson", "emily.w@taskflow.com", "DevOps Specialist", "Infrastructure", "Busy", "+1-555-0104"),
                new Employee("Michael Brown", "michael.b@taskflow.com", "QA Lead", "Quality Assurance", "Available", "+1-555-0105"),
                new Employee("Jessica Taylor", "jessica.t@taskflow.com", "Product Manager", "Product", "Available", "+1-555-0106"),
                new Employee("Daniel Wilson", "daniel.w@taskflow.com", "Data Analyst", "Analytics", "On Leave", "+1-555-0107"),
                new Employee("Sophia Martinez", "sophia.m@taskflow.com", "Full Stack Developer", "Engineering", "Available", "+1-555-0108"),
                new Employee("James Anderson", "james.a@taskflow.com", "System Architect", "Architecture", "Available", "+1-555-0109"),
                new Employee("Olivia Thomas", "olivia.t@taskflow.com", "Scrum Master", "Product", "Available", "+1-555-0110")
        );
        employeeRepository.saveAll(employees);
    }

    private void seedTaskData() {
        List<Employee> empList = employeeRepository.findAll();

        List<Task> tasks = Arrays.asList(
                new Task("Website Redesign UI", "Implement new responsive Kanban layout and theme styles", TaskStatus.IN_PROGRESS, Priority.HIGH, empList.get(2).getId(), empList.get(2).getName(), "2026-09-15"),
                new Task("Database Optimization", "Optimize JPA query indexing and caching strategies", TaskStatus.COMPLETED, Priority.HIGH, empList.get(1).getId(), empList.get(1).getName(), "2026-09-01"),
                new Task("JWT Auth Pipeline", "Verify token verification and role-based access filters", TaskStatus.COMPLETED, Priority.HIGH, empList.get(7).getId(), empList.get(7).getName(), "2026-08-30"),
                new Task("Docker Deployment Setup", "Configure Docker Compose orchestration and build rules", TaskStatus.COMPLETED, Priority.MEDIUM, empList.get(3).getId(), empList.get(3).getName(), "2026-09-05"),
                new Task("API Documentation Review", "Update OpenAPI Swagger documentation for endpoints", TaskStatus.IN_PROGRESS, Priority.LOW, empList.get(5).getId(), empList.get(5).getName(), "2026-09-20"),
                new Task("Automated E2E Testing", "Write unit and component test suites for API gateway", TaskStatus.PENDING, Priority.MEDIUM, empList.get(4).getId(), empList.get(4).getName(), "2026-09-25"),
                new Task("Analytics Report Pipeline", "Aggregate weekly task completion metrics for dashboard", TaskStatus.PENDING, Priority.MEDIUM, empList.get(6).getId(), empList.get(6).getName(), "2026-09-18"),
                new Task("System Architecture Review", "Conduct security audit and service decoupling check", TaskStatus.ON_HOLD, Priority.HIGH, empList.get(8).getId(), empList.get(8).getName(), "2026-10-01"),
                new Task("Sprint Planning Workshop", "Coordinate sprint backlog items and task sizing", TaskStatus.COMPLETED, Priority.LOW, empList.get(9).getId(), empList.get(9).getName(), "2026-08-28"),
                new Task("Mobile View Alignment", "Ensure responsive grid breakpoints on mobile viewports", TaskStatus.IN_PROGRESS, Priority.HIGH, empList.get(0).getId(), empList.get(0).getName(), "2026-09-10")
        );

        List<Task> savedTasks = taskRepository.saveAll(tasks);

        // Seed 10 Comments
        for (int i = 0; i < savedTasks.size(); i++) {
            Task t = savedTasks.get(i);
            commentRepository.save(new Comment(t.getId(), "Anuj", "Reviewed task progress for " + t.getTitle() + ". Execution on track."));
            notificationRepository.save(new Notification(t.getAssignedEmployeeId(), "Task '" + t.getTitle() + "' status is " + t.getStatus(), "TASK_UPDATE"));
        }
    }
}
