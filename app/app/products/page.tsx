import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/app/products");
  return <ProductsClient />;
}
