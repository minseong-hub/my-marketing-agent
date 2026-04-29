# Crewmate AI 자체 감사 리포트
**작성일:** 2026-04-29
**작성:** 개발 Claude (셀프 점검)
**범위:** AI 비서 품질 + 배포/결제 전 보안·DB 기반

---

## 🔴 CRITICAL — 배포 전 반드시 수정 (보안/돈/데이터)

### S-1. JWT 시크릿/암호화 키가 코드에 하드코딩 폴백
**위치:** `lib/auth.ts:11`, `middleware.ts:10`, `lib/social-auth.ts:8`, `.env:9`
**문제:** `process.env.JWT_SECRET || "saas-marketing-agent-secret-key-2024-change-in-production"` — 환경변수 누락 시 깃에 들어있는 폴백값으로 토큰 서명. 누구나 이 값으로 admin 토큰 위조 가능. `.env`의 `ENCRYPTION_KEY`는 `0000...0001`이라 평문이나 다름없음.
**위험:** 운영 사고 시 전체 사용자 세션 탈취 + 저장된 OAuth 토큰 복호화 가능
**조치:**
- 폴백 제거 → 키 없으면 부팅 거부 (throw)
- 배포 환경에서 `openssl rand -hex 32`로 새 시크릿 생성 + 호스팅 비밀 관리(Vercel/AWS Secrets)에만 저장
- `JWT_SECRET` 외 `ENCRYPTION_KEY`도 동일 처리

### S-2. 비밀번호 정책이 6자 이상뿐
**위치:** `app/api/auth/signup/route.ts:34`
**문제:** 길이만 검증. 사전 비밀번호(`123456`, `qwerty`) 통과
**조치:**
- 최소 8자 + 영문·숫자·특수문자 중 2종 이상 필수 (또는 zxcvbn으로 strength 점수 측정)
- 회원가입 화면에 강도 미터 표시

### S-3. 로그인/회원가입/소셜 콜백에 Rate Limit 없음
**위치:** `app/api/auth/login/route.ts`, `app/api/auth/signup/route.ts`, OAuth 콜백 전체
**문제:** 비밀번호 무차별 대입(credential stuffing) 무방비
**조치:**
- IP+이메일 기준 5회/15분 제한 (메모리 LRU 또는 Upstash Redis)
- 실패 누적 5회 시 captcha 또는 1분 lockout
- 같은 패턴을 OTP/이메일 인증 발송 API에도 적용

### S-4. 봇 회원가입 방어 없음
**문제:** captcha/honeypot 없음 → 스팸 가입 + DB 부풀리기 + AI 호출 abuse
**조치:** Cloudflare Turnstile 또는 hCaptcha 무료 플랜 추가

### S-5. AI 호출 한도(monthly_generation_limit) 정의만 있고 강제력 없음
**위치:** `lib/plans.ts`에 정의 존재, `lib/agents/runner.ts`에 검증 없음
**문제:** 무료 30회 / 스타터 500회로 설정해 둬도, runner는 호출 횟수 체크 없이 무제한 실행. 결제 차등의 핵심이 작동 안 함 + Anthropic API 비용 폭발 가능
**조치:**
- `runAgent` 진입 시 `db.countAgentSessionsForUser(userId, agentType, 30)` 합산 → 플랜 한도 초과 시 거부 + 사용자에게 업그레이드 CTA
- 동시에 `agent_logs` / `claude_token_usage` 테이블에 토큰 입출력 합계 기록 (input_tokens, output_tokens, model 가격) — 실비용 추적용
- 무료 플랜은 자동 임무(스케줄러) 비활성화 강제

### S-6. 결제 시스템이 모킹 상태에서 실제 결제 가능 UI 노출
**위치:** `app/api/billing/subscribe/route.ts:15` `// NOTE: Mock payment`
**문제:** 사용자가 "정기 결제 시작" 누르면 PG 연동 없이 DB만 active로 바뀜. 실서비스 오픈 시 무료로 유료 등급 받을 수 있음
**조치:**
- 토스페이먼츠 / 포트원(아임포트) 등 PG 연동 또는 Stripe Checkout 도입
- 도입 전엔 `process.env.NODE_ENV === "production"`이면 503 반환
- 결제 이벤트(payment_success/refund/dispute)는 PG 웹훅으로만 들어와야 함 — 클라이언트 응답으로 상태 변경 금지

