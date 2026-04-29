"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Clock, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AGENT_NAMES, AGENT_COLORS } from "@/lib/claude/prompts";

interface ApprovalItem {
  id: string;
  agent_type: string;
  title: string;
  description: string;
  urgency_level: string;
  expires_at: string;
  preview_data: Record<string, unknown>;
  action_type: string;
}

interface ApprovalModalProps {
  approvals: ApprovalItem[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
}

const URGENCY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  critical: "bg-red-100 text-red-700",
};

const URGENCY_LABELS: Record<string, string> = {
  low: "낮음",
  normal: "보통",
  high: "높음",
  critical: "긴급",
};

export function ApprovalModal({ approvals, onApprove, onReject }: ApprovalModalProps) {
  const [expandedId, setExpandedId] = useState<string | null>(approvals[0]?.id ?? null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  if (approvals.length === 0) return null;

  async function handleApprove(id: string) {
    setLoadingId(id);
    try { await onApprove(id); } finally { setLoadingId(null); }
  }

  async function handleReject(id: string) {
    if (!rejectingId) { setRejectingId(id); return; }
    setLoadingId(id);
    try {
      await onReject(id, rejectReason || undefined);
      setRejectingId(null);
      setRejectReason("");
    } finally { setLoadingId(null); }
  }

  return (
    <div className="space-y-3">
      {approvals.map((approval) => {
        const colors = AGENT_COLORS[approval.agent_type] || AGENT_COLORS.marketing;
        const isExpanded = expandedId === approval.id;
        const expiresAt = new Date(approval.expires_at);
        const minutesLeft = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 60000));

        return (
          <div key={approval.id} className={cn("rounded-2xl border-2 overflow-hidden transition-all", colors.border)}>
            {/* 헤더 */}
            <button
              className={cn("w-full p-4 flex items-start gap-3 text-left hover:brightness-95 transition-all", colors.bg)}
              onClick={() => setExpandedId(isExpanded ? null : approval.id)}
            >
              <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0 animate-pulse", colors.dot)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={cn("text-sm font-bold px-2 py-0.5 rounded-full", URGENCY_COLORS[approval.urgency_level])}>
                    {URGENCY_LABELS[approval.urgency_level] || "보통"}
                  </span>
                  <span className={cn("text-sm font-semibold", colors.text)}>
                    {AGENT_NAMES[approval.agent_type] || approval.agent_type}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-slate-400 ml-auto">
                    <Clock className="w-3 h-3" />
                    {minutesLeft}분 후 만료
                  </span>
                </div>
                <p className="text-base font-bold text-slate-800">{approval.title}</p>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />}
            </button>

            {/* 상세 */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-white border-t border-slate-100 space-y-4">
                    {/* 설명 */}
                    <div>
                      <p className="text-sm font-semibold text-slate-400 mb-1">요청 내용</p>
                      <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line">{approval.description}</p>
                    </div>

                    {/* 미리보기 */}
                    {Object.keys(approval.preview_data).length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-slate-400 mb-2">미리보기</p>
                        <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 space-y-1">
                          {Object.entries(approval.preview_data).map(([k, v]) => (
                            <div key={k} className="flex gap-2">
                              <span className="font-semibold text-slate-500 flex-shrink-0">{k}:</span>
                              <span className="break-all">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 거절 이유 입력 */}
                    {rejectingId === approval.id && (
                      <div>
                        <p className="text-sm font-semibold text-slate-400 mb-1">거절 사유 (선택)</p>
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="거절 사유를 입력하세요..."
                          className="w-full px-3 py-2 text-base border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                        />
                      </div>
                    )}

                    {/* 버튼 */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(approval.id)}
                        disabled={loadingId === approval.id}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        승인
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(approval.id)}
                        disabled={loadingId === approval.id}
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        {rejectingId === approval.id ? "확인 거절" : "거절"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
