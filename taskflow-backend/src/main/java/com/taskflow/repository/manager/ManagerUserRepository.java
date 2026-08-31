package com.taskflow.repository.manager;

import com.taskflow.model.manager.ManagerUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ManagerUserRepository extends JpaRepository<ManagerUser, Long> {
    Optional<ManagerUser> findByUsername(String username);
    Optional<ManagerUser> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
