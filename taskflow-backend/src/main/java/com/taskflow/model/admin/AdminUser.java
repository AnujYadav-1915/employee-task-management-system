package com.taskflow.model.admin;

import com.taskflow.model.AbstractUser;
import com.taskflow.model.Role;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "admin_users")
public class AdminUser extends AbstractUser {

    public AdminUser() {
        super();
    }

    public AdminUser(String username, String email, String password, Role role) {
        super(username, email, password, role);
    }
}
