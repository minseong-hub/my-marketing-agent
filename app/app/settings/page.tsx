import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { User, Building2, Shield, Sparkles, Package, Archive, CreditCard, LayoutDashboard } from "lucide-react";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/app/settings");

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-slate-800">설정</h1>
        <p className="text-base text-slate-400 mt-0.5">계정·브랜드·보안 + 다른 페이지로 빠른 이동</p>
      </div>

      <div className="space-y-4">
        {/* 계정 정보 */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-base font-semibold text-slate-800">계정 정보</h2>
            </div>
            <div className="space-y-4">
              <InfoRow label="이름" value={session.name ?? "-"} />
              <InfoRow label="이메일" value={session.email ?? "-"} />
              <InfoRow label="역할" value={session.role === "admin" ? "관리자" : "사용자"} />
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
              <h2 className="text-base font-semibold text-slate-800">브랜드 정보</h2>
            </div>
            <div className="space-y-4">
              <InfoRow label="상호명" value={session.businessName ?? "-"} />
              <InfoRow
                label="브랜드 표시명"
                value={session.brandDisplayName ?? "-"}
                badge="앱 전역 표시"
              />
            </div>
            <div className="mt-5 pt-5 border-t border-slate-100">
              <Link
                href="/app/brand"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                브랜드 보이스·타겟·USP 입력
              </Link>
              <p className="text-sm text-slate-500 mt-2">
                비서가 모든 임무에서 자동으로 활용합니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 빠른 이동 */}
        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-semibold text-slate-800 mb-4">빠른 이동</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <QuickLink href="/desk/marky" label="비서 데스크" icon={<LayoutDashboard className="w-5 h-5" />} accent="bg-pink-50 text-pink-700" />
              <QuickLink href="/app/automation" label="자동화 허브" icon={<LayoutDashboard className="w-5 h-5" />} accent="bg-cyan-50 text-cyan-700" />
              <QuickLink href="/app/library" label="보관함" icon={<Archive className="w-5 h-5" />} accent="bg-blue-50 text-blue-700" />
              <QuickLink href="/app/products" label="상품 카탈로그" icon={<Package className="w-5 h-5" />} accent="bg-amber-50 text-amber-700" />
              <QuickLink href="/app/brand" label="브랜드 프로필" icon={<Sparkles className="w-5 h-5" />} accent="bg-violet-50 text-violet-700" />
              <QuickLink href="/app/billing" label="결제 / 플랜" icon={<CreditCard className="w-5 h-5" />} accent="bg-emerald-50 text-emerald-700" />
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
              <h2 className="text-base font-semibold text-slate-800">보안</h2>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3">
              <p className="text-sm text-slate-600 leading-relaxed">
                세션은 7일 동안 유지됩니다. 보안을 위해 공유 기기에서는 사용 후 로그아웃하세요.
              </p>
              <div className="text-xs text-slate-500 space-y-1">
                <p>· 비밀번호 정책: 8자 이상 + 영문/숫자/특수문자 중 2종 이상</p>
                <p>· 로그인 시도 5회 실패 시 15분 잠금</p>
                <p>· 모든 인증 시도는 감사 로그에 기록됩니다</p>
              </div>
            </div>
            <form action="/api/auth/logout" method="post" className="mt-4">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors"
              >
                로그아웃
              </button>
            </form>
          </CardContent>
        </Card>

        {/* 향후 추가 예정 안내 */}
        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-semibold text-slate-800 mb-3">곧 추가될 기능</h2>
            <ul className="text-sm text-slate-500 space-y-2">
              <li>· 비밀번호 변경 (이메일 인증 도입 후)</li>
              <li>· 2단계 인증 (TOTP)</li>
              <li>· 외부 채널 연결 (스마트스토어 / 카페24 / 쇼피파이)</li>
              <li>· 알림 수신 설정 (이메일 / 카카오 알림톡)</li>
              <li>· 회원 탈퇴 + 데이터 다운로드</li>
            </ul>
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
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-base font-semibold text-slate-700">{value}</p>
        {badge && (
          <span className="text-[14px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

function QuickLink({ href, label, icon, accent }: { href: string; label: string; icon: React.ReactNode; accent: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-center"
    >
      <div className={`w-10 h-10 rounded-xl ${accent} flex items-center justify-center`}>
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
    </Link>
  );
}
