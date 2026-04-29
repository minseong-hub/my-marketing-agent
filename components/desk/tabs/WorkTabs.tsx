"use client";

import { TaskRunner } from "../widgets/TaskRunner";
import { DESKS, type DeskAgentId } from "@/data/desks";

/**
 * 비서별 실용 작업 탭 모음.
 * 모든 탭은 TaskRunner 인스턴스로, 입력폼 → AI 호출 → 결과 → 보관함 자동 저장.
 */

const colorOf = (id: DeskAgentId) => ({ accent: DESKS[id].agent.accent, accentDark: DESKS[id].agent.accentDark });

// =============== 마키 (마케팅 — SNS 콘텐츠 / 캡션 / 채널 운영) ===============

/** 인스타 캡션 자동 */
export function MarkyInstaCaptionTab() {
  const c = colorOf("marky");
  return (
    <TaskRunner
      agentType="marketing"
      kind="content_draft"
      accent={c.accent}
      accentDark={c.accentDark}
      title="인스타 캡션 자동 작성"
      description="상품·주제 한 줄 입력 → 마키가 인스타 톤으로 캡션 + 해시태그 8~12개를 즉시 작성합니다."
      fields={[
        { key: "topic", label: "캡션 주제", placeholder: "예: 가을 신상 라운드 니트 입고 알림", required: true },
        { key: "tone", label: "톤", type: "select", required: false,
          options: [
            { value: "감성형", label: "감성형 (분위기·감성 강조)" },
            { value: "정보형", label: "정보형 (혜택·스펙 위주)" },
            { value: "유머형", label: "유머형 (밈·드립 활용)" },
            { value: "친근형", label: "친근형 (친구처럼)" },
          ] },
        { key: "etc", label: "추가 메모 (선택)", placeholder: "할인율·기간·금기 표현 등", required: false },
      ]}
      buildPrompt={(v) => `다음 주제로 인스타그램 피드 캡션을 작성해 주세요.

주제: ${v.topic}
${v.tone ? `톤: ${v.tone}` : ""}
${v.etc ? `메모: ${v.etc}` : ""}

요구사항:
- 한국어, 100~180자
- 적절한 이모지 2~4개
- 줄바꿈 활용해서 모바일 가독성 좋게
- 마지막 줄에 해시태그 8~12개 (#가을룩 같은 트래픽 태그 + 브랜드 차별화 태그 혼합)
- 스크롤 멈추는 첫 한 줄(후킹) 필수`}
      buildSaveTitle={(v) => `인스타 캡션: ${v.topic.slice(0, 40)}`}
      exampleHint="결과는 자동으로 보관함에 저장됩니다."
    />
  );
}

/** 블로그 발행 자동 */
export function MarkyBlogTab() {
  const c = colorOf("marky");
  return (
    <TaskRunner
      agentType="marketing"
      kind="blog_post"
      accent={c.accent}
      accentDark={c.accentDark}
      title="블로그 글 자동 작성"
      description="주제·키워드 입력 → 마키가 SEO 친화 블로그 글 1편(800~1200자)을 작성합니다. 발행 전 검토 후 복사해 붙여넣기."
      fields={[
        { key: "topic", label: "글 주제", placeholder: "예: 가을 출근룩 코디 가이드 7가지", required: true },
        { key: "keywords", label: "타겟 키워드", placeholder: "예: 가을 출근룩, 30대 직장인 패션, 베이직 코디", required: true },
        { key: "audience", label: "타겟 독자", placeholder: "예: 25~34세 여성 직장인", required: false },
        { key: "etc", label: "추가 메모", placeholder: "포함하고 싶은 상품·링크·금기 표현", required: false, type: "textarea", rows: 2 },
      ]}
      buildPrompt={(v) => `다음 조건으로 네이버 블로그·티스토리에 발행 가능한 글 1편을 작성해 주세요.

주제: ${v.topic}
타겟 키워드: ${v.keywords}
${v.audience ? `타겟 독자: ${v.audience}` : ""}
${v.etc ? `추가 메모: ${v.etc}` : ""}

요구사항:
- 800~1200자
- 제목 1개 (검색 노출 최적화 + 흥미 유도)
- 첫 문단은 독자의 페인 포인트 공감
- 본문은 H2 소제목 3~4개로 구분, 각 소제목 아래 2~3문단
- 타겟 키워드 자연스럽게 6~10회 반복 (스팸 금지)
- 마지막 문단은 행동 유도 + 우리 브랜드 자연 언급 (광고색 약하게)
- 마크다운 형식: ## 소제목, **강조**, 리스트는 - 사용`}
      buildSaveTitle={(v) => `블로그: ${v.topic.slice(0, 40)}`}
    />
  );
}

