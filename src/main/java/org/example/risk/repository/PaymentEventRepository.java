package org.example.risk.repository;

import java.util.UUID;
import org.example.risk.domain.PaymentEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentEventRepository extends JpaRepository<PaymentEvent, UUID> {}
