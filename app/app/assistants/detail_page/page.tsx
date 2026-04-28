import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AssistantDetail } from "@/components/agents/AssistantDetail";

const QUICK_TASKS = [
  { label: "🔍 경쟁사 상세페이지 분석", task: "스마트스토어 내 우리 카테고리 상위 판매자 5곳의 상세페이지를 분석해줘. 공통점, 차별화 포인트, 우리가 도입해야 할 요소를 알려줘." },
  { label: "📋 상세페이지 구성안 작성", task: "우리 대표 상품에 맞는 상세페이지 구성안을 작성해줘. 상단 후킹 이미지, 제품 특장점, 사용 방법, 리뷰 섹션 등 전체 구조를 제안해줘." },
  { label: "✍️ 상품 카피라이팅", task: "구매 전환율을 높이는 상품 카피라이팅을 작성해줘. 제목, 핵심 메시지, 혜택 중심 설명, CTA 문구를 포함해서." },
  { label: "🔑 SEO 키워드 추출", task: "우리 상품 카테고리의 네이버 쇼핑 검색 최적화를 위한 핵심 키워드 20개와 롱테일 키워드 10개를 추출해줘." },
  { label: "📈 전환율 개선 분석", task: "현재 상세페이지의 전환율을 높이기 위해 개선해야 할 포인트를 분석하고, 구체적인 개선 방안을 제시해줘." },
];

export default async function DetailPageAssistantPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <AssistantDetail agentType="detail_page" quickTasks={QUICK_TASKS} />;
}