/** 스레드 시리즈 자동 (5포스트) */
export function MarkyThreadsTab() {
  const c = colorOf("marky");
  return (
    <TaskRunner
      agentType="marketing"
      kind="thread_series"
      accent={c.accent}
      accentDark={c.accentDark}
      title="스레드 시리즈 자동 (5포스트)"
      description="하나의 주제를 5개 연결된 스레드 포스트로 풀어 작성합니다. 각 포스트는 500자 이내, 다음 포스트로 이어지는 후킹 포함."
      fields={[
        { key: "topic", label: "시리즈 주제", placeholder: "예: 30대 직장인이 옷 잘 입는 5가지 비결", required: true },
        { key: "etc", label: "각도·메모", placeholder: "어떤 시각으로 풀고 싶은지", required: false, type: "textarea", rows: 2 },
      ]}
      buildPrompt={(v) => `다음 주제로 스레드(Threads) 시리즈 5포스트를 작성해 주세요.

주제: ${v.topic}
${v.etc ? `메모: ${v.etc}` : ""}

요구사항:
- 5포스트 시리즈, 각 포스트 500자 이내
- 1번 포스트는 강력한 후킹 (스크롤 멈추는 첫 줄)
- 2~4번은 하나씩 핵심 메시지 (구체적 예시·수치 포함)
- 5번은 정리 + 행동 유도
- 각 포스트 끝에 다음 포스트로 이어지는 한 줄 (예: "다음 포스트에서 더 자세히 ↓")
- 모든 포스트에 적절한 이모지 1~2개

출력 형식:
[포스트 1]
...
[포스트 2]
...
(이런 식으로 5개)`}
      buildSaveTitle={(v) => `스레드 시리즈: ${v.topic.slice(0, 40)}`}
    />
  );
}

/** 카카오 오픈채팅 공지사항 */
export function MarkyOpenChatTab() {
  const c = colorOf("marky");
  return (
    <TaskRunner
      agentType="marketing"
      kind="openchat_notice"
      accent={c.accent}
      accentDark={c.accentDark}
      title="카카오 오픈채팅 공지 기획"
      description="공지 종류 선택 → 친근한 톤의 카카오 오픈채팅 공지문을 자동 작성합니다."
      fields={[
        { key: "topic", label: "공지 주제", placeholder: "예: 추석 특가 5종 한정 판매", required: true },
        { key: "type", label: "공지 종류", type: "select", required: true,
          options: [
            { value: "신상 출시", label: "신상 출시 알림" },
            { value: "프로모션", label: "프로모션·할인" },
            { value: "재입고", label: "품절 상품 재입고" },
            { value: "이벤트", label: "이벤트·경품" },
            { value: "안내", label: "운영 안내 (배송·휴무 등)" },
          ] },
        { key: "details", label: "세부 정보", placeholder: "기간·할인율·수량·링크 등", required: false, type: "textarea", rows: 3 },
      ]}
      buildPrompt={(v) => `카카오 오픈채팅방 공지문을 작성해 주세요.

주제: ${v.topic}
종류: ${v.type}
세부 정보: ${v.details || "(별도 정보 없음)"}

요구사항:
- 친근하고 개인적인 톤 (친구한테 알려주듯)
- 250자 이내
- 첫 줄은 강력한 한 마디 (이모지 1개 + 후킹)
- 핵심 정보 3가지를 줄바꿈 + 이모지(•⏰📦💸🎁 등)로 시각적 강조
- 마지막 줄에 행동 유도 (예: "💌 댓글로 신청해 주세요")
- 과장 금지, 신뢰감 있게`}
      buildSaveTitle={(v) => `오픈채팅 공지: ${v.topic.slice(0, 40)}`}
    />
  );
}

