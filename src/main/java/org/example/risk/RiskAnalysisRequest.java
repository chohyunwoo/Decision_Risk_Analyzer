package org.example.risk;

public class RiskAnalysisRequest {
    private String link;
    private String timeOfDay;
    private String priceRange;

    public RiskAnalysisRequest() {
    }

    public RiskAnalysisRequest(String link, String timeOfDay, String priceRange) {
        this.link = link;
        this.timeOfDay = timeOfDay;
        this.priceRange = priceRange;
    }

    public String getLink() {
        return link;
    }

    public String getTimeOfDay() {
        return timeOfDay;
    }

    public String getPriceRange() {
        return priceRange;
    }
}
