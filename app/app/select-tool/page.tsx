"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { TOOLS } from "@/lib/tools-config";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  available: "사용 가능",
  beta: "베타",
  "coming-soon": "준비 중",
};

const STATUS_STYLE: Record<string, string> = {
  available: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30",
  beta: "bg-blue-400/20 text-blue-300 border-blue-400/30",
  "coming-soon": "bg-white/10 text-white/40 border-white/10",
};

export default function SelectToolPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d2050] to-[#0a1628] p-6">
      <div className="max-w-[1000px] mx-auto">

        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
              Simple Lab · 도구 선택
            </p>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            어떤 도구로 시작할까요?
          </h1>
          <p className="text-sm text-white/40 max-w-lg">
            브랜드 운영에 필요한 도구를 선택하세요. 각 도구는 업종과 브랜드에 맞게 자동으로 적응합니다.
          </p>
        </motion.div>

        {/* 툴 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((tool, idx) => {
            const Icon = tool.icon;
            const isLocked = tool.status === "coming-soon";

            const card = (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.07 }}
                whileHover={!isLocked ? { y: -4, transition: { duration: 0.18 } } : {}}
                className={cn(
                  "relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200",
                  "bg-white/5 backdrop-blur-md border",
                  isLocked
                    ? "opacity-50 cursor-not-allowed border-white/5"
                    : "cursor-pointer border-white/10 hover:border-blue-400/40 hover:bg-white/8 hover:shadow-[0_8px_32px_rgba(59,130,246,0.15)]"
                )}
              >
                {/* Block 1 — 아이콘 + 상태 배지 */}
                <div className="px-5 pt-5 pb-4 flex items-start justify-between border-b border-white/5">
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg",
                    tool.gradient
                  )}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={cn(
                    "text-[10px] font-semibold px-2.5 py-1 rounded-full border",
                    STATUS_STYLE[tool.status]
                  )}>
                    {STATUS_LABEL[tool.status]}
                  </span>
                </div>

                {/* Block 2 — 이름 + 설명 */}
                <div className="px-5 py-4 border-b border-white/5">
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">
                    {tool.nameEn}
                  </p>
                  <h3 className="text-base font-bold text-white mb-2 leading-snug">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-white/45 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                {/* Block 3 — 기능 목록 */}
                <div className="px-5 py-4 flex-1 border-b border-white/5">
                  <ul className="space-y-1.5">
                    {tool.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-white/50">
                        <CheckCircle2 className="w-3 h-3 text-blue-400/60 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Block 4 — CTA */}
                <div className="px-5 py-3.5 flex items-center justify-between bg-white/3">
                  {isLocked ? (
                    <div className="flex items-center gap-1.5 text-xs text-white/30">
                      <Lock className="w-3 h-3" />
                      곧 출시 예정
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-semibold text-blue-400">
                        도구 열기
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400/60" />
                    </>
                  )}
                </div>
              </motion.div>
            );

            return isLocked ? (
              <div key={tool.id}>{card}</div>
            ) : (
              <Link key={tool.id} href={tool.href}>
                {card}
              </Link>
            );
          })}
        </div>

        {/* 하단 안내 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-white/20 mt-10"
        >
          각 도구는 독립적으로 작동하며, 브랜드 프로필을 공유합니다.
        </motion.p>
      </div>
    </div>
  );
}