### S-7. CSRF 보호 부재
**문제:** `sameSite: "lax"`로 일정 부분 막히지만, GET 기반 상태 변경 라우트는 없는지 확인 필요. 결제/플랜 변경 API는 명시적으로 CSRF 토큰 또는 Origin 헤더 검증해야 함
**조치:**
- 상태 변경 POST에 `Origin/Referer` 검증 추가 (`request.headers.get("origin") === process.env.NEXT_PUBLIC_APP_URL`)
- 또는 csrf-token 쿠키+헤더 더블 서밋 패턴

### S-8. 어드민 권한 단일 조건 (`role === "admin"`)
**위치:** `middleware.ts:38`, `lib/auth.ts:81`
**문제:** admin 역할만 있고 owner/operator/support 분리 없음. 결제·환불 권한과 단순 고객지원 권한이 같음
**조치:** 역할 분리 (`owner/admin/support`) + 작업별 권한 매트릭스 + 모든 admin 액션 `admin_logs`에 강제 기록

### S-9. 입력 검증이 분산되어 있고 일관성 없음
**문제:** Zod 같은 스키마 검증 없이 if문으로 수동 체크. 누락된 필드, 타입 미스매치, SQL injection 위험은 없으나(prepared statement 사용) XSS는 사용자 콘텐츠가 그대로 표시됨
**조치:** 
- API 라우트 전체에 Zod 스키마 도입 → request body parse 일원화
- agent_logs/messages 등 사용자 입력 표시 시 React 자동 이스케이프 의존 OK지만, dangerouslySetInnerHTML 절대 금지 룰 명시

### S-10. SQLite WAL 파일이 운영에서 데이터 손실 위험
**위치:** `data/users.db`, WAL 파일 1MB 가량
**문제:** SQLite는 단일 노드용. 서버리스(Vercel)에서는 매 요청마다 새 인스턴스라 WAL 동기화/락 문제 + 쓰기 손실 가능. 백업 자동화 없음
**조치:**
- **배포 시 즉시 PostgreSQL로 마이그레이션** (Supabase/Neon/Railway 무료 티어 가능)
- Prisma 이미 일부 사용 중이니 schema.prisma 정의해 마이그레이션 일원화
- 자동 백업: 호스팅 제공 PITR 활성화

---

## 🟡 HIGH — AI 비서 성능에 직접 영향 (1주 내 수정)

### A-1. 시스템 프롬프트가 구버전 브랜드명 "업플로(UpFlow)"
**위치:** `lib/claude/prompts/index.ts:4,32,59,88`
**문제:** 모든 비서가 자신을 "업플로 어시스턴트"로 소개 → 사용자가 사이트는 Crewmate인데 비서는 UpFlow라고 하면 신뢰 하락
**조치:** 4개 프롬프트 전체 "Crewmate AI"로 교체 + 비서 이름(마키/데일리/애디/페니) 자기소개 1줄 추가

### A-2. 사용자 컨텍스트(브랜드/카테고리/판매채널) 프롬프트 미주입
**위치:** `lib/agents/runner.ts:95-97` — `messages: [{ role: "user", content: task }]`만 전달
**문제:** 회원가입 때 받은 `brand_display_name`, `industry`, `sales_channels`, `product_categories`가 DB에만 있고 AI에 안 들어감 → 비서가 "당신의 브랜드"라고 일반론만 답함
**조치:**
```ts
const user = db.getUserById(userId);
const userContext = `
[현재 사용자 정보]
- 브랜드명: ${user.brand_display_name}
- 업종: ${user.industry}
- 판매 채널: ${JSON.parse(user.sales_channels).join(", ")}
- 사업자 형태: ${user.business_type}
`;
const system = SYSTEM_PROMPTS[agentType] + userContext;
```

