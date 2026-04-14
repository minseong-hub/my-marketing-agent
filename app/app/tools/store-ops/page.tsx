"use client";

import { motion } from "framer-motion";
import { Store, CheckSquare, CalendarRange, Megaphone, ClipboardList, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const tasks = [
  { label: "상품 상세페이지 제작", done: true },
  { label: "대표 이미지 3종 준비", done: true },
  { label: "SNS 채널 예약 발행", done: false },
  { label: "오픈채팅 공지 발송", done: false },
  { label: "초기 재고 수량 확인", done: false },
];

const promos = [
  { name: "봄맞이 신상품 할인", status: "진행 중", dates: "4/15 ~ 4/21", color: "bg-emerald-100 text-emerald-700" },
  { name: "회원 전용 얼리버드", status: "준비 중", dates: "4/22 ~ 4/28", color: "bg-blue-100 text-blue-700" },
  { name: "5월 가정의 달 기획전", status: "기획 중", dates: "5/1 ~ 5/9", color: "bg-amber-100 text-amber-700" },
];

const opsTasks = [
  { label: "네이버 스마트스토어 상품 업데이트", priority: "high", status: "완료" },
  { label: "쿠팡 상세페이지 이미지 교체", priority: "high", status: "진행 중" },
  { label: "인스타 피드 정리 및 하이라이트 추가", priority: "mid", status: "예정" },
  { label: "Q&A 답변 일괄 처리", priority: "low", status: "예정" },
];

const PRIORITY_COLOR: Record<string, string> = {
  high: "bg-rose-100 text-rose-600",
  mid: "bg-amber-100 text-amber-600",
  low: "bg-slate-100 text-slate-500",
};

export default function StoreOpsTool() {
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div className="p-6 max-w-[960px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-7"
      >
        <div className="flex items-center gap-3 mb-4">
          <Link href="/app/select-tool">
            <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Store Operations</p>
            <h1 className="text-xl font-bold text-slate-800">스토어 운영 자동화</h1>
          </div>
        </div>
        <p className="text-sm text-slate-400 ml-[4.25rem]">
          상품 런칭부터 프로모션, 운영 태스크까지 스토어 전반을 체계적으로 관리하세요.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 런칭 체크리스트 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">런칭 체크리스트</h3>
              <p className="text-[10px] text-slate-400">{doneCount}/{tasks.length} 완료</p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-4">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${(doneCount / tasks.length) * 100}%` }}
            />
          </div>
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.label} className="flex items-center gap-2.5">
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                  task.done ? "bg-emerald-500 border-emerald-500" : "border-slate-300"
                )}>
                  {task.done && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className={cn("text-xs", task.done ? "text-slate-400 line-through" : "text-slate-700 font-medium")}>
                  {task.label}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* 프로모션 플래닝 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.07 }}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">프로모션 플래닝</h3>
          </div>
          <div className="space-y-2.5">
            {promos.map((promo) => (
              <div key={promo.name} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-xs font-semibold text-slate-700 flex-1 leading-snug">{promo.name}</p>
                  <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full ml-2", promo.color)}>
                    {promo.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <CalendarRange className="w-3 h-3" />
                  {promo.dates}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 운영 태스크보드 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.14 }}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">운영 태스크보드</h3>
          </div>
          <div className="space-y-2">
            {opsTasks.map((task) => (
              <div key={task.label} className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5", PRIORITY_COLOR[task.priority])}>
                  {task.priority === "high" ? "긴급" : task.priority === "mid" ? "보통" : "낮음"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 leading-snug">{task.label}</p>
                  <p className="text-[10px] text-slate-400">{task.status}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center justify-center gap-1.5 py-2 rounded-xl hover:bg-blue-50 transition-colors">
            <RefreshCw className="w-3 h-3" /> 태스크 새로고침
          </button>
        </motion.div>
      </div>
    </div>
  );
}
