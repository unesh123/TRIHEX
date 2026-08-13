import { cn } from "@/lib/utils";

export type BrandFamily =
  | "gemini"
  | "chatgpt"
  | "grok"
  | "claude"
  | "adobe"
  | "canva"
  | "coursera"
  | "capcut"
  | "kling"
  | "cursor"
  | "trihex-prompt"
  | "trihex-setup"
  | "trihex-automation"
  | "generic";

const FAMILY_FROM_BRAND: Record<string, BrandFamily> = {
  gemini: "gemini",
  openai: "chatgpt",
  grok: "grok",
  claude: "claude",
  adobe: "adobe",
  canva: "canva",
  coursera: "coursera",
  capcut: "capcut",
  kling: "kling",
  cursor: "cursor",
  microsoft: "generic",
  grammarly: "generic",
  nordvpn: "generic",
  youtube: "capcut",
  figma: "canva",
  elevenlabs: "claude",
  trihex: "trihex-prompt",
};

export function resolveBrandFamily(
  brandSlug: string,
  productSlug?: string,
): BrandFamily {
  if (productSlug?.includes("prompt")) return "trihex-prompt";
  if (productSlug?.includes("consultation") || productSlug?.includes("setup"))
    return "trihex-setup";
  if (productSlug?.includes("automation") || productSlug?.includes("workflow"))
    return "trihex-automation";
  return FAMILY_FROM_BRAND[brandSlug] ?? "generic";
}

const ACCENTS: Record<BrandFamily, { a: string; b: string; c: string }> = {
  gemini: { a: "#6D4AFF", b: "#3B82F6", c: "#A78BFA" },
  chatgpt: { a: "#138A63", b: "#374151", c: "#34D399" },
  grok: { a: "#111827", b: "#2563EB", c: "#94A3B8" },
  claude: { a: "#C2410C", b: "#D6B48C", c: "#FEF3C7" },
  adobe: { a: "#E11D48", b: "#7C3AED", c: "#2563EB" },
  canva: { a: "#06B6D4", b: "#8B5CF6", c: "#22D3EE" },
  coursera: { a: "#1D4ED8", b: "#312E81", c: "#93C5FD" },
  capcut: { a: "#111827", b: "#6D4AFF", c: "#22D3EE" },
  kling: { a: "#D97706", b: "#2563EB", c: "#FDE68A" },
  cursor: { a: "#4B5563", b: "#6D4AFF", c: "#C4B5FD" },
  "trihex-prompt": { a: "#6D4AFF", b: "#138A63", c: "#EEE9FF" },
  "trihex-setup": { a: "#2563EB", b: "#6D4AFF", c: "#DBEAFE" },
  "trihex-automation": { a: "#6D4AFF", b: "#0EA5E9", c: "#E0E7FF" },
  generic: { a: "#6D4AFF", b: "#94A3B8", c: "#E2E8F0" },
};

