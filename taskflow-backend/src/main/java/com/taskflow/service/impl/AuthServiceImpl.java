package com.taskflow.service.impl;

import com.taskflow.dto.AuthResponse;
import com.taskflow.dto.LoginRequest;
import com.taskflow.dto.RegisterRequest;
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
import com.taskflow.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final AdminUserRepository adminUserRepository;
    private final ManagerUserRepository managerUserRepository;
    private final EmployeeUserRepository employeeUserRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthServiceImpl(AdminUserRepository adminUserRepository,
                           ManagerUserRepository managerUserRepository,
                           EmployeeUserRepository employeeUserRepository,
                           EmployeeRepository employeeRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider tokenProvider) {
        this.adminUserRepository = adminUserRepository;
        this.managerUserRepository = managerUserRepository;
        this.employeeUserRepository = employeeUserRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        Role requestedRole = request.getRole() != null ? request.getRole() : Role.ROLE_EMPLOYEE;

        if (requestedRole == Role.ROLE_ADMIN) {
            throw new IllegalArgumentException("You cannot log in or register as an administrator, you can log in only as manager or employee.");
        }

        String username = request.getUsername();
        String email = request.getEmail();

        if (adminUserRepository.existsByUsername(username) ||
            managerUserRepository.existsByUsername(username) ||
            employeeUserRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists");
        }

        if (adminUserRepository.existsByEmail(email) ||
            managerUserRepository.existsByEmail(email) ||
            employeeUserRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        if (requestedRole == Role.ROLE_MANAGER) {
            ManagerUser manager = new ManagerUser(username, email, encodedPassword, Role.ROLE_MANAGER);
            ManagerUser saved = managerUserRepository.save(manager);
            String token = tokenProvider.generateToken(saved.getUsername(), saved.getRole().name(), saved.getId());
            return new AuthResponse(token, saved.getUsername(), saved.getEmail(), saved.getRole().name(), saved.getId());
        } else {
            EmployeeUser employee = new EmployeeUser(username, email, encodedPassword, Role.ROLE_EMPLOYEE);
            EmployeeUser saved = employeeUserRepository.save(employee);

            if (!employeeRepository.existsByEmail(email)) {
                Employee emp = new Employee(username, email, "Employee", "General", "Available", "");
                employeeRepository.save(emp);
            }

            String token = tokenProvider.generateToken(saved.getUsername(), saved.getRole().name(), saved.getId());
            return new AuthResponse(token, saved.getUsername(), saved.getEmail(), saved.getRole().name(), saved.getId());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String username = request.getUsername();
        String password = request.getPassword();

        AdminUser admin = adminUserRepository.findByUsername(username).orElse(null);
        if (admin != null && passwordEncoder.matches(password, admin.getPassword())) {
            String token = tokenProvider.generateToken(admin.getUsername(), admin.getRole().name(), admin.getId());
            return new AuthResponse(token, admin.getUsername(), admin.getEmail(), admin.getRole().name(), admin.getId());
        }

        ManagerUser manager = managerUserRepository.findByUsername(username).orElse(null);
        if (manager != null && passwordEncoder.matches(password, manager.getPassword())) {
            String token = tokenProvider.generateToken(manager.getUsername(), manager.getRole().name(), manager.getId());
            return new AuthResponse(token, manager.getUsername(), manager.getEmail(), manager.getRole().name(), manager.getId());
        }

        EmployeeUser employee = employeeUserRepository.findByUsername(username).orElse(null);
        if (employee != null && passwordEncoder.matches(password, employee.getPassword())) {
            String token = tokenProvider.generateToken(employee.getUsername(), employee.getRole().name(), employee.getId());
            return new AuthResponse(token, employee.getUsername(), employee.getEmail(), employee.getRole().name(), employee.getId());
        }

        return null;
    }

    @Override
    public boolean validateToken(String token) {
        return tokenProvider.validateToken(token);
    }

    @Override
    public String getUsernameFromToken(String token) {
        return tokenProvider.getUsernameFromJwt(token);
    }
}
