package org.example.risk.service;

import org.example.risk.domain.RiskRecord;

public interface AiExplanationService {
    String generateExplanation(RiskRecord record);
}
