import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";

export const metadata: Metadata = {
  title: "산물 콘텐츠 스튜디오",
  description: "산물 브랜드 SNS 콘텐츠 및 오픈채팅 운영 관리 도구",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto min-w-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
