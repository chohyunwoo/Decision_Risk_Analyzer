# Decision Risk Analyzer

일상적인 소비 선택(식사, 배달 등)에 대해 가격, 시간, 인원 기준으로 "이 선택이 얼마나 비효율적인지"를 빠르게 판단해 주는 서비스입니다.

현재 실제 서비스 흐름은 `Next.js 프론트엔드 + Supabase(Auth/DB) + Polar 결제 + OpenAI 보조 설명` 조합으로 운영되며, Spring Boot 백엔드는 별도 API/실험용 백엔드로 함께 관리되고 있습니다.

## 현재 실제 사용 중인 기능

### 핵심 분석
- 가격, 시간, 인원, 지역(`KR`, `US`, `JP`)을 입력받아 리스크 점수를 계산
- 메인 화면에서 즉시 점수 계산 및 리스크 레벨(`low`, `medium`, `high`) 표시
- 지역별 기준 금액을 반영해 국가별 체감 가격 차이 대응

### 인증 및 계정
- Supabase Auth 기반 회원가입/로그인
- 이메일 기반 인증 플로우
- 프로필 페이지에서 기본 정보 조회
- 계정 삭제 API 제공

### 구독 및 권한 제어
- 무료 플랜 / Pro 플랜 구분
- Pro 전용 기능:
  - AI 설명 생성
  - 7일 요약 AI 코멘트
  - 기록 목록
  - 월간 캘린더 뷰
- Polar Checkout 연동
- Polar 웹훅 수신 후 `profiles.plan` 업데이트
- 권한 반영 실패 시 환불 요청 처리
- 결제 복구용 `restore` API 및 고객 포털 연결

### AI 기능
- 분석 결과에 대한 짧은 설명 생성
- 최근 7일 기록 기준 주간 요약 생성
- AI는 점수 계산을 바꾸지 않고, 설명 텍스트 생성에만 사용

### 커뮤니티 및 운영 기능
- 커뮤니티 글 좋아요
- 사용자별 중복 좋아요 방지
- 게시글 신고 접수 API
- 관리자 전용 사용자 목록 조회
- 관리자 전용 사용자 권한(`user` / `admin`) 변경

### 국제화 및 운영
- 다국어 지원: `ko`, `en`, `ja`
- 레거시 도메인(`decision-risk-analyzer.pages.dev`) 접근 시 `riskly.store`로 리다이렉트
- `robots.ts`, `sitemap.ts` 기반 SEO 메타 파일 생성

## 실제 아키텍처

### 프론트엔드 (주 서비스)
- 경로: `frontend/`
- 스택: Next.js 15, React 19, TypeScript, next-intl, Tailwind CSS 4
- 역할:
  - 메인 UI 렌더링
  - 클라이언트 측 리스크 점수 계산
  - Supabase 인증 상태 연동
  - Polar 결제/포털/복구 API 호출
  - OpenAI 설명 API 호출

### 데이터 및 인증
- Supabase
- 역할:
  - 사용자 인증
  - 프로필(`profiles`) 관리
  - 커뮤니티 좋아요 / 신고 데이터 저장

### 결제
- Polar
- 역할:
  - Checkout 생성
  - 웹훅 기반 구독 상태 반영
  - 필요 시 환불 처리

### 보조 백엔드
- 경로: `src/`
- 스택: Spring Boot 3.3, Java 21, PostgreSQL, Spring Security, JPA
- 역할:
  - 결정형 리스크 분석 API
  - 사용량 제한 / idempotency 처리
  - 결제 상태 저장용 API
- 비고:
  - 저장소에 포함되어 있으나, 현재 메인 사용자 흐름은 `frontend/` 중심으로 동작

## 주요 디렉터리

- `frontend/`: 실제 서비스 UI 및 Edge API
- `src/`: Spring Boot 백엔드
- `docs/`: SQL 및 운영 문서
- `functions/`: 별도 서버리스 함수 예제 코드

## 프론트엔드 실행

### 1) 환경 변수

