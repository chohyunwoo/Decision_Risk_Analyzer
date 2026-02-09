package org.example.risk.service;

import java.util.EnumMap;
import java.util.Map;
import org.example.risk.domain.PriceBand;
import org.example.risk.domain.Region;
import org.example.risk.domain.RiskLabel;
import org.example.risk.domain.TimeBand;
import org.springframework.stereotype.Component;

@Component
public class RiskEngine {
    public static final String POLICY_VERSION = "risk-v1.0.0";

    private static final double WASTE_WEIGHT = 0.7;
    private static final double UNCERTAINTY_WEIGHT = 0.3;
    private static final double PRICE_WEIGHT_IN_WASTE = 0.6;
    private static final double TIME_WEIGHT_IN_WASTE = 0.4;

    private static final Map<Region, Double> BASE_ORDER_AMOUNT = new EnumMap<>(Region.class);

    static {
        BASE_ORDER_AMOUNT.put(Region.KR, 26216.0);
        BASE_ORDER_AMOUNT.put(Region.US, 31.09);
    }

    public RiskScoreResult score(Region region, double priceTotal, int people, int timeMinutes, String menu) {
        int safePeople = Math.max(1, people);
        double perPerson = priceTotal / safePeople;

        double base = BASE_ORDER_AMOUNT.getOrDefault(region, 26216.0);
        double lowThreshold = base * 0.8;
        double highThreshold = base * 1.2;

        int priceScore;
        PriceBand priceBand;
        if (perPerson < lowThreshold) {
            priceScore = 20;
            priceBand = PriceBand.LOW;
        } else if (perPerson < highThreshold) {
            priceScore = 50;
            priceBand = PriceBand.MID;
        } else {
            priceScore = 80;
            priceBand = PriceBand.HIGH;
        }

        int timeScore;
        TimeBand timeBand;
        if (timeMinutes < 20) {
            timeScore = 20;
            timeBand = TimeBand.LOW;
        } else if (timeMinutes < 60) {
            timeScore = 50;
            timeBand = TimeBand.MID;
        } else {
            timeScore = 80;
            timeBand = TimeBand.HIGH;
        }

        int wasteRisk = (int) Math.round(priceScore * PRICE_WEIGHT_IN_WASTE + timeScore * TIME_WEIGHT_IN_WASTE);
        int uncertaintyRisk = (menu == null || menu.trim().isEmpty()) ? 50 : 0;
        int total = (int) Math.round(wasteRisk * WASTE_WEIGHT + uncertaintyRisk * UNCERTAINTY_WEIGHT);
        total = Math.min(Math.max(total, 0), 100);

        RiskLabel label;
        if (total < 40) {
            label = RiskLabel.LOW;
        } else if (total < 70) {
            label = RiskLabel.MEDIUM;
        } else {
            label = RiskLabel.HIGH;
        }

        RiskScoreResult result = new RiskScoreResult();
        result.setScore(total);
        result.setLabel(label);
        result.setWasteRisk(wasteRisk);
        result.setUncertaintyRisk(uncertaintyRisk);
        result.setPricePerPerson(perPerson);
        result.setPriceBand(priceBand);
        result.setTimeBand(timeBand);
        return result;
    }
}
