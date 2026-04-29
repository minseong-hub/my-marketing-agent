import { db } from "@/lib/db";

/**
 * 비서 시스템 프롬프트 뒤에 자동으로 추가되는 사용자/브랜드/상품 컨텍스트.
 * 한 번의 회원가입/브랜드 입력으로 모든 비서가 즉시 활용할 수 있게 만듭니다.
 */
export function buildUserContextBlock(userId: string): string {
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

  // 브랜드 프로필
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
  return lines.join("\n");
}
