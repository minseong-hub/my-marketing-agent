import { ContentItem, TemplateType } from "./types";
import { isThisWeekDate, isTodayDate } from "./utils";
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from "date-fns";

// ─── 키워드 기반 자동 분류 ───────────────────────────────────────

const NEW_PRODUCT_KEYWORDS = ["신상품", "오픈", "선공개", "재입고", "첫 출하", "신규"];
const MEMBER_KEYWORDS = ["회원", "우선", "선공개", "혜택", "재구매", "멤버", "전용"];
const URGENT_KEYWORDS = ["마감", "한정", "특가", "돌발", "긴급", "막바지", "시즌"];

function matchesKeywords(content: ContentItem, keywords: string[]): boolean {
  const searchFields = [
    content.title,
    content.coreMessage,
    content.hook,
    ...content.supportPoints,
  ].join(" ");
  return keywords.some((kw) => searchFields.includes(kw));
}

// ─── 1. 오늘 업로드 예정 ────────────────────────────────────────
export function getTodayUploads(contents: ContentItem[]): ContentItem[] {
  return contents
    .filter(
      (c) =>
        isTodayDate(c.scheduledDate) &&
        (c.status === "scheduled" || c.status === "review")
    )
    .sort((a, b) => a.title.localeCompare(b.title));
}

// ─── 2. 이번 주 예정 콘텐츠 ────────────────────────────────────
export function getThisWeekScheduled(contents: ContentItem[]): ContentItem[] {
  return contents
    .filter(
      (c) =>
        isThisWeekDate(c.scheduledDate) &&
        (c.status === "drafting" || c.status === "review" || c.status === "scheduled")
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );
}

// ─── 3. 오픈채팅 우선 발행 예정 ────────────────────────────────
export function getOpenChatPriority(contents: ContentItem[]): ContentItem[] {
  return contents
    .filter(
      (c) =>
        c.platforms.includes("openchat") &&
        c.scheduledDate &&
        (c.status === "scheduled" || c.status === "review")
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );
}

// ─── 4. 신상품 오픈 예정 ───────────────────────────────────────
export function getNewProductContents(contents: ContentItem[]): ContentItem[] {
  return contents.filter(
    (c) =>
      c.templateType === "new_product" ||
      matchesKeywords(c, NEW_PRODUCT_KEYWORDS)
  );
}

// ─── 5. 회원 혜택성 콘텐츠 ─────────────────────────────────────
export function getMemberBenefitContents(contents: ContentItem[]): ContentItem[] {
  return contents.filter(
    (c) =>
      c.templateType === "member_benefit" ||
      c.templateType === "repurchase" ||
      matchesKeywords(c, MEMBER_KEYWORDS)
  );
}

// ─── 6. 돌발특가 / 시즌 마감 ───────────────────────────────────
export function getUrgentContents(contents: ContentItem[]): ContentItem[] {
  return contents.filter(
    (c) =>
      c.templateType === "flash_offer" ||
      c.templateType === "season_end" ||
      matchesKeywords(c, URGENT_KEYWORDS)
  );
}

// ─── 7. 검토 필요 콘텐츠 ───────────────────────────────────────
export function getNeedsReviewContents(contents: ContentItem[]): ContentItem[] {
  return contents
    .filter((c) => c.status === "idea" || c.status === "drafting")
    .sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );
}

// ─── 8. 이번 달 콘텐츠 ─────────────────────────────────────────
export function getThisMonthContents(contents: ContentItem[]): ContentItem[] {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  return contents.filter((c) => {
    try {
      return isWithinInterval(parseISO(c.scheduledDate), { start, end });
    } catch {
      return false;
    }
  });
}

// ─── 대시보드 스마트 요약 전체 ──────────────────────────────────
export interface SmartGroup {
  id: string;
  label: string;
  description: string;
  items: ContentItem[];
  href: string;
  color: string;
  iconLabel: string;
}

export function getSmartGroups(contents: ContentItem[]): SmartGroup[] {
  return [
    {
      id: "today",
      label: "오늘 확인할 콘텐츠",
      description: "오늘 업로드 예정 · scheduled/review",
      items: getTodayUploads(contents),
      href: "/contents?quick=today",
      color: "blue",
      iconLabel: "오늘",
    },
    {
      id: "member",
      label: "회원 우선 오픈 예정",
      description: "회원 혜택형 · 재구매형 · 관련 키워드",
      items: getMemberBenefitContents(contents).filter(
        (c) => c.status !== "published"
      ),
      href: "/contents?templateType=member_benefit",
      color: "violet",
      iconLabel: "회원",
    },
    {
      id: "openchat",
      label: "오픈채팅 먼저 발행",
      description: "오픈채팅 포함 · scheduled/review",
      items: getOpenChatPriority(contents),
      href: "/contents?platform=openchat&status=scheduled",
      color: "amber",
      iconLabel: "채팅",
    },
    {
      id: "needs-review",
      label: "검토가 필요한 콘텐츠",
      description: "아이디어 · 작성중 상태",
      items: getNeedsReviewContents(contents),
      href: "/contents?status=drafting",
      color: "rose",
      iconLabel: "검토",
    },
  ];
}

// ─── URL 쿼리 기반 필터 적용 ────────────────────────────────────
export interface FilterParams {
  quick?: string;         // today | this-week | this-month
  status?: string;
  platform?: string;
  templateType?: string;
}

export function applyFilters(
  contents: ContentItem[],
  params: FilterParams
): ContentItem[] {
  let result = [...contents];

  if (params.quick === "today") {
    result = result.filter((c) => isTodayDate(c.scheduledDate));
  } else if (params.quick === "this-week") {
    result = result.filter((c) => isThisWeekDate(c.scheduledDate));
  } else if (params.quick === "this-month") {
    result = getThisMonthContents(result);
  }

  if (params.status && params.status !== "all") {
    result = result.filter((c) => c.status === params.status);
  }

  if (params.platform && params.platform !== "all") {
    result = result.filter((c) =>
      c.platforms.includes(params.platform as any)
    );
  }

  if (params.templateType && params.templateType !== "all") {
    result = result.filter((c) => c.templateType === params.templateType);
  }

  return result;
}
