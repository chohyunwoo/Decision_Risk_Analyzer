package org.example.risk;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RiskAnalysisControllerTest {

    @Test
    void shouldReturnScoreFromService() {
        CountingStubService service = new CountingStubService(45);
        RiskAnalysisController controller = new RiskAnalysisController(service);
        RiskAnalysisRequest request = new RiskAnalysisRequest(
            "https://example.com/restaurant",
            "DINNER",
            "MID"
        );

        RiskAnalysisResponse response = controller.analyze(request);

        assertEquals(45, response.score());
        assertEquals(1, service.callCount());
    }

    private static final class CountingStubService extends RiskAnalysisService {
        private final int fixedScore;
        private int calls;
        private FoodDecisionInput capturedInput;

        private CountingStubService(int fixedScore) {
            super(new RiskScoringEngine());
            this.fixedScore = fixedScore;
        }

        @Override
        public int analyze(FoodDecisionInput input) {
            calls += 1;
            capturedInput = input;
            return fixedScore;
        }

        private int callCount() {
            return calls;
        }
    }
}
