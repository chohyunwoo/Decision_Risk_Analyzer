package org.example.risk.dto;

import org.example.risk.domain.RiskLabel;
import org.example.risk.domain.Region;

public class RiskRecordDetailResponse {
    private String id;
    private String createdAt;
    private Input input;
    private Result result;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public Input getInput() {
        return input;
    }

    public void setInput(Input input) {
        this.input = input;
    }

    public Result getResult() {
        return result;
    }

    public void setResult(Result result) {
        this.result = result;
    }

    public static class Input {
        private Region region;
        private Double priceTotal;
        private Integer people;
        private Integer timeMinutes;
        private String menu;
        private String link;

        public Region getRegion() {
            return region;
        }

        public void setRegion(Region region) {
            this.region = region;
        }

        public Double getPriceTotal() {
            return priceTotal;
        }

        public void setPriceTotal(Double priceTotal) {
            this.priceTotal = priceTotal;
        }

        public Integer getPeople() {
            return people;
        }

        public void setPeople(Integer people) {
            this.people = people;
        }

        public Integer getTimeMinutes() {
            return timeMinutes;
        }

        public void setTimeMinutes(Integer timeMinutes) {
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
    }

    public static class Result {
        private int riskScore;
        private RiskLabel riskLabel;
        private String policyVersion;
        private String aiExplanation;
        private RiskAnalyzeResponse.Breakdown breakdown;

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

        public String getAiExplanation() {
            return aiExplanation;
        }

        public void setAiExplanation(String aiExplanation) {
            this.aiExplanation = aiExplanation;
        }

        public RiskAnalyzeResponse.Breakdown getBreakdown() {
            return breakdown;
        }

        public void setBreakdown(RiskAnalyzeResponse.Breakdown breakdown) {
            this.breakdown = breakdown;
        }
    }
}
