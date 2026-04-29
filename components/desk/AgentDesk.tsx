"use client";

import { useState } from "react";
import { DeskTopBar } from "./DeskTopBar";
import { DeskSidebar } from "./DeskSidebar";
import { DeskTitleBar } from "./DeskTitleBar";
import { ToastHost } from "./ToastHost";
import { CalendarTimeline } from "./widgets/CalendarTimeline";
import { QuickStats } from "./widgets/QuickStats";
import { NowWorkingCard } from "./widgets/NowWorkingCard";
import { Timeline } from "./widgets/Timeline";
import { IncidentLog } from "./widgets/IncidentLog";
import { TeamHandoff } from "./widgets/TeamHandoff";
import { MarkyAudience } from "./widgets/specialty/MarkyAudience";
import { DaliPageHealth } from "./widgets/specialty/DaliPageHealth";
import { AddyROAS } from "./widgets/specialty/AddyROAS";
import { PennyLedger } from "./widgets/specialty/PennyLedger";
import { ChatBubble } from "./chat/ChatBubble";
import { CommandPalette } from "@/components/system/CommandPalette";
import {
  MarkyContentCalendarTab, MarkyAudienceTab,
  DaliTemplatesTab, DaliABTab,
  AddyCampaignsTab, AddySpendTab,
  PennyLedgerTab, PennyTaxTab,
  HistoryTab, PerformanceTab, KnowledgeTab, TeamTab, ReportsTab, SettingsTab,
} from "./tabs/DeskTabs";
import { type DeskAgentId } from "@/data/desks";

function Specialty({ agentId }: { agentId: DeskAgentId }) {
  if (agentId === "marky") return <MarkyAudience />;
  if (agentId === "dali") return <DaliPageHealth />;
  if (agentId === "addy") return <AddyROAS />;
  return <PennyLedger />;
}

function TabContent({ agentId, tab }: { agentId: DeskAgentId; tab: string }) {
  // Special tabs (비서별)
  if (agentId === "marky") {
    if (tab === "콘텐츠 캘린더") return <MarkyContentCalendarTab agentId={agentId} />;
    if (tab === "오디언스") return <MarkyAudienceTab agentId={agentId} />;
  }
  if (agentId === "dali") {
    if (tab === "템플릿 갤러리") return <DaliTemplatesTab agentId={agentId} />;
    if (tab === "A/B 테스트") return <DaliABTab agentId={agentId} />;
  }
  if (agentId === "addy") {
    if (tab === "캠페인") return <AddyCampaignsTab agentId={agentId} />;
    if (tab === "지출 모니터") return <AddySpendTab agentId={agentId} />;
  }
  if (agentId === "penny") {
    if (tab === "장부") return <PennyLedgerTab agentId={agentId} />;
    if (tab === "세금·정산") return <PennyTaxTab agentId={agentId} />;
  }
  // BASE tabs (공통)
  if (tab === "히스토리") return <HistoryTab agentId={agentId} />;
  if (tab === "성과 분석") return <PerformanceTab agentId={agentId} />;
  if (tab === "지식 베이스") return <KnowledgeTab agentId={agentId} />;
  if (tab === "팀 협업") return <TeamTab agentId={agentId} />;
  if (tab === "리포트") return <ReportsTab agentId={agentId} />;
  if (tab === "설정") return <SettingsTab agentId={agentId} />;
  return null;
}

export function AgentDesk({ agentId }: { agentId: DeskAgentId }) {
  const [activeTab, setActiveTab] = useState("오버뷰");

  // 비서 전환 시 탭 리셋
  const handleTabChange = (tab: string) => setActiveTab(tab);

  return (
    <div style={{ background: "#060920", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <DeskTopBar activeId={agentId} />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <DeskSidebar agentId={agentId} activeTab={activeTab} onTabChange={handleTabChange} />

        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <DeskTitleBar agentId={agentId} />

          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* 메인 컬럼 */}
            <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto" }}>
              {activeTab === "오버뷰" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* 캘린더 */}
                  <CalendarTimeline agentId={agentId} />

                  {/* 빠른 지표 */}
                  <QuickStats agentId={agentId} />

                  {/* 지금 작업 중 (인버티드 강조) */}
                  <NowWorkingCard agentId={agentId} />

                  {/* 비서별 특화 */}
                  <Specialty agentId={agentId} />

                  {/* 인시던트 */}
                  <IncidentLog agentId={agentId} />
                </div>
              ) : (
                <TabContent agentId={agentId} tab={activeTab} />
              )}
            </div>

            {/* 우측 레일 */}
            <aside style={{
              width: 280, flexShrink: 0,
              borderLeft: "1px solid #1f2a6b",
              background: "#060920",
              padding: "20px 16px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}>
              <Timeline agentId={agentId} />
              <TeamHandoff agentId={agentId} />
            </aside>
          </div>
        </main>
      </div>

      <ChatBubble agentId={agentId} />
      <CommandPalette />
      <ToastHost />
    </div>
  );
}
