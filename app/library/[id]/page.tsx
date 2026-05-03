import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CardWorkspaceClient } from "@/components/library/CardWorkspaceClient";

export const dynamic = "force-dynamic";

export default async function LibraryDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect(`/login?next=/library/${params.id}`);
  return <CardWorkspaceClient libraryId={params.id} />;
}
