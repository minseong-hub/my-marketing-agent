import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Crewmate AI design tokens
        bg: {
          deep: "#060920",
          DEFAULT: "#0a0e27",
          panel: "#0f1640",
          panel2: "#131c52",
        },
        line: "#1f2a6b",
        crewcyan: {
          DEFAULT: "#5ce5ff",
          dim: "#2a86a8",
          glow: "#9af0ff",
        },
        crewmagenta: {
          DEFAULT: "#ff4ec9",
          dim: "#8a2877",
          glow: "#ff86dc",
        },
        crewyellow: {
          DEFAULT: "#ffd84d",
          glow: "#fff0a8",
        },
        crewgreen: {
          DEFAULT: "#66ff9d",
          glow: "#b8ffd1",
        },
        crewtext: {
          DEFAULT: "#cfe9ff",
          dim: "#7e94c8",
          faint: "#4a5a8a",
        },
        // Keep existing shadcn tokens for admin/other pages
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        kr: ['"IBM Plex Sans KR"', "Pretendard", "system-ui", "sans-serif"],
        sans: ["Pretendard", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "pixel-pink": "4px 4px 0 0 #8a2877",
        "pixel-cyan": "4px 4px 0 0 #2a86a8",
        "pixel-lg-pink": "8px 8px 0 0 #8a2877",
        "glow-magenta": "0 0 24px rgba(255,78,201,0.35)",
        "glow-cyan": "0 0 24px rgba(92,229,255,0.35)",
        card: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-hover": "0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
        "card-lg": "0 8px 24px 0 rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.06)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        blink: { "50%": { opacity: "0.2" } },
        flicker: {
          "0%,100%": { opacity: "1" },
          "3%": { opacity: "0.6" },
          "6%": { opacity: "1" },
          "60%": { opacity: "0.85" },
          "63%": { opacity: "1" },
        },
        "led-pulse": {
          "0%,100%": { boxShadow: "0 0 0 0 currentColor, 0 0 8px 0 currentColor" },
          "50%": { boxShadow: "0 0 0 2px currentColor, 0 0 16px 2px currentColor" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "shoot-star": {
          "0%": { transform: "translateX(-100px) translateY(40px)", opacity: "0" },
          "10%": { opacity: "1" },
          "100%": { transform: "translateX(120vw) translateY(-80px)", opacity: "0" },
        },
      },
      animation: {
        blink: "blink 1s steps(2) infinite",
        flicker: "flicker 6s infinite",
        "led-pulse": "led-pulse 1.5s infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "shoot-star": "shoot-star 1.8s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
