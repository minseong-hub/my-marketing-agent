/**
 * AI Task Parser — rule-based mock implementation
 * Architecture is designed for LLM integration:
 *   → Replace parseTask() body with an API call to /api/ai/parse-task
 *   → Prompt template in buildPrompt() is ready for OpenAI / Anthropic
 */

export type TaskCategory =
  | "상품 관리"
  | "재고 관리"
  | "상품 업로드 관리"
  | "프로모션 관리"
  | "체크리스트"
  | "이슈 / 알림"
  | "운영 기록"
  | "일정 관리";

export type Urgency = "낮음" | "보통" | "높음" | "긴급";

export type TaskStatus =
  | "해야 할 일"
  | "진행 중"
  | "검토 필요"
  | "완료"
  | "보류";

export interface ParsedTask {
  title: string;
  parsedSummary: string;
  category: TaskCategory;
  relatedProduct?: string;
  relatedSeason?: string;
  dueDate?: string;        // YYYY-MM-DD
  urgency: Urgency;
  status: TaskStatus;
  assignedModule: string;
  assignedModuleHref: string;
  notes?: string;
}

// ─── Known seasonal products ──────────────────────────────────────────────────
const KNOWN_PRODUCTS = [
  "한라봉", "천혜향", "레드향", "황금향", "신비복숭아", "복숭아",
  "성주참외", "참외", "제주감귤", "감귤", "딸기", "수박", "메론",
  "망고", "체리", "블루베리", "포도", "사과", "배", "감",
];

// ─── Category detection rules (ordered by priority) ───────────────────────────
const CATEGORY_RULES: {
  keywords: string[];
  category: TaskCategory;
  module: string;
  href: string;
}[] = [
  {
    keywords: ["재고", "재입고", "품절", "소진", "수량", "보충", "입고", "박스", "재고 부족"],
    category: "재고 관리",
    module: "재고 관리",
    href: "/app/tools/store-ops/inventory",
  },
  {
    keywords: ["업로드", "등록", "올리다", "올려", "안 올린", "미등록", "스마트스토어에", "올라가지", "아직 안"],
    category: "상품 업로드 관리",
    module: "상품 업로드 관리",
    href: "/app/tools/store-ops/uploads",
  },
  {
    keywords: ["할인", "행사", "이벤트", "프로모션", "기획전", "쿠폰", "특가", "세일", "할인행사"],
    category: "프로모션 관리",
    module: "프로모션 관리",
    href: "/app/tools/store-ops/promotions",
  },
  {
    keywords: ["오픈", "런칭", "출시", "준비해", "준비하", "오픈 준비", "시작 준비"],
    category: "체크리스트",
    module: "체크리스트",
    href: "/app/tools/store-ops/checklist",
  },
  {
    keywords: ["이슈", "문제", "오류", "불량", "클레임", "민원", "환불", "반품", "CS"],
    category: "이슈 / 알림",
    module: "이슈 / 알림",
    href: "/app/tools/store-ops/issues",
  },
  {
    keywords: ["메모", "기록", "참고", "남겨", "노트", "히스토리", "지난 시즌", "지난시즌", "작년"],
    category: "운영 기록",
    module: "운영 기록",
    href: "/app/tools/store-ops/history",
  },
  {
    keywords: ["상세페이지", "수정", "이미지", "카피", "분류", "텍스트", "디자인"],
    category: "상품 관리",
    module: "상품 관리",
    href: "/app/tools/store-ops/products",
  },
  {
    keywords: ["일정", "캘린더", "예약", "스케줄", "날짜"],
    category: "일정 관리",
    module: "일정 관리",
    href: "/app/tools/store-ops/schedule",
  },
];

// ─── Prompt builder (for future LLM integration) ──────────────────────────────
export function buildPrompt(rawInput: string): string {
  return `
당신은 온라인 비즈니스 운영 자동화 플랫폼 '업플로'의 운영 업무 파서입니다.
사용자 입력을 JSON 형태로 구조화하세요.

입력: "${rawInput}"

출력 형식:
{
  "title": "업무 제목 (간결하게)",
  "category": "상품 관리|재고 관리|상품 업로드 관리|프로모션 관리|체크리스트|이슈 / 알림|운영 기록|일정 관리",
  "relatedProduct": "상품명 또는 null",
  "relatedSeason": "시즌 정보 또는 null",
  "dueDate": "YYYY-MM-DD 또는 null",
  "urgency": "낮음|보통|높음|긴급",
  "assignedModule": "배분할 모듈명"
}
`.trim();
}

