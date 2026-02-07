package org.example.risk;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RiskScoringEngineTest {

    @Test
    void shouldReturnSameScoreForSameInput() {
        RiskScoringEngine engine = new RiskScoringEngine();
        FoodDecisionInput input = new FoodDecisionInput(
            "https://example.com/restaurant",
            "DINNER",
            "MID"
        );

        int firstScore = engine.score(input);
        int secondScore = engine.score(input);

        assertEquals(firstScore, secondScore);
    }

    @Test
    void shouldApplyFixedWeightsCorrectly() {
        RiskScoringEngine engine = new RiskScoringEngine();
        FoodDecisionInput input = new FoodDecisionInput(
            "https://example.com/restaurant",
            "DINNER",
            "MID"
        );

        int score = engine.score(input);

        assertEquals(45, score);
    }

    @Test
    void shouldReturnScoreWithinAllowedRange() {
        RiskScoringEngine engine = new RiskScoringEngine();
        FoodDecisionInput input = new FoodDecisionInput(
            "https://example.com/restaurant",
            "LUNCH",
            "LOW"
        );

        int score = engine.score(input);

        assertTrue(score >= 25);
        assertTrue(score <= 65);
    }

    @Test
    void shouldReturnMaxScoreForHighestRiskInput() {
        RiskScoringEngine engine = new RiskScoringEngine();
        FoodDecisionInput input = new FoodDecisionInput(
            "",
            "DINNER",
            "HIGH"
        );

        int score = engine.score(input);

        assertEquals(65, score);
    }
}
