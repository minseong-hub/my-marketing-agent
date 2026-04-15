import { db } from "@/lib/db";
import { PageHeader, Card, Table, Th, Td, Badge } from "@/components/admin/ui";
import { TicketActions } from "./ticket-actions";

export default async function SupportPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const sp = searchParams;
  const tickets = db.listTickets(sp.status);
  const open = tickets.filter((t) => t.status === "open").length;
  const pending = tickets.filter((t) => t.status === "pending").length;
  const closed = tickets.filter((t) => t.status === "closed").length;

  return (
    <>
      <PageHeader title="고객 지원" description="문의 티켓 상태 · 우선순위 관리" />

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { v: "", label: `전체 (${tickets.length})` },
          { v: "open", label: `열림 (${open})` },
          { v: "pending", label: `대기 (${pending})` },
          { v: "closed", label: `완료 (${closed})` },
        ].map((f) => (
          <a
            key={f.v || "all"}
            href={`/admin/support${f.v ? `?status=${f.v}` : ""}`}
            className={
              "h-8 px-3 inline-flex items-center rounded-lg text-xs font-semibold border transition-colors " +
              ((sp.status ?? "") === f.v
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")
            }
          >
            {f.label}
          </a>
        ))}
      </div>

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>제목</Th>
              <Th>요청자</Th>
              <Th>우선순위</Th>
              <Th>상태</Th>
              <Th>생성</Th>
              <Th className="text-right">처리</Th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 && (
              <tr>
                <Td className="text-center text-slate-400">문의가 없습니다.</Td>
                <Td></Td><Td></Td><Td></Td><Td></Td><Td></Td>
              </tr>
            )}
            {tickets.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <Td className="font-medium text-slate-900 max-w-[360px]">
                  <div className="truncate">{t.subject}</div>
                  <div className="text-xs text-slate-500 truncate">{t.body}</div>
                </Td>
                <Td>{t.user_email}</Td>
                <Td>
                  {t.priority === "high" ? (
                    <Badge tone="rose">high</Badge>
                  ) : t.priority === "low" ? (
                    <Badge>low</Badge>
                  ) : (
                    <Badge tone="amber">normal</Badge>
                  )}
                </Td>
                <Td>
                  {t.status === "open" && <Badge tone="blue">open</Badge>}
                  {t.status === "pending" && <Badge tone="amber">pending</Badge>}
                  {t.status === "closed" && <Badge tone="emerald">closed</Badge>}
                </Td>
                <Td className="text-xs text-slate-500">{t.created_at?.slice(0, 16)}</Td>
                <Td className="text-right">
                  <TicketActions id={t.id} status={t.status} priority={t.priority} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
