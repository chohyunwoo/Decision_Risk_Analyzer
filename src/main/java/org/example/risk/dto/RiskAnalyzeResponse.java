package org.example.risk.dto;

import org.example.risk.domain.RiskLabel;

public class RiskAnalyzeResponse {
    private String recordId;
    private int riskScore;
    private RiskLabel riskLabel;
    private String policyVersion;
    private Breakdown breakdown;
    private String aiExplanation;
    private Usage usage;

    public String getRecordId() {
        return recordId;
    }

    public void setRecordId(String recordId) {
        this.recordId = recordId;
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

    public Breakdown getBreakdown() {
        return breakdown;
    }

    public void setBreakdown(Breakdown breakdown) {
        this.breakdown = breakdown;
    }

    public String getAiExplanation() {
        return aiExplanation;
    }

    public void setAiExplanation(String aiExplanation) {
        this.aiExplanation = aiExplanation;
    }

    public Usage getUsage() {
        return usage;
    }

    public void setUsage(Usage usage) {
        this.usage = usage;
    }

    public static class Breakdown {
        private Integer wasteRisk;
        private Integer uncertaintyRisk;
        private Double pricePerPerson;
        private String priceBand;
        private String timeBand;

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

        public String getPriceBand() {
            return priceBand;
        }

        public void setPriceBand(String priceBand) {
            this.priceBand = priceBand;
        }

        public String getTimeBand() {
            return timeBand;
        }

        public void setTimeBand(String timeBand) {
            this.timeBand = timeBand;
        }
    }

    public static class Usage {
        private int remainingFree;
        private String entitlement;

        public int getRemainingFree() {
            return remainingFree;
        }

        public void setRemainingFree(int remainingFree) {
            this.remainingFree = remainingFree;
        }

        public String getEntitlement() {
            return entitlement;
        }

        public void setEntitlement(String entitlement) {
            this.entitlement = entitlement;
        }
    }
}
