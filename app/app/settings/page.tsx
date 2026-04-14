import { getSession } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { User, Building2, Shield } from "lucide-react";

export default async function SettingsPage() {
  const session = await getSession();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-800">설정</h1>
        <p className="text-sm text-slate-400 mt-0.5">계정 및 브랜드 정보를 확인하세요</p>
      </div>

      <div className="space-y-4">
        {/* 계정 정보 */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-800">계정 정보</h2>
            </div>
            <div className="space-y-4">
              <InfoRow label="이름" value={session?.name ?? "-"} />
              <InfoRow label="이메일" value={session?.email ?? "-"} />
            </div>
          </CardContent>
        </Card>

        {/* 브랜드 정보 */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-violet-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-800">브랜드 정보</h2>
            </div>
            <div className="space-y-4">
              <InfoRow label="상호명" value={session?.businessName ?? "-"} />
              <InfoRow
                label="브랜드 표시명"
                value={session?.brandDisplayName ?? "-"}
                badge="앱 전역 표시"
              />
            </div>
          </CardContent>
        </Card>

        {/* 보안 */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Shield className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-800">보안</h2>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-xs text-slate-500">
                세션은 7일 동안 유지됩니다. 보안을 위해 공유 기기에서는 사용 후 로그아웃하세요.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-slate-700">{value}</p>
        {badge && (
          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
