import { ContentItem, Template, ChannelDrafts } from "./types";

interface TemplateVariables {
  productName: string;
  coreMessage: string;
  audience: string;
  hook: string;
  cta: string;
  link: string;
  supportPoint1: string;
  supportPoint2: string;
  supportPoint3: string;
}

function buildVariables(content: ContentItem): TemplateVariables {
  return {
    productName: content.productName,
    coreMessage: content.coreMessage,
    audience: content.audience,
    hook: content.hook,
    cta: content.cta,
    link: content.link,
    supportPoint1: content.supportPoints[0] || "",
    supportPoint2: content.supportPoints[1] || "",
    supportPoint3: content.supportPoints[2] || "",
  };
}

function replacePlaceholders(
  template: string,
  variables: TemplateVariables
): string {
  let result = template;
  const entries = Object.entries(variables) as [
    keyof TemplateVariables,
    string
  ][];
  for (const [key, value] of entries) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

export function generateChannelDrafts(
  content: ContentItem,
  template: Template
): ChannelDrafts {
  const variables = buildVariables(content);
  const drafts: ChannelDrafts = {};

  if (content.platforms.includes("blog")) {
    drafts.blog = replacePlaceholders(template.blogTemplate, variables);
  }
  if (content.platforms.includes("instagram")) {
    drafts.instagram = replacePlaceholders(
      template.instagramTemplate,
      variables
    );
  }
  if (content.platforms.includes("threads")) {
    drafts.threads = replacePlaceholders(template.threadsTemplate, variables);
  }
  if (content.platforms.includes("tiktok")) {
    drafts.tiktok = replacePlaceholders(template.tiktokTemplate, variables);
  }
  if (content.platforms.includes("openchat")) {
    drafts.openchat = replacePlaceholders(
      template.openchatTemplate,
      variables
    );
  }

  return drafts;
}

export function getCharCount(text: string): number {
  return text.length;
}

export const PLATFORM_CHAR_GUIDES: Record<string, string> = {
  blog: "1,000~3,000자 권장",
  instagram: "150~300자 권장 (해시태그 포함)",
  threads: "50~150자 권장",
  tiktok: "대본 200~400자 권장",
  openchat: "200~500자 권장",
};
