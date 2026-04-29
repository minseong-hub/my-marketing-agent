"use client";
import { useEffect, useState } from "react";

export function HudStrip() {
  const [time, setTime] = useState("");
  const [fuel, setFuel] = useState(87);
  const [o2, setO2] = useState(94);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex items-center gap-5 px-4 py-2 flex-wrap"
      style={{
        background: "#060920",
        borderTop: "1px solid #1f2a6b",
        fontFamily: '"IBM Plex Sans KR", sans-serif',
        fontSize: 13,
        color: "#cfe9ff",
        fontWeight: 500,
      }}
    >
      <span style={{ color: "#5ce5ff" }}>⏱ {time} (KST)</span>
      <span style={{ color: "#7e94c8" }}>|</span>
      <span>
        연료{" "}
        <span style={{ color: fuel > 50 ? "#66ff9d" : "#ffd84d" }}>{fuel}%</span>
      </span>
      <span style={{ color: "#7e94c8" }}>|</span>
      <span>
        산소{" "}
        <span style={{ color: o2 > 70 ? "#66ff9d" : "#ff4ec9" }}>{o2}%</span>
      </span>
      <span style={{ color: "#7e94c8" }}>|</span>
      <span>크루메이트호 · 7번 구역</span>
      <span className="ml-auto" style={{ color: "#66ff9d", animation: "blink 1s steps(2) infinite" }}>
        ● 전 시스템 정상
      </span>
    </div>
  );
}
