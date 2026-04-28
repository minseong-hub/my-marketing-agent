import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "개인정보처리방침 — UpFlow" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <Link href="/" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-6">
          <ChevronLeft className="w-4 h-4" /> 홈으로
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">개인정보처리방침</h1>
        <p className="text-sm text-slate-400 mb-8">최종 업데이트: 2026년 4월</p>
        <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed space-y-4">
          <p>업플로(UpFlow)는 이용자의 개인정보를 중요하게 생각하며, 관련 법령을 준수합니다.</p>
          <p>수집하는 정보: 이메일, 이름, 사업자 정보 (서비스 제공 목적)</p>
          <p>제3자 제공: 원칙적으로 제공하지 않으며, 법령에 의한 경우에만 제공합니다.</p>
          <p>문의: help@upflow.kr</p>
        </div>
      </div>
    </div>
  );
}
