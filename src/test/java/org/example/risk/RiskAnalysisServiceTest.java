package org.example.risk;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RiskAnalysisServiceTest {

    @Test
    void shouldReturnScoreFromEngine() {
        CountingStubEngine engine = new CountingStubEngine(45);
        RiskAnalysisService service = new RiskAnalysisService(engine);
        FoodDecisionInput input = new FoodDecisionInput(
            "https://example.com/restaurant",
            "DINNER",
            "MID"
        );

        int score = service.analyze(input);

        assertEquals(45, score);
        assertEquals(1, engine.callCount());
    }

    @Test
    void shouldPassInputToEngineWithoutModification() {
        CountingStubEngine engine = new CountingStubEngine(10);
        RiskAnalysisService service = new RiskAnalysisService(engine);
        FoodDecisionInput input = new FoodDecisionInput(
            "https://example.com/restaurant",
            "LUNCH",
            "LOW"
        );

        service.analyze(input);

        org.junit.jupiter.api.Assertions.assertSame(input, engine.capturedInput());
    }

    private static final class CountingStubEngine extends RiskScoringEngine {
        private final int fixedScore;
        private int calls;
        private FoodDecisionInput capturedInput;

        private CountingStubEngine(int fixedScore) {
            this.fixedScore = fixedScore;
        }

        @Override
        public int score(FoodDecisionInput input) {
            calls += 1;
            capturedInput = input;
            return fixedScore;
        }

        private int callCount() {
            return calls;
        }

        private FoodDecisionInput capturedInput() {
            return capturedInput;
        }
    }
}
