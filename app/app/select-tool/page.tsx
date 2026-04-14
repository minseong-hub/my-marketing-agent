"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { TOOLS } from "@/lib/tools-config";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  available: "사용 가능",
  beta: "베타",
  "coming-soon": "준비 중",
};

const STATUS_STYLE: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700 border-emerald-200",
  beta: "bg-blue-100 text-blue-700 border-blue-200",
  "coming-soon": "bg-slate-100 text-slate-500 border-slate-200",
};

export default function SelectToolPage() {
  return (
    <div className="p-6 max-w-[960px] mx-auto">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1.5">
          Simple Lab · 도구 선택
        </p>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          어떤 도구로 시작할까요?
        </h1>
        <p className="text-sm text-slate-400 max-w-lg">
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
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.07 }}
              whileHover={!isLocked ? { y: -3, transition: { duration: 0.18 } } : {}}
              className={cn(
                "relative bg-white border rounded-2xl p-5 flex flex-col gap-4 transition-shadow",
                isLocked
                  ? "opacity-60 cursor-not-allowed border-slate-200"
                  : "cursor-pointer border-slate-200 hover:border-slate-300 hover:shadow-lg shadow-sm"
              )}
            >
              {/* 아이콘 + 상태 배지 */}
              <div className="flex items-start justify-between">
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-sm",
                  tool.gradient
                )}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                  STATUS_STYLE[tool.status]
                )}>
                  {STATUS_LABEL[tool.status]}
                </span>
              </div>

              {/* 이름 + 설명 */}
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                  {tool.nameEn}
                </p>
                <h3 className="text-base font-bold text-slate-800 mb-2 leading-snug">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* 기능 목록 */}
              <ul className="space-y-1">
                {tool.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CheckCircle2 className="w-3 h-3 text-slate-300 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* 하단 CTA */}
              <div className={cn(
                "flex items-center justify-between pt-3 border-t border-slate-100",
              )}>
                {isLocked ? (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Lock className="w-3 h-3" />
                    곧 출시 예정
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-blue-600">
                    도구 열기
                  </span>
                )}
                {!isLocked && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
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
        className="text-center text-xs text-slate-300 mt-10"
      >
        각 도구는 독립적으로 작동하며, 브랜드 프로필을 공유합니다.
      </motion.p>
    </div>
  );
}
