import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AssistantDetail } from "@/components/agents/AssistantDetail";

const QUICK_TASKS = [
  { label: "🎯 네이버 광고 키워드 추출", task: "우리 스마트스토어 상품에 맞는 네이버 검색광고 키워드를 추출해줘. 핵심 키워드 10개, 롱테일 키워드 20개, 예상 CPC와 경쟁도를 포함해서." },
  { label: "✍️ 광고 소재 3종 세트 제작", task: "네이버 검색광고, 카카오 모먼트, 메타 광고에 맞는 광고 소재를 각각 제작해줘. 제목, 설명문, CTA, 타겟 오디언스를 포함해서." },
  { label: "💰 광고 예산 최적화 플랜", task: "월 100만원 광고 예산을 플랫폼별로 최적 배분하는 전략을 수립해줘. 각 플랫폼의 예상 ROAS와 목표 KPI를 포함해서." },
  { label: "📊 광고 성과 분석 리포트", task: "현재 광고 캠페인의 성과를 분석하고, CTR, CVR, ROAS 기준으로 개선이 필요한 부분을 진단해줘." },
  { label: "🔄 A/B 테스트 설계", task: "광고 효율을 높이기 위한 A/B 테스트 시나리오를 3개 설계해줘. 테스트 변수, 기간, 성공 지표를 포함해서." },
];

export default async function AdsAssistantPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <AssistantDetail agentType="ads" quickTasks={QUICK_TASKS} />;
}
