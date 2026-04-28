import { CockpitShell } from "@/components/layout/CockpitShell";
import { CockpitPanel } from "@/components/primitives/CockpitPanel";

export const metadata = { title: "개인정보처리방침 — Crewmate AI" };

function TocPanel() {
  return (
    <CockpitPanel title="목차" status="INDEXED" accent="#7e94c8" className="flex-1">
      <div className="space-y-2">
        {["수집 정보", "이용 목적", "보존 기간", "제3자 제공", "이용자 권리", "문의"].map(item => (
          <p key={item} style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#7e94c8" }}>
            › {item}
          </p>
        ))}
      </div>
    </CockpitPanel>
  );
}

export default function PrivacyPage() {
  return (
    <CockpitShell
      sector="SECTOR-7G · ARCHIVES"
      leftConsole={<TocPanel />}
      bootMessage="PRIVACY PROTOCOL v2026.04 · ENCRYPTION: AES-256 · STATUS: COMPLIANT"
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
          개인정보처리방침
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
          <p>Crewmate AI는 이용자의 개인정보를 중요하게 생각하며, 관련 법령을 준수합니다.</p>
          <p><strong style={{ color: "#cfe9ff" }}>수집하는 정보:</strong> 이메일, 이름, 사업자 정보 (서비스 제공 목적)</p>
          <p><strong style={{ color: "#cfe9ff" }}>제3자 제공:</strong> 원칙적으로 제공하지 않으며, 법령에 의한 경우에만 제공합니다.</p>
          <p><strong style={{ color: "#cfe9ff" }}>보존 기간:</strong> 회원 탈퇴 후 즉시 파기 (단, 관련 법령에 따라 보존 필요 시 예외)</p>
          <p><strong style={{ color: "#cfe9ff" }}>문의:</strong> help@crewmate.ai (관제 센터)</p>
        </div>
      </div>
    </CockpitShell>
  );
}