/** 인플루언서 협업 DM */
export function MarkyInfluencerDMTab() {
  const c = colorOf("marky");
  return (
    <TaskRunner
      agentType="marketing"
      kind="influencer_dm"
      accent={c.accent}
      accentDark={c.accentDark}
      title="인플루언서 협업 DM 자동"
      description="인플루언서 정보 → 첫 협업 제안 DM (칭찬 → 브랜드 소개 → 제안 옵션 → 다음 단계)."
      fields={[
        { key: "influencer", label: "인플루언서 정보", placeholder: "예: 30대 패션 인플루언서 5만 팔로워, 데일리룩 위주", required: true },
        { key: "specifics", label: "그 인플루언서의 최근 콘텐츠", placeholder: "예: 어제 올린 가을 트렌치 코디 포스트", required: false, type: "textarea", rows: 2 },
        { key: "offer", label: "제안 형태", type: "select", required: true,
          options: [
            { value: "무상 협찬", label: "무상 협찬 (제품 제공)" },
            { value: "페이드 협업", label: "페이드 협업 (예산 협의)" },
            { value: "둘 다", label: "둘 다 옵션 제시" },
          ] },
      ]}
      buildPrompt={(v) => `다음 인플루언서에게 첫 협업 제안 DM을 작성해 주세요.

인플루언서: ${v.influencer}
${v.specifics ? `최근 콘텐츠: ${v.specifics}` : ""}
제안 형태: ${v.offer}

요구사항:
- 친근하지만 정중한 톤
- 200자 이내
- 1) 그 인플루언서 콘텐츠를 본 구체적 칭찬 (스팸처럼 느끼지 않게)
- 2) 우리 브랜드/상품 한 줄 소개
- 3) 제안 형태 명시 (${v.offer})
- 4) 다음 단계 안내 (예: "관심 있으시면 답장 부탁드려요")
- 부담 주지 않게, 짧고 명확하게`}
      buildSaveTitle={(v) => `인플루언서 DM: ${v.influencer.slice(0, 40)}`}
    />
  );
}

// =============== 데일리 (상세페이지 — 카피 / SEO / 옵션 / 리뷰) ===============

/** 상세페이지 5섹션 자동 */
export function DaliFiveSectionsTab() {
  const c = colorOf("dali");
  return (
    <TaskRunner
      agentType="detail_page"
      kind="detail_section"
      accent={c.accent}
      accentDark={c.accentDark}
      title="상세페이지 5섹션 자동 작성"
      description="상품 정보 입력 → 후킹/문제/솔루션/사회적증거/CTA 5섹션을 카피 형태로 즉시 작성합니다."
      fields={[
        { key: "product", label: "상품명", placeholder: "예: 가을 베이직 라운드 니트", required: true },
        { key: "features", label: "주요 특징", placeholder: "예: 100% 면, 색상 5종, 봄가을용", required: true, type: "textarea", rows: 2 },
        { key: "price", label: "판매가 (선택)", placeholder: "예: 39000원", required: false },
        { key: "target", label: "타겟 고객", placeholder: "예: 30대 직장인 여성", required: false },
      ]}
      buildPrompt={(v) => `다음 상품의 상세페이지 5섹션을 작성해 주세요.

상품명: ${v.product}
주요 특징: ${v.features}
${v.price ? `판매가: ${v.price}` : ""}
${v.target ? `타겟: ${v.target}` : ""}

요구사항:
- 5섹션 구조 (각각 H2 제목 + 본문)
  ## 1) 후킹 — 첫 화면 (8자 이내 임팩트 카피 + 30자 부연)
  ## 2) 문제 제기 — 타겟의 페인 포인트 (3개 bullet)
  ## 3) 솔루션 — 우리 상품이 해결 (셀링포인트 3개 각각 카피 + 부연)
  ## 4) 사회적 증거 — 후기·수치·검증 (가상이라도 구체적으로)
  ## 5) CTA — 행동 유도 (할인·한정·긴급성 활용)
- 한국 소비자 톤
- 마크다운 형식, 그대로 복사해서 상세페이지에 붙여넣을 수 있게`}
      buildSaveTitle={(v) => `상세페이지 5섹션: ${v.product.slice(0, 40)}`}
    />
  );
}