// ─── Date parsing ─────────────────────────────────────────────────────────────
const BASE_DATE = new Date("2026-04-15");

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseDate(text: string): string | undefined {
  const today = BASE_DATE;
  if (text.includes("오늘")) return toDateStr(today);
  if (text.includes("내일")) {
    const d = new Date(today); d.setDate(d.getDate() + 1); return toDateStr(d);
  }
  if (text.includes("다음주") || text.includes("다음 주")) {
    const d = new Date(today); d.setDate(d.getDate() + 7); return toDateStr(d);
  }
  if (text.includes("이번 주") || text.includes("이번주")) {
    const d = new Date(today); d.setDate(d.getDate() + 4); return toDateStr(d);
  }
  if (text.includes("다음 달") || text.includes("다음달")) {
    const d = new Date(today); d.setMonth(d.getMonth() + 1); return toDateStr(d);
  }
  if (text.includes("다음 시즌") || text.includes("다음시즌")) {
    return "2026-06-01";
  }
  const m = text.match(/(\d{1,2})월\s*(\d{1,2})일/);
  if (m) {
    return toDateStr(new Date(today.getFullYear(), parseInt(m[1]) - 1, parseInt(m[2])));
  }
  return undefined;
}

// ─── Field extractors ─────────────────────────────────────────────────────────
function parseUrgency(text: string, category: TaskCategory): Urgency {
  if (text.includes("긴급") || text.includes("즉시") || text.includes("당장")) return "긴급";
  if (text.includes("빨리") || text.includes("오늘") || category === "이슈 / 알림") return "높음";
  if (text.includes("나중에") || text.includes("여유") || text.includes("참고")) return "낮음";
  return "보통";
}

function parseProduct(text: string): string | undefined {
  return KNOWN_PRODUCTS.find((p) => text.includes(p));
}

function parseSeason(text: string): string | undefined {
  if (text.includes("다음 시즌") || text.includes("다음시즌")) return "다음 시즌";
  if (text.includes("작년 시즌") || text.includes("지난 시즌")) return "지난 시즌";
  if (text.includes("이번 시즌") || text.includes("이번시즌")) return "이번 시즌";
  if (text.includes("시즌 종료")) return "시즌 종료";
  if (text.includes("시즌 오픈")) return "시즌 오픈";
  if (text.includes("봄")) return "봄 시즌";
  if (text.includes("여름")) return "여름 시즌";
  if (text.includes("가을")) return "가을 시즌";
  if (text.includes("겨울")) return "겨울 시즌";
  return undefined;
}

function generateTitle(text: string, product?: string, category?: TaskCategory): string {
  const s = text.trim();
  if (s.length <= 28) return s;
  if (product) {
    if (text.includes("오픈") || text.includes("준비")) return `${product} 시즌 오픈 준비`;
    if (text.includes("재고") || text.includes("재입고")) return `${product} 재고 점검`;
    if (text.includes("업로드") || text.includes("등록")) return `${product} 업로드 준비`;
    if (text.includes("할인") || text.includes("행사")) return `${product} 프로모션 기획`;
    if (text.includes("상세페이지") || text.includes("수정")) return `${product} 상세페이지 수정`;
    if (text.includes("메모") || text.includes("참고")) return `${product} 운영 메모`;
    return `${product} 관련 업무`;
  }
  if (category) return `${category} 업무 처리`;
  return s.slice(0, 26) + "…";
}

// ─── Main entry point ─────────────────────────────────────────────────────────
// To connect a real LLM: replace this function body with a fetch to /api/ai/parse-task
// that uses buildPrompt(rawInput) and returns ParsedTask JSON.
export function parseTask(rawInput: string): ParsedTask {
  const text = rawInput.trim();

  // Score each rule by keyword matches
  let best = CATEGORY_RULES.find((r) => r.category === "상품 관리")!;
  let bestScore = 0;
  for (const rule of CATEGORY_RULES) {
    const score = rule.keywords.filter((k) => text.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      best = rule;
    }
  }

  const category = best.category;
  const product = parseProduct(text);
  const season = parseSeason(text);
  const dueDate = parseDate(text);
  const urgency = parseUrgency(text, category);
  const title = generateTitle(text, product, category);

  const summaryParts: string[] = [`[${category}]`];
  if (product) summaryParts.push(`${product} 관련`);
  if (season) summaryParts.push(season);
  if (dueDate) summaryParts.push(`${dueDate}까지`);

  return {
    title,
    parsedSummary: summaryParts.join(" · "),
    category,
    relatedProduct: product,
    relatedSeason: season,
    dueDate,
    urgency,
    status: "해야 할 일",
    assignedModule: best.module,
    assignedModuleHref: best.href,
    notes: text,
  };
}
