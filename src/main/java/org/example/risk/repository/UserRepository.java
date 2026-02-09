package org.example.risk.repository;

import java.util.UUID;
import org.example.risk.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {}
