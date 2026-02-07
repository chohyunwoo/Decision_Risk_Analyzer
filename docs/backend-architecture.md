# Backend Architecture — Spring Boot (Risk Engine)

## 1. 백엔드의 책임

| 책임 | 설명 |
|------|------|
| **분석 파이프라인** | AI 리스크 추출 → Monte Carlo → Scoring → Sensitivity → 추천 |
| **데이터 소유** | Analysis, UsageRecord 등 분석 관련 데이터의 CRUD |
| **AI 연동** | OpenAI/Anthropic API 호출, 프롬프트 관리, 토큰 추적 |
| **정량 엔진** | Monte Carlo 시뮬레이션, 리스크 매트릭스, 민감도 분석 |
| **비동기 Job** | 분석 요청을 비동기로 처리, 상태 업데이트 |
| **B2B API** | 외부 REST API (Phase 2), API Key 인증, 레이트 리미팅 |

**소유하지 않는 것**: 사용자 인증, 결제/구독, 프론트엔드 렌더링.

---

## 2. 프로젝트 구조 (Spring Boot)

```
src/main/java/com/decisionrisk/
├── DecisionRiskApplication.java       # Spring Boot 메인
│
├── config/                            # ── 설정 ──
│   ├── AiConfig.java                  # AI 프로바이더 빈 설정
│   ├── AsyncConfig.java               # ThreadPoolTaskExecutor 설정
│   ├── RedisConfig.java               # Upstash Redis 연결
│   ├── SecurityConfig.java            # 내부/외부 API 보안 분기
│   └── CorsConfig.java                # Next.js 도메인 CORS 허용
│
├── controller/                        # ── REST 컨트롤러 ──
│   ├── AnalysisController.java        # 내부 API (/api/analyses)
│   └── ExternalApiController.java     # B2B API (/api/v1/analyses) [Phase 2]
│
├── dto/                               # ── 요청/응답 DTO ──
│   ├── request/
│   │   └── CreateAnalysisRequest.java # 분석 생성 요청
│   └── response/
│       ├── AnalysisResponse.java      # 분석 결과 응답
│       ├── AnalysisSummaryResponse.java # 목록용 요약
│       └── ApiErrorResponse.java      # 표준 에러 응답
│
├── domain/                            # ── 엔티티 ──
│   ├── Analysis.java                  # 분석 엔티티
│   ├── UsageRecord.java               # 사용량 기록
│   ├── ApiKey.java                    # API 키 [Phase 2]
│   └── enums/
│       ├── AnalysisStatus.java        # PENDING~COMPLETED|FAILED
│       ├── DecisionCategory.java      # CAREER, INVESTMENT, ...
│       └── RiskLevel.java             # VERY_LOW ~ VERY_HIGH
│
├── repository/                        # ── JPA Repository ──
│   ├── AnalysisRepository.java
│   ├── UsageRecordRepository.java
│   └── ApiKeyRepository.java         # [Phase 2]
│
├── service/                           # ── 비즈니스 서비스 ──
│   ├── AnalysisService.java           # 분석 CRUD + 파이프라인 트리거
│   ├── UsageService.java              # 사용량 기록
│   └── ApiKeyService.java            # [Phase 2]
│
├── engine/                            # ── 분석 엔진 (핵심) ──
│   ├── pipeline/
│   │   └── AnalysisPipeline.java      # 파이프라인 오케스트레이터
│   ├── ai/
│   │   ├── AiProvider.java            # 추상 인터페이스
│   │   ├── OpenAiProvider.java        # OpenAI 구현
│   │   ├── AnthropicProvider.java     # Claude 구현
│   │   ├── PromptTemplates.java       # 프롬프트 상수
│   │   └── RiskFactorParser.java      # JSON 파싱 + 검증
│   ├── quant/
│   │   ├── MonteCarloSimulator.java   # 몬테카를로 시뮬레이션
│   │   ├── ScoringMatrix.java         # 5×5 리스크 매트릭스
│   │   ├── SensitivityAnalyzer.java   # 민감도 분석
│   │   ├── BetaDistribution.java      # Beta 분포 샘플링
│   │   └── CategoryWeights.java       # 카테고리별 가중치
│   └── model/                         # 엔진 내부 모델
│       ├── RiskFactor.java
│       ├── MonteCarloResult.java
│       ├── ScoringMatrixResult.java
│       ├── SensitivityResult.java
│       ├── Recommendation.java
│       └── AnalysisReport.java
│
├── job/                               # ── 비동기 처리 ──
│   └── AnalysisJobProcessor.java      # @Async 분석 실행기
│
├── security/                          # ── 보안 ──
│   ├── InternalApiFilter.java         # X-User-Id 헤더 검증
│   └── ApiKeyFilter.java             # API Key 인증 [Phase 2]
│
└── exception/                         # ── 예외 처리 ──
    ├── GlobalExceptionHandler.java    # @ControllerAdvice
    ├── AnalysisNotFoundException.java
    ├── RateLimitExceededException.java
    └── AiProviderException.java

src/main/resources/
├── application.yml                    # 메인 설정
├── application-dev.yml                # 개발 환경
├── application-prod.yml               # 프로덕션 환경
└── prompts/                           # 프롬프트 템플릿 파일
    ├── risk-extraction.txt
    └── recommendation.txt

src/test/java/com/decisionrisk/
├── engine/quant/
│   ├── MonteCarloSimulatorTest.java
│   ├── ScoringMatrixTest.java
│   └── SensitivityAnalyzerTest.java
├── engine/ai/
│   └── RiskFactorParserTest.java
├── service/
│   └── AnalysisServiceTest.java
└── controller/
    └── AnalysisControllerTest.java
```