`frontend/.env.local` 파일에 아래 값을 설정합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_OG_IMAGE=http://localhost:3000/og.png
NEXT_PUBLIC_APP_LOGIN_DEEPLINK=

OPENAI_API_KEY=your_openai_api_key

POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_SERVER=sandbox
POLAR_SUCCESS_URL=http://localhost:3000/checkout/success
POLAR_RETURN_URL=http://localhost:3000/checkout/cancel
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY`를 대신 사용해도 되지만, 현재 코드는 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`를 우선 사용합니다.

### 2) 실행

```bash
cd frontend
npm install
npm run dev
```

개발 서버: `http://localhost:3000`

## 프론트엔드 배포

Cloudflare Pages 기준:

- Build Command: `cd frontend && npm install && npm run pages:build`
- Build Output Directory: `frontend/.vercel/output/static`
- Compatibility Flag: `nodejs_compat`

## Supabase 준비

필수로 아래 SQL 문서를 적용해야 합니다.

- 권한/역할 관련: `docs/supabase-roles.sql`
- 커뮤니티 게시글/좋아요 관련: `docs/supabase-posts.sql`
- 신고 테이블 관련: `frontend/docs/community-reports-schema.sql`

실제 코드에서 사용하는 주요 테이블/필드:

- `profiles`
  - `id`
  - `email`
  - `name`
  - `nickname`
  - `role`
  - `plan`
  - `polar_customer_id`
  - `polar_order_id`
- `posts`
- `post_likes`
- `community_reports`

## 주요 API (현재 프론트엔드)

### 인증/계정
- `POST /api/account/delete`

### AI
- `POST /api/ai/explain`
- `POST /api/ai/weekly`

### 결제
- `GET /api/polar/checkout`
- `POST /api/polar/webhook`
- `POST /api/polar/restore`
- `GET /api/polar/portal`

### 커뮤니티
- `POST /api/community/like`
- `GET /api/community/like?postId=<uuid>`
- `POST /api/community/report`

### 관리자
- `GET /api/admin/users`
- `POST /api/admin/users`

## Spring Boot 백엔드 실행 (선택)

현재 메인 서비스는 프론트엔드 중심이지만, 백엔드 API를 별도로 실행하려면 다음과 같이 설정합니다.

### 1) PostgreSQL 준비

```bash
docker run --name dra-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=dra -p 5432:5432 -d postgres:15-alpine
```

### 2) 환경 변수

```bash
export DB_URL=jdbc:postgresql://localhost:5432/dra
export DB_USER=postgres
export DB_PASSWORD=postgres
export JWT_SECRET=dev-secret-please-change-32-bytes-minimum
export OPENAI_API_KEY=your_openai_api_key
export OPENAI_MODEL=gpt-5.2
export OPENAI_TIMEOUT_SECONDS=8
```

Windows PowerShell:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/dra"
$env:DB_USER="postgres"
$env:DB_PASSWORD="postgres"
$env:JWT_SECRET="dev-secret-please-change-32-bytes-minimum"
$env:OPENAI_API_KEY="your_openai_api_key"
$env:OPENAI_MODEL="gpt-5.2"
$env:OPENAI_TIMEOUT_SECONDS="8"
```

### 3) 실행

```bash
./gradlew bootRun
```

기본 포트: `http://localhost:8080`

## 백엔드 테스트

통합 테스트는 Testcontainers + PostgreSQL 기반으로 작성되어 있습니다.

```bash
./gradlew test
```

검증 내용 예시:

- 동일 입력에 대한 결정형 점수 유지
- 같은 idempotency key 재요청 시 중복 차감 방지
- 동시 요청 시 무료 횟수 과차감 방지
- Pro 권한 사용자는 제한 없이 분석 가능

## 참고

- 메인 화면의 현재 리스크 계산은 프론트엔드에서 수행됩니다.
- Spring Boot의 `RiskService`/`RiskEngine`은 별도 백엔드 분석 흐름으로 유지되고 있습니다.
- AI 기능은 설명 생성 전용이며, 점수 산정 로직을 변경하지 않습니다.
