"use client";

import { useRouter } from "next/navigation";

export function TicketActions({
  id,
  status,
  priority,
}: {
  id: string;
  status: string;
  priority: string;
}) {
  const router = useRouter();

  async function patch(body: any) {
    await fetch(`/api/admin/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    router.refresh();
  }

  const cls =
    "h-8 px-2 rounded-md border border-slate-200 bg-white text-[11px] font-semibold text-slate-600";

  return (
    <div className="inline-flex items-center gap-1.5">
      <select className={cls} defaultValue={priority} onChange={(e) => patch({ priority: e.target.value })}>
        <option value="low">low</option>
        <option value="normal">normal</option>
        <option value="high">high</option>
      </select>
      <select className={cls} defaultValue={status} onChange={(e) => patch({ status: e.target.value })}>
        <option value="open">open</option>
        <option value="pending">pending</option>
        <option value="closed">closed</option>
      </select>
    </div>
  );
}