---

## 3. 분석 파이프라인 상세

### 전체 흐름

```
AnalysisController.create()
        │
        ▼
AnalysisService.createAnalysis()
        │── Analysis 레코드 생성 (status=PENDING)
        │── 202 즉시 반환
        │
        └──▶ AnalysisJobProcessor.process()  [@Async]
                │
                ├── [1] status → EXTRACTING
                │   AiProvider.extractRiskFactors()
                │   RiskFactorParser.validate()
                │   Analysis에 riskFactors 저장
                │
                ├── [2] status → SIMULATING
                │   MonteCarloSimulator.run(factors, 10_000)
                │   ScoringMatrix.calculate(factors)
                │   SensitivityAnalyzer.analyze(factors)
                │   결과 저장
                │
                ├── [3] status → GENERATING
                │   AiProvider.generateRecommendations()
                │   최종 리포트 조합
                │
                ├── [4] status → COMPLETED
                │   compositeRiskScore, riskLevel 저장
                │   UsageRecord 기록
                │
                └── [예외] status → FAILED
                    errorMessage 저장
```

### 상태 머신

```
PENDING ──▶ EXTRACTING ──▶ SIMULATING ──▶ GENERATING ──▶ COMPLETED
   │             │               │              │
   └─────────────┴───────────────┴──────────────┴──────▶ FAILED
```

각 단계에서 실패하면 `FAILED`로 전이하고 `errorMessage`에 원인을 기록한다.
클라이언트는 `GET /api/analyses/{id}`를 폴링하여 `status` 변화를 추적한다.

---

## 4. 엔진 모듈 상세

### 4-1. AI 리스크 추출 (`engine/ai/`)

**책임**: 사용자의 자연어 입력에서 구조화된 리스크 요인을 추출한다.

**프로바이더 추상화**:
```
                AiProvider (interface)
                ┌─────────────────────┐
                │ extractRiskFactors()│
                │ generateRecommend() │
                └─────────┬───────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
    OpenAiProvider              AnthropicProvider
    (gpt-4o / mini)             (claude-sonnet)
```

- `AI_PROVIDER` 환경변수로 선택 (기본: openai)
- 프롬프트는 `resources/prompts/` 에 외부 파일로 관리 → 재배포 없이 수정 가능
- 온도 0.3으로 일관된 JSON 출력 유도
- Zod 대신 Jackson + Custom Validator로 응답 검증

**AI 출력 → RiskFactor 매핑**:

| AI 출력 필드 | RiskFactor 필드 | 타입 | 범위 |
|-------------|----------------|------|------|
| name | name | String | 3-6단어 |
| category | category | Enum | financial, market, ... (10종) |
| probability | probability | double | 0.0 - 1.0 |
| probabilityConfidence | probabilityConfidence | double | 0.0 - 1.0 |
| impact | impact | int | 1-5 |
| direction | direction | Enum | negative / positive / neutral |
| timeframe | timeframe | Enum | immediate ~ long_term |
| mitigationPossibility | mitigationPossibility | Enum | high / medium / low / none |

