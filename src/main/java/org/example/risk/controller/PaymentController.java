package org.example.risk.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.example.risk.domain.PaymentEvent;
import org.example.risk.dto.PaymentStatusResponse;
import org.example.risk.dto.PaymentWebhookRequest;
import org.example.risk.dto.PaymentWebhookResponse;
import org.example.risk.security.UserPrincipal;
import org.example.risk.repository.EntitlementRepository;
import org.example.risk.repository.PaymentEventRepository;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentEventRepository paymentEventRepository;
    private final EntitlementRepository entitlementRepository;
    private final ObjectMapper objectMapper;

    public PaymentController(
        PaymentEventRepository paymentEventRepository,
        EntitlementRepository entitlementRepository,
        ObjectMapper objectMapper
    ) {
        this.paymentEventRepository = paymentEventRepository;
        this.entitlementRepository = entitlementRepository;
        this.objectMapper = objectMapper;
    }

    @PostMapping(value = "/webhook", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public PaymentWebhookResponse webhook(
        @RequestHeader(value = "Payment-Signature", required = false) String signature,
        @RequestBody PaymentWebhookRequest request
    ) {
        PaymentEvent event = new PaymentEvent();
        event.setId(UUID.randomUUID());
        event.setProvider(request.getProvider());
        event.setEventType(request.getEventType());
        event.setEventId(request.getEventId());
        try {
            event.setPayload(objectMapper.writeValueAsString(request.getPayload()));
        } catch (Exception ex) {
            event.setPayload("{}");
        }
        paymentEventRepository.save(event);
        return new PaymentWebhookResponse(true);
    }

    @GetMapping(value = "/status", produces = MediaType.APPLICATION_JSON_VALUE)
    public PaymentStatusResponse status(@AuthenticationPrincipal UserPrincipal principal) {
        var entitlement = entitlementRepository.findByUserId(principal.getUserId()).orElse(null);
        PaymentStatusResponse response = new PaymentStatusResponse();
        if (entitlement != null) {
            response.setEntitlement(entitlement.getEntitlement().name());
            response.setPlan(entitlement.getPlan());
            response.setPlanValidUntil(entitlement.getPlanValidUntil() != null
                ? entitlement.getPlanValidUntil().toString()
                : null);
            response.setBillingStatus(entitlement.getBillingStatus());
        }
        return response;
    }
}
