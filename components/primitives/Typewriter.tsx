"use client";
import { useEffect, useState, useRef } from "react";
import type { ChatLine } from "@/data/agents";

interface TypewriterProps {
  lines: ChatLine[];
  loop?: boolean;
}

export function Typewriter({ lines, loop = false }: TypewriterProps) {
  const [displayed, setDisplayed] = useState<{ line: ChatLine; text: string }[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [done, setDone] = useState(false);
  const [blink, setBlink] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const blinkInt = setInterval(() => setBlink(b => !b), 530);
    return () => clearInterval(blinkInt);
  }, []);

  const reset = () => {
    setDisplayed([]);
    setCurrentLine(0);
    setCurrentChar(0);
    setDone(false);
  };

  useEffect(() => {
    if (done) {
      if (loop) {
        timerRef.current = setTimeout(reset, 1500);
      }
      return;
    }
    if (currentLine >= lines.length) {
      setDone(true);
      return;
    }

    const line = lines[currentLine];
    const speed = line.speed ?? 28;
    const pause = line.pause ?? 0;
    const full = line.text;

    if (currentChar < full.length) {
      timerRef.current = setTimeout(() => {
        setDisplayed(prev => {
          const next = [...prev];
          if (next.length <= currentLine) {
            next.push({ line, text: full[0] });
          } else {
            next[currentLine] = { line, text: full.slice(0, currentChar + 1) };
          }
          return next;
        });
        setCurrentChar(c => c + 1);
      }, speed);
    } else {
      timerRef.current = setTimeout(() => {
        setCurrentLine(l => l + 1);
        setCurrentChar(0);
      }, pause + 120);
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentLine, currentChar, done, lines, loop]);

  return (
    <div className="font-mono text-sm leading-relaxed" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
      {displayed.map((entry, i) => (
        <div key={i} className="flex gap-1">
          <span style={{ color: entry.line.promptColor ?? "#7e94c8" }}>{entry.line.prompt}</span>
          <span style={{ color: entry.line.color ?? "#cfe9ff" }}>{entry.text}</span>
          {i === displayed.length - 1 && !done && (
            <span style={{ display: "inline-block", width: 7, height: 12, background: blink ? "#5ce5ff" : "transparent", verticalAlign: "text-bottom" }} />
          )}
        </div>
      ))}
    </div>
  );
}
