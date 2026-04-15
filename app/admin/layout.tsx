import type { ReactNode } from "react";

// 관리자 섹션 최상위 레이아웃 — 세션 체크/사이드바는 (console) 그룹에서 처리
// 로그인 페이지(/admin/login)는 이 레이아웃만 거쳐 자기 디자인으로 렌더
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
