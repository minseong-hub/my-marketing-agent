# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Crewmate AI — 프로젝트 마스터 지침

## 우선순위 규칙
- 이 파일의 내용이 모든 작업의 기준이다
- 최신 결정사항이 이전 결정사항보다 항상 우선한다
- 사용자가 명령한 수정만 진행한다. 관련 없는 영역 수정 금지

---

## 서비스 정체성

- **서비스명:** Crewmate AI
- **성격:** 온라인 스토어 운영자를 위한 AI 에이전트 4명 워크스페이스
- **타겟:** 스마트스토어/카페24/쇼피파이 운영 1인~소규모 셀러
- **메타포:** 사용자 = 우주선 함장, AI 크루 4명과 스토어 우주 항해

---

## 버전 관리 규칙

| 구분 | 포맷 | 예시 |
|---|---|---|
| Beta | `Beta V 00.xx.xx` | `Beta V 00.02.00` |
| Official | `Official V 01.00.00+` | `Official V 01.00.00` |

**현재 버전: Beta V 00.02.00** ✅ 확정됨

---

## 현재 상태 로그 (Baseline Log)

### Beta V 00.02.00 — Crewmate AI 전체 재설계 확정
**Status:** confirmed baseline
**Date:** 2026-04-29

**확정된 결정사항:**
1. 서비스명 = Crewmate AI (기존 UpFlow에서 완전 교체)
2. 디자인 컨셉 = 레트로 픽셀 + SF 콕핏 우주선 테마
3. 4명의 AI 크루 고정:
   - 마키(Marky) — 마케팅 비서 / #ff4ec9 마젠타
   - 데일리(Dali) — 상세페이지 비서 / #5ce5ff 시안
   - 애디(Addy) — 광고 전문가 / #ffd84d 옐로
   - 페니(Penny) — 재무 비서 / #66ff9d 그린
4. CockpitShell = 모든 페이지 공통 레이아웃 (3컬럼)
5. rightConsole = 항상 CrewRoster (예외 없음)
6. 픽셀 우주복 아바타 = 18×22 그리드, SVG rect 기반
7. Starfield = Canvas RAF 3레이어 별빛
8. FloatingCrew = 리사주 곡선 궤도 부유 애니메이션
9. 전체 폰트: Press Start 2P (제목) / JetBrains Mono (라벨) / IBM Plex Sans KR (본문)
10. 마이크로카피: 가입→탑승, 로그인→입항, 로그아웃→출항 등

---

## 4명의 크루 (픽스)

| ID | 이름 | 역할 | 액센트 | 태그라인 |
|---|---|---|---|---|
| marky | 마키 | 마케팅 비서 | #ff4ec9 | "감성 한 스푼, 데이터 한 트럭." |
| dali | 데일리 | 상세페이지 비서 | #5ce5ff | "스크롤이 멈추는 그 페이지." |
| addy | 애디 | 광고 전문가 | #ffd84d | "ROAS 사냥꾼." |
| penny | 페니 | 재무 비서 | #66ff9d | "1원도 새지 않게." |

---

## 페이지 → sector 매핑

| 페이지 | sector | leftConsole |
|---|---|---|
| `/` 랜딩 | SHIP CREWMATE-04 | COMMS(마키) + VITALS |
| `/crew` | CREW DOSSIER | 선택된 크루 프로필 |
| `/pricing` | SUPPLY DEPOT | CALCULATOR 슬라이더 |
| `/docs` | MISSION MANUAL | TOC |
| `/blog` | COMMS LOG | ARCHIVE LOG |
| `/login` | AIRLOCK | 부팅 시퀀스 타자기 |
| `/signup` | AIRLOCK | 부팅 시퀀스 |
| `/terms`, `/privacy` | ARCHIVES | 목차 |
| `404` | LOST IN SPACE | 미아 우주인 |

---

## 구현된 파일 구조

