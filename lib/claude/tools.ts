import type Anthropic from "@anthropic-ai/sdk";

export const COMMON_TOOLS: Anthropic.Tool[] = [
  {
    name: "report_action",
    description: "현재 수행 중인 작업을 사용자에게 한국어로 즉시 보고합니다. 모든 주요 행동 전/후에 반드시 호출하세요.",
    input_schema: {
      type: "object" as const,
      properties: {
        level: {
          type: "string",
          enum: ["info", "action", "warning", "error", "success"],
          description: "보고 수준: info=일반 정보, action=작업 실행, warning=주의, error=오류, success=완료",
        },
        message: {
          type: "string",
          description: "한국어 자연어 메시지. 비전문가도 이해할 수 있게 간결하게 작성. 예: '인스타그램 트렌드 키워드 32개를 수집했습니다.'",
        },
      },
      required: ["level", "message"],
    },
  },
  {
    name: "request_approval",
    description: "사용자 승인이 필요한 작업 전에 반드시 호출합니다. 호출 즉시 에이전트는 일시정지되며, 사용자 응답을 기다립니다.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "승인 요청 제목 (한국어, 15자 이내)" },
        description: { type: "string", description: "무엇을 왜 하려는지 설명 (한국어, 2-4줄)" },
        action_type: {
          type: "string",
          enum: ["publish_sns", "create_ad", "update_budget", "create_content", "generate_report", "send_email", "other"],
        },
        payload: { type: "object", description: "실제 실행할 액션 데이터" },
        preview_data: { type: "object", description: "사용자에게 미리보기로 보여줄 데이터" },
        urgency_level: { type: "string", enum: ["low", "normal", "high", "critical"], description: "긴급도" },
        expires_in_minutes: { type: "number", description: "승인 만료 시간(분). 기본 60분" },
      },
      required: ["title", "description", "action_type", "payload"],
    },
  },
  {
    name: "collaborate",
    description: "다른 에이전트에게 데이터나 요청을 전달하여 협업합니다.",
    input_schema: {
      type: "object" as const,
      properties: {
        to_agent_type: {
          type: "string",
          enum: ["marketing", "detail_page", "ads", "finance"],
          description: "수신 에이전트 타입",
        },
        subject: { type: "string", description: "협업 주제" },
        message_type: { type: "string", enum: ["request", "notification"], description: "요청 또는 알림" },
        content: { type: "object", description: "전달할 데이터" },
      },
      required: ["to_agent_type", "subject", "message_type", "content"],
    },
  },
  {
    name: "task_complete",
    description: "모든 작업이 완료되었을 때 호출합니다.",
    input_schema: {
      type: "object" as const,
      properties: {
        summary: { type: "string", description: "완료 요약 (한국어, 2-3줄)" },
      },
      required: ["summary"],
    },
  },
  {
    name: "save_financial_record",
    description: "재무 데이터(매출, 지출, 광고비 등)를 기록합니다. 재무 어시스턴트가 사용.",
    input_schema: {
      type: "object" as const,
      properties: {
        type: { type: "string", enum: ["revenue", "expense", "refund", "ad_spend"], description: "거래 유형" },
        category: { type: "string", description: "카테고리. 예: smartstore_sales, own_mall_sales, logistics, ad, platform_fee" },
        amount: { type: "number", description: "금액 (원)" },
        description: { type: "string", description: "설명" },
        channel: { type: "string", description: "판매 채널: smartstore, own_mall" },
        product_name: { type: "string", description: "상품명" },
        date: { type: "string", description: "날짜 YYYY-MM-DD" },
      },
      required: ["type", "category", "amount", "date"],
    },
  },
  {
    name: "save_ad_campaign",
    description: "광고 캠페인을 생성하거나 업데이트합니다. 광고 전문가 에이전트가 사용.",
    input_schema: {
      type: "object" as const,
      properties: {
        platform: { type: "string", enum: ["naver_sa", "kakao", "meta", "google"], description: "광고 플랫폼" },
        campaign_name: { type: "string", description: "캠페인명" },
        keywords: { type: "array", items: { type: "string" }, description: "광고 키워드 목록" },
        headline: { type: "string", description: "광고 제목" },
        description: { type: "string", description: "광고 설명문" },
        budget: { type: "number", description: "예산 (원)" },
      },
      required: ["platform", "campaign_name", "keywords"],
    },
  },
  {
    name: "save_content_draft",
    description: "SNS 콘텐츠 초안을 저장합니다. 마케팅 어시스턴트가 사용.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "콘텐츠 제목" },
        platform: { type: "string", enum: ["instagram", "blog", "threads", "tiktok", "openchat"], description: "플랫폼" },
        content: { type: "string", description: "콘텐츠 본문" },
        hashtags: { type: "array", items: { type: "string" }, description: "해시태그 목록" },
        scheduled_date: { type: "string", description: "발행 예정일 YYYY-MM-DD" },
      },
      required: ["title", "platform", "content"],
    },
  },
];