### A-3. 세션 메모리 부재 (모든 임무가 0에서 시작)
**위치:** `runner.ts:96` — 매번 새 messages 배열
**문제:** 어제 마키가 만든 콘텐츠 캘린더, 데일리가 분석한 경쟁사 — 다음 임무에 전혀 전달 안 됨. 비서들이 매번 같은 질문을 사용자에게 함
**조치:**
- 같은 사용자+에이전트의 직전 N개 세션 요약을 system 프롬프트에 주입
- 또는 각 세션 종료 시 LLM이 "이 세션의 핵심 결과 3줄 요약" 생성 → `agent_memories` 테이블에 저장 → 다음 세션 system에 포함
- 비용 통제 위해 30일 이내·요약된 형태만 사용

### A-4. 도구 정의는 있으나 실제 데이터 저장 없는 도구 다수
**위치:** `runner.ts:224-233`
**문제:**
- `save_content_draft` — 로그만 출력하고 DB 저장 없음 (콘텐츠 어디에도 안 남음)
- `save_ad_campaign` — 로그만 출력, `ad_campaigns` 테이블 있는데 INSERT 안 됨
- 즉, 비서가 작업해도 결과물이 휘발성. 사용자가 다시 보려면 로그 스크롤만 가능
**조치:** 두 도구 핸들러에서 실제 `db.create*` 호출 + 사용자 화면에 "보관함" 페이지 (`/app/library`) 신설하여 누적된 콘텐츠/캠페인/상세페이지 초안 열람 가능하게

### A-5. 외부 데이터 수집 도구 부재
**문제:** 마키 프롬프트는 "인스타그램 트렌드 수집", 애디는 "경쟁사 광고 분석"인데 정작 도구가 `report_action / request_approval / collaborate / task_complete / save_*` 6개뿐. **인터넷 검색·웹스크래핑·SNS API 도구가 0개** → 비서가 본인 학습 데이터로만 답함 (오늘의 트렌드 절대 모름)
**조치 (우선순위):**
1. `web_search` 도구 — Tavily/Serper API 연동 (한국어 검색 지원)
2. `fetch_url` 도구 — 특정 URL 본문 가져오기 (경쟁사 페이지 분석용)
3. (선택) `naver_keyword_volume` 도구 — 네이버 검색광고 API 키워드 검색량 (애디용)
4. (선택) `instagram_hashtag_count` 도구 — 마키용

### A-6. MAX_ITERATIONS = 30 고정, 토큰/비용 가드 없음
**위치:** `runner.ts:9, 102-108`
**문제:** 한 임무가 30턴 도구 호출 가능 → 한 임무에 입력 토큰 누적 100K+ 가능. `max_tokens: 4096`만 출력 제한. 입력 컨텍스트 무한 누적
**조치:**
- 누적 입력 토큰 50K 초과 시 강제 종료 + 사용자에게 "복잡한 임무는 단계별로 나눠 주세요" 알림
- `response.usage.input_tokens / output_tokens` 매 턴 기록 → 사용자별 일/월 합계 → S-5 한도 강제와 연동
- prompt caching 활성화 (system 프롬프트 + tool 정의는 정적이므로 캐시) → 비용 ~80% 절감

### A-7. Quick Tasks / Auto Tasks가 모두 "분석/기획" 수준에 머무름
**위치:** `lib/scheduler/auto-tasks.ts`, 각 크루 페이지의 QUICK_TASKS
**문제:** 셀러가 진짜 원하는 건 "결과물"인데, 카탈로그가 죄다 "~을 분석해 주세요 / ~을 기획해 주세요"로 끝남 → 응답이 마크다운 보고서로만 나옴. 실제 인스타 캡션 1개, 광고 헤드라인 1개 같은 "산출물"은 없음
**조치:**
- 각 비서별 산출물 지향 임무 5개 추가 (예: "내일 올릴 인스타 캡션 1개와 해시태그 12개를 즉시 작성", "이 상품 1개의 셀링포인트 카피 3개를 작성")
- 작업 결과는 `save_content_draft` 등 도구로 DB에 저장 → 보관함에서 복사 가능

