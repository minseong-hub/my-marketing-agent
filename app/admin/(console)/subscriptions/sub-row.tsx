"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SubRow({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function update(next: string) {
    setBusy(true);
    try {
      await fetch(`/api/admin/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      {status !== "active" && (
        <button
          disabled={busy}
          onClick={() => update("active")}
          className="h-7 px-2.5 text-[11px] font-semibold rounded-md border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
        >
          활성화
        </button>
      )}
      {status !== "paused" && (
        <button
          disabled={busy}
          onClick={() => update("paused")}
          className="h-7 px-2.5 text-[11px] font-semibold rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          일시정지
        </button>
      )}
      {status !== "canceled" && (
        <button
          disabled={busy}
          onClick={() => update("canceled")}
          className="h-7 px-2.5 text-[11px] font-semibold rounded-md border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
        >
          해지
        </button>
      )}
    </div>
  );
}
