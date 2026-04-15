"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FIELDS: {
  key: string;
  label: string;
  type: "text" | "bool";
  hint?: string;
}[] = [
  { key: "brand_name", label: "브랜드 이름", type: "text" },
  { key: "support_email", label: "고객지원 이메일", type: "text" },
  { key: "owner_email", label: "소유자 이메일 (슈퍼 관리자)", type: "text", hint: "지정된 이메일만 요금제·시스템 설정 변경 가능. 비우면 모든 admin 허용" },
  { key: "maintenance_mode", label: "점검 모드", type: "bool", hint: "true 시 일반 사용자 접근 차단 (향후)" },
  { key: "signup_enabled", label: "회원가입 허용", type: "bool" },
  { key: "two_factor_required", label: "관리자 2FA 필수", type: "bool", hint: "활성화 시 OTP 검증 로직 연결 필요" },
  { key: "admin_ip_allowlist", label: "관리자 IP 화이트리스트", type: "text", hint: "쉼표로 구분. 비우면 전체 허용" },
];

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      await fetch(`/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setMsg("저장되었습니다.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const cls =
    "w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

  return (
    <div className="space-y-4">
      {FIELDS.map((f) => (
        <div key={f.key}>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">
            {f.label}
            {f.hint && <span className="ml-2 text-[11px] text-slate-400 font-normal">{f.hint}</span>}
          </label>
          {f.type === "bool" ? (
            <select
              className={cls}
              value={form[f.key] ?? "false"}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            >
              <option value="true">활성</option>
              <option value="false">비활성</option>
            </select>
          ) : (
            <input
              className={cls}
              value={form[f.key] ?? ""}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          )}
        </div>
      ))}

      {msg && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
          {msg}
        </div>
      )}

      <div className="pt-2 flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="h-10 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold disabled:opacity-60"
        >
          {saving ? "저장 중..." : "설정 저장"}
        </button>
      </div>
    </div>
  );
}
