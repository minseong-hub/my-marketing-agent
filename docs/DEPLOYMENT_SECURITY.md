# 배포 전 보안 체크리스트 & 마이그레이션 가이드

이 문서는 Crewmate AI를 운영 환경에 배포하기 직전에 반드시 점검해야 하는 보안·인프라 항목과, SQLite → PostgreSQL 마이그레이션 절차를 정리합니다.

---

## 1. 환경변수 (필수)

배포 호스팅(Vercel/AWS/Railway 등)의 비밀 관리에 아래 값을 등록합니다. **`.env` 파일은 절대 커밋 금지** (`.gitignore`에 이미 포함).

```bash
# 32바이트 hex 시크릿 — 새 값으로 발급
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SCHEDULER_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")

# DB
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# 앱 URL — Origin 검증에 사용 (반드시 https)
NEXT_PUBLIC_APP_URL=https://your-domain.example
NEXT_PUBLIC_BASE_URL=https://your-domain.example

# AI / OAuth
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
KAKAO_CLIENT_ID=...
KAKAO_CLIENT_SECRET=...

# 결제 — 실제 PG 연동 시에만 'live'로 변경
PAYMENTS_PROVIDER=mock   # 또는 live
```

`lib/env.ts`가 부팅 시 검증하므로, 시크릿이 누락되거나 약하면 서버가 즉시 부팅 거부합니다.

---

## 2. SQLite → PostgreSQL 마이그레이션

### 2.1 왜 필요한가
- SQLite는 단일 노드 파일 DB. Vercel 등 서버리스에서는 매 요청 콜드 스타트마다 새 인스턴스가 떠 WAL 동기화/락 충돌 + 쓰기 손실 가능.
- 동시 접속/쓰기가 늘면 DB-WAL 파일이 부풀고 백업 자동화가 어려움.
- 프로덕션은 관리형 Postgres(Supabase / Neon / Railway / RDS)로 옮겨야 함.

### 2.2 권장 호스팅 옵션

| 서비스 | 무료 티어 | 한국 리전 | PITR(Point-In-Time Recovery) |
|---|---|---|---|
| **Supabase** | 500MB / 2 프로젝트 | Singapore | Pro부터 |
| **Neon** | 500MB / 0.25 vCPU | US/EU | Pro부터 |
| **Railway** | 5달러 크레딧/월 | US/EU | 자체 백업 |
| **AWS RDS** | t4g.micro | Seoul | 가능 (PITR 35일) |

**추천:** Supabase (Singapore 리전 → 한국 레이턴시 합리적, Auth/Storage 함께) 또는 Neon (가장 빠른 콜드 스타트).

### 2.3 마이그레이션 절차

#### 단계 1 — Prisma 스키마 정의
현재 `prisma/schema.prisma`는 비어있어 SQLite 직접 SQL을 사용합니다. PostgreSQL 도입 시 아래로 교체:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// === 사용자 ===
model User {
  id                  String    @id @default(uuid())
  email               String    @unique
  name                String
  passwordHash        String?   @map("password_hash")
  businessName        String    @map("business_name")
  brandDisplayName    String    @map("brand_display_name")
  role                String    @default("user")
  status              String    @default("active")
  industry            String    @default("")
  phone               String    @default("")
  businessType        String    @default("") @map("business_type")
  salesChannels       Json      @default("[]") @map("sales_channels")
  productCategories   Json      @default("[]") @map("product_categories")
  authProvider        String    @default("email") @map("auth_provider")
  providerId          String?   @map("provider_id")
  linkedProviders     Json      @default("[]") @map("linked_providers")
  planSlug            String?   @map("plan_slug")
  planStatus          String    @default("none") @map("plan_status")
  trialStartedAt      DateTime? @map("trial_started_at")
  trialEndsAt         DateTime? @map("trial_ends_at")
  firstPaymentDone    Boolean   @default(false) @map("first_payment_done")
  termsAgreedAt       DateTime? @map("terms_agreed_at")
  privacyAgreedAt     DateTime? @map("privacy_agreed_at")
  marketingConsent    Boolean   @default(false) @map("marketing_consent")
  createdAt           DateTime  @default(now()) @map("created_at")

  agentSessions       AgentSession[]
  approvalRequests    ApprovalRequest[]
  authEvents          AuthEvent[]

  @@index([email])
  @@index([role])
  @@map("users")
}

