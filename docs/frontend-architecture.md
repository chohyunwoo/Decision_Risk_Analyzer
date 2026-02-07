# Frontend Architecture — Next.js (Vercel)

## 1. 프론트엔드의 책임

| 책임 | 설명 |
|------|------|
| **사용자 인터페이스** | 랜딩, 분석 위자드, 리포트 뷰어, 대시보드 |
| **인증 관리** | Auth.js로 OAuth/Credentials 세션 처리 |
| **결제 게이트** | Stripe Checkout, 웹훅 수신, 구독 상태 관리 |
| **사용량 게이트** | 티어별 분석 횟수 제한 + 기능 잠금 |
| **BFF (Backend For Frontend)** | 프론트엔드 전용 API Routes → Spring Boot 프록시 |
| **리포트 시각화** | Recharts 기반 차트 렌더링 |
| **다국어** | next-intl 기반 i18n (MVP: 영어) |

**소유하지 않는 것**: 분석 연산, AI 호출, 리스크 엔진, B2B API.
이들은 모두 Spring Boot 백엔드가 담당한다.

---

## 2. App Router 구조

```
src/app/
├── layout.tsx                    # 루트 레이아웃 (html, Providers 래핑)
├── not-found.tsx                 # 404
├── global-error.tsx              # 전역 에러 바운더리
│
├── [locale]/                     # ── i18n 동적 세그먼트 ──
│   ├── layout.tsx                # NextIntlClientProvider
│   ├── page.tsx                  # 랜딩 페이지 (/)
│   │
│   ├── (marketing)/              # ── 퍼블릭 마케팅 ──
│   │   ├── pricing/page.tsx      # 가격 비교 + Stripe Checkout
│   │   ├── about/page.tsx        # 서비스 소개
│   │   └── demo/page.tsx         # 비로그인 데모 (사전 로딩된 예시)
│   │
│   ├── (auth)/                   # ── 인증 페이지 ──
│   │   ├── layout.tsx            # 중앙 카드 레이아웃
│   │   ├── login/page.tsx        # 로그인 (OAuth + 이메일)
│   │   └── register/page.tsx     # 회원가입
│   │
│   └── (dashboard)/              # ── 인증 필요 영역 ──
│       ├── layout.tsx            # 사이드바 + 헤더 쉘
│       ├── dashboard/page.tsx    # 홈 (통계, 최근 분석)
│       ├── analysis/
│       │   ├── new/page.tsx      # 분석 위자드 (4단계 폼)
│       │   └── [id]/page.tsx     # 리포트 뷰어
│       ├── history/page.tsx      # 분석 히스토리 목록
│       ├── settings/page.tsx     # 계정 + 구독 관리
│       └── api-keys/page.tsx     # API Key 관리 (Phase 2)
│
└── api/                          # ── API Routes (BFF) ──
    ├── auth/[...nextauth]/route.ts    # Auth.js 핸들러
    ├── webhooks/stripe/route.ts       # Stripe 웹훅 수신
    └── internal/                      # 프론트엔드 전용 내부 API
        ├── analysis/route.ts          # POST: 생성, GET: 목록
        ├── analysis/[id]/route.ts     # GET: 단일 분석 (폴링)
        ├── analysis/[id]/export/route.ts  # GET: PDF/CSV
        └── usage/route.ts            # GET: 사용량 통계
```

### Route Group 설계 의도

| 그룹 | URL 영향 | 목적 |
|------|---------|------|
| `(marketing)` | 없음 | 퍼블릭 페이지끼리 레이아웃 공유 (footer 포함) |
| `(auth)` | 없음 | 인증 페이지 전용 중앙 정렬 레이아웃 |
| `(dashboard)` | 없음 | 사이드바+헤더 레이아웃, 미들웨어에서 세션 필수 |

`[locale]` 세그먼트는 URL에 반영된다. 기본 로케일(en)은 prefix 생략.
- `/pricing` → 영어
- `/ko/pricing` → 한국어

---

## 3. 주요 페이지별 역할

### 3-1. 랜딩 페이지 (`/`)

