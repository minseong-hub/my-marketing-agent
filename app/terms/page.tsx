import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TERMS_META, TERMS_SECTIONS } from "@/lib/legal-content";

export const metadata = {
  title: "이용약관 — UpFlow",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#145CFF] transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            업플로 홈
          </Link>
          <span className="text-xs text-slate-400 font-medium">UpFlow</span>
        </div>
      </header>

      {/* 본문 */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* 타이틀 */}
        <div className="mb-10 pb-6 border-b border-slate-100">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#145CFF] text-xs font-semibold mb-4">
            법적 문서
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
            {TERMS_META.title}
          </h1>
          <p className="text-sm text-slate-400">
            시행일: {TERMS_META.effectiveDate}
          </p>
        </div>

        {/* 섹션 */}
        <div className="space-y-8">
          {TERMS_SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-[15px] font-bold text-[#145CFF] mb-3">
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.body.map((para, i) => (
                  <p
                    key={i}
                    className="text-sm text-slate-700 leading-relaxed whitespace-pre-line"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* 부칙 */}
        <div className="mt-10 pt-6 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            <span className="font-semibold">부칙</span>: 본 약관은{" "}
            {TERMS_META.effectiveDate}부터 적용됩니다.
          </p>
        </div>

        {/* 하단 링크 */}
        <div className="mt-8 flex items-center gap-4 text-xs text-slate-400">
          <Link href="/privacy" className="hover:text-[#145CFF] transition-colors">
            개인정보처리방침
          </Link>
          <span>·</span>
          <Link href="/" className="hover:text-[#145CFF] transition-colors">
            홈으로
          </Link>
        </div>
      </main>
    </div>
  );
}