model AgentSession {
  id                  String    @id @default(uuid())
  userId              String    @map("user_id")
  agentType           String    @map("agent_type")
  status              String    @default("idle")
  currentTask         String?   @map("current_task")
  lastReportedAt      DateTime? @map("last_reported_at")
  startedAt           DateTime  @default(now()) @map("started_at")
  completedAt         DateTime? @map("completed_at")
  errorMessage        String?   @map("error_message")
  metadata            Json      @default("{}")
  conversationHistory Json      @default("[]") @map("conversation_history")

  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  logs                AgentLog[]
  approvals           ApprovalRequest[]

  @@index([userId, agentType])
  @@index([startedAt])
  @@map("agent_sessions")
}

model AgentLog {
  id              String   @id @default(uuid())
  sessionId       String   @map("session_id")
  agentType       String   @map("agent_type")
  userId          String   @map("user_id")
  level           String   @default("info")
  message         String
  technicalDetail String?  @map("technical_detail")
  metadata        Json     @default("{}")
  createdAt       DateTime @default(now()) @map("created_at")

  session         AgentSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([sessionId, createdAt])
  @@map("agent_logs")
}

model ApprovalRequest {
  id            String    @id @default(uuid())
  sessionId     String    @map("session_id")
  userId        String    @map("user_id")
  agentType     String    @map("agent_type")
  status        String    @default("pending")
  title         String
  description   String
  actionType    String    @map("action_type")
  payload       Json      @default("{}")
  previewData   Json      @default("{}") @map("preview_data")
  urgencyLevel  String    @default("normal") @map("urgency_level")
  expiresAt     DateTime  @map("expires_at")
  resolvedAt    DateTime? @map("resolved_at")
  resolvedBy    String?   @map("resolved_by")
  rejectReason  String?   @map("reject_reason")
  resumeData    Json      @default("{}") @map("resume_data")
  createdAt     DateTime  @default(now()) @map("created_at")

  session       AgentSession @relation(fields: [sessionId], references: [id])
  user          User         @relation(fields: [userId], references: [id])

  @@index([userId, status])
  @@map("approval_requests")
}

model AuthEvent {
  id        Int      @id @default(autoincrement())
  kind      String
  userId    String?  @map("user_id")
  email     String?
  ip        String?
  userAgent String?  @map("user_agent")
  detail    String?
  createdAt DateTime @default(now()) @map("created_at")

  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId, createdAt])
  @@index([email, createdAt])
  @@index([kind, createdAt])
  @@map("auth_events")
}

