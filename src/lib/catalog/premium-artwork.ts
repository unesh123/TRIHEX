/** Price-free raster artwork shared by duration variants of each product. */
const PRODUCT_ARTWORK: Array<[RegExp, string]> = [
  [/^1password/, "1password"], [/^adobe/, "adobe"],
  [/^amazon-prime/, "prime-video"], [/^beautiful-ai/, "beautiful-ai"],
  [/^character-ai/, "character-ai"], [/^crunchyroll/, "crunchyroll"],
  [/^disney/, "disney"], [/^duolingo/, "duolingo"],
  [/^envato/, "envato"], [/^evernote/, "evernote"],
  [/^(expressvpn|nordvpn|surfshark)/, "vpn"],
  [/^figma/, "figma"], [/^freepik/, "freepik"],
  [/^github-copilot/, "copilot"], [/^grammarly/, "grammarly"],
  [/^hailuo/, "hailuo"], [/^jetbrains/, "jetbrains"],
  [/^leonardo/, "leonardo"], [/^linkedin/, "linkedin"],
  [/^luma/, "luma"], [/^masterclass/, "masterclass"],
  [/^(microsoft|office-365)/, "microsoft"], [/^midjourney/, "midjourney"],
  [/^netflix/, "netflix"], [/^openai-api/, "chatgpt"],
  [/^perplexity/, "perplexity"], [/^pika/, "pika"], [/^poe/, "poe"],
  [/^shutterstock/, "shutterstock"], [/^skillshare/, "skillshare"],
  [/^spotify/, "spotify"], [/^suno/, "suno"], [/^todoist/, "todoist"],
  [/^udio/, "udio"], [/^windows/, "windows"],
  [/^windsurf/, "windsurf"], [/^youtube/, "youtube"],
  [/^claude-code/, "claude-code"],
  [/^claude/, "claude"],
  [/^(chatgpt|gpt-plus)/, "chatgpt"],
  [/^(veo|google-veo)/, "veo"],
  [/^(gemini|google-one-ai)/, "gemini"],
  [/^(grok|super-?grok)/, "grok"],
  [/^canva/, "canva"], [/^capcut/, "capcut"],
  [/^cursor/, "cursor"], [/^coursera/, "coursera"],
  [/^kling/, "kling"], [/^elevenlabs/, "elevenlabs"],
  [/^lovable/, "lovable"], [/^factory/, "factory"],
  [/^framer/, "framer"], [/^gamma/, "gamma"],
  [/^granola/, "granola"], [/^gumloop/, "gumloop"],
  [/^higgsfield/, "higgsfield"], [/^manus/, "manus"],
  [/^mobbin/, "mobbin"], [/^n8n/, "n8n"],
  [/^notion/, "notion"], [/^railway/, "railway"],
  [/^runway/, "runway"], [/^supabase/, "supabase"],
  [/^warp/, "warp"], [/^(muse|musi)-?ai/, "museai"],
  [/^ai-prompt-starter/, "prompt-pack"],
  [/^small-business-ai/, "business-setup"],
  [/^(custom-)?workflow-automation/, "automation"],
  [/^ai-money-maker/, "ai-course"],
  [/^(the-)?psychology-of-closing/, "sales-course"],
  [/^(the-)?passive-rebel/, "leads-course"],
  [/^udemy-16/, "developer-pack"], [/^trihex-vip/, "vip"],
];

// All mapped assets are generated and checked by the catalogue image audit.
export const AVAILABLE_ARTWORK = new Set(PRODUCT_ARTWORK.map(([, key]) => key));

export function premiumArtworkForSlug(slug: string): string | null {
  const key = PRODUCT_ARTWORK.find(([pattern]) => pattern.test(slug.toLowerCase()))?.[1];
  if (!key || !AVAILABLE_ARTWORK.has(key)) return null;
  return `/media/artwork/${key}.webp`;
}
