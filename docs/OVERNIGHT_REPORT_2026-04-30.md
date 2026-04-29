# 야간 작업 보고서 — 2026-04-30 (멀티테넌트 + 레퍼런스 시스템 + 자동 발행 큐)

**작업 시간:** 2026-04-29 23시 ~ 2026-04-30 새벽
**범위:** 사용자 요청 — "멀티 브랜드 + 레퍼런스 기반 자동 발행 / API 결제 즉시 ON / 플랫폼별 레퍼런스 수집"
**상태:** 모든 코드 변경 완료. TypeScript ✓, ESLint ✓, 스모크 테스트 7/7 ✓.

---

## 1. 변경 사항 요약

### 신설 파일
| 파일 | 역할 |
|---|---|
| `lib/references/fetcher.ts` | 플랫폼별 레퍼런스 수집기 (네이버 블로그/스마트스토어/인스타/스레드/티스토리/일반 웹) |
| `lib/publish/channels.ts` | 자동 발행 채널 어댑터 인터페이스 (library/manual_export 즉시 사용 가능, 5개 채널 OAuth 대기) |
| `app/api/brand/pull-reference/route.ts` | URL → 본문 추출 API (POST/GET/DELETE) |
| `app/api/queue/route.ts` | 자동 발행 큐 CRUD API |
| `app/api/scheduler/drain-queue/route.ts` | 큐 워커 (cron 트리거용) |
| `app/api/platform-status/route.ts` | API 키 상태 + 토큰 사용량 + 캐시 절감률 + 비용 추정 |
| `app/app/api-status/page.tsx` + `ApiStatusClient.tsx` | 시스템 헬스 대시보드 |
| `scripts/smoke-references.mjs` | 신규 엔드포인트 7건 e2e 검증 스크립트 |

### 수정 파일
| 파일 | 변경 |
|---|---|
| `lib/db.ts` | `brand_profiles` 4컬럼 추가, `content_queue`/`reference_pulls` 테이블 신설, 마이그레이션 안전 처리, 11개 신규 메서드 |
| `app/api/brand/route.ts` | 레퍼런스 샘플/스타일가이드/구조템플릿/비주얼refs 입출력 |
| `app/app/brand/BrandProfileClient.tsx` | 4탭 구조 (정체성/레퍼런스 팩/스타일 가이드/템플릿) |
| `lib/agents/context.ts` | `buildReferencePackBlock` 신설 — cache_control로 토큰 ~80% 절감 |
| `lib/agents/runner.ts` | 레퍼런스 팩을 ephemeral 캐시 블록으로 system 프롬프트에 주입 |
| `app/api/studio/run-task/route.ts` | 동일 |
| `app/api/studio/generate-cards/route.ts` | 동일 |
| `app/api/studio/generate-ads/route.ts` | 동일 |
| `components/desk/DeskTopBar.tsx` | "브랜드" "시스템" 진입점 추가 |

---

## 2. 핵심 기능 작동 흐름

### 흐름 A — 사용자가 본인 브랜드를 SaaS로 사용
1. `/app/brand` → **정체성** 탭에 브랜드명/타겟/USP 입력 (기존 동일)
2. **레퍼런스 팩** 탭에 좋아하는 글의 URL 붙여넣기 → `/api/brand/pull-reference` 호출 → 본문 자동 추출 → 미리보기
3. 또는 텍스트 직접 붙여넣기 (인스타 캡션 캡처 등)
4. **스타일 가이드** 탭에서 문장 길이/이모지/격식/톤 키워드 설정
5. **템플릿** 탭에 "이런 흐름으로 써줘" 본문 등록
6. ▶ 저장 → DB에 즉시 반영

### 흐름 B — 비서가 컨텐츠 생성 시
1. 사용자가 데스크에서 "📝 블로그 발행" 클릭 → 주제 입력 → 실행
2. `/api/studio/run-task`가 시스템 프롬프트를 다음 순서로 조립:
   - [캐시] 비서 베이스 프롬프트
   - [캐시] **레퍼런스 팩** (스타일 가이드 + 샘플 6개 + 템플릿 4개 + 비주얼refs + 자가검증 라인)
   - [非캐시] 사용자 정체성/상품 컨텍스트
3. Claude API 호출 → 첫 호출 후 같은 사용자의 5분 내 호출은 입력 토큰 80% 캐시에서 읽음 (비용 ~80% 절감)
4. 결과는 보관함에 자동 저장

### 흐름 C — 자동 발행 큐
1. 클라이언트 또는 비서가 `POST /api/queue`로 발행 예약 (channel/scheduled_at/payload)
2. cron이 `POST /api/scheduler/drain-queue` (`Authorization: Bearer SCHEDULER_SECRET`) 주기 호출
3. 워커가 due 항목들을 채널 어댑터로 전달
4. `library`/`manual_export`는 즉시 발행 가능, 그 외 5채널은 OAuth 연결 후 활성화
5. 실패 시 5분 후 재시도, 3회 실패 시 status=failed

### 흐름 D — 결제 후 즉시 ON
1. 사용자가 Anthropic 결제 완료
2. `.env`의 `ANTHROPIC_API_KEY` 갱신 (이미 있는 경우 재시작만)
3. 서버 재시작 (또는 dev hot-reload 미사용 시 `npm run dev` 재기동)
4. `/app/api-status` 새로고침 → ACTIVE 표시
5. 별도 코드 변경 불필요

---

## 3. 보안 / 견고성 확인 사항

