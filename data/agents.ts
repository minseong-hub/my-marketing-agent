export type AgentId = "marky" | "dali" | "addy" | "penny";

export interface ChatLine {
  prompt: string;
  text: string;
  promptColor?: string;
  color?: string;
  speed?: number;
  pause?: number;
}

export interface Agent {
  id: AgentId;
  name: string;
  englishName: string;
  role: string;
  title: string;
  accent: string;
  accentDark: string;
  tagline: string;
  desc: string;
  skills: string[];
  sample: ChatLine[];
}

export const AGENTS: Agent[] = [
  {
    id: "marky",
    name: "마키",
    englishName: "Marky",
    role: "마케팅 비서",
    title: "MARKETING SPECIALIST",
    accent: "#ff4ec9",
    accentDark: "#8a2877",
    tagline: "감성 한 스푼, 데이터 한 트럭.",
    desc: "SNS 콘텐츠 기획부터 캡션 생성, 트렌드 분석까지. 마키가 브랜드 감성을 데이터로 증명합니다.",
    skills: ["인스타그램 캡션", "SNS 스케줄링", "트렌드 분석", "해시태그 최적화", "브랜드 톤 유지"],
    sample: [
      { prompt: "› ", text: "INIT marky.exe ...", color: "#7e94c8", speed: 18 },
      { prompt: "› ", text: "오늘 인스타 캡션 3개 뽑아줘", promptColor: "#ffd84d" },
      { prompt: "» ", text: "🌙 가을밤, 우리집 무드등 스타일 3종 → 아늑함이 문 앞으로 배달됩니다.", promptColor: "#ff4ec9", pause: 600 },
      { prompt: "» ", text: "참여율 +18% 예상. 발행할까요?", promptColor: "#ff4ec9" },
    ],
  },
  {
    id: "dali",
    name: "데일리",
    englishName: "Dali",
    role: "상세페이지 비서",
    title: "DETAIL PAGE ARCHITECT",
    accent: "#5ce5ff",
    accentDark: "#2a86a8",
    tagline: "스크롤이 멈추는 그 페이지.",
    desc: "고객이 구매 버튼을 누르게 만드는 상세페이지. 데일리가 5섹션 구조부터 카피까지 자동 생성합니다.",
    skills: ["상세페이지 기획", "구매 전환 카피", "섹션 구조 설계", "이미지 배치 가이드", "A/B 테스트 시안"],
    sample: [
      { prompt: "› ", text: "INIT dali.exe ...", color: "#7e94c8", speed: 18 },
      { prompt: "› ", text: "텀블러 상세페이지 만들어줘", promptColor: "#ffd84d" },
      { prompt: "» ", text: "5섹션 자동 생성 완료: 후킹 → 문제 → 솔루션 → 증거 → CTA", promptColor: "#5ce5ff", pause: 500 },
      { prompt: "» ", text: "예상 체류시간 +42초. 전환률 +11%p 추정.", promptColor: "#5ce5ff" },
    ],
  },
  {
    id: "addy",
    name: "애디",
    englishName: "Addy",
    role: "광고 전문가",
    title: "ADS OPTIMIZATION ENGINE",
    accent: "#ffd84d",
    accentDark: "#a08820",
    tagline: "ROAS 사냥꾼.",
    desc: "Meta, Google, 네이버 광고를 실시간 분석. 예산 낭비를 잡고 ROAS를 극대화합니다.",
    skills: ["광고 성과 분석", "예산 최적화", "타겟팅 개선", "소재 A/B 테스트", "채널별 ROAS 추적"],
    sample: [
      { prompt: "› ", text: "INIT addy.exe ...", color: "#7e94c8", speed: 18 },
      { prompt: "› ", text: "이번 주 광고 성과 분석해줘", promptColor: "#ffd84d" },
      { prompt: "» ", text: "Meta 4.2x / Google 2.8x / Naver 1.1x → Naver 컷, Meta로 예산 이동 권장", promptColor: "#ffd84d", pause: 700 },
      { prompt: "» ", text: "예산 재배분 시 ROAS 평균 +0.8x 예상. 실행할까요?", promptColor: "#ffd84d" },
    ],
  },
  {
    id: "penny",
    name: "페니",
    englishName: "Penny",
    role: "재무 비서",
    title: "FINANCIAL NAVIGATOR",
    accent: "#66ff9d",
    accentDark: "#2a8a55",
    tagline: "1원도 새지 않게.",
    desc: "매출·비용·순이익을 한눈에. 페니가 재무 흐름을 실시간으로 추적하고 절세 포인트를 찾아냅니다.",
    skills: ["손익 분석", "현금흐름 추적", "비용 카테고리화", "세금 시뮬레이션", "월별 리포트"],
    sample: [
      { prompt: "› ", text: "INIT penny.exe ...", color: "#7e94c8", speed: 18 },
      { prompt: "› ", text: "이번 달 손익 요약해줘", promptColor: "#ffd84d" },
      { prompt: "» ", text: "매출 ₩42,180,000 / 비용 ₩28,940,000 / 순이익 ₩13,240,000", promptColor: "#66ff9d", pause: 600 },
      { prompt: "» ", text: "순이익 +22% MoM. 광고비 비중 12% → 목표 대비 양호.", promptColor: "#66ff9d" },
    ],
  },
];