| 섹션 | 역할 | 렌더링 |
|------|------|--------|
| Hero | 가치 제안 + CTA ("무료로 시작") | Server Component |
| Features | 3가지 핵심 기능 카드 (AI추출, MC시뮬, 리포트) | Server Component |
| Demo Preview | 사전 로딩된 예시 리포트 미리보기 | Client Component |
| Pricing | 가격 비교 테이블 (임베딩) | Server Component |
| Social Proof | 사용 사례 / 후기 | Server Component |

**의도**: 첫 방문에서 "무엇을 해주는 서비스인지" 5초 내 파악하게 하고,
데모 또는 회원가입으로 전환시키는 것이 목표.

### 3-2. 분석 위자드 (`/analysis/new`)

4단계 스텝 폼. 클라이언트 컴포넌트.

```
Step 1: 카테고리 선택
┌──────────┐ ┌──────────┐ ┌──────────┐
│  Career  │ │Investment│ │ Business │  ...
└──────────┘ └──────────┘ └──────────┘

Step 2: 의사결정 설명
┌──────────────────────────────────────────┐
│ "저는 현재 대기업에서 5년차 개발자로 일하고     │
│  있는데, 스타트업 CTO 제안을 받았습니다..."     │
│                                          │
│                              2,340 / 10,000 │
└──────────────────────────────────────────┘

Step 3: 추가 컨텍스트 (선택)
 - 예산/자금 규모
 - 타임라인
 - 리스크 허용도 (보수적/중립/적극적)

Step 4: 검토 & 제출
 요약 카드 → [분석 시작] 버튼
```

**제출 후 흐름**:
1. `POST /api/internal/analysis` → BFF가 세션·사용량 확인 후 Spring Boot 호출
2. 202 응답 수신 → `/analysis/{id}` 로 리다이렉트
3. 리포트 뷰어에서 2초 간격 폴링 (상태 변화 시각화)

```
PENDING → EXTRACTING → SIMULATING → GENERATING → COMPLETED
  ●──────────●──────────────●────────────●────────────●
  "준비 중"   "AI 분석 중"    "시뮬레이션"   "리포트 생성"   "완료!"
```

### 3-3. 리포트 뷰어 (`/analysis/[id]`)

분석 완료 후 표시되는 결과 페이지. Server Component로 초기 데이터 로드,
차트 영역은 Client Component.

| 섹션 | 컴포넌트 | 데이터 소스 |
|------|---------|-----------|
| 종합 점수 | `<ReportSummary>` | `compositeRiskScore`, `riskLevel` |
| 리스크 요인 테이블 | `<RiskFactorTable>` | `riskFactors[]` |
| 5×5 리스크 매트릭스 | `<RiskMatrixChart>` | `scoringMatrixResult` |
| MC 확률 분포 | `<MonteCarloChart>` | `monteCarloResults.histogram` |
| 민감도 토네이도 | `<SensitivityChart>` | `sensitivityResults.factors` |
| AI 추천사항 | `<Recommendations>` | `recommendations[]` |
| 내보내기 버튼 | `<ExportButtons>` | — (Pro 티어 이상) |

### 3-4. 대시보드 (`/dashboard`)

| 영역 | 내용 |
|------|------|
| 통계 카드 | 이번 달 분석 횟수, 평균 리스크 점수, 남은 무료 횟수 |
| 최근 분석 | 최근 5건 리스트 (제목, 카테고리, 점수, 날짜) |
| Quick Action | "새 분석 시작" 버튼 |

---

## 4. BFF (Backend For Frontend) API Routes

Next.js API Routes는 **프록시 + 게이트키퍼** 역할만 수행한다.
비즈니스 로직은 담지 않는다.

### 역할 흐름

```
브라우저 → Next.js API Route → Spring Boot
              │
              ├── 1. 세션 검증 (Auth.js)
              ├── 2. 구독 티어 확인
              ├── 3. 사용량 한도 확인
              ├── 4. 요청 변환 (필요시)
              ├── 5. Spring Boot API 호출
              └── 6. 응답 반환
```

### 라우트별 책임

| Route | 게이트 역할 | Backend 호출 |
|-------|-----------|-------------|
| `POST /internal/analysis` | 세션 필수 + Free 티어 5회/월 확인 | `POST /api/analyses` |
| `GET /internal/analysis` | 세션 필수 | `GET /api/analyses?userId=` |
| `GET /internal/analysis/[id]` | 세션 필수 + 본인 소유 확인 | `GET /api/analyses/{id}` |
| `GET /internal/analysis/[id]/export` | 세션 필수 + Pro 티어 이상 | PDF/CSV 생성 or 프록시 |
| `GET /internal/usage` | 세션 필수 | DB 직접 조회 (User 테이블) |

