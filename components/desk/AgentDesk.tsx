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
import { DESKS, type DeskAgentId } from "@/data/desks";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';

function Specialty({ agentId }: { agentId: DeskAgentId }) {
  if (agentId === "marky") return <MarkyAudience />;
  if (agentId === "dali") return <DaliPageHealth />;
  if (agentId === "addy") return <AddyROAS />;
  return <PennyLedger />;
}

function StubTab({ tab }: { tab: string }) {
  const a = DESKS.marky.agent;
  return (
    <div style={{
      border: "1px dashed #1f2a6b",
      padding: "60px 40px",
      textAlign: "center",
      fontFamily: FONT_KR,
      color: "#7e94c8",
    }}>
      <p style={{ fontSize: 16, fontWeight: 600, color: "#cfe9ff", marginBottom: 8 }}>
        「{tab}」 탭은 콘셉트 단계
      </p>
      <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
        오버뷰 탭에서 전체 흐름을 먼저 확인해 주세요.<br />
        이 탭은 곧 실 데이터 + 위젯이 채워질 예정입니다.
      </p>
    </div>
  );
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
                <StubTab tab={activeTab} />
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
      <ToastHost />
    </div>
  );
}
