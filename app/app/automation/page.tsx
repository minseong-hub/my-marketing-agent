import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AutomationHubClient from "./AutomationHubClient";

export const dynamic = "force-dynamic";

export default async function AutomationPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/app/automation");
  return <AutomationHubClient />;
}