```
data/
  agents.ts      ← 4 크루 데이터 + ChatLine 타입
  avatars.ts     ← 픽셀 우주복 팔레트 (makeSuit 함수)

components/
  primitives/
    PixelAvatar.tsx      ← SVG 픽셀아트 렌더러
    AstronautAvatar.tsx  ← 아바타 + idle 보브
    Typewriter.tsx       ← 타자기 (줄단위, loop 지원)
    Bar.tsx              ← 세그먼트 게이지 바
    CornerLabel.tsx      ← HUD 코너 라벨
    CockpitPanel.tsx     ← LED 타이틀바 패널
    PixelButton.tsx      ← primary/secondary/ghost
    HudStrip.tsx         ← 시간/연료/O2 하단 스트립
    Starfield.tsx        ← Canvas 별빛 배경
  crew/
    FloatingAstronaut.tsx ← 리사주 궤도 부유 + 호버
    FloatingCrew.tsx      ← 4명 동시 부유
    AgentModal.tsx        ← Framer AnimatePresence 도시에
    CrewRoster.tsx        ← 우측 콘솔 크루 명단
  layout/
    CockpitNav.tsx        ← 스티키 픽셀 네비
    Footer.tsx            ← 픽셀 푸터
    CockpitShell.tsx      ← ⭐ 전 페이지 공통 3컬럼 레이아웃
  sections/
    HeroCockpit.tsx       ← 랜딩 hero (3컬럼 + 별빛 + 부유 크루)
    HowItWorks.tsx        ← 4단계 카드
    Pricing.tsx           ← 솔로/듀오/풀크루 플랜
    Faq.tsx               ← 아코디언
    CtaSection.tsx        ← 런치 CTA

app/
  page.tsx           ← 랜딩 (HeroCockpit + 섹션들)
  crew/page.tsx      ← 크루 소개
  pricing/page.tsx   ← 가격 + Calculator
  docs/page.tsx      ← 도큐
  blog/page.tsx      ← 블로그
  login/page.tsx     ← 입항 폼 (기존 API 유지)
  terms/page.tsx     ← 이용약관
  privacy/page.tsx   ← 개인정보처리방침
  not-found.tsx      ← 404 미아 우주인
```

---

## 남은 작업 (TODO)

- [ ] `/signup` 페이지 Crewmate AI 테마로 교체 (현재 기존 UpFlow 디자인)
- [ ] `/app/assistants` — 로그인 후 대시보드 Crewmate AI 테마 적용
- [ ] `/crew/[id]` — 에이전트 개별 상세 페이지
- [ ] 404 페이지 Starfield 배경 개선
- [ ] 반응형 최적화 (768px 미만 FloatingCrew 격자 정렬)
- [ ] Konami 코드 Easter egg (선택)

---

## 디자인 토큰 (tailwind.config.ts)

| 용도 | 클래스 |
|---|---|
| 메인 배경 | `bg-[#060920]` |
| 패널 | `bg-bg-panel` |
| 시안 (정보/보조) | `text-crewcyan` |
| 마젠타 (메인 액션) | `text-crewmagenta` |
| 그린 (성공/매출) | `text-crewgreen` |
| 옐로 (광고/경고) | `text-crewyellow` |

## 일관성 규칙
- `border-radius: 0` (pixel-frame clip-path 사용)
- H1/H2: Press Start 2P만 사용
- 본문: IBM Plex Sans KR
- 라벨/숫자/코드: JetBrains Mono
- 4 크루 색 = 해당 크루를 가리킬 때만 사용

---

## 개발 명령어

```bash
npm run dev      # 개발 서버 (hot reload)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint (✓ 에러 없음)
npx tsc --noEmit # TypeScript 체크 (✓ 에러 없음)
```

---

## 기술 스택

- **Framework:** Next.js 14 App Router, React 18, TypeScript (strict)
- **Styling:** Tailwind CSS + 커스텀 Crewmate 토큰
- **Animation:** Framer Motion (모달) + Canvas RAF (별빛) + CSS keyframes
- **Database:** SQLite (better-sqlite3), Prisma ORM (기존 /app/* 영역 유지)
- **Auth:** JWT (jose + bcryptjs), HTTP-only cookie

### 환경 변수 (`.env`)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="..."
ANTHROPIC_API_KEY="sk-ant-..."
ENCRYPTION_KEY="..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 인증 구조 (기존 유지)
- 사용자: `auth-token` 쿠키 → `/app/*` 보호
- 어드민: `admin-token` 쿠키 → `/admin/*` 보호
- `middleware.ts`에서 라우트별 쿠키 검증
