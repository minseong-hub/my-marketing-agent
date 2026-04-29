import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { AgentDesk } from "@/components/desk/AgentDesk";
import type { DeskAgentId } from "@/data/desks";

const VALID: DeskAgentId[] = ["marky", "dali", "addy", "penny"];

export const dynamic = "force-dynamic";

export default async function DeskPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect(`/login?next=/desk/${params.id}`);
  if (!VALID.includes(params.id as DeskAgentId)) notFound();
  return <AgentDesk agentId={params.id as DeskAgentId} />;
}
