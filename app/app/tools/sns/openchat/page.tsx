"use client";

import { motion } from "framer-motion";
import { Radio, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const channels = [
  { name: "인스타그램", handle: "@sanmul_official", followers: 3842, posts: 128, engagement: "4.8%", color: "from-pink-500 to-rose-500", icon: "IG" },
  { name: "블로그", handle: "blog.naver.com/sanmul", followers: 1250, posts: 62, engagement: "7.2%", color: "from-orange-500 to-amber-500", icon: "BL" },
  { name: "스레드", handle: "@sanmul_official", followers: 840, posts: 46, engagement: "6.1%", color: "from-slate-500 to-slate-700", icon: "TH" },
  { name: "틱톡", handle: "@sanmul_kr", followers: 512, posts: 18, engagement: "9.4%", color: "from-red-500 to-rose-600", icon: "TT" },
  { name: "오픈채팅", handle: "산물 회원 방", followers: 247, posts: 34, engagement: "—", color: "from-amber-500 to-yellow-500", icon: "OC" },
];

function GC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white border border-slate-200/80 shadow-sm rounded-2xl", className)}>{children}</div>;
}

export default function ChannelsPage() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Radio className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">SNS Marketing</p>
          <h1 className="text-xl font-bold text-slate-800">채널별 관리</h1>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {channels.map((c, i) => (
          <motion.div key={c.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GC className="p-5 hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer">
              <div className="flex items-start gap-4 mb-4">
                <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-sm font-extrabold text-slate-800 shadow-lg", c.color)}>{c.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 mb-0.5">{c.name}</p>
                  <p className="text-[11px] text-slate-500">{c.handle}</p>
                </div>
                <button className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full font-semibold hover:bg-blue-100 transition-colors">연결됨</button>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200">
                <div><p className="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1"><Users className="w-2.5 h-2.5" /> 팔로워</p><p className="text-sm font-bold text-slate-800 tabular-nums">{c.followers.toLocaleString()}</p></div>
                <div><p className="text-[10px] text-slate-400 mb-0.5">게시물</p><p className="text-sm font-bold text-slate-800 tabular-nums">{c.posts}</p></div>
                <div><p className="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5" /> 반응률</p><p className="text-sm font-bold text-emerald-600 tabular-nums">{c.engagement}</p></div>
              </div>
            </GC>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
