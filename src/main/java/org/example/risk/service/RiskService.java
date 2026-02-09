package org.example.risk.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;
import org.example.risk.domain.Entitlement;
import org.example.risk.domain.EntitlementType;
import org.example.risk.domain.IdempotencyKey;
import org.example.risk.domain.IdempotencyStatus;
import org.example.risk.domain.RiskRecord;
import org.example.risk.domain.User;
import org.example.risk.domain.UsageCounter;
import org.example.risk.dto.RiskAnalyzeRequest;
import org.example.risk.dto.RiskAnalyzeResponse;
import org.example.risk.error.ApiException;
import org.example.risk.error.ErrorCodes;
import org.example.risk.repository.EntitlementRepository;
import org.example.risk.repository.IdempotencyKeyRepository;
import org.example.risk.repository.RiskRecordRepository;
import org.example.risk.repository.UserRepository;
import org.example.risk.repository.UsageCounterRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RiskService {
    private static final int DEFAULT_FREE_COUNT = 3;

    private final UserRepository userRepository;
    private final EntitlementRepository entitlementRepository;
    private final UsageCounterRepository usageCounterRepository;
    private final IdempotencyKeyRepository idempotencyKeyRepository;
    private final RiskRecordRepository riskRecordRepository;
    private final RiskEngine riskEngine;
    private final AiExplanationService aiExplanationService;
    private final ObjectMapper objectMapper;

    public RiskService(
        UserRepository userRepository,
        EntitlementRepository entitlementRepository,
        UsageCounterRepository usageCounterRepository,
        IdempotencyKeyRepository idempotencyKeyRepository,
        RiskRecordRepository riskRecordRepository,
        RiskEngine riskEngine,
        AiExplanationService aiExplanationService,
        ObjectMapper objectMapper
    ) {
        this.userRepository = userRepository;
        this.entitlementRepository = entitlementRepository;
        this.usageCounterRepository = usageCounterRepository;
        this.idempotencyKeyRepository = idempotencyKeyRepository;
        this.riskRecordRepository = riskRecordRepository;
        this.riskEngine = riskEngine;
        this.aiExplanationService = aiExplanationService;
        this.objectMapper = objectMapper.copy()
            .configure(MapperFeature.SORT_PROPERTIES_ALPHABETICALLY, true)
            .configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true);
    }

    @Transactional
    public RiskAnalyzeResponse analyze(UUID userId, RiskAnalyzeRequest request, String idempotencyKey) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(ErrorCodes.UNAUTHORIZED, "User not found", HttpStatus.UNAUTHORIZED));

        String requestHash = hashRequest(request);
        IdempotencyKey idem = idempotencyKeyRepository.findByUserIdAndIdempotencyKey(userId, idempotencyKey)
            .orElse(null);

        if (idem != null) {
            return handleExistingIdempotency(idem, requestHash);
        }

        idem = new IdempotencyKey();
        idem.setUser(user);
        idem.setIdempotencyKey(idempotencyKey);
        idem.setRequestHash(requestHash);
        idem.setStatus(IdempotencyStatus.PENDING);
        idem.setExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));

        try {
            idempotencyKeyRepository.save(idem);
        } catch (DataIntegrityViolationException ex) {
            IdempotencyKey existing = idempotencyKeyRepository
                .findByUserIdAndIdempotencyKey(userId, idempotencyKey)
                .orElseThrow(() -> ex);
            return handleExistingIdempotency(existing, requestHash);
        }

        Entitlement entitlement = entitlementRepository.findByUserIdForUpdate(userId)
            .orElseGet(() -> entitlementRepository.save(new Entitlement(user, EntitlementType.FREE)));

        if (entitlement.getEntitlement() == EntitlementType.BLOCKED) {
            throw new ApiException(ErrorCodes.FORBIDDEN, "User is blocked", HttpStatus.FORBIDDEN);
        }

        UsageCounter usageCounter = null;
        if (entitlement.getEntitlement() == EntitlementType.FREE) {
            usageCounterRepository.ensureExists(userId, DEFAULT_FREE_COUNT);
            usageCounter = usageCounterRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new ApiException(ErrorCodes.INTERNAL_ERROR, "Usage counter missing", HttpStatus.INTERNAL_SERVER_ERROR));
            if (usageCounter.getRemainingFree() <= 0) {
                throw new ApiException(ErrorCodes.FORBIDDEN, "Free usage limit reached", HttpStatus.FORBIDDEN);
            }
        }

        RiskScoreResult score = riskEngine.score(
            request.getRegion(),
            request.getPriceTotal(),
            request.getPeople(),
            request.getTimeMinutes(),
            request.getMenu()
        );

        RiskRecord record = new RiskRecord();
        record.setId(UUID.randomUUID());
        record.setUser(user);
        record.setRegion(request.getRegion());
        record.setPriceTotal(request.getPriceTotal());
        record.setPeople(request.getPeople());
        record.setTimeMinutes(request.getTimeMinutes());
        record.setMenu(request.getMenu());
        record.setLink(request.getLink());
        record.setRiskScore(score.getScore());
        record.setRiskLabel(score.getLabel());
        record.setPolicyVersion(RiskEngine.POLICY_VERSION);
        record.setWasteRisk(score.getWasteRisk());
        record.setUncertaintyRisk(score.getUncertaintyRisk());
        record.setPricePerPerson(score.getPricePerPerson());
        record.setPriceBand(score.getPriceBand());
        record.setTimeBand(score.getTimeBand());
        record.setIdempotencyKey(idempotencyKey);

        String aiExplanation = aiExplanationService.generateExplanation(record);
        record.setAiExplanation(aiExplanation);

        riskRecordRepository.save(record);

        if (entitlement.getEntitlement() == EntitlementType.FREE) {
            usageCounter.setRemainingFree(usageCounter.getRemainingFree() - 1);
        }

        RiskAnalyzeResponse response = toAnalyzeResponse(record, entitlement, usageCounter);

        idem.setStatus(IdempotencyStatus.COMPLETED);
        idem.setRiskRecordId(record.getId());
        idem.setResponsePayload(serializeResponse(response));
        idempotencyKeyRepository.save(idem);

        return response;
    }

    private RiskAnalyzeResponse handleExistingIdempotency(IdempotencyKey idem, String requestHash) {
        if (!idem.getRequestHash().equals(requestHash)) {
            throw new ApiException(ErrorCodes.CONFLICT, "Idempotency key reused with different payload", HttpStatus.CONFLICT);
        }
        if (idem.getStatus() == IdempotencyStatus.COMPLETED) {
            return deserializeResponse(idem.getResponsePayload());
        }
        throw new ApiException(ErrorCodes.CONFLICT, "Request already in progress", HttpStatus.CONFLICT);
    }

    private String hashRequest(RiskAnalyzeRequest request) {
        try {
            byte[] data = objectMapper.writeValueAsBytes(request);
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception ex) {
            throw new ApiException(ErrorCodes.INTERNAL_ERROR, "Failed to hash request", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private String serializeResponse(RiskAnalyzeResponse response) {
        try {
            return objectMapper.writeValueAsString(response);
        } catch (JsonProcessingException ex) {
            throw new ApiException(ErrorCodes.INTERNAL_ERROR, "Failed to serialize response", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private RiskAnalyzeResponse deserializeResponse(String payload) {
        if (payload == null) {
            throw new ApiException(ErrorCodes.INTERNAL_ERROR, "Missing idempotent response", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        try {
            return objectMapper.readValue(payload.getBytes(StandardCharsets.UTF_8), RiskAnalyzeResponse.class);
        } catch (Exception ex) {
            throw new ApiException(ErrorCodes.INTERNAL_ERROR, "Failed to deserialize response", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public Optional<RiskRecord> getRecord(UUID userId, UUID recordId) {
        return riskRecordRepository.findById(recordId)
            .filter(record -> record.getUser().getId().equals(userId));
    }

    private RiskAnalyzeResponse toAnalyzeResponse(RiskRecord record, Entitlement entitlement, UsageCounter usageCounter) {
        RiskAnalyzeResponse response = new RiskAnalyzeResponse();
        response.setRecordId(record.getId().toString());
        response.setRiskScore(record.getRiskScore());
        response.setRiskLabel(record.getRiskLabel());
        response.setPolicyVersion(record.getPolicyVersion());

        RiskAnalyzeResponse.Breakdown breakdown = new RiskAnalyzeResponse.Breakdown();
        breakdown.setWasteRisk(record.getWasteRisk());
        breakdown.setUncertaintyRisk(record.getUncertaintyRisk());
        breakdown.setPricePerPerson(record.getPricePerPerson());
        breakdown.setPriceBand(record.getPriceBand() != null ? record.getPriceBand().name() : null);
        breakdown.setTimeBand(record.getTimeBand() != null ? record.getTimeBand().name() : null);
        response.setBreakdown(breakdown);

        response.setAiExplanation(record.getAiExplanation());

        RiskAnalyzeResponse.Usage usage = new RiskAnalyzeResponse.Usage();
        usage.setEntitlement(entitlement.getEntitlement().name());
        usage.setRemainingFree(usageCounter != null ? usageCounter.getRemainingFree() : 0);
        response.setUsage(usage);
        return response;
    }
}
