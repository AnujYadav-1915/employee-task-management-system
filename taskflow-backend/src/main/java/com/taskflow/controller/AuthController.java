package com.taskflow.controller;

import com.taskflow.dto.AuthResponse;
import com.taskflow.dto.LoginRequest;
import com.taskflow.dto.RegisterRequest;
import com.taskflow.model.AbstractUser;
import com.taskflow.model.Employee;
import com.taskflow.model.Role;
import com.taskflow.model.admin.AdminUser;
import com.taskflow.model.employee.EmployeeUser;
import com.taskflow.model.manager.ManagerUser;
import com.taskflow.repository.EmployeeRepository;
import com.taskflow.repository.admin.AdminUserRepository;
import com.taskflow.repository.employee.EmployeeUserRepository;
import com.taskflow.repository.manager.ManagerUserRepository;
import com.taskflow.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private ManagerUserRepository managerUserRepository;

    @Autowired
    private EmployeeUserRepository employeeUserRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        Role requestedRole = registerRequest.getRole() != null ? registerRequest.getRole() : Role.ROLE_EMPLOYEE;

        // Block any attempt to register as Administrator
        if (requestedRole == Role.ROLE_ADMIN) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "You cannot log in or register as an administrator, you can log in only as manager or employee."));
        }

        String username = registerRequest.getUsername();
        String email = registerRequest.getEmail();

        // Unique username/email check across all database stores
        if (adminUserRepository.existsByUsername(username) ||
            managerUserRepository.existsByUsername(username) ||
            employeeUserRepository.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Username already exists"));
        }

        if (adminUserRepository.existsByEmail(email) ||
            managerUserRepository.existsByEmail(email) ||
            employeeUserRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Email already exists"));
        }

        String encodedPassword = passwordEncoder.encode(registerRequest.getPassword());

        if (requestedRole == Role.ROLE_MANAGER) {
            // Save to manager_db
            ManagerUser manager = new ManagerUser(username, email, encodedPassword, Role.ROLE_MANAGER);
            ManagerUser savedManager = managerUserRepository.save(manager);
            String token = tokenProvider.generateToken(savedManager.getUsername(), savedManager.getRole().name(), savedManager.getId());
            return ResponseEntity.ok(new AuthResponse(
                    token, savedManager.getUsername(), savedManager.getEmail(), savedManager.getRole().name(), savedManager.getId()
            ));
        } else {
            // Save to employee_db
            EmployeeUser empUser = new EmployeeUser(username, email, encodedPassword, Role.ROLE_EMPLOYEE);
            EmployeeUser savedEmpUser = employeeUserRepository.save(empUser);

            // Also create/sync corresponding Employee directory record in employee_db
            if (!employeeRepository.existsByEmail(email)) {
                Employee emp = new Employee(username, email, "Employee", "General", "Available", "");
                employeeRepository.save(emp);
            }

            String token = tokenProvider.generateToken(savedEmpUser.getUsername(), savedEmpUser.getRole().name(), savedEmpUser.getId());
            return ResponseEntity.ok(new AuthResponse(
                    token, savedEmpUser.getUsername(), savedEmpUser.getEmail(), savedEmpUser.getRole().name(), savedEmpUser.getId()
            ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        String username = loginRequest.getUsername();
        String password = loginRequest.getPassword();

        // 1. Check Admin Database (admin_db) - Reserved for Anuj
        AdminUser admin = adminUserRepository.findByUsername(username).orElse(null);
        if (admin != null && passwordEncoder.matches(password, admin.getPassword())) {
            String token = tokenProvider.generateToken(admin.getUsername(), admin.getRole().name(), admin.getId());
            return ResponseEntity.ok(new AuthResponse(
                    token, admin.getUsername(), admin.getEmail(), admin.getRole().name(), admin.getId()
            ));
        }

        // 2. Check Manager Database (manager_db)
        ManagerUser manager = managerUserRepository.findByUsername(username).orElse(null);
        if (manager != null && passwordEncoder.matches(password, manager.getPassword())) {
            String token = tokenProvider.generateToken(manager.getUsername(), manager.getRole().name(), manager.getId());
            return ResponseEntity.ok(new AuthResponse(
                    token, manager.getUsername(), manager.getEmail(), manager.getRole().name(), manager.getId()
            ));
        }

        // 3. Check Employee Database (employee_db)
        EmployeeUser employee = employeeUserRepository.findByUsername(username).orElse(null);
        if (employee != null && passwordEncoder.matches(password, employee.getPassword())) {
            String token = tokenProvider.generateToken(employee.getUsername(), employee.getRole().name(), employee.getId());
            return ResponseEntity.ok(new AuthResponse(
                    token, employee.getUsername(), employee.getEmail(), employee.getRole().name(), employee.getId()
            ));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String tokenHeader) {
        if (tokenHeader != null && tokenHeader.startsWith("Bearer ")) {
            String token = tokenHeader.substring(7);
            if (tokenProvider.validateToken(token)) {
                String username = tokenProvider.getUsernameFromJwt(token);
                return ResponseEntity.ok(Map.of("valid", true, "username", username));
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("valid", false));
    }
}
