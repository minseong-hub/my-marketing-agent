# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# UpFlow (업플로) — 프로젝트 마스터 지침

## 우선순위 규칙
- 이 파일의 내용이 모든 작업의 기준이다
- 최신 결정사항이 이전 결정사항보다 항상 우선한다
- 사용자가 명령한 수정만 진행한다. 관련 없는 영역 수정 금지

---

## 서비스 정체성

- **서비스명:** 업플로 (UpFlow)
- **성격:** 온라인 비즈니스 운영자를 위한 멀티툴 SaaS 플랫폼
- **타겟 고객:** 온라인 쇼핑몰 셀러 (스마트스토어, 쿠팡 등)

---

## 버전 관리 규칙

| 구분 | 포맷 | 예시 |
|---|---|---|
| Beta | `Beta V 00.xx.xx` | `Beta V 00.01.00` |
| Official | `Official V 01.00.00+` | `Official V 01.00.00` |

- 버전 업 기준은 Claude가 판단 (사용자 지시 불필요)
  - 새 툴/섹션 추가, 핵심 기능 구현 → second number +1
  - UI 수정, 버그 픽스, 소규모 기능 → third number +1
  - 단순 텍스트·네이밍·설정 변경 → 버전 유지
- "확정" 선언 시 → CLAUDE.md 상태 업데이트 + GitHub push (버전 번호 변경 없음)
- major/risky update 전에는 직전 버전 백업
- 문제 발생 시 직전 버전으로 rollback 후 이어서 작업
- major summary 시 현재 버전명을 함께 표시

**현재 버전: Beta V 00.01.01** ✅ 확정됨

---

## 현재 상태 로그 (Baseline Log)

### Beta V 00.01.01 — 확정
**Status:** confirmed baseline  
**Source of truth:** laptop work + UpFlow detailed spec v2

**확정된 결정사항:**
1. 서비스명 = 업플로 (UpFlow) — 전체 네이밍 통일 완료
2. 핵심 개념 = 온라인 비즈니스 운영자 멀티툴 SaaS
3. 메인 디자인 = 화이트 베이스 + vivid cobalt blue 액센트
4. 툴 순서 고정 (아래 참조)
5. Store Ops = 최우선 툴
6. Store Ops 섹션 고정 (아래 참조)
7. Store Ops 대시보드 규칙 고정
8. 운영보드 상태 6개 고정
9. AI비서 규칙 고정
10. 캘린더 규칙 고정
11. 어드민 구조 고정
12. 요금제 고정

---

## 디자인 기준

- **메인 컬러:** vivid cobalt blue
- **베이스:** white base + blue accents
- **스타일:** modern premium SaaS
- **금지:** old gray admin UI, 칙칙한 중성 톤 UI

---

## 공통 UX 규칙

- **dead UI 금지** — 클릭 가능한 모든 요소는 실제로 작동해야 한다
- **첫 화면은 summary first** — 상세 데이터는 클릭 후 표시
- **카드 숫자와 상세 데이터 must match** — 표시 숫자와 실제 데이터 불일치 금지
- **shared data = one source of truth** — 같은 데이터는 한 곳에서 관리
- **config over hardcoding** — 하드코딩보다 설정값 우선
- **readability / speed / accuracy 우선**

---

## 전체 사용자 흐름

```
landing → login/signup → tool select → tool pages → billing → admin
```

---

## 툴 구성 및 순서

### 운영 코어
| 순서 | 툴 | 경로 |
|---|---|---|
| 1 | Store Ops (온라인스토어 운영 자동화) | `/app/tools/store-ops` |
| 2 | Profit Analytics (마진/수익흐름 분석) | `/app/tools/margin` |

### 성장 & 전환
| 순서 | 툴 | 경로 |
|---|---|---|
| 3 | SNS (마케팅 자동화) | `/app/tools/sns` |
| 4 | Detail Page (상세페이지 기획) | `/app/tools/detail-page` |
| 5 | Ads (광고 자동화) | `/app/tools/ads` |
| 6 | CRM (고객응대/CRM 자동화) | `/app/tools/crm` |

---

## Store Ops 상세 규칙 (최우선 툴)

### 섹션 구성 (고정)
1. 대시보드
2. 운영 보드
3. 상품 관리
4. 재고 관리
5. 상품 업로드 관리
6. 프로모션 관리
7. 체크리스트
8. 이슈 / 알림
9. 운영 기록

### 대시보드 규칙
- product-centered (상품 중심)
- monthly calendar first (캘린더 상단)
- product summary below calendar (캘린더 하단에 상품 요약)
- seasonal product operation focus (시즌 상품 운영 중심)

### 운영보드 상태 (6개, 고정)
1. 오늘 해야할 일
2. 해야 할 일
3. 진행 중
4. 진행예정
5. 완료
6. 지연

---

## AI비서 규칙

- **자연어 입력 → 파싱 → 저장 → 분배** 흐름
- **별도 "AI task" 카테고리 금지** — AI가 생성한 업무도 일반 업무처럼 처리
- AI 업무는 board / calendar / modules에 즉시 반영
- **레이아웃:** left panel 20~30% (AI 입력), calendar 70~80%
- 하단에 오늘 해야할 일 포함

---

## 캘린더 규칙

- **타입:** monthly (월별)
- **마커:** horizontal bars (가로 바) — dot 마커 금지
- **필터:** 전체 + 업종 필터
- **금지:** 봄/여름/가을/겨울 chips

---

## 어드민 규칙

- **경로:** `/admin`
- **접근:** owner only (server-side role protection)
- **섹션:** users / billing / plans / support / notices / analytics / settings

---

## 요금제 (고정)

| 플랜 | 월 요금 | 첫 결제 | 무료 체험 | 포함 툴 |
|---|---|---|---|---|
| Starter | ₩19,900 | ₩9,900 | 7일 | Store Ops, Profit Analytics |
| Growth | ₩59,000 | — | 7일 | Starter + SNS, Detail Page |
| Pro | ₩149,000 | — | 7일 | 6개 전체 |

---

## 개발 규칙

- **관련 파일만 수정** — 관련 없는 영역 rewrite 금지
- **앱 확장성 유지** — 툴 추가/제거가 쉬운 구조 유지
- **dead UI 금지** — 구현 안 된 기능은 비활성화 표시 또는 제거

---

## 개발 명령어

```bash
npm run dev      # 개발 서버 시작 (hot reload)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 실행
```

---

## 기술 스택

- **Framework:** Next.js 14 App Router, React 18, TypeScript (strict)
- **Styling:** Tailwind CSS + shadcn/ui + Radix UI
- **Database:** SQLite (better-sqlite3), Prisma ORM
- **Auth:** JWT (jose + bcryptjs), HTTP-only cookie
- **Animation:** Framer Motion
- **Font:** Pretendard (Korean)

### 환경 변수 (`.env`)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="..."   # 프로덕션에서 반드시 변경
```

### Next.js 설정 주의사항
`next.config.mjs`에서 better-sqlite3를 `serverComponentsExternalPackages`로 등록함.  
네이티브 모듈 추가 시 동일하게 처리 필요.

### 인증 구조
- 사용자: `auth-token` 쿠키 (7일) → `/app/*` 보호
- 어드민: `admin-token` 쿠키 (12시간, role=admin) → `/admin/*` 보호
- `middleware.ts`에서 라우트별 쿠키 검증

### 데이터베이스 테이블
`users`, `plans`, `subscriptions`, `support_tickets`, `notices`, `admin_logs`, `settings`, `billing_events`
