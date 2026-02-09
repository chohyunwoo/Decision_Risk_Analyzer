package org.example.risk.repository;

import java.util.Optional;
import java.util.UUID;
import org.example.risk.domain.Entitlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface EntitlementRepository extends JpaRepository<Entitlement, UUID> {
    Optional<Entitlement> findByUserId(UUID userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Entitlement e where e.userId = :userId")
    Optional<Entitlement> findByUserIdForUpdate(@Param("userId") UUID userId);
}
