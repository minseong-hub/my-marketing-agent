"use client";

import { motion } from "framer-motion";
import { FileImage, Pencil, Layout, Lightbulb, Palette, FolderOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const modules = [
  {
    icon: Pencil,
    title: "상품/페이지 브리프",
    desc: "상품 핵심 정보, 타겟, 가격, 차별점을 구조화합니다.",
    color: "bg-violet-50 text-violet-600",
    items: ["제품명 · 카테고리 입력", "타겟 고객 정의", "핵심 차별점 3가지"],
    badge: "브리프 작성",
    badgeColor: "bg-violet-100 text-violet-700",
  },
  {
    icon: Layout,
    title: "섹션 구성 플래너",
    desc: "상세페이지를 구성하는 섹션 순서와 목적을 기획합니다.",
    color: "bg-blue-50 text-blue-600",
    items: ["후킹 섹션", "신뢰 · 증거 섹션", "CTA 섹션"],
    badge: "3개 섹션",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    icon: Lightbulb,
    title: "카피 블록 생성",
    desc: "섹션별 헤드라인, 서브카피, 설명 텍스트를 작성합니다.",
    color: "bg-amber-50 text-amber-600",
    items: ["헤드라인 초안 3가지", "서브카피 & 설명", "후킹 문장"],
    badge: "작성 중",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    icon: Palette,
    title: "디자인 방향 가이드",
    desc: "컬러 톤, 레이아웃 스타일, 이미지 방향을 정의합니다.",
    color: "bg-rose-50 text-rose-600",
    items: ["컬러 팔레트 선택", "이미지 스타일 방향", "폰트 & 레이아웃"],
    badge: "가이드",
    badgeColor: "bg-rose-100 text-rose-700",
  },
  {
    icon: FolderOpen,
    title: "레퍼런스 정리함",
    desc: "벤치마킹 페이지와 참고 이미지를 모아 관리합니다.",
    color: "bg-emerald-50 text-emerald-600",
    items: ["URL 클리핑", "스크린샷 메모", "섹션별 분류"],
    badge: "0개 저장됨",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
];

export default function DetailPageTool() {
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
            <FileImage className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider">Detail Page Studio</p>
            <h1 className="text-xl font-bold text-slate-800">상세페이지 기획</h1>
          </div>
        </div>
        <p className="text-sm text-slate-400 ml-[4.25rem]">
          상품 상세페이지를 섹션 단위로 기획하고, 카피와 디자인 방향을 한 곳에서 정리하세요.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod, idx) => {
          const Icon = mod.icon;
          return (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.07 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", mod.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", mod.badgeColor)}>
                  {mod.badge}
                </span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1.5">{mod.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">{mod.desc}</p>
              <ul className="space-y-1">
                {mod.items.map((item) => (
                  <li key={item} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 p-4 rounded-2xl bg-violet-50 border border-violet-100 text-center">
        <p className="text-sm text-violet-600 font-semibold mb-1">첫 번째 상세페이지 프로젝트를 만들어보세요</p>
        <p className="text-xs text-violet-400">상품 정보를 입력하면 섹션 구성과 카피를 자동으로 제안합니다.</p>
      </div>
    </div>
  );
}
