import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LibraryClient from "./LibraryClient";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/app/library");
  return <LibraryClient />;
}