/** 셀링포인트 3개 자동 */
export function DaliSellingPointsTab() {
  const c = colorOf("dali");
  return (
    <TaskRunner
      agentType="detail_page"
      kind="detail_section"
      accent={c.accent}
      accentDark={c.accentDark}
      title="셀링포인트 3개 카피 자동"
      description="상품 특징 → 8자 임팩트 카피 + 30자 부연 + 3개 셀링포인트 한 번에."
      fields={[
        { key: "features", label: "상품 특징 (콤마 구분)", placeholder: "예: 100% 면, 색상 5종, 1일 배송, 사이즈 교환 무료", required: true, type: "textarea", rows: 3 },
      ]}
      buildPrompt={(v) => `다음 상품 특징에서 상세페이지 상단에 노출할 셀링포인트 3개를 추출해 작성해 주세요.

특징: ${v.features}

요구사항:
- 셀링포인트 3개 (구매 결정에 가장 직결되는 것 우선)
- 각각: 8자 이내 임팩트 카피 + 30자 이내 부연 카피
- 형식:
  ▸ 셀링포인트 1
  [임팩트 카피]
  [부연 카피]

  ▸ 셀링포인트 2
  ...`}
      buildSaveTitle={() => `셀링포인트 카피`}
    />
  );
}

/** SEO 메타 자동 */
export function DaliSEOTab() {
  const c = colorOf("dali");
  return (
    <TaskRunner
      agentType="detail_page"
      kind="seo_meta"
      accent={c.accent}
      accentDark={c.accentDark}
      title="SEO 메타 태그 자동"
      description="상품 정보 → 네이버 검색 최적화 상품명·메타 설명·키워드 태그 자동 생성."
      fields={[
        { key: "product", label: "상품 정보", placeholder: "예: 가을 베이직 라운드 니트, 100% 면, 5색상", required: true, type: "textarea", rows: 2 },
        { key: "category", label: "카테고리", placeholder: "예: 여성 의류 / 니트", required: true },
      ]}
      buildPrompt={(v) => `다음 상품의 네이버 검색·구글 SEO 최적화 메타 태그를 작성해 주세요.

상품: ${v.product}
카테고리: ${v.category}

요구사항:
- 1) 검색 노출용 상품명 — 네이버 스마트스토어 기준 100자 이내, 핵심 키워드 앞쪽 배치
- 2) 메타 설명 — 150~160자, 검색 결과에서 클릭 유도
- 3) 키워드 태그 — 핵심·확장·롱테일 분류, 총 15~20개
- 4) ALT 태그 권장 — 메인 이미지용 60자 이내 한국어
- 형식: 항목별 H2 헤더 + 결과`}
      buildSaveTitle={(v) => `SEO 메타: ${v.product.slice(0, 30)}`}
    />
  );
}

