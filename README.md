# TaskFlow - Employee Task Management System

TaskFlow is a full-stack web application designed for managing team members, assigning tasks, tracking progress percentages, and recording work notes.

## Tech Stack

- **Frontend**: React 18, Vite, React Router, Axios
- **Backend Services**: Java 17, Spring Boot 3
- **Database**: MySQL 8.0, Spring Data JPA / Hibernate
- **Security**: Spring Security, JWT (JSON Web Tokens), BCrypt
- **Architecture**: Microservices behind an HTTP reverse proxy API Gateway

## System Architecture

- **`api-gateway` (Port 8080)**: Reverse proxy entry point routing REST requests to the microservices.
- **`auth-service` (Port 8081)**: Handles authentication, user registration, and JWT token issuance/verification.
- **`user-service` (Port 8082)**: Manages employee directories, profiles, and departmental assignments.
- **`task-service` (Port 8083)**: Manages task creation, status transitions, estimated hour allocations, progress percentages, and remarks history.
- **`notification-service` (Port 8084)**: Stores and manages user notifications.
- **`frontend` (Port 3000)**: React single-page application.

## Quick Start

### Using Docker Compose

1. Clone the repository:
   ```bash
   git clone https://github.com/AnujYadav-1915/employee-task-management-system.git
   cd employee-task-management-system
   ```

2. Build and start services:
   ```bash
   docker-compose up --build -d
   ```

3. Access the application:
   - Web UI: `http://localhost:3000`
   - API Gateway: `http://localhost:8080`

## Endpoints

### Auth Service (`/api/auth`)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate and receive JWT
- `GET /api/auth/validate` - Validate token

### Employee Service (`/api/employees`)
- `GET /api/employees` - List all employees
- `POST /api/employees` - Add new employee
- `PUT /api/employees/{id}` - Update employee
- `DELETE /api/employees/{id}` - Delete employee
- `GET /api/employees/stats` - Employee statistics

### Task Service (`/api/tasks`)
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `PATCH /api/tasks/{id}/status` - Update task status
- `PATCH /api/tasks/{id}/progress` - Update progress percentage and note
- `DELETE /api/tasks/{id}` - Delete task
- `GET /api/tasks/stats` - Task statistics
- `GET /api/tasks/{id}/comments` - Get task notes and comments
- `POST /api/tasks/{id}/comments` - Add task note

### Notification Service (`/api/notifications`)
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/user/{userId}` - Get user notifications
- `PATCH /api/notifications/{id}/read` - Mark notification as read