// 기타 테이블(plans/subscriptions/billing_events/financial_records/ad_campaigns/detail_page_projects 등)도
// 동일한 패턴으로 정의. 자세한 컬럼은 lib/db.ts의 CREATE TABLE 참고.
```

#### 단계 2 — DB 추상화 레이어 도입
`lib/db.ts`는 better-sqlite3에 강결합되어 있습니다. PostgreSQL 도입 시 두 가지 접근 가능:

**(A) Prisma로 전면 교체 (권장)** — 타입 안전, 마이그레이션 자동화. 모든 `db.method()` 호출을 `prisma.user.findUnique()` 같은 Prisma API로 점진 교체.

**(B) 인터페이스 분리 후 어댑터 계층 추가** — `lib/db.ts`를 인터페이스만 노출하고, `lib/db/sqlite.ts`와 `lib/db/postgres.ts`를 구현체로 분리. 환경변수로 스위칭.

소요: (A) 1~2주, (B) 1주. 새 기능 페이스 고려해 (A) 권장.

#### 단계 3 — 데이터 이전
1. 현재 `data/users.db` 백업: `cp data/users.db data/users.db.backup-$(date +%F)`
2. SQLite → CSV 또는 SQL dump
   ```bash
   sqlite3 data/users.db .dump > backup.sql
   ```
3. PostgreSQL용 SQL로 변환 (datetime → timestamptz, AUTOINCREMENT → SERIAL/IDENTITY 등). 테이블별로 INSERT 변환 도구 사용:
   - https://github.com/dimitri/pgloader (한 번에 마이그레이션)
   - 또는 Prisma의 `prisma db pull` 후 직접 `prisma db seed`
4. `prisma migrate deploy` 로 스키마 적용
5. 데이터 검증 쿼리 (행 개수, 핵심 사용자/세션 일치)
6. 운영 DATABASE_URL 교체 → 재배포

#### 단계 4 — 백업 정책
- 호스팅 자동 백업 활성화 (PITR 7~14일)
- 주 1회 외부 스토리지(S3 등)로 dump 복사 (재해 복구)
- 백업 복원 리허설을 분기 1회 수행

---

## 3. 결제 PG 연동 체크리스트 (S-6 해제 조건)

`PAYMENTS_PROVIDER=live` 로 전환 가능한 상태가 되려면:

- [ ] PG사 가맹 계약 완료 (포트원 / 토스페이먼츠 / Stripe)
- [ ] 결제 위젯 또는 결제창 통합 (`/app/billing` UI 교체)
- [ ] 웹훅 엔드포인트 구현: `payment.completed`, `payment.failed`, `subscription.canceled`, `refund.completed`
- [ ] 웹훅 서명 검증 (예: 토스 `Toss-Signature` 헤더)
- [ ] Idempotency 키 처리 (중복 결제 방지)
- [ ] 환불 처리 흐름 + 관리자 권한 (`billing.refund` 권한 체크 — 이미 RBAC 정의됨)
- [ ] 영수증 발급/세금계산서 발행 절차
- [ ] 약관/이용약관에 결제·환불 조항 보강
- [ ] 결제 실패 → 사용자 알림(이메일) 자동 발송

전환 전까지 `app/api/billing/subscribe/route.ts`와 `cancel/route.ts`는 production에서 503으로 차단됩니다.

---

## 4. 프로덕션 보안 점검표

### 인증
- [x] JWT 시크릿 폴백 제거 + env 검증 (S-1)
- [x] 비밀번호 정책 (8자 + 2종 이상) (S-2)
- [x] Rate Limit: 로그인 5회/15분, 회원가입 5회/1시간, OAuth 20회/5분 (S-3)
- [x] Honeypot + 폼 노출 시간 검증 (S-4)
- [ ] **Cloudflare Turnstile / hCaptcha 추가** (배포 직전 권장)
- [ ] 이메일 인증 (회원가입 후 24시간 내 인증 미완료 시 자동 잠금)
- [ ] 비밀번호 재설정 플로우 (현재 미구현)
- [ ] 2FA (현재 settings flag만 있고 OTP 미구현)

### 권한
- [x] RBAC: owner/admin/support/user (S-8)
- [x] admin 라우트 미들웨어 + IP allowlist 옵션
- [ ] 모든 admin 액션이 `admin_logs`에 강제 기록되는지 코드 감사 필요

### 입력/CSRF
- [x] Zod 스키마 검증 (S-9)
- [x] Origin/Referer 동일 출처 검증 (S-7)
- [x] SameSite=Lax 쿠키 + httpOnly + secure(prod)

### 데이터/AI
- [x] AI 호출 한도 강제 (S-5)
- [x] 무료 플랜 자동 임무 차단
- [x] auth_events 감사 로깅
- [ ] 토큰 사용량/비용 추적 (input/output tokens)
- [ ] 운영 DB는 PostgreSQL (S-10 — 본 가이드 참고)

### 인프라
- [ ] HTTPS 강제 (Vercel은 자동, 자체 호스팅은 nginx 설정 필요)
- [ ] HSTS 헤더 추가
- [ ] CSP(Content-Security-Policy) 헤더 추가 — XSS 추가 방어
- [ ] Sentry 등 에러 모니터링
- [ ] Anthropic API 키 회전 정책 (분기별)
- [ ] DB 자동 백업 활성화

### 사고 대응
- [ ] 시크릿 유출 시 회전 절차 문서화
- [ ] 침해 사고 시 사용자 통보 절차 (개인정보보호법)
- [ ] auth_events / admin_logs 모니터링 알림 (예: 로그인 실패 100회/시 알림)

---

## 5. 주기적 감사 (배포 후)

월 1회:
- `auth_events`에서 `login_fail`, `rate_limited`, `csrf_blocked` 추세 점검
- `admin_logs` 변동 검토
- 의존성 보안 패치: `npm audit fix`
- 시크릿 잔존 검사: `git secrets --scan`

분기 1회:
- 침투 테스트 (외부 또는 내부)
- DB 백업 복원 리허설
- 시크릿/API 키 회전
- 약관 갱신 검토