**티어별 AI 모델 선택**:
- Free 티어 → `gpt-4o-mini` (저비용, 빠름)
- Pro/API/Enterprise → `gpt-4o` 또는 `claude-sonnet` (고품질)
- 프론트엔드가 `X-User-Tier` 헤더로 전달

### 4-2. Monte Carlo 시뮬레이션 (`engine/quant/MonteCarloSimulator`)

**책임**: 리스크 요인들의 확률 분포를 시뮬레이션하여 종합 리스크의 불확실성 범위를 산출한다.

**알고리즘**:

```
입력: RiskFactor[] (5~15개), iterations = 10,000

각 iteration에서:
  1. 각 요인에 대해 Bernoulli(probability)로 발생 여부 결정
  2. 발생 시, Beta(α, β) 분포로 실제 영향도 샘플링
     - α = impact × confidence × 2
     - β = (5 - impact) × confidence × 2 + 1
     - 신뢰도가 높을수록 → 명시된 impact 근처에 분포 집중
     - 신뢰도가 낮을수록 → 넓은 분산
  3. 카테고리 가중치 적용
  4. 방향 반영 (positive → 점수 감소, negative → 점수 증가)
  5. 0-100 정규화

출력:
  - 10,000개 점수 배열
  - 백분위수 (P5, P25, P50, P75, P95)
  - 평균, 표준편차
  - 고위험 확률 (score > 70인 비율)
  - 히스토그램 (20 bins)
```

**성능**: 10,000 × 15 요인 ≈ 150,000 연산 → JVM에서 ~10ms 소요. 별도 스레드 풀 불필요.

### 4-3. 스코어링 매트릭스 (`engine/quant/ScoringMatrix`)

**책임**: 리스크 요인을 5×5 매트릭스에 배치하고 가중 복합 점수를 산출한다.

```
              Impact →
              1(무시)  2(경미)  3(보통)  4(심각)  5(치명)
Prob  5(거의확실) │ Med  │ High │ High │ Crit │ Crit │
 ↓    4(높음)    │ Low  │ Med  │ High │ High │ Crit │
      3(보통)    │ Low  │ Med  │ Med  │ High │ High │
      2(낮음)    │ Low  │ Low  │ Med  │ Med  │ High │
      1(희박)    │ Low  │ Low  │ Low  │ Med  │ Med  │
```

**복합 점수 계산**:
1. 각 위협 요인의 `확률 버킷(1-5) × 영향도(1-5)` = 원점수 (1-25)
2. 카테고리 가중치 적용 (의사결정 유형에 따라 0.3 ~ 1.5)
3. 전체 가중 점수 합산 → 이론적 최대치 대비 비율 → 0-100 정규화
4. 구간별 리스크 레벨: VERY_LOW(0-20) ~ VERY_HIGH(81-100)

### 4-4. 민감도 분석 (`engine/quant/SensitivityAnalyzer`)

**책임**: 어떤 요인이 종합 점수에 가장 큰 영향을 미치는지 순위를 매긴다.

**방법**: One-at-a-time (OAT) 민감도 분석
- 각 요인의 확률을 ±20% 변동
- 변동 전후 복합 점수 차이 = 민감도
- 민감도 크기순으로 정렬 → 토네이도 차트 데이터

---

## 5. Job 처리 흐름

### 비동기 실행 구조

```
┌───────────────────────────────────────────────────┐
│                 Spring Boot                        │
│                                                   │
│  ┌──────────────┐     ┌─────────────────────┐     │
│  │ Controller   │────▶│  AnalysisService    │     │
│  │ (동기 응답)   │     │  .createAnalysis()  │     │
│  └──────────────┘     └─────────┬───────────┘     │
│                                 │ @Async           │
│                                 ▼                  │
│                    ┌────────────────────────┐      │
│                    │ AnalysisJobProcessor   │      │
│                    │ .process(analysisId)   │      │
│                    │                        │      │
│                    │  ThreadPoolTaskExecutor │      │
│                    │  core=4, max=8, queue=50│      │
│                    └────────────────────────┘      │
│                                                   │
└───────────────────────────────────────────────────┘
```

