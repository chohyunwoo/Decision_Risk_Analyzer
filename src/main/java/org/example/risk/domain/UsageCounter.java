package org.example.risk.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "usage_counters")
public class UsageCounter {
    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "remaining_free", nullable = false)
    private int remainingFree;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public UsageCounter() {}

    public UsageCounter(UUID userId, int remainingFree) {
        this.userId = userId;
        this.remainingFree = remainingFree;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public int getRemainingFree() {
        return remainingFree;
    }

    public void setRemainingFree(int remainingFree) {
        this.remainingFree = remainingFree;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PrePersist
    void ensureId() {
        if (this.userId == null) {
            throw new IllegalStateException("UsageCounter.userId must be set");
        }
    }
}
