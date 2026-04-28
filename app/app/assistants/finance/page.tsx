import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AssistantDetail } from "@/components/agents/AssistantDetail";

const QUICK_TASKS = [
  { label: "📊 이번 달 매출 현황 집계", task: `이번 달 스마트스토어와 자사몰의 매출 현황을 집계해줘. 채널별 매출, 전월 대비 증감률, 상위 판매 상품을 분석해줘. 오늘 날짜: ${new Date().toLocaleDateString("ko-KR")}` },
  { label: "💸 지출 항목 자동 분류", task: "이번 달 지출 내역을 카테고리별로 자동 분류해줘. 광고비, 물류비, 플랫폼 수수료, 재료비 등으로 구분하고 각 비중을 분석해줘." },
  { label: "📈 수익성 분석 리포트", task: "브랜드 전체 수익성 분석 리포트를 작성해줘. 매출총이익률, 순이익률, ROAS, 상품별 마진을 포함한 종합 분석." },
  { label: "🔍 비용 절감 기회 발굴", task: "현재 지출 구조를 분석해서 비용을 절감할 수 있는 기회를 찾아줘. 구체적인 절감 방안과 예상 절감액을 포함해서." },
  { label: "📅 월간 재무 요약 보고서", task: "지난달 전체 재무 데이터를 요약한 보고서를 작성해줘. 매출, 지출, 순이익, 주요 이슈, 다음 달 액션 플랜을 포함해서." },
];

export default async function FinanceAssistantPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <AssistantDetail agentType="finance" quickTasks={QUICK_TASKS} />;
}
