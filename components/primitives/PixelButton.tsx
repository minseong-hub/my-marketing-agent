"use client";
import { ReactNode, ButtonHTMLAttributes } from "react";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  full?: boolean;
  children: ReactNode;
}

const variantStyles = {
  primary: {
    background: "#ff4ec9",
    color: "#060920",
    border: "2px solid #ff4ec9",
    boxShadow: "4px 4px 0 0 #8a2877",
    fontWeight: 700,
  },
  secondary: {
    background: "#0f1640",
    color: "#5ce5ff",
    border: "2px solid #5ce5ff",
    boxShadow: "4px 4px 0 0 #2a86a8",
    fontWeight: 600,
  },
  ghost: {
    background: "transparent",
    color: "#cfe9ff",
    border: "2px solid #1f2a6b",
    boxShadow: "none",
    fontWeight: 500,
  },
};

const sizeStyles = {
  sm: { padding: "6px 14px", fontSize: 13 },
  md: { padding: "10px 20px", fontSize: 14 },
  lg: { padding: "14px 28px", fontSize: 15 },
};

export function PixelButton({
  variant = "primary",
  size = "md",
  full = false,
  children,
  style,
  ...props
}: PixelButtonProps) {
  return (
    <button
      className="pixel-frame active:translate-y-1 transition-transform duration-75 cursor-pointer"
      style={{
        fontFamily: '"Press Start 2P", monospace',
        letterSpacing: "0.05em",
        width: full ? "100%" : undefined,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
