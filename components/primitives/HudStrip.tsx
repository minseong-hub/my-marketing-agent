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
      className="flex items-center gap-6 px-4 py-2"
      style={{
        background: "#060920",
        borderTop: "1px solid #1f2a6b",
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 9,
        color: "#7e94c8",
        letterSpacing: "0.08em",
      }}
    >
      <span style={{ color: "#5ce5ff" }}>⏱ {time} UTC+9</span>
      <span>|</span>
      <span>
        FUEL{" "}
        <span style={{ color: fuel > 50 ? "#66ff9d" : "#ffd84d" }}>{fuel}%</span>
      </span>
      <span>|</span>
      <span>
        O2{" "}
        <span style={{ color: o2 > 70 ? "#66ff9d" : "#ff4ec9" }}>{o2}%</span>
      </span>
      <span>|</span>
      <span>SECTOR-7G · SHIP CREWMATE-04</span>
      <span className="ml-auto" style={{ color: "#66ff9d", animation: "blink 1s steps(2) infinite" }}>
        ● ALL SYSTEMS NOMINAL
      </span>
    </div>
  );
}