/** 옵션 설명 자동 */
export function DaliOptionsTab() {
  const c = colorOf("dali");
  return (
    <TaskRunner
      agentType="detail_page"
      kind="option_copy"
      accent={c.accent}
      accentDark={c.accentDark}
      title="옵션 설명 카피 자동"
      description="옵션 종류(색상/사이즈/소재) → 각 옵션별 추천 대상 한 줄 카피."
      fields={[
        { key: "options", label: "옵션 목록 (콤마 구분)", placeholder: "예: 블랙, 네이비, 베이지, 카멜, 그레이", required: true, type: "textarea", rows: 2 },
        { key: "type", label: "옵션 종류", type: "select", required: true,
          options: [
            { value: "color", label: "색상" },
            { value: "size", label: "사이즈" },
            { value: "material", label: "소재" },
            { value: "style", label: "스타일" },
            { value: "other", label: "기타" },
          ] },
      ]}
      buildPrompt={(v) => `다음 옵션 각각에 대해 '어떤 사람·상황에 추천' 한 줄 카피(30자 이내)를 작성해 주세요.

옵션 종류: ${v.type}
옵션 목록: ${v.options}

요구사항:
- 색상은 분위기·계절감·코디 추천
- 사이즈는 체형·용도 가이드
- 소재는 사용 환경·관리 팁
- 친근한 톤, 30자 이내
- 형식: "옵션명 — 한 줄 카피"`}
      buildSaveTitle={(v) => `옵션 카피: ${v.type}`}
    />
  );
}

/** 리뷰 답글 5종 */
export function DaliReviewRepliesTab() {
  const c = colorOf("dali");
  return (
    <TaskRunner
      agentType="detail_page"
      kind="review_replies"
      accent={c.accent}
      accentDark={c.accentDark}
      title="리뷰 답글 5종 템플릿"
      description="상품 정보 → ★5/★4/★3/★2/★1 별점별 답글 5종 즉시 복붙 가능."
      fields={[
        { key: "product", label: "상품 정보", placeholder: "예: 가을 라운드 니트, 평균 별점 4.3", required: true, type: "textarea", rows: 2 },
      ]}
      buildPrompt={(v) => `다음 상품의 리뷰 답글 템플릿 5종을 작성해 주세요.

상품: ${v.product}

요구사항:
- 별점별 1개씩 (★5 / ★4 / ★3 / ★2 / ★1)
- 각 80자 이내
- 셀러 톤, 진정성 있게
- 별점 낮을수록 사과·조치 비중 ↑
- 별점 높을수록 감사·구매 유도 ↑
- 형식:
  ## ★5 — 만족 리뷰
  [답글]

  ## ★4 — 대체로 만족
  ...`}
      buildSaveTitle={() => `리뷰 답글 5종`}
    />
  );
}

// =============== 애디 (광고 — 키워드 / 카피 / 진단) ===============

/** 키워드 발굴 자동 */
export function AddyKeywordsTab() {
  const c = colorOf("addy");
  return (
    <TaskRunner
      agentType="ads"
      kind="ad_keywords"
      accent={c.accent}
      accentDark={c.accentDark}
      title="광고 키워드 발굴 자동"
      description="상품·카테고리 → 네이버 SA / 구글 쇼핑광고용 키워드 30~50개 자동 추출 (검색량·CPC 추정 포함)."
      fields={[
        { key: "product", label: "상품 정보", placeholder: "예: 가을 라운드 니트, 30대 직장인 여성", required: true, type: "textarea", rows: 2 },
        { key: "channel", label: "광고 채널", type: "select", required: true,
          options: [
            { value: "naver", label: "네이버 검색광고" },
            { value: "google", label: "구글 쇼핑광고" },
            { value: "both", label: "둘 다" },
          ] },
      ]}
      buildPrompt={(v) => `다음 상품의 ${v.channel === "naver" ? "네이버 검색광고" : v.channel === "google" ? "구글 쇼핑광고" : "네이버 + 구글 광고"}용 키워드 30~50개를 발굴해 주세요.

상품: ${v.product}

요구사항:
- 카테고리별 분류:
  ▸ 핵심 키워드 (검색량 多, CPC 高) 5~8개
  ▸ 확장 키워드 (브랜드+상품) 8~12개
  ▸ 롱테일 키워드 (3단어 이상, CPC 低) 15~25개
- 각 키워드 옆에 추정: 검색량(상/중/하), CPC 범위(원)
- 한국 셀러 평균 기준 (의류·생활용품 CPC 200~800원)
- 표 형식 출력`}
      buildSaveTitle={(v) => `광고 키워드: ${v.product.slice(0, 30)}`}
    />
  );
}

