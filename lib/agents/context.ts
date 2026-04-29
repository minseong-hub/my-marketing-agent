import { db } from "@/lib/db";
import type { ReferenceSample, StyleGuide, StructureTemplate, VisualRef } from "@/lib/db";

/**
 * 비서 시스템 프롬프트 뒤에 자동으로 추가되는 사용자/브랜드/상품 컨텍스트.
 * 한 번의 회원가입/브랜드 입력으로 모든 비서가 즉시 활용할 수 있게 만듭니다.
 *
 * 두 블록으로 분리:
 *  - buildUserContextBlock: 정체성/상품 (자주 변경됨)
 *  - buildReferencePackBlock: 레퍼런스/스타일가이드/템플릿 (변경 적음 — 캐시 적중률 ↑)
 *
 * runner는 buildReferencePackBlock을 ephemeral cache 블록으로,
 * buildUserContextBlock은 일반 system 블록으로 주입.
 */

export function buildUserContextBlock(userId: string, opts?: { agentType?: string }): string {
  const user = db.getUserById(userId);
  if (!user) return "";

  const lines: string[] = [];
  lines.push("\n## [현재 사용자 컨텍스트 — 답변에 반드시 반영]");
  lines.push(`- 브랜드명: ${user.brand_display_name || user.business_name || "(미입력)"}`);
  if (user.business_name && user.business_name !== user.brand_display_name) {
    lines.push(`- 사업체명: ${user.business_name}`);
  }
  lines.push(`- 업종: ${user.industry || "(미입력)"}`);
  lines.push(`- 사업자 형태: ${user.business_type || "(미입력)"}`);

  let salesChannels: string[] = [];
  let productCategories: string[] = [];
  try { salesChannels = JSON.parse(user.sales_channels || "[]"); } catch {}
  try { productCategories = JSON.parse(user.product_categories || "[]"); } catch {}
  if (salesChannels.length) lines.push(`- 판매 채널: ${salesChannels.join(", ")}`);
  if (productCategories.length) lines.push(`- 주요 카테고리: ${productCategories.join(", ")}`);

  // 브랜드 프로필 (정체성 부분만 — 레퍼런스 등은 별도 블록)
  const brand = db.getBrandProfile(userId);
  if (brand) {
    if (brand.brand_voice) lines.push(`- 브랜드 보이스/톤: ${brand.brand_voice}`);
    if (brand.target_audience) lines.push(`- 타겟 고객: ${brand.target_audience}`);
    if (brand.unique_value) lines.push(`- 차별점/USP: ${brand.unique_value}`);
    if (brand.brand_story) lines.push(`- 브랜드 스토리: ${brand.brand_story}`);
    if (brand.do_not_use) lines.push(`- 사용 금지 표현: ${brand.do_not_use}`);
    try {
      const tags = JSON.parse(brand.hashtag_library || "[]");
      if (Array.isArray(tags) && tags.length) {
        lines.push(`- 자주 쓰는 해시태그: ${tags.slice(0, 20).join(", ")}`);
      }
    } catch {}
    try {
      const comp = JSON.parse(brand.competitor_urls || "[]");
      if (Array.isArray(comp) && comp.length) {
        lines.push(`- 경쟁사/벤치마킹 대상: ${comp.slice(0, 10).join(", ")}`);
      }
    } catch {}
  }

  // 활성 상품 (상위 5개만 — 토큰 절약)
  const products = db.listProducts(userId, false).slice(0, 5);
  if (products.length) {
    lines.push("");
    lines.push("## [등록된 상품 (최신 5개)]");
    products.forEach((p, i) => {
      const features = (() => { try { return JSON.parse(p.features || "[]"); } catch { return []; } })();
      const sp = (() => { try { return JSON.parse(p.selling_points || "[]"); } catch { return []; } })();
      const featureLine = features.length ? ` | 특징: ${features.slice(0, 5).join(", ")}` : "";
      const spLine = sp.length ? ` | 셀링포인트: ${sp.slice(0, 3).join(", ")}` : "";
      const priceLine = p.price ? ` | 가격: ${p.price.toLocaleString()}원` : "";
      lines.push(`${i + 1}. ${p.name}${p.category ? ` (${p.category})` : ""}${priceLine}${featureLine}${spLine}`);
    });
  }

  lines.push("");
  lines.push("위 정보가 있으면 그것에 맞춰 답하세요. 일반론보다 이 사용자에 맞춘 구체적 결과물을 우선합니다.");

  // (옵션) 비서별 추가 안내 — 비서가 자기 색깔로 답하도록
  if (opts?.agentType) {
    const tag = AGENT_TAGS[opts.agentType];
    if (tag) lines.push(`\n[현재 비서 역할: ${tag}]`);
  }

  return lines.join("\n");
}

const AGENT_TAGS: Record<string, string> = {
  marketing: "마키 — 마케팅 카피·SNS·콘텐츠 캘린더 전담",
  detail_page: "데일리 — 상세페이지·셀링포인트·SEO 메타 전담",
  ads: "애디 — 메타/네이버 광고 소재·키워드·예산 분배 전담",
  finance: "페니 — 손익·세금·정산·환불 정책 전담",
};

/**
 * 레퍼런스 팩 + 스타일 가이드 + 구조 템플릿을 system 프롬프트로 빌드.
 *
 * 변경이 드물어서 cache_control: ephemeral 블록으로 주입하면
 * 같은 사용자의 반복 호출에서 입력 토큰 비용 ~80% 절감.
 *
 * 토큰 폭증 방지: 전체 12,000자 한도, 레퍼런스는 각 1,500자까지.
 */
