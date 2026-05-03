import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LibraryGridClient } from "@/components/library/LibraryGridClient";

export const dynamic = "force-dynamic";

export default async function LibraryIndexPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/library");
  return <LibraryGridClient />;
}
