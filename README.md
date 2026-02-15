# Decision Risk Analyzer

의사결정 리스크를 점수로 보여주는 서비스입니다.  
현재 레포는 `Spring Boot 백엔드 + Next.js 프론트엔드 + Supabase(Auth/DB) + Polar 결제`로 구성됩니다.

## 현재 구현 기능
- 리스크 점수 계산 API 및 기록 조회 (백엔드)
- Supabase 인증 (이메일/비밀번호, Google 로그인)
- 다국어 지원 (`ko`, `en`, `ja`)
- 프로필 페이지 (기본 정보, 비밀번호 재설정, 계정 삭제)
- 관리자 콘솔 (사용자 역할 조회/변경)
- 커뮤니티 게시판
- 게시글 작성/수정/삭제
- 좋아요 중복 방지 (사용자당 게시글 1회)
- 게시글 검색/필터 (`q`, `sort`, `period`, `page`)
- Polar 결제/웹훅 기반 Pro 플랜 처리
- Google Analytics + Microsoft Clarity 스크립트 연동

## 프로젝트 구조
- `src/`: Spring Boot 백엔드
- `frontend/`: Next.js 앱 (App Router)
- `docs/`: Supabase SQL 및 아키텍처 문서
- `functions/`: 서버리스 함수 코드

## 빠른 시작

### 1) 백엔드 실행 (Spring Boot)
1. PostgreSQL 준비
```bash
docker run --name dra-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=dra -p 5432:5432 -d postgres:15-alpine
```
2. 환경 변수
```bash
export DB_URL=jdbc:postgresql://localhost:5432/dra
export DB_USER=postgres
export DB_PASSWORD=postgres
export JWT_SECRET=dev-secret-please-change-32-bytes-minimum
```
3. 실행
```bash
./gradlew bootRun
```

### 2) 프론트엔드 실행 (Next.js)
1. 환경 변수 `frontend/.env.local`
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXT_PUBLIC_SITE_URL=https://riskly.store
NEXT_PUBLIC_OG_IMAGE=https://your-domain.com/og.png

POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_SERVER=sandbox
POLAR_SUCCESS_URL=https://your-domain.com/?checkout=success
POLAR_RETURN_URL=https://your-domain.com/?checkout=cancel
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
```
2. 실행
```bash
cd frontend
npm install
npm run dev
```

## Supabase 설정
1. 사용자/권한 관련 SQL 실행
```sql
-- see docs/supabase-roles.sql
```
2. 커뮤니티 테이블 SQL 실행
```sql
-- see docs/supabase-posts.sql
```
3. 관리자 계정 지정
- Supabase `profiles.role = 'admin'`

`docs/supabase-posts.sql`에는 아래가 포함됩니다.
- `posts` 테이블
- `post_likes` 테이블 (PK: `post_id, user_id`)
- RLS 정책
- `increment_post_like_count` 함수

## 커뮤니티 API
- `POST /api/community/like`
- `GET /api/community/like?postId=<uuid>`

동작 요약:
- `POST`는 이미 좋아요한 사용자면 카운트를 증가시키지 않음
- `GET`은 현재 로그인 사용자의 좋아요 여부 반환

## 분석 스크립트
- GA: `frontend/app/[locale]/layout.tsx`에 `gtag` 포함
- Clarity: `frontend/app/[locale]/layout.tsx`에 Clarity init 스크립트 포함
- 현재 Clarity 프로젝트 ID: `vgm3ujvbbf`

## SEO
- `frontend/app/robots.ts`, `frontend/app/sitemap.ts`에서 생성
- 기본 OG: `frontend/public/og.png`, `frontend/public/og.svg`

## Cloudflare Pages 배포
- Build Command: `cd frontend && npm install && npm run pages:build`
- Build Output Directory: `frontend/.vercel/output/static`
- Compatibility Flag: `nodejs_compat`

## Polar 웹훅
- Endpoint: `https://<your-domain>/api/polar/webhook`
- 이벤트: `order.paid`
- 필수 스코프: `checkouts:write`
- 자동 환불 사용 시: `refunds:write`

## API 예시 (백엔드)
### POST `/api/risk/analyze`
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

### GET `/api/risk/records`
```bash
curl -X GET "http://localhost:8080/api/risk/records?page=1&size=20" \
  -H "Authorization: Bearer <JWT>"
```

### GET `/api/users/me`
```bash
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer <JWT>"
```