**MVP에서는 `@Async` + `ThreadPoolTaskExecutor`로 충분하다.**

확장 시(Phase 3+) 메시지 큐로 전환 가능:

| 규모 | 처리 방식 | 이유 |
|------|----------|------|
| MVP (~100 DAU) | `@Async` + 스레드 풀 | 단일 인스턴스, 설정 간단 |
| Growth (~1K DAU) | Redis Queue (Bull 등) | 재시도, 우선순위 큐 |
| Enterprise (~10K+ DAU) | RabbitMQ / SQS | 분산 워커, 스케일 아웃 |

### 재시도 & 실패 처리

- AI API 호출 실패 → 최대 2회 재시도 (지수 백오프: 1s, 3s)
- 전체 파이프라인 타임아웃: 60초
- 최종 실패 시 `status=FAILED`, `errorMessage`에 원인 기록
- 실패 분석은 사용량에 카운트하지 않음

---

## 6. 데이터베이스 설계

### 백엔드 소유 테이블

**Analysis** — 분석 전체 라이프사이클

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 분석 고유 ID |
| user_id | VARCHAR | 사용자 ID (FK 없음, Next.js와 공유) |
| status | ENUM | PENDING → COMPLETED \| FAILED |
| title | VARCHAR(200) | 사용자 지정 제목 |
| decision_input | TEXT | 자연어 입력 원문 |
| category | ENUM | 의사결정 카테고리 |
| additional_context | JSONB | 추가 컨텍스트 (선택) |
| risk_factors | JSONB | AI 추출 리스크 요인 배열 |
| monte_carlo_results | JSONB | MC 시뮬레이션 결과 |
| scoring_matrix_result | JSONB | 스코어링 매트릭스 결과 |
| sensitivity_results | JSONB | 민감도 분석 결과 |
| composite_risk_score | FLOAT | 최종 점수 (0-100) |
| risk_level | ENUM | VERY_LOW ~ VERY_HIGH |
| recommendations | JSONB | AI 추천사항 배열 |
| ai_provider | VARCHAR | 사용된 AI 프로바이더 |
| ai_model | VARCHAR | 모델 버전 |
| ai_tokens_used | INT | 총 토큰 사용량 |
| ai_latency_ms | INT | AI 응답 시간 |
| processing_time_ms | INT | 전체 처리 시간 |
| error_message | TEXT | 실패 시 에러 메시지 |
| created_at | TIMESTAMP | 생성 시각 |
| updated_at | TIMESTAMP | 수정 시각 |

**인덱스**:
- `(user_id, created_at DESC)` — 사용자별 최신순 목록
- `(user_id, status)` — 진행 중 분석 조회
- `(category)` — 카테고리별 통계

**UsageRecord** — 사용량 추적

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | |
| user_id | VARCHAR | |
| type | ENUM | ANALYSIS_COMPLETED, API_CALL, ... |
| ai_tokens_input | INT | 입력 토큰 |
| ai_tokens_output | INT | 출력 토큰 |
| estimated_cost_usd | FLOAT | 추정 비용 |
| metadata | JSONB | 추가 정보 |
| created_at | TIMESTAMP | |

**ApiKey** (Phase 2) — B2B API 키

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | |
| user_id | VARCHAR | |
| name | VARCHAR | 사용자 지정 이름 |
| key_hash | VARCHAR (UNIQUE) | SHA-256 해시 |
| key_prefix | VARCHAR(12) | 식별용 접두사 |
| rate_limit_per_minute | INT | 분당 제한 (기본 60) |
| rate_limit_per_day | INT | 일당 제한 (기본 1000) |
| is_active | BOOLEAN | 활성 여부 |
| expires_at | TIMESTAMP | 만료일 (nullable) |
| last_used_at | TIMESTAMP | 마지막 사용 |
| created_at | TIMESTAMP | |

### 프론트엔드와의 DB 공유 전략

프론트엔드(Next.js)와 백엔드(Spring Boot)는 **동일한 Neon PostgreSQL 인스턴스**를 사용하되,
**테이블 소유권을 명확히 분리**한다.

