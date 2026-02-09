package org.example.risk.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "entitlements")
public class Entitlement {
    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "entitlement", nullable = false)
    private EntitlementType entitlement;

    @Column(name = "plan")
    private String plan;

    @Column(name = "plan_valid_until")
    private Instant planValidUntil;

    @Column(name = "billing_status")
    private String billingStatus;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Entitlement() {}

    public Entitlement(UUID userId, EntitlementType entitlement) {
        this.userId = userId;
        this.entitlement = entitlement;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public EntitlementType getEntitlement() {
        return entitlement;
    }

    public void setEntitlement(EntitlementType entitlement) {
        this.entitlement = entitlement;
    }

    public String getPlan() {
        return plan;
    }

    public void setPlan(String plan) {
        this.plan = plan;
    }

    public Instant getPlanValidUntil() {
        return planValidUntil;
    }

    public void setPlanValidUntil(Instant planValidUntil) {
        this.planValidUntil = planValidUntil;
    }

    public String getBillingStatus() {
        return billingStatus;
    }

    public void setBillingStatus(String billingStatus) {
        this.billingStatus = billingStatus;
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
            throw new IllegalStateException("Entitlement.userId must be set");
        }
    }
}
