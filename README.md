# TaskFlow - Employee Task & Workflow Management System

TaskFlow is a microservices-based full-stack web application designed for managing team employees, task assignments, status tracking, and automated event notifications.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js, Axios, React Router |
| **Backend Services** | Java 17, Spring Boot 3.1, Spring Cloud Gateway |
| **Security** | Spring Security, JWT |
| **Persistence** | MySQL 8.0, Spring Data JPA / Hibernate |
| **Caching** | Redis |
| **Messaging** | Apache Kafka |
| **DevOps** | Docker, Docker Compose |
| **API Docs** | Swagger / OpenAPI |

---

## Application Architecture

The system consists of 5 Spring Boot microservices behind a Spring Cloud API Gateway:

- **`api-gateway` (Port 8080)**: Entry point routing frontend REST requests to microservices.
- **`auth-service` (Port 8081)**: Manages user registration, login, and JWT token issuance/validation.
- **`user-service` (Port 8082)**: Manages employee profiles, roles, departments, and availability status.
- **`task-service` (Port 8083)**: Manages task creation, status transitions (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`), priorities, and comments. Uses Redis to cache dashboard counts and publishes events to Apache Kafka (`task-events`).
- **`notification-service` (Port 8084)**: Consumes task events from Apache Kafka and logs user notifications in MySQL.

---

## Request Flow

```
React Frontend (Axios)
       │
       ▼
Spring Cloud Gateway (:8080)
       │
       ├──► Auth Service (:8081) ──► MySQL
       ├──► User Service (:8082) ──► MySQL
       ├──► Task Service (:8083) ──► MySQL + Redis (Cache)
       │                                 │
       │                                 ▼ (Publishes Events)
       │                            Apache Kafka
       │                                 │
       │                                 ▼ (Consumes Events)
       └──► Notification Service (:8084) ──► MySQL
```

---

## Repository Structure

```
.
├── docker-compose.yml
├── api-gateway/
├── auth-service/
├── user-service/
├── task-service/
├── notification-service/
└── frontend/
```

---

## Quick Start (Docker Compose)

### Prerequisites
- Docker Engine & Docker Compose installed.

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/AnujYadav-1915/employee-task-management-system.git
   cd employee-task-management-system
   ```

2. Build and start all containers:
   ```bash
   docker-compose up --build -d
   ```

3. Open the application:
   - **Frontend UI**: `http://localhost:3000`
   - **API Gateway**: `http://localhost:8080`

---

## Service Endpoints & Swagger Docs

- **Auth Service Docs**: `http://localhost:8081/swagger-ui.html`
- **User Service Docs**: `http://localhost:8082/swagger-ui.html`
- **Task Service Docs**: `http://localhost:8083/swagger-ui.html`
- **Notification Service Docs**: `http://localhost:8084/swagger-ui.html`

---

## Key REST Endpoints

### Auth Service (`/api/auth`)
- `POST /api/auth/register` - Create account & return JWT
- `POST /api/auth/login` - Authenticate user & return JWT
- `GET /api/auth/validate` - Validate JWT header token

### Employee Service (`/api/employees`)
- `GET /api/employees` - List all employees
- `POST /api/employees` - Create employee record
- `PUT /api/employees/{id}` - Update employee profile
- `DELETE /api/employees/{id}` - Delete employee record
- `GET /api/employees/stats` - Fetch employee statistics

### Task Service (`/api/tasks`)
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task details
- `PATCH /api/tasks/{id}/status` - Update task status
- `DELETE /api/tasks/{id}` - Delete task
- `GET /api/tasks/stats` - Fetch dashboard task metrics (cached in Redis)
- `GET /api/tasks/{id}/comments` - Get task comments
- `POST /api/tasks/{id}/comments` - Add task comment

### Notification Service (`/api/notifications`)
- `GET /api/notifications` - Fetch notification stream
- `PATCH /api/notifications/{id}/read` - Mark notification as read
