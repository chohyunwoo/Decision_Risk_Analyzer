package org.example.risk.service;

import java.time.format.DateTimeFormatter;
import java.util.UUID;
import org.example.risk.domain.Entitlement;
import org.example.risk.domain.EntitlementType;
import org.example.risk.dto.UserMeResponse;
import org.example.risk.error.ApiException;
import org.example.risk.error.ErrorCodes;
import org.example.risk.repository.EntitlementRepository;
import org.example.risk.repository.UsageCounterRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private static final int DEFAULT_FREE_COUNT = 3;

    private final EntitlementRepository entitlementRepository;
    private final UsageCounterRepository usageCounterRepository;

    public UserService(EntitlementRepository entitlementRepository, UsageCounterRepository usageCounterRepository) {
        this.entitlementRepository = entitlementRepository;
        this.usageCounterRepository = usageCounterRepository;
    }

    public UserMeResponse getMe(UUID userId) {
        Entitlement entitlement = entitlementRepository.findByUserId(userId)
            .orElseThrow(() -> new ApiException(ErrorCodes.UNAUTHORIZED, "User not found", HttpStatus.UNAUTHORIZED));

        usageCounterRepository.ensureExists(userId, DEFAULT_FREE_COUNT);
        int remainingFree = usageCounterRepository.findById(userId)
            .map(counter -> counter.getRemainingFree())
            .orElse(0);

        UserMeResponse response = new UserMeResponse();
        response.setUserId(userId.toString());
        response.setEntitlement(entitlement.getEntitlement().name());
        response.setRemainingFree(entitlement.getEntitlement() == EntitlementType.FREE ? remainingFree : 0);
        response.setPlan(entitlement.getPlan());
        response.setPlanValidUntil(entitlement.getPlanValidUntil() != null
            ? DateTimeFormatter.ISO_INSTANT.format(entitlement.getPlanValidUntil())
            : null);
        return response;
    }
}
