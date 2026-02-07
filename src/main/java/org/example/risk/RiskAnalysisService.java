package org.example.risk;

public class RiskAnalysisService {
    private final RiskScoringEngine engine;

    public RiskAnalysisService(RiskScoringEngine engine) {
        this.engine = engine;
    }

    public int analyze(FoodDecisionInput input) {
        return engine.score(input);
    }
}
