package org.example.risk.service;

import java.time.format.DateTimeFormatter;
import java.util.UUID;
import org.example.risk.domain.Region;
import org.example.risk.domain.RiskRecord;
import org.example.risk.dto.RiskAnalyzeResponse;
import org.example.risk.dto.RiskRecordDetailResponse;
import org.example.risk.dto.RiskRecordSummaryResponse;
import org.example.risk.error.ApiException;
import org.example.risk.error.ErrorCodes;
import org.example.risk.repository.RiskRecordRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class RiskQueryService {
    private final RiskRecordRepository riskRecordRepository;

    public RiskQueryService(RiskRecordRepository riskRecordRepository) {
        this.riskRecordRepository = riskRecordRepository;
    }

    public Page<RiskRecordSummaryResponse> list(UUID userId, Region region, Pageable pageable) {
        Page<RiskRecord> page = region == null
            ? riskRecordRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
            : riskRecordRepository.findByUserIdAndRegionOrderByCreatedAtDesc(userId, region, pageable);

        return page.map(this::toSummary);
    }

    public RiskRecordDetailResponse get(UUID userId, UUID recordId) {
        RiskRecord record = riskRecordRepository.findById(recordId)
            .filter(r -> r.getUser().getId().equals(userId))
            .orElseThrow(() -> new ApiException(ErrorCodes.NOT_FOUND, "Record not found", HttpStatus.NOT_FOUND));

        RiskRecordDetailResponse response = new RiskRecordDetailResponse();
        response.setId(record.getId().toString());
        response.setCreatedAt(DateTimeFormatter.ISO_INSTANT.format(record.getCreatedAt()));

        RiskRecordDetailResponse.Input input = new RiskRecordDetailResponse.Input();
        input.setRegion(record.getRegion());
        input.setPriceTotal(record.getPriceTotal());
        input.setPeople(record.getPeople());
        input.setTimeMinutes(record.getTimeMinutes());
        input.setMenu(record.getMenu());
        input.setLink(record.getLink());
        response.setInput(input);

        RiskRecordDetailResponse.Result result = new RiskRecordDetailResponse.Result();
        result.setRiskScore(record.getRiskScore());
        result.setRiskLabel(record.getRiskLabel());
        result.setPolicyVersion(record.getPolicyVersion());
        result.setAiExplanation(record.getAiExplanation());

        RiskAnalyzeResponse.Breakdown breakdown = new RiskAnalyzeResponse.Breakdown();
        breakdown.setWasteRisk(record.getWasteRisk());
        breakdown.setUncertaintyRisk(record.getUncertaintyRisk());
        breakdown.setPricePerPerson(record.getPricePerPerson());
        breakdown.setPriceBand(record.getPriceBand() != null ? record.getPriceBand().name() : null);
        breakdown.setTimeBand(record.getTimeBand() != null ? record.getTimeBand().name() : null);
        result.setBreakdown(breakdown);

        response.setResult(result);
        return response;
    }

    private RiskRecordSummaryResponse toSummary(RiskRecord record) {
        RiskRecordSummaryResponse summary = new RiskRecordSummaryResponse();
        summary.setId(record.getId().toString());
        summary.setCreatedAt(DateTimeFormatter.ISO_INSTANT.format(record.getCreatedAt()));
        summary.setRegion(record.getRegion());
        summary.setRiskScore(record.getRiskScore());
        summary.setRiskLabel(record.getRiskLabel());
        summary.setPriceTotal(record.getPriceTotal());
        summary.setPeople(record.getPeople());
        summary.setTimeMinutes(record.getTimeMinutes());
        summary.setMenu(record.getMenu());
        return summary;
    }
}
