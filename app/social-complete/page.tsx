import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySocialPending, PENDING_COOKIE } from "@/lib/social-auth";
import SocialCompleteForm from "./SocialCompleteForm";

export const metadata = { title: "프로필 완성 — UpFlow" };

export default async function SocialCompletePage() {
  const cookieStore = await cookies();
  const pendingToken = cookieStore.get(PENDING_COOKIE)?.value;
  if (!pendingToken) redirect("/signup");

  const pending = await verifySocialPending(pendingToken);
  if (!pending) redirect("/signup");

  return (
    <SocialCompleteForm
      provider={pending.provider}
      email={pending.email}
      name={pending.name}
    />
  );
}
