package org.example.risk;

public class RiskScoringEngine {
    public int score(FoodDecisionInput input) {
        int timeRisk = 0;
        if ("LUNCH".equals(input.getTimeOfDay())) {
            timeRisk = 10;
        } else if ("DINNER".equals(input.getTimeOfDay())) {
            timeRisk = 20;
        }

        int priceRisk = 0;
        if ("LOW".equals(input.getPriceRange())) {
            priceRisk = 10;
        } else if ("MID".equals(input.getPriceRange())) {
            priceRisk = 20;
        } else if ("HIGH".equals(input.getPriceRange())) {
            priceRisk = 30;
        }

        int linkRisk = 0;
        if (input.getLink() != null && !input.getLink().isEmpty()) {
            linkRisk = 5;
        } else {
            linkRisk = 15;
        }

        return timeRisk + priceRisk + linkRisk;
    }
}
