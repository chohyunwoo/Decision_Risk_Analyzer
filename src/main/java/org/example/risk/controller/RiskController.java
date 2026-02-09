package org.example.risk.controller;

import jakarta.validation.Valid;
import java.util.UUID;
import org.example.risk.domain.Region;
import org.example.risk.dto.RiskAnalyzeRequest;
import org.example.risk.dto.RiskAnalyzeResponse;
import org.example.risk.dto.RiskRecordDetailResponse;
import org.example.risk.dto.RiskRecordSummaryResponse;
import org.example.risk.error.ApiException;
import org.example.risk.error.ErrorCodes;
import org.example.risk.security.UserPrincipal;
import org.example.risk.service.RiskQueryService;
import org.example.risk.service.RiskService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/risk")
public class RiskController {
    private final RiskService riskService;
    private final RiskQueryService riskQueryService;

    public RiskController(RiskService riskService, RiskQueryService riskQueryService) {
        this.riskService = riskService;
        this.riskQueryService = riskQueryService;
    }

    @PostMapping(value = "/analyze", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public RiskAnalyzeResponse analyze(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
        @Valid @RequestBody RiskAnalyzeRequest request
    ) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new ApiException(ErrorCodes.VALIDATION_ERROR, "Idempotency-Key header is required", HttpStatus.BAD_REQUEST);
        }
        return riskService.analyze(principal.getUserId(), request, idempotencyKey);
    }

    @GetMapping(value = "/records", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<RiskRecordSummaryResponse> records(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(name = "page", defaultValue = "1") int page,
        @RequestParam(name = "size", defaultValue = "20") int size,
        @RequestParam(name = "region", required = false) Region region
    ) {
        int safePage = Math.max(1, page) - 1;
        int safeSize = Math.min(Math.max(1, size), 100);
        Pageable pageable = PageRequest.of(safePage, safeSize);
        return riskQueryService.list(principal.getUserId(), region, pageable);
    }

    @GetMapping(value = "/records/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public RiskRecordDetailResponse recordDetail(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable("id") UUID id
    ) {
        return riskQueryService.get(principal.getUserId(), id);
    }
}
