package org.example.risk.service;

import org.example.risk.domain.RiskRecord;
import org.springframework.stereotype.Service;

@Service
public class StubAiExplanationService implements AiExplanationService {
    @Override
    public String generateExplanation(RiskRecord record) {
        return null;
    }
}
