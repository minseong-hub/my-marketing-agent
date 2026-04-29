"use client";

import { useEffect, useState, useCallback } from "react";

type ToastOpts = {
  color?: string;
  icon?: string;
  duration?: number;
};

type Toast = {
  id: number;
  msg: string;
  color: string;
  icon: string;
  exiting?: boolean;
};

declare global {
  interface Window {
    showToast?: (msg: string, opts?: ToastOpts) => void;
  }
}

let nextId = 1;

export function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  useEffect(() => {
    window.showToast = (msg: string, opts: ToastOpts = {}) => {
      const id = nextId++;
      const t: Toast = {
        id,
        msg,
        color: opts.color ?? "#5ce5ff",
        icon: opts.icon ?? "▸",
      };
      setToasts((prev) => [...prev, t]);
      const dur = opts.duration ?? 2800;
      setTimeout(() => dismiss(id), dur);
    };
    return () => { delete window.showToast; };
  }, [dismiss]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 100,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column-reverse",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pixel-frame"
          style={{
            position: "relative",
            background: "#0a0e27",
            border: `2px solid ${t.color}`,
            boxShadow: `4px 4px 0 ${t.color}66, 0 0 24px ${t.color}44`,
            color: t.color,
            fontFamily: '"IBM Plex Sans KR", sans-serif',
            fontSize: 15,
            fontWeight: 600,
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            pointerEvents: "auto",
            cursor: "pointer",
            animation: t.exiting ? "toast-out 0.2s ease forwards" : "toast-in 0.32s ease",
            minWidth: 280,
            maxWidth: 480,
          }}
          onClick={() => dismiss(t.id)}
        >
          <span style={{ fontSize: 17 }}>{t.icon}</span>
          <span style={{ color: "#cfe9ff", flex: 1 }}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

/** 외부에서 호출 — 클라이언트에서만 동작 */
export function showToast(msg: string, opts?: ToastOpts) {
  if (typeof window !== "undefined" && window.showToast) {
    window.showToast(msg, opts);
  }
}