```
┌─ Next.js 소유 ──────────────────┐  ┌─ Spring Boot 소유 ──────────┐
│ User (tier, stripe*, usage*)    │  │ Analysis                    │
│ Account (Auth.js)               │  │ UsageRecord                 │
│ Session (Auth.js)               │  │ ApiKey (Phase 2)            │
│ VerificationToken (Auth.js)     │  │                             │
│ StripeEvent                     │  │                             │
└─────────────────────────────────┘  └─────────────────────────────┘
                │                                    │
                └──── 공유 키: user_id (User.id) ─────┘
```

- `user_id`는 양쪽에서 참조하지만, FK 제약조건은 걸지 않는다 (서비스 간 독립성)
- 스키마 마이그레이션은 각각 독립적으로 수행 (Prisma, Flyway)

---

## 7. API 설계

### 7-1. 내부 API (Next.js BFF → Spring Boot)

기본 URL: `http://backend-host/api`

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | `/api/analyses` | 분석 생성 | X-User-Id 헤더 |
| GET | `/api/analyses?userId={id}&page={n}` | 분석 목록 | X-User-Id 헤더 |
| GET | `/api/analyses/{id}` | 단일 분석 조회 | X-User-Id 헤더 |

**내부 API 보안**: Next.js → Spring Boot 통신은 내부 네트워크에서 이루어진다.
`X-User-Id`와 `X-User-Tier` 헤더 + 공유 시크릿(`X-Internal-Key`)으로 인증한다.

**요청 예시** — 분석 생성:
```
POST /api/analyses
Headers:
  X-User-Id: user_cuid123
  X-User-Tier: PRO
  X-Internal-Key: {shared_secret}
Body:
  {
    "title": "스타트업 CTO 이직 결정",
    "decisionInput": "현재 대기업 5년차 개발자...",
    "category": "CAREER",
    "additionalContext": { "riskTolerance": "moderate" }
  }
```

**응답 예시** — 202 Accepted:
```json
{
  "id": "analysis_abc123",
  "status": "PENDING",
  "createdAt": "2026-02-07T10:30:00Z"
}
```

**응답 예시** — 완료된 분석:
```json
{
  "id": "analysis_abc123",
  "status": "COMPLETED",
  "title": "스타트업 CTO 이직 결정",
  "category": "CAREER",
  "compositeRiskScore": 62.4,
  "riskLevel": "HIGH",
  "riskFactors": [ ... ],
  "monteCarloResults": {
    "percentiles": { "p5": 28, "p25": 45, "p50": 61, "p75": 74, "p95": 89 },
    "mean": 60.2,
    "probabilityOfHighRisk": 0.42,
    "histogram": [ ... ]
  },
  "scoringMatrixResult": { ... },
  "sensitivityResults": { ... },
  "recommendations": [ ... ],
  "processingTimeMs": 8420,
  "createdAt": "2026-02-07T10:30:00Z"
}
```

### 7-2. B2B 외부 API (Phase 2)

기본 URL: `https://api.decisionrisk.com/v1`

| Method | Endpoint | Rate Limit |
|--------|----------|------------|
| POST | `/v1/analyses` | 60/min |
| GET | `/v1/analyses/{id}` | 120/min |
| GET | `/v1/analyses` | 120/min |
| GET | `/v1/health` | 제한 없음 |

**인증**: `Authorization: Bearer dra_live_xxxxxxxxxxxx`
**레이트 리미팅**: Redis (Upstash) Sliding Window 알고리즘
**응답 봉투**: `{ "data": {...}, "meta": { "requestId", "timestamp" } }`
**에러 형식**: `{ "error": { "code": "RATE_LIMITED", "message": "..." } }`

응답 헤더:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1707300000
```

---

## 8. 보안

### 내부 API 보안 (InternalApiFilter)

```
요청 도착
  │
  ├── X-Internal-Key 헤더 확인
  │   └── 불일치 → 403 Forbidden
  │
  ├── X-User-Id 헤더 존재 확인
  │   └── 없음 → 400 Bad Request
  │
  └── 통과 → Controller로 전달
