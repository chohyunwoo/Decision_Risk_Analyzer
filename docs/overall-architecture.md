# Overall Architecture — Decision Risk Analyzer

## 1. 시스템 개요

Decision Risk Analyzer는 사용자가 자연어로 의사결정 시나리오를 입력하면,
**AI가 리스크 요인을 추출**하고 **정량 엔진이 시뮬레이션**을 수행하여
시각적 리포트를 제공하는 글로벌 SaaS 서비스이다.

```
┌─────────────────────────────────────────────────────────────────┐
│                        사용자 (브라우저)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js on Vercel)                  │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐   │
│  │ 랜딩/마케팅 │  │ 분석 위자드 │  │ 리포트 뷰어 │  │ 대시보드/설정  │   │
│  └──────────┘  └──────────┘  └───────────┘  └──────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  API Routes (BFF) — 인증·결제·사용량 게이트 + 백엔드 프록시    │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST (internal)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│               Backend (Spring Boot on Railway/Fly.io)            │
│                                                                 │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────────┐     │
│  │ REST API    │  │ Risk Engine   │  │  Job Processor      │     │
│  │ Controller  │→ │ (Pipeline)    │→ │  (비동기 분석 실행)    │     │
│  └────────────┘  └──────┬───────┘  └──────────┬──────────┘     │
│                         │                      │                │
│              ┌──────────┴──────────┐           │                │
│              │                     │           │                │
│         ┌────▼─────┐       ┌──────▼──────┐    │                │
│         │ AI Client │       │ Quant Engine │    │                │
│         │(OpenAI/   │       │ Monte Carlo  │    │                │
│         │ Claude)   │       │ Scoring      │    │                │
│         └──────────┘       │ Sensitivity  │    │                │
│                            └─────────────┘    │                │
└────────────────────────────────────────────────┼────────────────┘
                                                 │
                    ┌────────────────────────────┼────────┐
                    │                            │        │
               ┌────▼─────┐  ┌──────────┐  ┌───▼────┐   │
               │PostgreSQL │  │  Redis    │  │  S3/R2 │   │
               │ (Neon)    │  │ (Upstash) │  │ (PDF)  │   │
               └──────────┘  └──────────┘  └────────┘   │
                    │                                     │
                    └─────────────────────────────────────┘
```

---

## 2. 프론트엔드 ↔ 백엔드 책임 경계

| 관심사 | Frontend (Next.js) | Backend (Spring Boot) |
|--------|-------------------|----------------------|
| **인증** | Auth.js로 세션 관리, OAuth 플로우 | JWT 검증만 수행 (발급 안 함) |
| **결제** | Stripe Checkout UI, 가격 페이지 | — (관여하지 않음) |
| **구독/사용량** | Stripe 웹훅 수신 → DB 업데이트, 티어 게이트 | 요청 시 티어 정보를 헤더로 수신 |
| **분석 요청** | 입력 폼 → BFF가 검증 후 백엔드 호출 | 분석 생성 + 파이프라인 실행 |
| **분석 결과** | 폴링으로 상태 확인 → 리포트 렌더링 | 결과 저장 + JSON 반환 |
| **B2B API** | — | API Key 인증 + 레이트 리미팅 + 분석 실행 |
| **리포트 시각화** | Recharts 차트 렌더링 | — |
| **PDF 생성** | React-PDF로 서버 사이드 생성 | — (또는 백엔드로 이전 가능) |
| **i18n** | next-intl로 다국어 UI | AI 출력 언어만 제어 (프롬프트) |

**핵심 원칙**: Frontend는 "사용자 경험과 비즈니스 게이트"를, Backend는 "분석 연산과 데이터"를 소유한다.

---

## 3. 통신 흐름

### 3-1. 분석 생성 (웹 사용자)

```
브라우저                Next.js BFF              Spring Boot             외부 AI
  │                       │                        │                      │
  │── POST /analysis ────▶│                        │                      │
  │                       │── 세션 검증              │                      │
  │                       │── 사용량 확인 (DB)       │                      │
  │                       │── POST /api/analyses ──▶│                      │
  │                       │                        │── 분석 레코드 생성     │
  │◀── 202 { id, status } │◀── 202 ────────────────│                      │
  │                       │                        │                      │
  │                       │                   [비동기 Job 시작]             │
  │                       │                        │── 리스크 추출 요청 ──▶│
  │                       │                        │◀── RiskFactor[] ─────│
  │                       │                        │── Monte Carlo 실행    │
  │                       │                        │── Scoring Matrix      │
  │                       │                        │── Sensitivity 분석    │
  │                       │                        │── 추천사항 생성 ──────▶│
  │                       │                        │◀── Recommendation[] ─│
  │                       │                        │── status=COMPLETED    │
  │                       │                        │                      │
  │── GET /analysis/{id} ─▶│── GET /api/analyses/{id}▶│                   │
  │◀── { report data } ───│◀── { full result } ────│                      │
```

### 3-2. 분석 생성 (B2B API)

