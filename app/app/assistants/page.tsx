import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AssistantsDashboardClient from "./AssistantsDashboardClient";

export default async function AssistantsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <AssistantsDashboardClient />;
}
