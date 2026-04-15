import { getSession } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default async function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <AppSidebar
        brandDisplayName={session!.brandDisplayName}
        userName={session!.name}
      />
      <main className="flex-1 overflow-auto min-w-0">{children}</main>
    </div>
  );
}
