import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "이용약관 — UpFlow" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <Link href="/" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-6">
          <ChevronLeft className="w-4 h-4" /> 홈으로
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">이용약관</h1>
        <p className="text-sm text-slate-400 mb-8">최종 업데이트: 2026년 4월</p>
        <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed space-y-4">
          <p>업플로(UpFlow) 서비스를 이용해 주셔서 감사합니다. 본 약관은 서비스 이용에 관한 기본 사항을 규정합니다.</p>
          <p>서비스를 이용하시면 본 약관에 동의하신 것으로 간주됩니다.</p>
          <p>문의: help@upflow.kr</p>
        </div>
      </div>
    </div>
  );
}
