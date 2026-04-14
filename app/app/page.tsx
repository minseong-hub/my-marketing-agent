import { getSession } from "@/lib/auth";
import DashboardClient from "./DashboardClient";

export default async function AppDashboardPage() {
  const session = await getSession();
  return (
    <DashboardClient
      brandDisplayName={session?.brandDisplayName ?? "브랜드"}
      userName={session?.name ?? ""}
    />
  );
}
