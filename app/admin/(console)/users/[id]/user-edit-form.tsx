"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRow, PlanRow } from "@/lib/db";

export function UserEditForm({ user, plans }: { user: UserRow; plans: PlanRow[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: user.name,
    role: user.role,
    status: user.status,
    plan_id: user.plan_id ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          role: form.role,
          status: form.status,
          plan_id: form.plan_id || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setMsg({ type: "err", text: d.error || "저장 실패" });
      } else {
        setMsg({ type: "ok", text: "저장되었습니다." });
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  const cls = "w-full h-10 px-3 rounded-lg border border-slate-200 text-base bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-slate-700 mb-1 block">이름</label>
        <input className={cls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">역할</label>
          <select className={cls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">상태</label>
          <select className={cls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">active</option>
            <option value="suspended">suspended</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-700 mb-1 block">요금제</label>
        <select className={cls} value={form.plan_id} onChange={(e) => setForm({ ...form, plan_id: e.target.value })}>
          <option value="">(없음)</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · ₩{p.price_monthly.toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      {msg && (
        <div
          className={
            "rounded-lg px-3 py-2 text-sm " +
            (msg.type === "ok"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200")
          }
        >
          {msg.text}
        </div>
      )}

      <div className="pt-2 flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="h-10 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold disabled:opacity-60"
        >
          {saving ? "저장 중..." : "변경 저장"}
        </button>
      </div>
    </div>
  );
}
