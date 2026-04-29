"use client";
import Link from "next/link";
import { CockpitShell } from "@/components/layout/CockpitShell";
import { CockpitPanel } from "@/components/primitives/CockpitPanel";
import { POSTS } from "./posts";

export default function BlogPage() {
  const ArchivePanel = (
    <CockpitPanel title="발행 일지 모음" status="업데이트됨" accent="#7e94c8" className="flex-1">
      <div className="space-y-3">
        {POSTS.map(p => (
          <div key={p.id} style={{ borderBottom: "1px solid #1f2a6b", paddingBottom: 8 }}>
            <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: "#7e94c8" }}>{p.date}</p>
            <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 15, color: "#cfe9ff", marginTop: 2, lineHeight: 1.5 }}>{p.title}</p>
          </div>
        ))}
      </div>
    </CockpitPanel>
  );

  return (
    <CockpitShell
      sector="운영 일지 · 발행 콘텐츠"
      leftConsole={ArchivePanel}
      bootMessage="운영 일지 5편 게시됨 · 새 글 알림 받기 신청 가능"
    >
      <div style={{ padding: "32px 24px" }}>
        <p style={{ fontFamily: '"IBM Plex Sans KR", sans-serif', fontSize: 14, fontWeight: 600, color: "#5ce5ff", letterSpacing: "0.04em", marginBottom: 12 }}>
          운영 일지 · 셀러를 위한 인사이트
        </p>
        <h1
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "clamp(17px, 1.8vw, 22px)",
            color: "#cfe9ff",
            textShadow: "4px 4px 0 #8a2877",
            marginBottom: 28,
          }}
        >
          운영 로그
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {POSTS.map(post => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="pixel-frame cursor-pointer"
              style={{
                border: `1px solid ${post.color}44`,
                background: "#0f1640",
                padding: "20px 16px",
                transition: "all 0.15s",
                textDecoration: "none",
                display: "block",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.border = `1px solid ${post.color}`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border = `1px solid ${post.color}44`; }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 12,
                    color: post.color,
                    border: `1px solid ${post.color}`,
                    padding: "2px 6px",
                  }}
                >
                  {post.tag}
                </span>
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 12,
                    color: "#7e94c8",
                  }}
                >
                  {post.date}
                </span>
              </div>
              <p
                style={{
                  fontFamily: '"IBM Plex Sans KR", sans-serif',
                  fontSize: 18,
                  color: "#cfe9ff",
                  fontWeight: 600,
                  lineHeight: 1.6,
                }}
              >
                {post.title}
              </p>
              <p
                style={{
                  fontFamily: '"IBM Plex Sans KR", sans-serif',
                  fontSize: 14,
                  color: "#7e94c8",
                  marginTop: 8,
                  lineHeight: 1.6,
                }}
              >
                {post.excerpt}
              </p>
              <p
                style={{
                  fontFamily: '"IBM Plex Sans KR", sans-serif',
                  fontSize: 14,
                  color: post.color,
                  marginTop: 10,
                  fontWeight: 500,
                }}
              >
                자세히 읽기 →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </CockpitShell>
  );
}
