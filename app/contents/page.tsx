import { Suspense } from "react";
import ContentsPageClient from "./ContentsPageClient";

function ContentsPageSkeleton() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="h-8 w-40 bg-slate-200 rounded-xl animate-pulse mb-2" />
      <div className="h-4 w-24 bg-slate-100 rounded animate-pulse mb-6" />
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 h-24 animate-pulse" />
      <div className="bg-white rounded-2xl border border-slate-200 h-80 animate-pulse" />
    </div>
  );
}

export default function ContentsPage() {
  return (
    <Suspense fallback={<ContentsPageSkeleton />}>
      <ContentsPageClient />
    </Suspense>
  );
}
