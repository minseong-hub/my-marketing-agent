"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { CockpitShell } from "@/components/layout/CockpitShell";
import { CockpitPanel } from "@/components/primitives/CockpitPanel";
import { POSTS, getPost } from "../posts";

const FONT_KR = '"IBM Plex Sans KR", sans-serif';
const FONT_PIX = '"Press Start 2P", monospace';
const FONT_MONO = '"JetBrains Mono", monospace';

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  // 같은 카테고리 다른 글 추천
  const related = POSTS.filter((p) => p.id !== post.id && p.tag === post.tag).slice(0, 3);
  const others = POSTS.filter((p) => p.id !== post.id).slice(0, 3);

  const ArchivePanel = (
    <CockpitPanel title="발행 일지 모음" status="업데이트됨" accent="#7e94c8" className="flex-1">
      <div className="space-y-3">
        {POSTS.map(p => (
          <Link
            key={p.id}
            href={`/blog/${p.slug}`}
            style={{
              display: "block",
              borderBottom: p.id === post.id ? `1px solid ${post.color}` : "1px solid #1f2a6b",
              paddingBottom: 8,
              textDecoration: "none",
            }}
          >
            <p style={{ fontFamily: FONT_MONO, fontSize: 12, color: p.id === post.id ? post.color : "#7e94c8" }}>{p.date}</p>
            <p style={{ fontFamily: FONT_KR, fontSize: 14, color: p.id === post.id ? "#ffffff" : "#cfe9ff", marginTop: 2, lineHeight: 1.5, fontWeight: p.id === post.id ? 700 : 500 }}>{p.title}</p>
          </Link>
        ))}
      </div>
    </CockpitPanel>
  );

  return (
    <CockpitShell
      sector="운영 일지 · 발행 콘텐츠"
      leftConsole={ArchivePanel}
      bootMessage={`「${post.title}」 — ${post.date}`}
      accent={post.color}
    >
      <div style={{ padding: "32px 28px", maxWidth: 760 }}>
        {/* 브레드크럼 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          <Link href="/blog" style={{ fontFamily: FONT_KR, fontSize: 14, color: "#7e94c8", textDecoration: "none", fontWeight: 500 }}>
            ← 운영 일지 목록
          </Link>
          <span style={{ color: "#1f2a6b" }}>›</span>
          <span style={{ fontFamily: FONT_KR, fontSize: 14, color: post.color, fontWeight: 600 }}>
            {post.tag}
          </span>
        </div>

        {/* 헤더 */}
        <p style={{ fontFamily: FONT_MONO, fontSize: 12, color: "#7e94c8", letterSpacing: "0.08em", marginBottom: 6 }}>
          {post.date} · {post.tag}
        </p>
        <h1 style={{
          fontFamily: FONT_KR, fontWeight: 800, fontSize: "clamp(26px, 3vw, 36px)",
          color: "#ffffff", lineHeight: 1.25, letterSpacing: "-0.02em",
          marginBottom: 14,
        }}>
          {post.title}
        </h1>
        <p style={{ fontFamily: FONT_KR, fontSize: 17, color: post.color, lineHeight: 1.6, marginBottom: 28, fontWeight: 500 }}>
          {post.excerpt}
        </p>

        {/* 본문 */}
        <article style={{
          fontFamily: FONT_KR, fontSize: 16, color: "#cfe9ff",
          lineHeight: 1.85, whiteSpace: "pre-line",
        }}>
          {post.body.split(/^##\s+/m).map((block, i) => {
            if (i === 0) return block.trim() ? <p key={i} style={{ marginBottom: 16 }}>{block}</p> : null;
            const [heading, ...rest] = block.split("\n");
            return (
              <div key={i} style={{ marginTop: 28, marginBottom: 16 }}>
                <h2 style={{
                  fontFamily: FONT_KR, fontSize: 20, fontWeight: 700,
                  color: post.color, marginBottom: 10,
                  letterSpacing: "-0.01em",
                }}>
                  {heading.trim()}
                </h2>
                <div>{rest.join("\n").trim()}</div>
              </div>
            );
          })}
        </article>

        {/* 관련 글 */}
        {related.length > 0 && (
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #1f2a6b" }}>
            <p style={{ fontFamily: FONT_PIX, fontSize: 11, color: post.color, letterSpacing: "0.08em", marginBottom: 14 }}>
              ▸ 같은 카테고리 다른 글
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`} style={{ textDecoration: "none" }}>
                  <div className="pixel-frame" style={{ border: `1px solid ${r.color}44`, background: "#0a0e27", padding: 12, transition: "all 0.15s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = r.color; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${r.color}44`; }}
                  >
                    <p style={{ fontFamily: FONT_MONO, fontSize: 11, color: r.color, marginBottom: 4 }}>{r.date}</p>
                    <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 600, color: "#cfe9ff", lineHeight: 1.5 }}>{r.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 더 읽기 */}
        <div style={{ marginTop: 36, paddingTop: 24, borderTop: "1px solid #1f2a6b" }}>
          <p style={{ fontFamily: FONT_PIX, fontSize: 11, color: "#5ce5ff", letterSpacing: "0.08em", marginBottom: 14 }}>
            ▸ 다른 글 둘러보기
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
            {others.map((r) => (
              <Link key={r.id} href={`/blog/${r.slug}`} style={{ textDecoration: "none" }}>
                <div className="pixel-frame" style={{ border: `1px solid ${r.color}33`, background: "#0a0e27", padding: 12 }}>
                  <p style={{ fontFamily: FONT_MONO, fontSize: 11, color: r.color, marginBottom: 4 }}>{r.tag}</p>
                  <p style={{ fontFamily: FONT_KR, fontSize: 14, fontWeight: 600, color: "#cfe9ff", lineHeight: 1.5 }}>{r.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </CockpitShell>
  );
}
