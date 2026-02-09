package org.example.risk.dto;

public class UserMeResponse {
    private String userId;
    private String entitlement;
    private int remainingFree;
    private String plan;
    private String planValidUntil;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEntitlement() {
        return entitlement;
    }

    public void setEntitlement(String entitlement) {
        this.entitlement = entitlement;
    }

    public int getRemainingFree() {
        return remainingFree;
    }

    public void setRemainingFree(int remainingFree) {
        this.remainingFree = remainingFree;
    }

    public String getPlan() {
        return plan;
    }

    public void setPlan(String plan) {
        this.plan = plan;
    }

    public String getPlanValidUntil() {
        return planValidUntil;
    }

    public void setPlanValidUntil(String planValidUntil) {
        this.planValidUntil = planValidUntil;
    }
}
