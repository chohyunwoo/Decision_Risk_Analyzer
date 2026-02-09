package org.example.risk.service;

import org.example.risk.domain.PriceBand;
import org.example.risk.domain.RiskLabel;
import org.example.risk.domain.TimeBand;

public class RiskScoreResult {
    private int score;
    private RiskLabel label;
    private int wasteRisk;
    private int uncertaintyRisk;
    private double pricePerPerson;
    private PriceBand priceBand;
    private TimeBand timeBand;

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public RiskLabel getLabel() {
        return label;
    }

    public void setLabel(RiskLabel label) {
        this.label = label;
    }

    public int getWasteRisk() {
        return wasteRisk;
    }

    public void setWasteRisk(int wasteRisk) {
        this.wasteRisk = wasteRisk;
    }

    public int getUncertaintyRisk() {
        return uncertaintyRisk;
    }

    public void setUncertaintyRisk(int uncertaintyRisk) {
        this.uncertaintyRisk = uncertaintyRisk;
    }

    public double getPricePerPerson() {
        return pricePerPerson;
    }

    public void setPricePerPerson(double pricePerPerson) {
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
}
