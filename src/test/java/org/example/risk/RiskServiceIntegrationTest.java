package org.example.risk;

import java.util.UUID;
import org.example.risk.domain.Entitlement;
import org.example.risk.domain.EntitlementType;
import org.example.risk.domain.User;
import org.example.risk.domain.UsageCounter;
import org.example.risk.dto.RiskAnalyzeRequest;
import org.example.risk.error.ApiException;
import org.example.risk.repository.EntitlementRepository;
import org.example.risk.repository.IdempotencyKeyRepository;
import org.example.risk.repository.RiskRecordRepository;
import org.example.risk.repository.UserRepository;
import org.example.risk.repository.UsageCounterRepository;
import org.example.risk.service.RiskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Testcontainers
class RiskServiceIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
        .withDatabaseName("dra_test")
        .withUsername("postgres")
        .withPassword("postgres");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
        registry.add("app.jwt.secret", () -> "dev-secret-please-change-32-bytes-minimum");
    }

    @Autowired
    private RiskService riskService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntitlementRepository entitlementRepository;

    @Autowired
    private UsageCounterRepository usageCounterRepository;

    @Autowired
    private RiskRecordRepository riskRecordRepository;

    @Autowired
    private IdempotencyKeyRepository idempotencyKeyRepository;

    private UUID userId;

    @BeforeEach
    void setUp() {
        riskRecordRepository.deleteAll();
        idempotencyKeyRepository.deleteAll();
        usageCounterRepository.deleteAll();
        entitlementRepository.deleteAll();
        userRepository.deleteAll();

        userId = UUID.randomUUID();
        User user = new User(userId);
        userRepository.save(user);
    }

    private RiskAnalyzeRequest baseRequest() {
        RiskAnalyzeRequest request = new RiskAnalyzeRequest();
        request.setRegion(org.example.risk.domain.Region.KR);
        request.setPriceTotal(28000.0);
        request.setPeople(2);
        request.setTimeMinutes(35);
        request.setMenu("김치찌개");
        return request;
    }

    @Test
    void deterministicScoreTest() {
        entitlementRepository.save(new Entitlement(userId, EntitlementType.FREE));
        usageCounterRepository.save(new UsageCounter(userId, 3));

        var response1 = riskService.analyze(userId, baseRequest(), "key-1");
        var response2 = riskService.analyze(userId, baseRequest(), "key-2");

        assertThat(response1.getRiskScore()).isEqualTo(response2.getRiskScore());
        assertThat(usageCounterRepository.findById(userId).orElseThrow().getRemainingFree()).isEqualTo(1);
    }

    @Test
    void idempotencyPreventsDoubleDecrement() {
        entitlementRepository.save(new Entitlement(userId, EntitlementType.FREE));
        usageCounterRepository.save(new UsageCounter(userId, 3));

        var response1 = riskService.analyze(userId, baseRequest(), "idempotent-key");
        var response2 = riskService.analyze(userId, baseRequest(), "idempotent-key");

        assertThat(response1.getRiskScore()).isEqualTo(response2.getRiskScore());
        assertThat(riskRecordRepository.count()).isEqualTo(1);
        assertThat(usageCounterRepository.findById(userId).orElseThrow().getRemainingFree()).isEqualTo(2);
    }

    @Test
    void parallelRequestsDoNotOverDecrement() throws Exception {
        entitlementRepository.save(new Entitlement(userId, EntitlementType.FREE));
        usageCounterRepository.save(new UsageCounter(userId, 1));

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch latch = new CountDownLatch(1);

        Callable<Boolean> task1 = () -> {
            latch.await();
            riskService.analyze(userId, baseRequest(), "key-a");
            return true;
        };

        Callable<Boolean> task2 = () -> {
            latch.await();
            riskService.analyze(userId, baseRequest(), "key-b");
            return true;
        };

        Future<Boolean> f1 = executor.submit(task1);
        Future<Boolean> f2 = executor.submit(task2);
        latch.countDown();

        int success = 0;
        int failures = 0;
        for (Future<Boolean> f : new Future[]{f1, f2}) {
            try {
                f.get();
                success++;
            } catch (Exception ex) {
                failures++;
            }
        }
        executor.shutdown();

        assertThat(success).isEqualTo(1);
        assertThat(failures).isEqualTo(1);
        assertThat(usageCounterRepository.findById(userId).orElseThrow().getRemainingFree()).isEqualTo(0);
        assertThat(riskRecordRepository.count()).isEqualTo(1);
    }

    @Test
    void premiumBypassesLimit() {
        Entitlement ent = new Entitlement(userId, EntitlementType.PAID);
        ent.setPlan("pro");
        entitlementRepository.save(ent);
        usageCounterRepository.save(new UsageCounter(userId, 0));

        var response = riskService.analyze(userId, baseRequest(), "premium-key");
        assertThat(response.getRiskScore()).isGreaterThan(0);
        assertThat(usageCounterRepository.findById(userId).orElseThrow().getRemainingFree()).isEqualTo(0);
    }
}
