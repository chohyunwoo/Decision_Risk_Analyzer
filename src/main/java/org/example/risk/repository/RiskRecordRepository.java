package org.example.risk.repository;

import java.util.UUID;
import org.example.risk.domain.RiskRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RiskRecordRepository extends JpaRepository<RiskRecord, UUID> {
    Page<RiskRecord> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    Page<RiskRecord> findByUserIdAndRegionOrderByCreatedAtDesc(UUID userId, org.example.risk.domain.Region region, Pageable pageable);
}
