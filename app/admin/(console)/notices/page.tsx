import { db } from "@/lib/db";
import { PageHeader, Card } from "@/components/admin/ui";
import { NoticesManager } from "./notices-manager";

export default async function NoticesPage() {
  const notices = db.listNotices();
  return (
    <>
      <PageHeader title="공지 / 배너" description="앱 상단 배너 및 공지사항 관리" />
      <Card className="p-6">
        <NoticesManager initial={notices} />
      </Card>
    </>
  );
}