export function buildReferencePackBlock(userId: string, opts?: { agentType?: string }): string {
  const brand = db.getBrandProfile(userId);
  if (!brand) return "";

  const samples = parseField<ReferenceSample[]>(brand.reference_samples, []);
  const sg = parseField<StyleGuide>(brand.style_guide, {});
  const tpls = parseField<StructureTemplate[]>(brand.structure_templates, []);
  const visual = parseField<VisualRef[]>(brand.visual_refs, []);

  const filteredTpls = opts?.agentType
    ? tpls.filter((t) => !t.agent_type || t.agent_type === opts.agentType)
    : tpls;

  const hasAny =
    samples.length > 0 ||
    Object.keys(sg).length > 0 ||
    filteredTpls.length > 0 ||
    visual.length > 0;
  if (!hasAny) return "";

  const lines: string[] = [];
  lines.push("## [브랜드 레퍼런스 팩 — 다음 결과물에 반영]");
  lines.push("이 사용자가 좋아하는 톤·구조·시각 레퍼런스입니다. 새 컨텐츠 생성 시 이 결을 흉내 내되,");
  lines.push("문장은 그대로 복제하지 말고 패턴(리듬·길이·이모지·접속사·마무리)만 차용하세요.");
  lines.push("");

  // 1) 스타일 가이드
  if (Object.keys(sg).length > 0) {
    lines.push("### 스타일 가이드");
    if (sg.sentence_length) lines.push(`- 문장 길이: ${labelSentence(sg.sentence_length)}`);
    if (sg.formality) lines.push(`- 격식: ${labelFormality(sg.formality)}`);
    if (sg.emoji_policy) lines.push(`- 이모지: ${labelEmoji(sg.emoji_policy)}`);
    if (sg.tone_keywords?.length) lines.push(`- 톤 키워드: ${sg.tone_keywords.join(", ")}`);
    if (sg.paragraph_pattern) lines.push(`- 단락 구조: ${sg.paragraph_pattern}`);
    if (sg.signature_phrases?.length) {
      lines.push(`- 시그니처 마무리 (가끔 사용): ${sg.signature_phrases.slice(0, 5).join(" / ")}`);
    }
    lines.push("");
  }

  // 2) 레퍼런스 샘플 (상위 6개, 각 1,500자 한도)
  if (samples.length > 0) {
    lines.push("### 레퍼런스 샘플");
    samples.slice(0, 6).forEach((s, i) => {
      const truncated = s.text.length > 1500 ? s.text.slice(0, 1500) + "...(생략)" : s.text;
      lines.push(`[${i + 1}] ${s.label || "(라벨 없음)"}${s.source ? ` · ${s.source}` : ""}`);
      lines.push(truncated);
      lines.push("");
    });
  }

  // 3) 구조 템플릿
  if (filteredTpls.length > 0) {
    lines.push("### 구조 템플릿 (사용자가 선호하는 흐름)");
    filteredTpls.slice(0, 4).forEach((t, i) => {
      const body = t.body.length > 1000 ? t.body.slice(0, 1000) + "..." : t.body;
      lines.push(`[${i + 1}] ${t.name}`);
      lines.push(body);
      lines.push("");
    });
  }

  // 4) 비주얼 레퍼런스 (이미지 생성/카드뉴스 디자인 참고)
  if (visual.length > 0) {
    lines.push("### 비주얼 레퍼런스");
    visual.slice(0, 5).forEach((v, i) => {
      const kw = v.keywords?.length ? ` [${v.keywords.join(", ")}]` : "";
      lines.push(`[${i + 1}] ${v.description}${kw}${v.url ? ` (${v.url})` : ""}`);
    });
    lines.push("");
  }

  // 5) 자가검증 라인 (Quality Gate)
  lines.push("### 자가 검증");
  lines.push("결과물을 출력하기 전 다음을 자체 점검하세요:");
  lines.push("(a) 위 스타일 가이드의 격식·이모지·길이 룰을 지켰는가?");
  lines.push("(b) 레퍼런스 샘플과 결이 비슷한가? (복제 아님 — 패턴 차용)");
  lines.push("(c) 사용 금지 표현이 들어가지 않았는가?");
  lines.push("부족하면 한 번 더 다듬어 출력합니다.");

  // 전체 길이 안전장치
  const out = lines.join("\n");
  return out.length > 12_000 ? out.slice(0, 12_000) + "\n...(레퍼런스 팩 길이 초과로 잘림)" : out;
}

function parseField<T>(s: string | undefined, fallback: T): T {
  if (!s) return fallback;
  try { return JSON.parse(s) as T; } catch { return fallback; }
}

function labelSentence(v: NonNullable<StyleGuide["sentence_length"]>): string {
  return { short: "짧고 임팩트 있게", medium: "중간 길이 (대화체)", long: "길고 풍부하게", mixed: "상황에 따라 혼합" }[v];
}
function labelFormality(v: NonNullable<StyleGuide["formality"]>): string {
  return { casual: "반말/친구톤", polite: "존댓말 (~요/~습니다)", formal: "격식체 (~입니다)" }[v];
}
function labelEmoji(v: NonNullable<StyleGuide["emoji_policy"]>): string {
  return { none: "사용 안 함", minimal: "가끔 (포인트만)", moderate: "적당히 (3~5개)", rich: "풍부하게" }[v];
}
