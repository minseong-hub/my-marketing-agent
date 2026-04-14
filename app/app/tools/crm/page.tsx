"use client";

import { motion } from "framer-motion";
import { MessageSquare, Star, Users, Repeat2, LifeBuoy, AlertCircle, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const reviews = [
  {
    author: "주*연",
    rating: 5,
    content: "정말 달고 맛있어요! 아이들이 너무 좋아해서 바로 재구매했어요.",
    date: "2026-04-14",
    replied: false,
  },
  {
    author: "이*경",
    rating: 4,
    content: "배송이 빠르고 신선해요. 다음에도 주문할게요.",
    date: "2026-04-13",
    replied: true,
  },
  {
    author: "박*현",
    rating: 5,
    content: "처음 구매했는데 맛이 기대 이상이었어요. 강추합니다!",
    date: "2026-04-12",
    replied: false,
  },
];

const segments = [
  { label: "신규 고객", count: 42, color: "bg-blue-500", pct: 30 },
  { label: "재구매 고객", count: 87, color: "bg-emerald-500", pct: 62 },
  { label: "VIP (3회+)", count: 11, color: "bg-violet-500", pct: 8 },
];

const templates = [
  { title: "5성 리뷰 감사 답변", category: "리뷰", preview: "좋은 후기 남겨주셔서 감사합니다! 다음에도..." },
  { title: "배송 지연 사과 메시지", category: "CS", preview: "배송이 늦어져 불편을 드려 대단히 죄송합니다..." },
  { title: "재구매 유도 쿠폰 메시지", category: "마케팅", preview: "이전에 구매해 주신 고객님께 특별 혜택을..." },
];

export default function CrmTool() {
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider">CRM & Reviews</p>
            <h1 className="text-xl font-bold text-slate-800">CRM · 고객 자동화</h1>
          </div>
        </div>
        <p className="text-sm text-slate-400 ml-[4.25rem]">
          리뷰 답변 자동화, 고객 세그먼트 관리, CS 템플릿으로 고객 관계를 효율적으로 운영하세요.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 리뷰 답변 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
                <Star className="w-4 h-4 text-rose-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">최근 리뷰</h3>
            </div>
            <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              {reviews.filter((r) => !r.replied).length}건 미답변
            </span>
          </div>
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.author} className="p-3.5 rounded-xl border border-slate-100 hover:border-rose-100 hover:bg-rose-50/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">{review.author}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{review.date}</span>
                    {review.replied ? (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">답변 완료</span>
                    ) : (
                      <span className="text-[10px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full font-medium">미답변</span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-2">{review.content}</p>
                {!review.replied && (
                  <button className="flex items-center gap-1.5 text-[11px] text-rose-500 hover:text-rose-600 font-semibold">
                    <Sparkles className="w-3 h-3" /> AI 답변 생성
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* 우측 패널 */}
        <div className="space-y-4">
          {/* 고객 세그먼트 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.07 }}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">고객 세그먼트</h3>
            </div>
            <div className="space-y-2.5">
              {segments.map((seg) => (
                <div key={seg.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600">{seg.label}</span>
                    <span className="text-xs font-bold text-slate-700">{seg.count}명</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className={cn("h-full rounded-full", seg.color)} style={{ width: `${seg.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 text-xs text-blue-500 hover:text-blue-600 font-semibold flex items-center justify-center gap-1 py-2 rounded-xl hover:bg-blue-50 transition-colors">
              <Repeat2 className="w-3 h-3" /> 재구매 캠페인 기획
            </button>
          </motion.div>

          {/* CS 템플릿 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.14 }}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                <LifeBuoy className="w-3.5 h-3.5 text-violet-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">CS 템플릿</h3>
            </div>
            <div className="space-y-2">
              {templates.map((tpl) => (
                <div key={tpl.title} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-violet-200 hover:bg-violet-50/40 transition-colors cursor-pointer">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-semibold text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded-full">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 mb-0.5">{tpl.title}</p>
                  <p className="text-[10px] text-slate-400 truncate">{tpl.preview}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
