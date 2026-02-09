package org.example.risk.dto;

public class PaymentStatusResponse {
    private String entitlement;
    private String plan;
    private String planValidUntil;
    private String billingStatus;

    public String getEntitlement() {
        return entitlement;
    }

    public void setEntitlement(String entitlement) {
        this.entitlement = entitlement;
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

    public String getBillingStatus() {
        return billingStatus;
    }

    public void setBillingStatus(String billingStatus) {
        this.billingStatus = billingStatus;
    }
}
