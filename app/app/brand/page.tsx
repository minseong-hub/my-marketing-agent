import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import BrandProfileClient from "./BrandProfileClient";

export const dynamic = "force-dynamic";

export default async function BrandProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/app/brand");
  return <BrandProfileClient />;
}
