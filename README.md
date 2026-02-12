# Decision Risk Analyzer (MVP v1)

## Why This Project Exists
음식 선택은 사소해 보이지만,
막상 선택 후에는 “괜히 시켰나?”라는 후회가 자주 발생합니다.

이 프로젝트는
**복잡한 추천이나 AI 판단 없이도,
단순한 리스크 점수만으로 의사결정을 돕는 것이 가능한지**
검증하기 위해 시작된 MVP입니다.

---

## Service Purpose
음식(배달/외식) 의사결정 상황에 대해
**결정적인(deterministic) 리스크 점수**를 제공하고,
점수의 의미를 쉽게 이해할 수 있도록 돕는 MVP입니다.

---

## User Flow
1. 음식점/배달 링크, 시간대, 가격대 입력
2. Analyze 실행
3. 리스크 점수와 구간 설명 확인
4. 무료 체험 3회 소진 시 사용 제한 및 유료 전환 안내 확인

---

## MVP Included Features
- 단일 도메인: 음식(배달/외식) 의사결정만 지원
- 고정 가중치 기반 Risk Scoring (결정적 계산)
- 점수 구간별 간단 설명 문구
- 무료 체험 3회 제한 (프론트엔드 localStorage)
- 최소 입력 UI 및 결과 표시

---

## Intentionally Excluded Features
이 MVP는 **의도적으로 단순함을 유지**합니다.

- 다른 도메인(커리어/투자/비즈니스 등)
- 확률/시뮬레이션/통계(몬테카를로, 민감도 등)
- AI가 점수를 계산하거나 판단을 주도하는 기능
- 고급 인증/다중 플랜/구독 중심 과금
- 실제 결제 연동 (유료 플랜은 안내만 표시)

---

## What This MVP Validates
이 MVP는 다음 질문에 답하기 위해 만들어졌습니다.

- 사용자가 **단순 리스크 점수**만으로도 음식 선택에 도움을 받는가?
- 최소 입력만으로도 서비스 흐름이 직관적으로 이해되는가?
- 무료 체험 제한 이후 **유료 전환 의도**가 자연스럽게 인지되는가?

---

## AI 활용 계획 (추가 예정)
- **결과 설명 자동 생성**: 리스크 점수와 입력값(메뉴, 가격, 시간)에 근거해 1~2문장 요약을 생성.
- **입력 정규화**: 메뉴 입력의 오타/유사어를 표준화해 분류 정확도를 개선.
- **대안 제안**: 리스크가 높을 때 유사하지만 낮은 리스크의 메뉴/옵션을 제안.
- **추가 질문 유도**: 입력이 모호할 때 필요한 질문만 추가로 요청해 정확도 향상.
- **개인화 학습**: 사용자의 반복 선택 패턴을 기반으로 가중치/설명 톤을 개인화.

---

## 추가 예정 (확장 기능)
- **로그인/동기화**: 여러 기기에서 기록을 안전하게 동기화.
- **AI 설명 생성**: 리스크 결과를 자연어로 요약하고 개선 포인트를 제안.
- **장기 통계/리포트**: 월/분기 단위 리포트와 패턴 분석 제공.
- **협업/공유**: 가족/팀 단위 기록 공유 및 요약 제공.

---

## Frontend (Next.js + Supabase)

### 주요 기능
- Supabase 인증: 로그인/회원가입
- i18n: 한국어/영어/일본어 (기본 한국어)
- 프로필 페이지: 이메일/이름/닉네임 관리
- 관리자 콘솔: 사용자 목록 조회 및 역할(user/admin) 변경

### SEO 설정
1) 환경 변수 (`frontend/.env.local`)
```bash
NEXT_PUBLIC_SITE_URL=https://riskly.store
NEXT_PUBLIC_OG_IMAGE=https://your-domain.com/og.png
```

2) 대표 도메인
- canonical/사이트맵 기준 도메인은 `https://riskly.store`로 고정
- `decision-risk-analyzer.pages.dev`는 별도 도메인으로 운영하되, 가능하면 플랫폼 리다이렉트로 대표 도메인으로 통합 권장