/** 부정 키워드 추출 */
export function AddyNegativeKeywordsTab() {
  const c = colorOf("addy");
  return (
    <TaskRunner
      agentType="ads"
      kind="negative_keywords"
      accent={c.accent}
      accentDark={c.accentDark}
      title="부정(제외) 키워드 자동"
      description="광고 효율 떨어뜨리는 키워드 30개 추출 — 광고 매니저에 그대로 등록."
      fields={[
        { key: "product", label: "상품·가격대", placeholder: "예: 가을 니트, 4~6만원대 프리미엄", required: true, type: "textarea", rows: 2 },
      ]}
      buildPrompt={(v) => `다음 상품 광고에서 효율을 떨어뜨릴 부정(제외) 키워드 30개를 카테고리별로 작성해 주세요.

상품: ${v.product}

요구사항:
- 카테고리별 분류:
  ▸ 가격대 미스매치 (예: 저가·1만원대·만원대)
  ▸ 무관 카테고리
  ▸ 중고·리퍼·리뷰성 (예: 중고, 후기, 리뷰)
  ▸ 경쟁 브랜드명
  ▸ 도매·b2b
- 한 줄에 한 키워드, 카테고리별로 묶음`}
      buildSaveTitle={() => `부정 키워드 30개`}
    />
  );
}

/** 광고 카피 5종 변형 */
export function AddyAdCopyTab() {
  const c = colorOf("addy");
  return (
    <TaskRunner
      agentType="ads"
      kind="ad_copy_variations"
      accent={c.accent}
      accentDark={c.accentDark}
      title="광고 카피 5종 변형"
      description="동일 상품 5개 다른 앵글의 광고 카피 (혜택/문제해결/사회적증거/긴급성/스토리)."
      fields={[
        { key: "product", label: "상품 + 타겟", placeholder: "예: 가을 라운드 니트, 30대 직장 여성, 출퇴근복", required: true, type: "textarea", rows: 2 },
      ]}
      buildPrompt={(v) => `다음 상품에 메타(인스타그램) 광고 카피 5종 변형을 작성해 주세요. 각각 다른 앵글로.

상품·타겟: ${v.product}

요구사항:
- 5개 변형 (서로 다른 앵글):
  ## 1) 혜택형 — "이거 사면 뭐가 좋은지"
  ## 2) 문제 해결형 — "이런 고민 있죠? 해결해 드려요"
  ## 3) 사회적 증거형 — "다른 사람들도 이걸 선택"
  ## 4) 긴급성형 — "지금 안 사면 손해"
  ## 5) 스토리형 — "이 브랜드는 어떻게 시작됐는지"
- 각 변형마다: 헤드라인(30자) + 본문(100자) + CTA + 해시태그 5개
- 한국 셀러 톤, 메타 정책 준수 (최저가/최고 단정 금지)`}
      buildSaveTitle={(v) => `광고 카피 5종: ${v.product.slice(0, 30)}`}
    />
  );
}

/** 예산 분배 시뮬 */
export function AddyBudgetTab() {
  const c = colorOf("addy");
  return (
    <TaskRunner
      agentType="ads"
      kind="budget_sim"
      accent={c.accent}
      accentDark={c.accentDark}
      title="채널별 광고 예산 분배"
      description="월 예산 + 조건 → Meta / 네이버 / 구글 분배 비율 + 예상 ROAS 산출."
      fields={[
        { key: "budget", label: "월 광고 예산 (원)", placeholder: "예: 1000000", required: true },
        { key: "category", label: "카테고리", placeholder: "예: 여성 의류 (니트)", required: true },
        { key: "stage", label: "브랜드 단계", type: "select", required: true,
          options: [
            { value: "신생", label: "신생 (인지도 ↓)" },
            { value: "성장", label: "성장 중" },
            { value: "정착", label: "정착" },
          ] },
      ]}
      buildPrompt={(v) => `월 광고 예산 ${v.budget}원을 다음 조건에서 채널별 분배 시뮬레이션 해 주세요.

카테고리: ${v.category}
브랜드 단계: ${v.stage}

요구사항:
- Meta(인스타·페북), 네이버 검색광고, 구글 쇼핑광고 3채널
- 각 채널: 추천 비율(%), 추천 금액(원), 예상 ROAS 범위
- 한국 의류 평균 ROAS 2.0~3.5x 기준
- 신생은 Meta 비중 ↑ (60%+), 정착은 네이버 ↑
- 표 형식 + 분배 근거 한 단락`}
      buildSaveTitle={(v) => `예산 분배: ${v.category} ${v.budget}원`}
    />
  );
}

