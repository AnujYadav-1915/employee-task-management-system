package com.taskflow.model.manager;

import com.taskflow.model.AbstractUser;
import com.taskflow.model.Role;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "manager_users")
public class ManagerUser extends AbstractUser {

    public ManagerUser() {
        super();
    }

    public ManagerUser(String username, String email, String password, Role role) {
        super(username, email, password, role);
    }
}
