package org.example.risk;

import org.springframework.stereotype.Service;

@Service
public class RiskAnalysisService {
    private final RiskScoringEngine engine;

    public RiskAnalysisService(RiskScoringEngine engine) {
        this.engine = engine;
    }

    public int analyze(FoodDecisionInput input) {
        return engine.score(input);
    }
}
