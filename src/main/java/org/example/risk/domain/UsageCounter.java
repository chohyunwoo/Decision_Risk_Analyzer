package org.example.risk.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "usage_counters")
public class UsageCounter {
    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @MapsId
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "remaining_free", nullable = false)
    private int remainingFree;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public UsageCounter() {}

    public UsageCounter(User user, int remainingFree) {
        this.user = user;
        this.userId = user.getId();
        this.remainingFree = remainingFree;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
        this.userId = user != null ? user.getId() : null;
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
}
