"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save } from "lucide-react";

type Notice = {
  id: string;
  title: string;
  body: string;
  kind: string;
  active: number;
  created_at: string;
};

export function NoticesManager({ initial }: { initial: Notice[] }) {
  const router = useRouter();
  const [list, setList] = useState(initial);
  const [draft, setDraft] = useState({ title: "", body: "", kind: "notice" });

  async function create() {
    if (!draft.title) return;
    await fetch(`/api/admin/notices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setDraft({ title: "", body: "", kind: "notice" });
    router.refresh();
  }

  async function save(n: Notice) {
    await fetch(`/api/admin/notices/${n.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: n.title,
        body: n.body,
        kind: n.kind,
        active: n.active,
      }),
    });
    router.refresh();
  }

  async function del(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const cls = "h-9 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

  return (
    <div>
      <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-2 mb-2">
          <input
            className={cls}
            placeholder="제목"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
          <select
            className={cls}
            value={draft.kind}
            onChange={(e) => setDraft({ ...draft, kind: e.target.value })}
          >
            <option value="notice">공지</option>
            <option value="banner">상단 배너</option>
            <option value="maintenance">점검 안내</option>
          </select>
        </div>
        <textarea
          className="w-full min-h-[72px] p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
          placeholder="본문"
          value={draft.body}
          onChange={(e) => setDraft({ ...draft, body: e.target.value })}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={create}
            className="h-9 px-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" /> 공지 추가
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {list.length === 0 && (
          <div className="text-sm text-slate-400 text-center py-10">등록된 공지가 없습니다.</div>
        )}
        {list.map((n, idx) => (
          <div key={n.id} className="border border-slate-200 rounded-xl p-4 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px_auto] gap-2 mb-2">
              <input
                className={cls + " font-semibold"}
                value={n.title}
                onChange={(e) => {
                  const next = [...list];
                  next[idx] = { ...n, title: e.target.value };
                  setList(next);
                }}
              />
              <select
                className={cls}
                value={n.kind}
                onChange={(e) => {
                  const next = [...list];
                  next[idx] = { ...n, kind: e.target.value };
                  setList(next);
                }}
              >
                <option value="notice">공지</option>
                <option value="banner">상단 배너</option>
                <option value="maintenance">점검 안내</option>
              </select>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={n.active === 1}
                  onChange={(e) => {
                    const next = [...list];
                    next[idx] = { ...n, active: e.target.checked ? 1 : 0 };
                    setList(next);
                  }}
                />
                활성
              </label>
            </div>
            <textarea
              className="w-full min-h-[64px] p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
              value={n.body}
              onChange={(e) => {
                const next = [...list];
                next[idx] = { ...n, body: e.target.value };
                setList(next);
              }}
            />
            <div className="flex justify-between items-center mt-2">
              <div className="text-[11px] text-slate-400">등록 {n.created_at}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => del(n.id)}
                  className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 text-xs text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 삭제
                </button>
                <button
                  onClick={() => save(n)}
                  className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  <Save className="w-3.5 h-3.5" /> 저장
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