```

- 공유 시크릿은 환경변수로 관리 (`INTERNAL_API_KEY`)
- Next.js 서버에서만 이 키를 보유하므로 외부 접근 불가
- 프로덕션에서는 Railway Private Networking 사용 (인터넷 비노출)

### B2B API 보안 (ApiKeyFilter, Phase 2)

```
요청 도착
  │
  ├── Authorization: Bearer {key} 추출
  │
  ├── SHA-256(key) 계산 → DB에서 key_hash 조회
  │   └── 없음 or 비활성 → 401 Unauthorized
  │
  ├── 만료일 확인
  │   └── 만료됨 → 401 API_KEY_EXPIRED
  │
  ├── 사용자 티어 확인 (API or ENTERPRISE만 허용)
  │   └── 미달 → 403 Forbidden
  │
  ├── Redis Rate Limit 확인
  │   └── 초과 → 429 Too Many Requests
  │
  └── 통과 → Controller로 전달
```

---

## 9. 설정 파일 구조 (`application.yml`)

```yaml
# application.yml (공통)
spring:
  application:
    name: decision-risk-analyzer
  jpa:
    hibernate:
      ddl-auto: validate           # Flyway가 마이그레이션 담당
    open-in-view: false

  datasource:
    url: ${DATABASE_URL}
    hikari:
      maximum-pool-size: 10

  task:
    execution:
      pool:
        core-size: 4
        max-size: 8
        queue-capacity: 50
      thread-name-prefix: "analysis-"

# AI 설정
ai:
  provider: ${AI_PROVIDER:openai}
  openai:
    api-key: ${OPENAI_API_KEY}
    model-free: gpt-4o-mini
    model-pro: gpt-4o
    temperature: 0.3
    max-tokens: 4000
  anthropic:
    api-key: ${ANTHROPIC_API_KEY}
    model: claude-sonnet-4-20250514

# 엔진 설정
engine:
  monte-carlo:
    iterations: 10000
    timeout-ms: 5000
  pipeline:
    timeout-ms: 60000
    retry:
      max-attempts: 2
      backoff-ms: 1000

# 내부 API 보안
security:
  internal-api-key: ${INTERNAL_API_KEY}

# Redis
redis:
  url: ${UPSTASH_REDIS_REST_URL}
  token: ${UPSTASH_REDIS_REST_TOKEN}

# Rate Limiting (Phase 2)
rate-limit:
  api:
    per-minute: 60
    per-day: 1000
```

---

## 10. 배포

### MVP 배포 구성

```
Railway
├── Service: decision-risk-backend
│   ├── Docker 이미지 (Java 21 + Spring Boot)
│   ├── 환경변수: DATABASE_URL, AI keys, INTERNAL_API_KEY
│   ├── 헬스체크: /actuator/health
│   ├── Port: 8080
│   └── 리소스: 512MB RAM, 0.5 vCPU (스타터)
│
└── Addon: Neon PostgreSQL (외부 연결)
```

**Railway 선택 이유**:
- Spring Boot JAR/Docker 네이티브 지원
- Private Networking (Next.js ↔ Spring Boot 내부 통신)
- GitHub 연동 자동 배포
- 합리적 가격 ($5/월~)

### 헬스체크 엔드포인트

`GET /actuator/health` → Spring Boot Actuator 기본 제공

커스텀 상세:
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "redis": { "status": "UP" },
    "aiProvider": { "status": "UP", "provider": "openai" }
  }
}
```

---

## 11. 기술 스택 요약

| 기술 | 버전 | 역할 |
|------|------|------|
| Java | 21 (LTS) | 런타임 |
| Spring Boot | 3.3+ | 웹 프레임워크, DI, 비동기 |
| Gradle | 8.14 | 빌드 도구 |
| Spring Data JPA | 3.x | ORM |
| Flyway | 10.x | DB 마이그레이션 |
| Jackson | 2.x | JSON 직렬화/역직렬화 |
| OkHttp | 4.x | AI API HTTP 클라이언트 |
| Hibernate Validator | 8.x | 요청 검증 |
| HikariCP | 5.x | 커넥션 풀 |
| Spring Actuator | 3.x | 헬스체크, 메트릭 |
| JUnit 5 | 5.10+ | 테스트 |
| Mockito | 5.x | 목킹 |
| Testcontainers | 1.19+ | 통합 테스트 (PostgreSQL) |