---

## 5. 인증 흐름 (Auth.js v5)

### 프로바이더

| 프로바이더 | MVP | 용도 |
|-----------|-----|------|
| Google OAuth | O | 주요 소셜 로그인 |
| Credentials | O | 이메일/비밀번호 (글로벌 사용자용) |
| GitHub OAuth | Phase 2 | 개발자 대상 |

### 세션 전략

- **JWT 기반** (Prisma Adapter와 함께 사용)
- 토큰에 `userId`, `tier` 포함 → API Route에서 DB 조회 없이 티어 확인 가능
- Spring Boot 호출 시 `X-User-Id`, `X-User-Tier` 헤더로 전달

### 미들웨어 (`src/middleware.ts`)

```
요청 진입
  │
  ├── /api/v1/* → pass (B2B API는 Spring Boot가 직접 처리)
  │
  ├── /api/internal/* → 세션 없으면 401
  │
  ├── /(dashboard)/* → 세션 없으면 /login 리다이렉트
  │
  └── 그 외 → next-intl 로케일 라우팅 처리
```

---

## 6. 결제 흐름 (Stripe)

### 구독 생성

```
가격 페이지                    Stripe                      Next.js Webhook
    │                           │                              │
    │── Checkout Session 생성 ──▶│                              │
    │◀── Checkout URL ──────────│                              │
    │                           │                              │
    │── 사용자 결제 완료 ──────▶│                              │
    │                           │── checkout.session.completed ▶│
    │                           │                              │── User.tier 업데이트
    │                           │                              │── User.stripeCustomerId 저장
    │                           │                              │── StripeEvent 기록 (멱등성)
    │◀── /dashboard 리다이렉트 ──│                              │
```

### 구독 상태 변경

| Stripe 이벤트 | 프론트엔드 처리 |
|--------------|---------------|
| `checkout.session.completed` | tier를 PRO/API로 변경, Stripe ID 저장 |
| `customer.subscription.updated` | 플랜 변경 반영 (업/다운그레이드) |
| `customer.subscription.deleted` | tier를 FREE로 다운그레이드 |
| `invoice.payment_failed` | 사용자에게 경고 표시 (Grace Period) |

### 멱등성 보장

모든 웹훅 이벤트는 `StripeEvent` 테이블에 `stripeEventId`를 기록한다.
중복 이벤트 수신 시 스킵한다.

### 프론트엔드 DB 소유 테이블

Stripe 연동을 위해 프론트엔드(Next.js)도 **독자적으로 Neon DB에 접근**한다.
단, 소유 범위는 다음으로 한정:

| 테이블 | 프론트엔드 소유 필드 |
|--------|-------------------|
| `User` | `tier`, `stripeCustomerId`, `stripeSubscriptionId`, `analysisCountThisMonth` |
| `StripeEvent` | 전체 (웹훅 멱등성 전용) |
| `Account`, `Session` | 전체 (Auth.js 전용) |

분석 데이터(`Analysis`, `UsageRecord` 등)는 **Spring Boot가 소유**하며,
프론트엔드는 API를 통해서만 접근한다.

---

## 7. UX 핵심 흐름

### 신규 사용자 여정

```
1. 랜딩 페이지 방문
   │
2. 데모 리포트 미리보기 (비로그인)
   │
3. "무료로 시작" 클릭 → 회원가입
   │
4. 대시보드 → "새 분석" 클릭
   │
5. 분석 위자드 4단계 입력
   │
6. 로딩 화면 (파이프라인 상태 표시)
   │
7. 리포트 뷰어 (종합 점수 + 차트 + 추천)
   │
   ├── 만족 → 추가 분석 or 공유
   └── Pro 기능 필요 → 가격 페이지 → 구독
```

### 무료 → Pro 전환 트리거

| 트리거 시점 | 표시 내용 |
|-----------|----------|
| 5회 분석 소진 후 새 분석 시도 | "이번 달 무료 분석을 모두 사용했습니다. Pro로 업그레이드하세요." |
| 리포트에서 PDF 내보내기 클릭 | "PDF 내보내기는 Pro 기능입니다." (잠금 아이콘) |
| 리포트 상세 섹션 | 기본 리포트 = 요약만 / Pro = 전체 차트 |

