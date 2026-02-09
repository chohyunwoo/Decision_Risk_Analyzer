package org.example.risk.repository;

import java.util.Optional;
import java.util.UUID;
import org.example.risk.domain.UsageCounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import org.springframework.transaction.annotation.Transactional;

public interface UsageCounterRepository extends JpaRepository<UsageCounter, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from UsageCounter u where u.userId = :userId")
    Optional<UsageCounter> findByUserIdForUpdate(@Param("userId") UUID userId);

    @Modifying
    @Transactional
    @Query(value = "insert into usage_counters (user_id, remaining_free, updated_at) values (:userId, :remainingFree, now()) on conflict (user_id) do nothing", nativeQuery = true)
    void ensureExists(@Param("userId") UUID userId, @Param("remainingFree") int remainingFree);
}