### A-8. Manual Ops가 비서당 2개로 부족
**위치:** `components/agents/AssistantDetail.tsx` CREW_MAP.manualOps
**문제:** 셀러가 자주 하는 작업 대비 커버리지가 너무 좁음
**조치:** 비서당 5~7개로 확장. 예시:
- 마키: 카페24/스마트스토어 상품명 SEO 최적화 / 인플루언서 DM 초안 / 부정 리뷰 응대 답글
- 데일리: 옵션 설명 카피 / Q&A 답변 템플릿 / 배송 안내 카피
- 애디: 키워드 부정 단어 추출 / 비효율 광고 일시정지 후보 분석 / 광고 소재 카피 5종
- 페니: 부가세 추정 / 환불 정책 문구 / 단순 손익 계산 (LLM 없이 클라 계산)

### A-9. 협업(collaborate) 도구는 정의만 있고 실제 다른 비서가 받아주지 않음
**위치:** `runner.ts:177-194`
**문제:** 마키가 collaborate로 애디에게 "이 키워드 광고 만들어 줘" 호출해도, 그건 단순히 로그 한 줄로 끝남. 받는 쪽 에이전트 세션이 자동 시작되지 않음 → 비서간 협업 기능이 그림의 떡
**조치:**
- collaborate 호출 시 `to_agent_type`에 대한 새 세션을 자동 생성 + 협업 데이터를 task로 주입해 `runAgent` 호출
- 비용 폭주 방지 위해 협업 깊이 2 제한 (A→B→C 금지)

### A-10. 한국어 마이크로카피 일관성 (오타/번역체)
- `app/blog/page.tsx`에 `"도시에 열기 →"` (이미 수정했지만 잔여 가능성) → 한 번 더 grep 필요
- runner.ts 에러 메시지 "AI 연결 오류" / "통신 장애" 혼용 — 통일

---

## 🟢 MEDIUM — 운영 품질·UX (배포 후 단계적)

### M-1. SSE 인메모리 버스 → 다중 인스턴스 미지원
**위치:** `lib/sse/bus.ts`
**문제:** Vercel/서버리스에서는 인스턴스가 여러 개 → 사용자 A가 인스턴스1에 SSE 연결, runner가 인스턴스2에서 publish → 이벤트 누락
**조치:** 배포 시 Upstash Redis pub/sub로 교체 (코드 30줄 수준)

### M-2. 로그/감사 로깅 부족
- `agent_logs` 있음 (good)
- `admin_logs` 테이블 있음 (good) — 단 어드민 작업이 실제로 기록되는지 확인 필요
- **로그인 성공/실패 로그 없음** → 침입 감지 불가
- **결제 관련 IP/UserAgent 미기록** → 분쟁 시 입증 불가
**조치:** `auth_events` (login_success/login_fail/password_change 등) 테이블 추가 + IP·UA 기록

### M-3. 회원가입 시 이메일 인증 없음
**문제:** 가짜 이메일로 가입 가능 → 알림/영수증 발송 불가
**조치:** Resend/Mailgun으로 이메일 인증 코드 발송 → 인증 전엔 자동 임무 비활성화

### M-4. 회원 탈퇴 / 데이터 삭제 흐름 부재
**문제:** 개인정보처리방침엔 "삭제 가능"이라 적혀 있을 가능성 높지만 코드엔 탈퇴 API/UI 없음. GDPR/개인정보보호법 위반 소지
**조치:** `/app/settings`에 탈퇴 + 데이터 다운로드 버튼, 30일 유예 후 hard delete

### M-5. 비밀번호 재설정 흐름 없음
**문제:** 분실 시 복구 불가. CS 폭주 + 사용자 이탈
**조치:** /forgot-password → 이메일 토큰 → /reset-password 3단계

### M-6. 스케줄러 SCHEDULER_SECRET 회전 정책 부재
**문제:** `.env`에 평문으로 노출 + 변경 시 모든 cron 재배포 필요
**조치:** 환경변수 + 키 회전 절차 문서화. Vercel Cron은 자체 인증 사용 권장