function Geometry({ family }: { family: BrandFamily }) {
  const c = ACCENTS[family];
  switch (family) {
    case "gemini":
      return (
        <>
          <circle cx="120" cy="120" r="46" fill={c.a} opacity="0.9" />
          <circle cx="120" cy="120" r="28" fill={c.b} opacity="0.85" />
          <path
            d="M120 52 L132 108 L188 120 L132 132 L120 188 L108 132 L52 120 L108 108 Z"
            fill={c.c}
            opacity="0.75"
          />
        </>
      );
    case "chatgpt":
      return (
        <>
          <circle cx="90" cy="110" r="28" fill={c.a} />
          <circle cx="150" cy="110" r="28" fill={c.b} opacity="0.85" />
          <path
            d="M118 110 C118 90 122 90 122 110 C122 130 118 130 118 110 Z"
            fill={c.c}
          />
          <rect x="70" y="150" width="100" height="14" rx="7" fill={c.a} opacity="0.35" />
        </>
      );
    case "grok":
      return (
        <>
          <circle cx="120" cy="120" r="54" fill="none" stroke={c.b} strokeWidth="6" />
          <circle cx="120" cy="120" r="22" fill={c.a} />
          <circle cx="168" cy="78" r="10" fill={c.b} />
          <circle cx="74" cy="166" r="8" fill={c.c} />
        </>
      );
    case "claude":
      return (
        <>
          <rect x="70" y="70" width="48" height="48" rx="10" fill={c.a} />
          <rect x="122" y="70" width="48" height="48" rx="10" fill={c.b} />
          <rect x="70" y="122" width="100" height="48" rx="10" fill={c.c} />
        </>
      );
    case "adobe":
      return (
        <>
          <polygon points="120,55 175,165 65,165" fill={c.a} opacity="0.9" />
          <polygon points="120,85 155,155 85,155" fill={c.b} opacity="0.85" />
          <circle cx="120" cy="130" r="14" fill={c.c} />
        </>
      );
    case "canva":
      return (
        <>
          <path
            d="M50 140 C90 60, 150 60, 190 140"
            fill="none"
            stroke={c.a}
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M60 160 C100 90, 140 90, 180 160"
            fill="none"
            stroke={c.b}
            strokeWidth="10"
            strokeLinecap="round"
          />
        </>
      );
    case "coursera":
      return (
        <>
          <rect x="68" y="70" width="104" height="18" rx="4" fill={c.a} />
          <rect x="78" y="100" width="84" height="14" rx="4" fill={c.c} />
          <rect x="88" y="126" width="64" height="14" rx="4" fill={c.b} opacity="0.7" />
          <circle cx="120" cy="170" r="12" fill={c.a} />
        </>
      );
    case "capcut":
      return (
        <>
          <rect x="55" y="80" width="130" height="80" rx="12" fill={c.a} />
          <rect x="70" y="100" width="40" height="40" rx="6" fill={c.b} />
          <rect x="120" y="110" width="50" height="8" rx="4" fill={c.c} />
          <rect x="120" y="128" width="36" height="8" rx="4" fill={c.c} opacity="0.7" />
        </>
      );
    case "kling":
      return (
        <>
          <rect x="55" y="70" width="70" height="100" rx="10" fill={c.a} opacity="0.85" />
          <rect x="115" y="90" width="70" height="80" rx="10" fill={c.b} opacity="0.8" />
          <circle cx="90" cy="120" r="16" fill={c.c} />
        </>
      );
    case "cursor":
      return (
        <>
          <rect x="60" y="60" width="120" height="120" rx="16" fill={c.a} opacity="0.15" />
          <rect x="78" y="78" width="84" height="18" rx="4" fill={c.b} />
          <rect x="78" y="108" width="64" height="10" rx="3" fill={c.c} />
          <rect x="78" y="128" width="74" height="10" rx="3" fill={c.c} opacity="0.7" />
          <rect x="78" y="148" width="48" height="10" rx="3" fill={c.b} opacity="0.5" />
        </>
      );
    case "trihex-prompt":
      return (
        <>
          <polygon points="120,50 170,80 170,140 120,170 70,140 70,80" fill={c.a} opacity="0.9" />
          <polygon points="120,78 148,94 148,126 120,142 92,126 92,94" fill={c.c} />
          <circle cx="120" cy="110" r="12" fill={c.b} />
        </>
      );
    case "trihex-setup":
      return (
        <>
          <rect x="55" y="95" width="50" height="50" rx="10" fill={c.a} />
          <rect x="115" y="70" width="50" height="50" rx="10" fill={c.b} />
          <rect x="145" y="130" width="40" height="40" rx="10" fill={c.c} />
          <path d="M105 120 H115 M165 120 V130" stroke={c.a} strokeWidth="4" />
        </>
      );
    case "trihex-automation":
      return (
        <>
          <circle cx="70" cy="120" r="22" fill={c.a} />
          <circle cx="120" cy="120" r="22" fill={c.b} />
          <circle cx="170" cy="120" r="22" fill={c.a} opacity="0.75" />
          <path
            d="M92 120 H98 M142 120 H148"
            stroke={c.c}
            strokeWidth="6"
            strokeLinecap="round"
          />
        </>
      );
    default:
      return <circle cx="120" cy="120" r="40" fill={c.a} />;
  }
}

export function FamilyArtwork({
  family,
  className,
  title,
}: {
  family: BrandFamily;
  className?: string;
  title?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-square w-full overflow-hidden rounded-[18px] border border-[var(--border)] bg-[#F7F8FC]",
        className,
      )}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title}
    >
      <svg viewBox="0 0 240 240" className="h-full w-full p-5" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={`glow-${family}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#F2F4F8" stopOpacity="1" />
          </radialGradient>
        </defs>
        <rect width="240" height="240" fill={`url(#glow-${family})`} rx="18" />
        <ellipse cx="120" cy="185" rx="54" ry="10" fill="#111827" opacity="0.08" />
        <Geometry family={family} />
      </svg>
    </div>
  );
}