---

## 8. 컴포넌트 구조

```
src/components/
├── ui/                    # shadcn/ui 프리미티브 (Button, Card, Input, Dialog...)
│
├── layout/
│   ├── header.tsx         # 상단 네비게이션 (로고, 메뉴, 프로필)
│   ├── sidebar.tsx        # 대시보드 사이드바 (네비게이션 링크)
│   ├── footer.tsx         # 마케팅 페이지 푸터
│   └── mobile-nav.tsx     # 모바일 햄버거 메뉴
│
├── analysis/
│   ├── analysis-wizard.tsx     # 4단계 스텝 폼 (메인 오케스트레이터)
│   ├── decision-input.tsx      # 자연어 텍스트 입력 (캐릭터 카운터 포함)
│   ├── context-selector.tsx    # 카테고리별 추가 컨텍스트 폼
│   ├── risk-factor-card.tsx    # 개별 리스크 요인 카드
│   ├── risk-matrix-chart.tsx   # 5×5 히트맵 (Recharts ScatterChart)
│   ├── monte-carlo-chart.tsx   # 확률 분포 히스토그램 (Recharts BarChart)
│   ├── sensitivity-chart.tsx   # 토네이도 차트 (Recharts BarChart 수평)
│   ├── report-summary.tsx      # 종합 점수 게이지 + 리스크 레벨 뱃지
│   ├── recommendations.tsx     # 추천사항 우선순위 리스트
│   └── analysis-loading.tsx    # 파이프라인 진행 상태 표시
│
├── dashboard/
│   ├── stats-cards.tsx         # 통계 카드 (분석 횟수, 평균 점수)
│   └── recent-analyses.tsx     # 최근 분석 리스트
│
├── pricing/
│   ├── pricing-table.tsx       # 티어 비교 테이블
│   └── checkout-button.tsx     # Stripe Checkout 트리거
│
├── landing/
│   ├── hero-section.tsx
│   ├── features-section.tsx
│   └── cta-section.tsx
│
└── shared/
    ├── logo.tsx
    ├── theme-toggle.tsx        # 다크모드 전환
    ├── locale-switcher.tsx     # 언어 전환 (Phase 2)
    └── upgrade-prompt.tsx      # Pro 업그레이드 유도 모달/배너
```

---

## 9. 상태 관리 전략

| 데이터 종류 | 방식 | 이유 |
|-----------|------|------|
| 페이지 데이터 (분석 목록, 리포트) | Server Component 직접 fetch | SSR, 캐싱 최적화 |
| 분석 상태 폴링 | React Query (`useQuery` + refetchInterval) | 2초 간격 자동 갱신 |
| 위자드 폼 상태 | `useState` (로컬) | 단일 페이지 내 4단계, 전역 불필요 |
| 테마/로케일 | React Context (next-themes, next-intl) | 앱 전역 설정 |
| 세션/인증 | Auth.js `useSession()` | 프레임워크 제공 |

**전역 상태 라이브러리 (Redux 등) 사용하지 않음.**
MVP에서는 Server Component + React Query로 충분하다.

---

## 10. 프론트엔드 기술 스택

| 기술 | 버전 | 역할 |
|------|------|------|
| Next.js | 14.2+ | App Router, API Routes, 미들웨어 |
| React | 18.3+ | UI 라이브러리 |
| TypeScript | 5.4+ | 타입 안전성 |
| Tailwind CSS | 3.4+ | 스타일링 |
| shadcn/ui | latest | UI 컴포넌트 (copy-paste, 의존성 없음) |
| Auth.js | 5.x | 인증 |
| Stripe.js | latest | 결제 UI |
| Recharts | 2.x | 차트 (리스크 매트릭스, MC, 토네이도) |
| next-intl | 3.x | i18n |
| next-themes | latest | 다크모드 |
| React Query | 5.x | 클라이언트 데이터 페칭/폴링 |
| Zod | 3.x | 폼 검증 + API 요청/응답 검증 |
| Prisma Client | 5.x | 인증/구독 DB 접근 (제한적) |
