import type { ReactNode } from "react";
import { getAdminSession, isOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminConsoleLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const settings = db.getSettings();
  const ownerSet = !!(settings.owner_email || "").trim();
  const owner = isOwner(session.email);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar adminEmail={session.email} />
      <main className="flex-1 min-w-0">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {ownerSet && !owner && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-800">
                <span className="font-bold">제한된 관리자 권한입니다.</span> 요금제 · 시스템 설정 등 민감 작업은 소유자({settings.owner_email})만 수행할 수 있습니다.
              </div>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