### M-7. 이용약관/개인정보처리방침 본문이 placeholder 수준
**위치:** `app/terms/page.tsx`, `app/privacy/page.tsx`
**문제:** 결제 시작 시 이 약관에 동의하게 되는데 현재 본문은 한 문단짜리 형식. 분쟁 시 효력 없음
**조치:** 변호사 검토 받은 표준 약관 (네이버/카카오 약관 참고 후 본인 서비스에 맞게 작성). 결제 도입 시 필수

### M-8. 로깅된 비서 응답이 사용자 화면에서만 보이고 검색/필터 불가
**문제:** 어제 마키가 만든 캡션을 다시 찾으려면 무한스크롤. 보관함 + 태그 + 검색 필요 (A-4와 연결)

### M-9. 4 비서별 통계가 더미 (DashboardClient.tsx 게이지 v=92, 97 등 하드코딩)
**위치:** AssistantDetail.tsx의 CREW_MAP.stats
**문제:** "SNS 참여율 부스트 92%"가 매 페이지 동일 → 사용자가 "이거 가짜네" 인식
**조치:** 실 사용 데이터로 계산하거나, 명시적 라벨 ("예시 성과 — 실 데이터 연동 시 변경")로 솔직하게 표기

### M-10. 환경변수/빌드 검증 없음
**조치:** `lib/env.ts`에 Zod 스키마로 필수 env 검증 + 부팅 시 누락 즉시 throw → 운영 사고 사전 차단

---

## 🔵 LOW — 개선 여지 (일반 품질)

- L-1. `lib/claude/client.ts` 에 prompt caching 미사용 — 비용 30~80% 절감 기회
- L-2. `MODEL = "claude-sonnet-4-6"` 하드코딩, 비서별 모델 분리 옵션 없음 (간단 임무는 haiku, 분석 임무는 sonnet 식)
- L-3. SSE 재연결 백오프 5초 고정 — 지수 백오프 권장
- L-4. 유저 프로필 편집 화면 부재 (회원가입 후 카테고리/채널 수정 불가)
- L-5. 알림(이메일/카톡) 발송 인프라 없음 — 승인 대기 60분 후 만료 시 사용자 모름
- L-6. CLAUDE.md에 구버전 정보 (`UpFlow` 표기, Beta 00.02.00) — 다음 이정표 도달 시 갱신 필요

---

## 우선순위 실행 로드맵 (제안)

### Phase 1 — 결제 오픈 전 필수 (CRITICAL 전부)
1. **S-1, S-2, S-3, S-7, S-9** — 인증/입력 보안 강화
2. **S-5** — AI 호출 한도 강제 (이거 없으면 무료 플랜이 의미 없음)
3. **S-10** — PostgreSQL 마이그레이션
4. **S-6** — 실 PG 연동 (포트원 추천: 토스/카카오/카드 한번에)
5. **M-3, M-4, M-5** — 이메일 인증/탈퇴/비번 재설정
6. **M-7** — 약관 정비

### Phase 2 — 비서 성능 점프 (1~2주)
1. **A-1, A-2** — 브랜드/사용자 컨텍스트 주입 (1일이면 끝남, 임팩트 큼)
2. **A-5** — 웹 검색·페이지 fetch 도구 (비서가 "오늘의 트렌드"를 진짜로 알게 됨)
3. **A-4, A-7, A-8** — 결과물 산출 + DB 저장 + 보관함
4. **A-3** — 세션 메모리

### Phase 3 — 스케일·관측 (1개월+)
1. **M-1** — Redis SSE
2. **A-6 / L-1** — 토큰 사용량 추적 + prompt caching
3. **A-9** — 비서간 자동 협업
4. **M-2 / M-10** — 감사 로깅 / env 검증

---

## 즉시 시작 가능한 작업 (사용자 결정 후)
이 리포트의 어느 항목부터 코드로 반영할지 알려주시면 진행합니다. 결제·DB 환경 변경(S-6, S-10)은 호스팅 결정이 필요해 보류 권장이지만, **A-1·A-2·A-4·A-7 (비서 성능 직결)** 과 **S-1·S-5 (보안+호출 한도)** 는 외부 의존 없이 지금 바로 가능합니다.
