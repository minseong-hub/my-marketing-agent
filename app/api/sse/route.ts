import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { sseBus } from "@/lib/sse/bus";
import type { SSEEvent } from "@/lib/agents/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const userId = session.userId;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      function send(event: SSEEvent) {
        try {
          const payload = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {}
      }

      // 연결 확인 초기 이벤트
      send({ type: "heartbeat", data: { timestamp: new Date().toISOString() } });

      // SSE 버스 구독
      const unsubscribe = sseBus.subscribe(userId, send);

      // 30초마다 heartbeat
      const timer = setInterval(() => {
        send({ type: "heartbeat", data: { timestamp: new Date().toISOString() } });
      }, 30000);

      // 연결 종료 처리
      request.signal.addEventListener("abort", () => {
        clearInterval(timer);
        unsubscribe();
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
