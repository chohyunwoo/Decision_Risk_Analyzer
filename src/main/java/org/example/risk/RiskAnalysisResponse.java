package org.example.risk;

public class RiskAnalysisResponse {
    private int score;

    public RiskAnalysisResponse() {
    }

    public RiskAnalysisResponse(int score) {
        this.score = score;
    }

    public int getScore() {
        return score;
    }
}