// =============== 페니 (재무 — 손익 / 부가세 / 비용 / 환불 정책) ===============

/** 월간 손익 리포트 */
export function PennyMonthlyReportTab() {
  const c = colorOf("penny");
  return (
    <TaskRunner
      agentType="finance"
      kind="finance_report"
      accent={c.accent}
      accentDark={c.accentDark}
      title="월간 손익 리포트 자동"
      description="이번 달 매출·지출 입력 → 핵심 지표 + 다음 달 액션 3가지 작성."
      fields={[
        { key: "data", label: "월간 데이터", placeholder: "예: 매출 1200만, 광고비 150만, 매입 480만, 수수료 110만, 기타 80만", required: true, type: "textarea", rows: 4 },
      ]}
      buildPrompt={(v) => `다음 월간 재무 데이터로 손익 리포트를 작성해 주세요.

데이터: ${v.data}

요구사항:
- 핵심 지표 표:
  ▸ 매출, 매출원가, 매출총이익, 매출총이익률
  ▸ 광고비, 광고비 비중
  ▸ 영업이익, 영업이익률
- 한 단락 평가 (좋은 점 / 주의 점 / 위험)
- 다음 달 우선순위 액션 3가지 (구체적 숫자 포함)
- 모든 금액은 원화 천 단위 콤마, 백분율 소수점 1자리`}
      buildSaveTitle={() => `월간 손익 리포트`}
    />
  );
}

/** 비용 절감 분석 */
export function PennyCostReductionTab() {
  const c = colorOf("penny");
  return (
    <TaskRunner
      agentType="finance"
      kind="cost_analysis"
      accent={c.accent}
      accentDark={c.accentDark}
      title="비용 절감 기회 분석"
      description="현재 비용 구조 입력 → 절감 가능 항목 우선순위 + 예상 절감액."
      fields={[
        { key: "expenses", label: "월 비용 항목 (콤마 구분)", placeholder: "예: 광고비 150만, 물류 80만, 플랫폼 수수료 110만, 매입 480만, 외주 30만, 기타 50만", required: true, type: "textarea", rows: 3 },
      ]}
      buildPrompt={(v) => `다음 비용 구조에서 절감 가능 영역을 분석해 주세요.

월 비용: ${v.expenses}

요구사항:
- 비용 비중 분석 표 (큰 순서)
- 절감 가능 후보 3~5개:
  ▸ 항목명
  ▸ 현재 금액 / 절감 후 예상 금액 / 절감 폭 (% / 원)
  ▸ 구체적 실행 방법 (어떻게 줄일지)
- 우선순위 (영향 × 실행 용이성)
- 한 단락 종합 코멘트`}
      buildSaveTitle={() => `비용 절감 분석`}
    />
  );
}

