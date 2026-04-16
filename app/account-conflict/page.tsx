import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySocialPending, PENDING_COOKIE } from "@/lib/social-auth";
import AccountConflictView from "./AccountConflictView";

export const metadata = { title: "계정 연결 — UpFlow" };

export default async function AccountConflictPage() {
  const cookieStore = await cookies();
  const pendingToken = cookieStore.get(PENDING_COOKIE)?.value;
  if (!pendingToken) redirect("/login");

  const pending = await verifySocialPending(pendingToken);
  if (!pending) redirect("/login");

  return (
    <AccountConflictView
      provider={pending.provider}
      email={pending.email}
    />
  );
}