2) 검색엔진 등록
- Google Search Console에 사이트 등록 후 `sitemap.xml` 제출

3) 자동 생성 경로
- `https://your-domain.com/robots.txt`
- `https://your-domain.com/sitemap.xml`
 - 기본 OG 이미지: `https://your-domain.com/og.png` (SVG는 `/og.svg`)

### Supabase 설정
1) SQL 실행 (RLS + profiles + 트리거)
```sql
-- see docs/supabase-roles.sql
```

2) 환경 변수 (`frontend/.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3) 관리자 지정
- Supabase 대시보드에서 `profiles.role = 'admin'`으로 변경

### Google 로그인 (Supabase Auth)
1) Google Cloud에서 OAuth 클라이언트 생성 (Web)
2) 승인된 자바스크립트 원본에 사이트 도메인 추가
3) 승인된 리디렉션 URI에 Supabase 콜백 URL 추가  
   예: `https://<project-ref>.supabase.co/auth/v1/callback`
4) Supabase 대시보드 → Authentication → Providers → Google
   - Client ID / Client Secret 입력 후 활성화
5) Supabase URL Configuration에서 Site URL 및 Redirect URLs 설정

---

## Cloudflare Pages 배포

### Build 설정
- Build Command: `cd frontend && npm install && npm run pages:build`
- Build Output Directory: `frontend/.vercel/output/static`

### Compatibility Flags
- Functions → `nodejs_compat` 추가 (Node.js 호환 경고 해결)

---

## Polar 결제 (Checkout + Webhook + 자동 환불)

### 1) 환경 변수
`frontend/.env.local` 또는 Cloudflare Pages 환경 변수에 추가:
```bash
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_SERVER=sandbox
POLAR_SUCCESS_URL=https://your-domain.com/?checkout=success
POLAR_RETURN_URL=https://your-domain.com/?checkout=cancel
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
```

### 2) 웹훅 설정 (Polar)
- URL: `https://<your-domain>/api/polar/webhook`
- 이벤트: `order.paid`
- Webhook Secret → `POLAR_WEBHOOK_SECRET`

### 3) 권한 스코프
- 필수: `checkouts:write`
- 자동 환불: `refunds:write`

### 4) 동작 방식
- `/api/polar/checkout`로 체크아웃 생성
- 결제 완료(`order.paid`) 시 프로필에 `plan=pro` 부여
- 프로필 업데이트 실패 시 환불 자동 실행

---

## Backend Run (Spring Boot + PostgreSQL)

### 1) PostgreSQL 준비
로컬에 PostgreSQL이 없다면 Docker로 실행하세요.

```bash
docker run --name dra-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=dra -p 5432:5432 -d postgres:15-alpine
```

### 2) 환경 변수
```bash
export DB_URL=jdbc:postgresql://localhost:5432/dra
export DB_USER=postgres
export DB_PASSWORD=postgres
export JWT_SECRET=dev-secret-please-change-32-bytes-minimum
```

### 3) 실행
```bash
./gradlew bootRun
```

---

## JWT 토큰
- `Authorization: Bearer <token>`
- HS256, subject = user UUID
- JWT_SECRET와 일치해야 함

---

## Curl Examples

### POST /api/risk/analyze
```bash
curl -X POST http://localhost:8080/api/risk/analyze \
  -H "Authorization: Bearer <JWT>" \
  -H "Idempotency-Key: 123e4567-e89b-12d3-a456-426614174000" \
  -H "Content-Type: application/json" \
  -d '{
    "region": "KR",
    "priceTotal": 28000,
    "people": 2,
    "timeMinutes": 35,
    "menu": "김치찌개",
    "link": "https://example.com/store/123"
  }'
```

### GET /api/risk/records
```bash
curl -X GET "http://localhost:8080/api/risk/records?page=1&size=20" \
  -H "Authorization: Bearer <JWT>"
```

### GET /api/users/me
```bash
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer <JWT>"
```
