package com.taskflow.model.employee;

import com.taskflow.model.AbstractUser;
import com.taskflow.model.Role;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "employee_users")
public class EmployeeUser extends AbstractUser {

    public EmployeeUser() {
        super();
    }

    public EmployeeUser(String username, String email, String password, Role role) {
        super(username, email, password, role);
    }
}
