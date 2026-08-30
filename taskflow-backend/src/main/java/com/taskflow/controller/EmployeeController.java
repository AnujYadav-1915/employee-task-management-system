package com.taskflow.controller;

import com.taskflow.model.Employee;
import com.taskflow.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        return employeeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Employee createEmployee(@RequestBody Employee employee) {
        if (employee.getStatus() == null) {
            employee.setStatus("Available");
        }
        return employeeRepository.save(employee);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long id, @RequestBody Employee details) {
        return employeeRepository.findById(id)
                .map(employee -> {
                    employee.setName(details.getName());
                    employee.setEmail(details.getEmail());
                    employee.setRole(details.getRole());
                    employee.setDepartment(details.getDepartment());
                    employee.setStatus(details.getStatus());
                    employee.setPhone(details.getPhone());
                    return ResponseEntity.ok(employeeRepository.save(employee));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        if (employeeRepository.existsById(id)) {
            employeeRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getEmployeeStats() {
        long total = employeeRepository.count();
        long available = employeeRepository.findByStatus("Available").size();
        long onLeave = employeeRepository.findByStatus("On Leave").size();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEmployees", total);
        stats.put("availableEmployees", available);
        stats.put("onLeaveEmployees", onLeave);

        return ResponseEntity.ok(stats);
    }
}
