import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crewmate AI — 당신의 스토어, 4명의 크루가 운영합니다",
  description: "마키, 데일리, 애디, 페니 — 24시간 일하는 AI 동료들. 마케팅·상세페이지·광고·재무를 한 화면에서, 한 팀처럼.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
