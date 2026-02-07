package org.example.risk;

public class FoodDecisionInput {
    private final String link;
    private final String timeOfDay;
    private final String priceRange;

    public FoodDecisionInput(String link, String timeOfDay, String priceRange) {
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
