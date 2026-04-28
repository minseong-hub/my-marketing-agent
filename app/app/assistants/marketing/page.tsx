import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AssistantDetail } from "@/components/agents/AssistantDetail";

const QUICK_TASKS = [
  { label: "📊 오늘 인스타그램 트렌드 분석", task: "오늘 인스타그램에서 뷰티/패션 카테고리의 인기 트렌드와 해시태그를 분석하고, 우리 브랜드에 맞는 콘텐츠 아이디어 5개를 제안해줘." },
  { label: "✍️ 이번 주 SNS 콘텐츠 기획", task: "이번 주 월~금 인스타그램과 블로그에 올릴 콘텐츠를 기획해줘. 각 콘텐츠의 주제, 핵심 메시지, 해시태그를 포함해서." },
  { label: "🔥 경쟁사 마케팅 동향 파악", task: "스마트스토어와 자사몰을 운영하는 경쟁 브랜드들의 최근 SNS 마케팅 전략을 분석하고 우리가 참고할 수 있는 인사이트를 제공해줘." },
  { label: "📅 월간 콘텐츠 달력 작성", task: "이번 달 SNS 콘텐츠 달력을 작성해줘. 플랫폼별(인스타그램, 블로그, 스레드) 발행 일정과 주제를 포함해서." },
  { label: "💡 바이럴 콘텐츠 아이디어", task: "현재 트렌드를 반영한 바이럴 가능성이 높은 SNS 콘텐츠 아이디어 3가지를 제안하고, 각각의 예상 반응과 제작 방법을 설명해줘." },
];

export default async function MarketingAssistantPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <AssistantDetail agentType="marketing" quickTasks={QUICK_TASKS} />;
}