```
외부 클라이언트                       Spring Boot
  │                                     │
  │── POST /api/v1/analyses ───────────▶│
  │   Header: Authorization: Bearer {key} │
  │                                     │── API Key 검증 (Hash 비교)
  │                                     │── Redis 레이트 리밋 확인
  │                                     │── 분석 파이프라인 실행 (동기/비동기)
  │◀── 202 { id } ─────────────────────│
  │                                     │
  │── GET /api/v1/analyses/{id} ───────▶│
  │◀── { data, meta } ────────────────│
```

---

## 4. MVP 범위 정의

### 포함 (MVP)

| 영역 | 기능 |
|------|------|
| 분석 | 자연어 입력 → AI 리스크 추출 → MC 시뮬레이션 → 스코어링 → 리포트 |
| 카테고리 | Career, Investment, Business, Personal, Other (5종) |
| 인증 | Google OAuth + 이메일/비밀번호 |
| 구독 | Free (5회/월) + Pro ($5.50, 무제한) |
| UI | 랜딩, 분석 위자드, 리포트 뷰어, 대시보드, 가격 페이지 |
| 차트 | 리스크 매트릭스, MC 분포, 토네이도 차트 |
| i18n | 영어 (기본) |
| 배포 | Vercel (FE) + Railway (BE) + Neon (DB) |

### 제외 (Post-MVP)

| 영역 | 기능 | 우선순위 |
|------|------|---------|
| B2B API | 외부 REST API + API Key 관리 | Phase 2 |
| 팀 협업 | 팀 워크스페이스, 공유, 코멘트 | Phase 2 |
| 템플릿 | 카테고리별 사전 정의 시나리오 | Phase 2 |
| 비교 모드 | 2개 시나리오 나란히 비교 | Phase 2 |
| PDF 내보내기 | 리포트 PDF 다운로드 | Phase 2 |
| 한국어 | i18n 한국어 지원 | Phase 2 |
| Enterprise | 화이트라벨, SSO, 커스텀 모델 | Phase 3 |
| 알림 | 이메일 알림, 분석 완료 통지 | Phase 3 |

---

## 5. 확장 로드맵

```
Phase 1 — MVP (4주)
├── 핵심 분석 파이프라인
├── 웹 UI (분석 위자드 + 리포트)
├── 인증 (Google OAuth)
├── Freemium 구독 (Free + Pro)
└── Vercel + Railway + Neon 배포

       │
       ▼

Phase 2 — Growth (MVP + 4~8주)
├── B2B REST API + API Key 관리
├── API 티어 ($49.99/월)
├── 팀 워크스페이스 + 멤버 관리
├── 분석 템플릿 라이브러리
├── 2개 시나리오 비교 모드
├── PDF/CSV 내보내기
├── GitHub OAuth 추가
├── 한국어 i18n
└── 분석 히스토리 검색/필터

       │
       ▼

Phase 3 — Enterprise (Growth + 8~16주)
├── Enterprise 티어 (커스텀 가격)
├── SSO (SAML/OIDC)
├── 화이트라벨 (커스텀 도메인 + 브랜딩)
├── 커스텀 리스크 모델 업로드
├── Webhook 알림 (분석 완료 시 콜백)
├── 감사 로그 (Audit Trail)
├── 전용 AI 모델 파인튜닝
├── 멀티 리전 배포
└── SLA 보장 + 전담 지원
```

---

## 6. 기술 스택 요약

| 레이어 | 기술 | 역할 |
|--------|------|------|
| Frontend | Next.js 14, TypeScript, Tailwind, shadcn/ui | UI, BFF, 인증, 결제 |
| Backend | Spring Boot 3.x, Java 21, Gradle | 분석 엔진, B2B API |
| Database | PostgreSQL (Neon) | 사용자, 분석, 구독, API Key |
| Cache | Redis (Upstash) | 레이트 리미팅, 세션 캐시 |
| AI | OpenAI API, Anthropic API | 리스크 추출, 추천사항 |
| 결제 | Stripe | 구독 빌링 |
| 인증 | Auth.js v5 (NextAuth) | OAuth, 세션 관리 |
| 차트 | Recharts | 리스크 시각화 |
| 배포 | Vercel (FE), Railway (BE) | 호스팅 |
| 스토리지 | Cloudflare R2 | PDF 보고서 |
| 모니터링 | Sentry | 에러 트래킹 |

---

## 7. 환경 변수 맵

```
Frontend (.env.local)                    Backend (application.yml)
─────────────────────                    ────────────────────────
NEXTAUTH_SECRET                          spring.datasource.url
NEXTAUTH_URL                             spring.datasource.username/password
GOOGLE_CLIENT_ID/SECRET                  openai.api-key
STRIPE_SECRET_KEY                        anthropic.api-key
STRIPE_WEBHOOK_SECRET                    ai.provider (openai|anthropic)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY       redis.url
NEXT_PUBLIC_APP_URL                      redis.token
NEXT_PUBLIC_API_BASE_URL (→ Spring Boot) api.rate-limit.per-minute
DATABASE_URL (Neon, 구독/사용량용)          api.rate-limit.per-day
```
