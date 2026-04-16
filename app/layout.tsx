import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "업플로 — 온라인 비즈니스 운영 자동화",
  description: "온라인 쇼핑몰 셀러를 위한 멀티툴 SaaS 플랫폼",
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
