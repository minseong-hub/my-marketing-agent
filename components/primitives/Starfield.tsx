"use client";
import { useEffect, useRef } from "react";

interface StarfieldProps {
  density?: number;
  speed?: number;
  height?: number | string;
  className?: string;
}

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  cross: boolean;
}

export function Starfield({ density = 1, speed = 0.3, height, className = "" }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = ["#ffffff","#cfe9ff","#9af0ff","#ff86dc","#ffffff","#cfe9ff","#ffffff"];
    let W = 0, H = 0;
    let stars: Star[] = [];
    let raf: number;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      initStars();
    };

    const initStars = () => {
      const count = Math.floor(W * H * 0.001 * density);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        size: Math.random() < 0.7 ? 1 : Math.random() < 0.8 ? 1.5 : 2,
        speed: (Math.random() * 0.5 + 0.3) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        cross: Math.random() < 0.06,
      }));
    };

    const draw = () => {
      ctx.fillStyle = "rgba(6,9,32,0)";
      ctx.clearRect(0, 0, W, H);

      // bg gradient
      const grad = ctx.createRadialGradient(W * 0.6, H * 0.5, 0, W * 0.6, H * 0.5, Math.max(W, H));
      grad.addColorStop(0, "#1a1547");
      grad.addColorStop(0.5, "#0a0e27");
      grad.addColorStop(1, "#060920");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      for (const s of stars) {
        ctx.fillStyle = s.color;
        if (s.cross) {
          ctx.fillRect(s.x, s.y - 2, 1, 5);
          ctx.fillRect(s.x - 2, s.y, 5, 1);
        } else {
          ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
        }
        s.y += s.speed;
        if (s.y > H) {
          s.y = 0;
          s.x = Math.random() * W;
        }
      }
      raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    draw();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [density, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ height: height ?? "100%" }}
    />
  );
}
