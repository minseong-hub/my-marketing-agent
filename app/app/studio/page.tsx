import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import StudioClient from "./StudioClient";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/app/studio");
  return <StudioClient />;
}
