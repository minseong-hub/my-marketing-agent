"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Eye, MousePointerClick, Calendar, ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const channelStats = [
  { name: "인스타그램", posts: 12, reach: "4,200", engagement: "8.2%", color: "bg-pink-500", trend: "+12%" },
  { name: "블로그", posts: 8, reach: "2,900", engagement: "5.4%", color: "bg-orange-500", trend: "+5%" },
  { name: "스레드", posts: 15, reach: "1,800", engagement: "6.1%", color: "bg-slate-500", trend: "+22%" },
  { name: "오픈채팅", posts: 10, reach: "960", engagement: "14.3%", color: "bg-amber-500", trend: "+3%" },
];

const weeklyHighlights = [
  { label: "최고 도달 콘텐츠", value: "성주참외 신상품 오픈", sub: "인스타 · 도달 2,140명", positive: true },
  { label: "이번 주 업로드", value: "7건", sub: "지난주 대비 +2건", positive: true },
  { label: "평균 참여율", value: "7.8%", sub: "업계 평균 대비 +2.1%p", positive: true },
  { label: "CTA 클릭", value: "183회", sub: "전환율 4.3%", positive: false },
];

const weekDays = ["월", "화", "수", "목", "금", "토", "일"];
const barHeights = [40, 65, 30, 80, 55, 70, 45];

export default function AnalyticsTool() {
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
            <BarChart3 className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Analytics</p>
            <h1 className="text-xl font-bold text-slate-800">성과 분석 대시보드</h1>
          </div>
          <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-auto">
            준비 중
          </span>
        </div>
        <p className="text-sm text-slate-400 ml-[4.25rem]">
          채널별 콘텐츠 성과와 캠페인 결과를 한눈에 파악하세요. 실제 데이터 연동은 곧 출시됩니다.
        </p>
      </motion.div>

      {/* 주간 하이라이트 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {weeklyHighlights.map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.06 }}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
          >
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">{item.label}</p>
            <p className="text-lg font-extrabold text-slate-800 mb-0.5">{item.value}</p>
            <p className={cn("text-[10px] font-semibold flex items-center gap-0.5", item.positive ? "text-emerald-600" : "text-slate-400")}>
              {item.positive && <ArrowUpRight className="w-3 h-3" />}
              {item.sub}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 주간 발행 현황 차트 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-800">이번 주 발행 현황</h3>
            </div>
            <span className="text-xs text-slate-400">4/14 ~ 4/20</span>
          </div>
          <div className="flex items-end gap-2 h-24">
            {weekDays.map((day, i) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-amber-500 to-orange-400 transition-all"
                  style={{ height: `${barHeights[i]}%` }}
                />
                <span className="text-[10px] text-slate-400 font-medium">{day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 채널별 요약 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.17 }}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-800">채널별 요약</h3>
          </div>
          <div className="space-y-3">
            {channelStats.map((ch) => (
              <div key={ch.name} className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full flex-shrink-0", ch.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold text-slate-700">{ch.name}</span>
                    <span className="text-[10px] font-bold text-emerald-600">{ch.trend}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> {ch.reach}</span>
                    <span className="flex items-center gap-0.5"><MousePointerClick className="w-2.5 h-2.5" /> {ch.engagement}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
              <Calendar className="w-3 h-3" /> 실제 데이터 연동 준비 중
            </p>
            <p className="text-[10px] text-amber-500 mt-0.5">현재 샘플 데이터로 미리보기 중입니다.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
