import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "심플 마케팅 랩 — 브랜드 마케팅 스튜디오",
  description: "브랜드 SNS 콘텐츠 및 마케팅 운영 관리 도구",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