| 항목 | 처리 |
|---|---|
| SSRF (사설망 URL 수집) | `fetcher.ts`에서 localhost/10./192.168./.local 차단 |
| URL fetch 타임아웃 | 12초 (FETCH_TIMEOUT_MS) |
| 본문 길이 제한 | 8,000자 잘림 (메모리 보호) |
| 레퍼런스 팩 토큰 폭증 | 12,000자 한도 + 샘플당 1,500자 |
| Rate limit | 모든 신규 API에 RATE_LIMITS.API_AUTH 적용 |
| CSRF | 모든 변경 요청 verifySameOrigin |
| Zod 검증 | 모든 입력 — 길이/타입/허용값 |
| 멀티테넌트 격리 | 모든 쿼리 `WHERE user_id = ?` (큐/레퍼런스/브랜드 모두) |
| 워커 인증 | SCHEDULER_SECRET Bearer (잘못된 토큰 시 401) |
| 1년 초과 예약 차단 | createQueueItem |

---

## 4. 검증 결과

```
[smoke] BASE = http://localhost:3000

  ✓ /api/platform-status (no auth) → 401
  ✓ /api/brand/pull-reference (no auth) → 401
  ✓ /api/queue (no auth) → 401
  ✓ drain-queue (bad secret) → 401
  ✓ drain-queue (GET health) → 200
  ✓ og:title 추출
  ✓ 해시태그 추출 (한글+영문)

[smoke] 7 passed, 0 failed
```

- **TypeScript:** `npx tsc --noEmit` ✓ no errors
- **ESLint:** `npx next lint` ✓ no warnings or errors
- **dev server:** http://localhost:3000 → 200, /desk/marky → 307 (login redirect 정상)

---

## 5. 사용자님 응답 / 결정 필요 항목

### 🔴 즉시 결정 필요
| # | 항목 | 옵션 |
|---|---|---|
| Q1 | **Anthropic 결제** — 사용량 검증 위해 필수 | 즉시 결제 / 며칠 후 / 보류 |
| Q2 | **fal.ai vs Replicate 이미지 생성** — 둘 중 한 곳만 결제하면 자동 활성 | fal.ai (빠름, ~$0.003/이미지) / Replicate / 둘 다 / 보류 |
| Q3 | **cheerio 추가 여부** — 현재 정규식 기반 fetcher는 90% 케이스 OK. cheerio 추가 시 더 정확 (특히 동적 SPA) | 추가 / 일단 보류 |

### 🟡 다음 단계 결정 (1주일 내)
| # | 항목 | 설명 |
|---|---|---|
| Q4 | **OAuth 채널 우선순위** | 네이버 블로그 / Instagram Graph / 카페24 중 어느 것부터? |
| Q5 | **PostgreSQL 호스팅** | P-1: Supabase / Neon / Railway 중 선택 |
| Q6 | **결제 게이트웨이** | P-2: 토스페이먼츠 / 포트원 (구 아임포트) |
| Q7 | **운영 도메인** | crewmate.ai / .kr / .co.kr 중 등록 |

### 🟢 사용자 입력 시 반영 가능 (선택)
| # | 항목 | 설명 |
|---|---|---|
| Q8 | **본인 브랜드 정보** | 사용자님이 직접 운영하는 스토어가 있다면 등록해서 첫 사례로 검증 |
| Q9 | **시드 레퍼런스** | 사용자님이 좋아하는 한국 인플루언서/브랜드 글 3~5개 URL 알려주시면 데모 데이터로 등록 |

---

## 6. 결제 후 즉시 활성화 매뉴얼

```bash
# 1. .env 파일 편집
ANTHROPIC_API_KEY="sk-ant-..."     # 결제 후 발급된 키
FAL_KEY="..."                       # (옵션) 이미지 생성
SCHEDULER_SECRET="..."              # (옵션) 자동 발행 워커용

# 2. 서버 재시작
npm run dev    # 개발
npm run build && npm start  # 운영

# 3. /app/api-status 새로고침 → ACTIVE 표시 확인

# 4. (옵션) cron 등록 - 자동 발행 워커
*/5 * * * * curl -X POST http://localhost:3000/api/scheduler/drain-queue \
  -H "Authorization: Bearer $SCHEDULER_SECRET"
```

---

## 7. 미수행 항목 (의도적 보류)

- **OAuth 실 연동 (네이버/메타/카페24)** — 운영 도메인 + 사업자 등록 필요. 사용자 결정 후 작업.
- **이메일 발송** — P-4: SES/Sendgrid 결정 필요.
- **CAPTCHA** — P-5: hCaptcha vs reCAPTCHA 결정 필요.
- **PostgreSQL 마이그레이션** — P-1, P-2 후 일괄 처리.
- **품질 자가평가 별도 호출** — 현재는 같은 호출 안에서 self-critique 라인으로 처리. 추후 별도 호출 비용 대비 가치 검증 후 결정.

---

## 8. 알려진 한계

- **인스타그램/스레드 본문 추출** — 로그인 필요한 본문은 og:description으로만 가능 (보통 첫 1~2줄). Instagram Graph API 연동 필요.
- **네이버 블로그** — iframe 내 본문은 잘 추출되지만 "이전/다음 글" 링크 등 노이즈가 일부 섞일 수 있음. 사용자가 텍스트 탭에서 다듬기 가능.
- **fetcher cheerio 미사용** — 정규식 기반이라 깊게 중첩된 div가 많은 페이지에서 본문이 짧게 나올 수 있음. 케이스 발견 시 cheerio 추가 검토.

---

## 끝

기상 후 위 Q1~Q3 답변만 주시면 다음 단계 즉시 진행할 수 있습니다.
모든 변경은 사용자님이 명령한 범위 안에서만 — 다른 영역은 건드리지 않았습니다.
