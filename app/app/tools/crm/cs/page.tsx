"use client";

import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const inquiries = [
  { id: 1, author: "김*수", channel: "스마트스토어", content: "성주참외 3kg 배송 언제 되나요? 주문한 지 이틀 됐는데 송장이 안 떠요.", time: "10분 전", urgent: true, status: "미답변" },
  { id: 2, author: "최*진", channel: "카카오", content: "제품 교환 가능한가요? 일부 상품이 눌려 왔어요.", time: "2시간 전", urgent: true, status: "미답변" },
  { id: 3, author: "오*연", channel: "인스타", content: "재입고 예정 있을까요? 한라봉 5kg 품절이라 아쉬워요.", time: "5시간 전", urgent: false, status: "처리중" },
  { id: 4, author: "박*준", channel: "스마트스토어", content: "사이즈별 당도 차이가 있나요?", time: "어제", urgent: false, status: "미답변" },
  { id: 5, author: "이*은", channel: "오픈채팅", content: "회원 쿠폰 적용이 안 돼요.", time: "어제", urgent: false, status: "완료" },
];
const STATUS: Record<string, string> = {
  "미답변": "bg-rose-50 text-rose-700 border-rose-200",
  "처리중": "bg-blue-50 text-blue-700 border-blue-200",
  "완료": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function CsPage() {
  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <MessageCircle className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mb-0.5">CRM & Reviews</p>
          <h1 className="text-xl font-bold text-slate-800">CS 응답</h1>
        </div>
      </motion.div>

      <div className="space-y-2">
        {inquiries.map((q, i) => (
          <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <GC className={cn("p-4 hover:border-blue-300 transition-all cursor-pointer", q.urgent && "border-amber-200 bg-amber-50")}>
              <div className="flex items-start gap-3">
                {q.urgent && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-bold text-slate-800">{q.author}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">{q.channel}</span>
                    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border", STATUS[q.status])}>{q.status}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-auto"><Clock className="w-2.5 h-2.5" />{q.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">{q.content}</p>
                  {q.status !== "완료" && (
                    <button className="flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-700 font-semibold">
                      <Sparkles className="w-3 h-3" /> AI 답변 초안 생성
                    </button>
                  )}
                </div>
              </div>
            </GC>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
