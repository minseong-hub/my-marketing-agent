import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ApiStatusClient from "./ApiStatusClient";

export const dynamic = "force-dynamic";

export default async function ApiStatusPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/app/api-status");
  return <ApiStatusClient />;
}