/** 부가세 신고 도우미 */
export function PennyVatTab() {
  const c = colorOf("penny");
  return (
    <TaskRunner
      agentType="finance"
      kind="vat_helper"
      accent={c.accent}
      accentDark={c.accentDark}
      title="부가세 신고 체크리스트"
      description="조건 입력 → 신고 직전 챙겨야 할 자료·확인 사항 자동 정리."
      fields={[
        { key: "quarter", label: "신고 분기", type: "select", required: true,
          options: [
            { value: "1Q", label: "1분기 (1~3월)" },
            { value: "2Q", label: "2분기 (4~6월)" },
            { value: "3Q", label: "3분기 (7~9월)" },
            { value: "4Q", label: "4분기 (10~12월)" },
          ] },
        { key: "type", label: "사업자 유형", type: "select", required: true,
          options: [
            { value: "general", label: "일반과세자" },
            { value: "simple", label: "간이과세자" },
          ] },
        { key: "channels", label: "판매 채널", placeholder: "예: 스마트스토어, 자사몰, 카페24", required: false },
      ]}
      buildPrompt={(v) => `다음 조건의 부가세 신고 직전 체크리스트를 작성해 주세요.

분기: ${v.quarter}
사업자 유형: ${v.type === "general" ? "일반과세자" : "간이과세자"}
판매 채널: ${v.channels || "(미입력)"}

요구사항:
- 1) 매출 자료 (채널별 챙길 것)
- 2) 매입 자료 (세금계산서 / 카드매출전표 / 현금영수증)
- 3) 광고비·물류비 등 비용 영수증
- 4) 신고 직전 확인할 누락 가능성
- 5) 자주 빼먹는 항목 (분기 마지막 주 결제 등)
- 항목별 ✓ 체크박스 형식
- 마지막 줄: "정확한 신고는 세무사·국세청 홈택스 확인 필수"`}
      buildSaveTitle={(v) => `부가세 체크리스트 ${v.quarter}`}
    />
  );
}

/** 환불 정책 카피 */
export function PennyRefundPolicyTab() {
  const c = colorOf("penny");
  return (
    <TaskRunner
      agentType="finance"
      kind="refund_policy"
      accent={c.accent}
      accentDark={c.accentDark}
      title="환불 정책 카피 자동"
      description="정책 조건 → 상세페이지·약관용 명확한 한국 셀러 톤 카피."
      fields={[
        { key: "policy", label: "환불 정책 조건", placeholder: "예: 단순 변심 7일, 반품비 3000원, 미개봉 한정, 사이즈 교환 1회 무료", required: true, type: "textarea", rows: 3 },
      ]}
      buildPrompt={(v) => `다음 환불 정책을 한국 소비자가 오해 없이 이해할 수 있도록 상세페이지·약관용 텍스트로 정리해 주세요.

정책: ${v.policy}

요구사항:
- 1) 환불 가능 조건
- 2) 환불 불가 조건
- 3) 절차 (1단계 → 2단계 → 3단계)
- 4) 비용 부담 (택배비·차감 등)
- 표·체크리스트 형식 권장
- 친근하지만 법적 모호함 없게
- 마지막에 "고객센터 운영 시간" 언급 자리 표시`}
      buildSaveTitle={() => `환불 정책 카피`}
    />
  );
}

/** 손익 한 줄 진단 */
export function PennyDiagnosisTab() {
  const c = colorOf("penny");
  return (
    <TaskRunner
      agentType="finance"
      kind="finance_diagnosis"
      accent={c.accent}
      accentDark={c.accentDark}
      title="손익 한 줄 진단 (신호등)"
      description="수치 입력 → 한 문단 평가 + 신호등(🟢🟡🔴)으로 즉시 진단."
      fields={[
        { key: "numbers", label: "이번 달 수치", placeholder: "예: 매출 850만 매입 320만 광고 110만 수수료 75만 기타 60만", required: true, type: "textarea", rows: 3 },
      ]}
      buildPrompt={(v) => `다음 한 달 재무 수치를 한 문단(80~120자)으로 평가하고 신호등을 매겨 주세요.

수치: ${v.numbers}

요구사항:
- 신호등 1개 (🟢 안정 / 🟡 주의 / 🔴 위험)
- 영업이익률 15%+ → 🟢, 5~15% → 🟡, 5% 미만 → 🔴
- 한 문단(80~120자)으로 핵심만
- 형식: "🟢 안정 — [내용]" 같이 첫 글자에 신호등`}
      buildSaveTitle={() => `손익 진단`}
    />
  );
}
