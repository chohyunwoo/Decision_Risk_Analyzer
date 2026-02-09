package org.example.risk.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "risk_records",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_risk_user_idem", columnNames = {"user_id", "idempotency_key"})
    }
)
public class RiskRecord {
    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "region", nullable = false)
    private Region region;

    @Column(name = "price_total", nullable = false)
    private double priceTotal;

    @Column(name = "people", nullable = false)
    private int people;

    @Column(name = "time_minutes", nullable = false)
    private int timeMinutes;

    @Column(name = "menu")
    private String menu;

    @Column(name = "link")
    private String link;

    @Column(name = "risk_score", nullable = false)
    private int riskScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_label", nullable = false)
    private RiskLabel riskLabel;

    @Column(name = "policy_version", nullable = false)
    private String policyVersion;

    @Column(name = "waste_risk")
    private Integer wasteRisk;

    @Column(name = "uncertainty_risk")
    private Integer uncertaintyRisk;

    @Column(name = "price_per_person")
    private Double pricePerPerson;

    @Enumerated(EnumType.STRING)
    @Column(name = "price_band")
    private PriceBand priceBand;

    @Enumerated(EnumType.STRING)
    @Column(name = "time_band")
    private TimeBand timeBand;

    @Column(name = "ai_explanation")
    private String aiExplanation;

    @Column(name = "idempotency_key", nullable = false)
    private String idempotencyKey;

    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "user_id", referencedColumnName = "user_id", insertable = false, updatable = false),
        @JoinColumn(name = "idempotency_key", referencedColumnName = "idempotency_key", insertable = false, updatable = false)
    })
    private IdempotencyKey idempotencyRef;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Region getRegion() {
        return region;
    }

    public void setRegion(Region region) {
        this.region = region;
    }

    public double getPriceTotal() {
        return priceTotal;
    }

    public void setPriceTotal(double priceTotal) {
        this.priceTotal = priceTotal;
    }

    public int getPeople() {
        return people;
    }

    public void setPeople(int people) {
        this.people = people;
    }

    public int getTimeMinutes() {
        return timeMinutes;
    }

    public void setTimeMinutes(int timeMinutes) {
        this.timeMinutes = timeMinutes;
    }

    public String getMenu() {
        return menu;
    }

    public void setMenu(String menu) {
        this.menu = menu;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public int getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(int riskScore) {
        this.riskScore = riskScore;
    }

    public RiskLabel getRiskLabel() {
        return riskLabel;
    }

    public void setRiskLabel(RiskLabel riskLabel) {
        this.riskLabel = riskLabel;
    }

    public String getPolicyVersion() {
        return policyVersion;
    }

    public void setPolicyVersion(String policyVersion) {
        this.policyVersion = policyVersion;
    }

    public Integer getWasteRisk() {
        return wasteRisk;
    }

    public void setWasteRisk(Integer wasteRisk) {
        this.wasteRisk = wasteRisk;
    }

    public Integer getUncertaintyRisk() {
        return uncertaintyRisk;
    }

    public void setUncertaintyRisk(Integer uncertaintyRisk) {
        this.uncertaintyRisk = uncertaintyRisk;
    }

    public Double getPricePerPerson() {
        return pricePerPerson;
    }

    public void setPricePerPerson(Double pricePerPerson) {
        this.pricePerPerson = pricePerPerson;
    }

    public PriceBand getPriceBand() {
        return priceBand;
    }

    public void setPriceBand(PriceBand priceBand) {
        this.priceBand = priceBand;
    }

    public TimeBand getTimeBand() {
        return timeBand;
    }

    public void setTimeBand(TimeBand timeBand) {
        this.timeBand = timeBand;
    }

    public String getAiExplanation() {
        return aiExplanation;
    }

    public void setAiExplanation(String aiExplanation) {
        this.aiExplanation = aiExplanation;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public IdempotencyKey getIdempotencyRef() {
        return idempotencyRef;
    }

    public void setIdempotencyRef(IdempotencyKey idempotencyRef) {
        this.idempotencyRef = idempotencyRef;
    }
}
