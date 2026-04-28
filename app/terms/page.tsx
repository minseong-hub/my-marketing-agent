import { CockpitShell } from "@/components/layout/CockpitShell";
import { CockpitPanel } from "@/components/primitives/CockpitPanel";

export const metadata = { title: "이용약관 — Crewmate AI" };

const TOC_ITEMS = ["제1조 목적", "제2조 정의", "제3조 이용계약", "제4조 서비스 제공", "제5조 이용자 의무"];

function TocPanel() {
  return (
    <CockpitPanel title="목차" status="INDEXED" accent="#7e94c8" className="flex-1">
      <div className="space-y-2">
        {TOC_ITEMS.map(item => (
          <p key={item} style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#7e94c8" }}>
            › {item}
          </p>
        ))}
      </div>
    </CockpitPanel>
  );
}

export default function TermsPage() {
  return (
    <CockpitShell
      sector="SECTOR-7G · ARCHIVES"
      leftConsole={<TocPanel />}
      bootMessage="LEGAL ARCHIVE LOADED · TERMS v2026.04 · JURISDICTION: KOREA"
    >
      <div style={{ padding: "32px 28px", maxWidth: 720 }}>
        <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#4a5a8a", marginBottom: 8 }}>
          최종 업데이트: 2026년 4월
        </p>
        <h1
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "clamp(12px, 1.6vw, 16px)",
            color: "#cfe9ff",
            textShadow: "3px 3px 0 #8a2877",
            marginBottom: 28,
          }}
        >
          이용약관
        </h1>
        <div
          style={{
            fontFamily: '"IBM Plex Sans KR", sans-serif',
            fontSize: 14,
            color: "#7e94c8",
            lineHeight: 1.9,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <p>Crewmate AI 서비스를 이용해 주셔서 감사합니다. 본 약관은 서비스 이용에 관한 기본 사항을 규정합니다.</p>
          <p>서비스를 이용하시면 본 약관에 동의하신 것으로 간주됩니다.</p>
          <p>서비스 이용 중 문제가 발생하면 관제 센터(help@crewmate.ai)로 연락해 주세요.</p>
          <p style={{ fontSize: 12, color: "#4a5a8a" }}>※ 본 약관은 한국 법률을 준거법으로 합니다.</p>
        </div>
      </div>
    </CockpitShell>
  );
}
