import { db } from "@/lib/db";
import { PageHeader, Card, Table, Th, Td } from "@/components/admin/ui";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const settings = db.getSettings();
  const logs = db.listAdminLogs(50);

  return (
    <>
      <PageHeader title="시스템 설정" description="브랜드 / 보안 / 운영 설정" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">시스템 설정</h2>
          <SettingsForm initial={settings} />
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-bold text-slate-900 mb-2">보안 가이드</h2>
          <ul className="text-sm text-slate-600 space-y-2 mt-3 list-disc pl-4">
            <li>관리자 쿠키는 httpOnly + sameSite=strict + 12h 만료로 설정되어 있습니다.</li>
            <li>비밀번호는 bcrypt(cost=12) 해시 저장합니다.</li>
            <li>2FA(TOTP) 연결 지점이 준비되어 있습니다 — <code>two_factor_required</code> 활성화 시 로그인에 OTP 검증 로직을 연결하세요.</li>
            <li>IP 화이트리스트는 쉼표로 구분된 목록을 <code>admin_ip_allowlist</code>에 입력하면 적용됩니다. 비어 있으면 모든 IP 허용.</li>
            <li>모든 관리자 액션은 <code>admin_logs</code> 테이블에 기록됩니다.</li>
          </ul>
        </Card>
      </div>

      <Card>
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">관리자 감사 로그 (최근 50건)</h2>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>시각</Th>
              <Th>관리자</Th>
              <Th>액션</Th>
              <Th>대상</Th>
              <Th>상세</Th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <Td className="text-center text-slate-400">기록된 로그가 없습니다.</Td>
                <Td></Td><Td></Td><Td></Td><Td></Td>
              </tr>
            )}
            {logs.map((l) => (
              <tr key={l.id}>
                <Td className="text-sm text-slate-500 whitespace-nowrap">{l.created_at}</Td>
                <Td className="text-slate-700">{l.admin_email}</Td>
                <Td className="font-medium text-slate-900">{l.action}</Td>
                <Td className="text-sm text-slate-500">
                  {l.target_type ? `${l.target_type}:${l.target_id ?? ""}` : "-"}
                </Td>
                <Td className="text-sm text-slate-500 max-w-[320px] truncate">{l.detail ?? ""}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
