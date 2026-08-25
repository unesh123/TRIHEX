const GENERATED_ASSETS = {
  gemini: "/media/covers/trihex-generated/gemini-pro-18-months-link.webp",
  chatgpt: "/media/covers/trihex-generated/chatgpt-plus-1-month-fw.webp",
  canva: "/media/covers/trihex-generated/canva-pro-1-year.webp",
  capcut: "/media/covers/trihex-generated/capcut-pro-30-days.webp",
  cursor: "/media/covers/trihex-generated/cursor-pro-30-days.webp",
  adobe: "/media/covers/trihex-generated/adobe-creative-cloud-2-months.webp",
  claude: "/media/covers/trihex-generated/claude-pro-1-month.webp",
  coursera: "/media/covers/trihex-generated/coursera-premium-1-year.webp",
  grok: "/media/covers/trihex-generated/grok-super-3-months.webp",
  elevenlabs: "/media/covers/trihex-generated/elevenlabs-1-month.webp",
  gamma: "/media/covers/trihex-generated/gamma-ai-pro-1-month.webp",
  manus: "/media/covers/trihex-generated/manus-ai-pro-12-months.webp",
  notion: "/media/covers/trihex-generated/notion-business-3-months.webp",
  replit: "/media/covers/trihex-generated/replit-core-1-month.webp",
  reference: "/media/covers/trihex-generated/trihex-style-reference.webp",
} as const;

const SLUG_MATCHES: Array<{ match: RegExp; path: string }> = [
  { match: /gemini|google-ai|google-5tb|veo/, path: GENERATED_ASSETS.gemini },
  { match: /chatgpt|openai|gpt-/, path: GENERATED_ASSETS.chatgpt },
  { match: /canva/, path: GENERATED_ASSETS.canva },
  { match: /capcut/, path: GENERATED_ASSETS.capcut },
  { match: /cursor|antigravity/, path: GENERATED_ASSETS.cursor },
  { match: /adobe/, path: GENERATED_ASSETS.adobe },
  { match: /claude/, path: GENERATED_ASSETS.claude },
  { match: /coursera/, path: GENERATED_ASSETS.coursera },
  { match: /grok|supergrok/, path: GENERATED_ASSETS.grok },
  { match: /elevenlabs/, path: GENERATED_ASSETS.elevenlabs },
  { match: /gamma/, path: GENERATED_ASSETS.gamma },
  { match: /manus/, path: GENERATED_ASSETS.manus },
  { match: /notion/, path: GENERATED_ASSETS.notion },
  { match: /replit/, path: GENERATED_ASSETS.replit },
];

export function getGeneratedCover(
  slug: string,
  family?: string,
): string | null {
  const normalized = slug.toLowerCase();
  const exactFamily = SLUG_MATCHES.find(({ match }) => match.test(normalized));
  if (exactFamily) return exactFamily.path;

  if (family === "trihex-prompt" || family === "trihex-setup" || family === "trihex-automation") {
    return GENERATED_ASSETS.reference;
  }

  return null;
}
