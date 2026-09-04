import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const MEDIA_DIR = path.join(ROOT, "public", "media", "covers");
const MANIFEST_PATH = path.join(ROOT, "src", "lib", "catalog", "product-cover-manifest.json");
const BRAIN_DIR = "C:/Users/unesh/.gemini/antigravity/brain/7d5185dc-d73a-499c-94ed-ab512eb62556";

interface ManifestEntry {
  slug: string;
  family: string;
  canonical: string;
  publicPath: string;
  mode: string;
  sourceFile: string;
  alt: string;
  resolutionNote: string;
  artWidth: number;
  artHeight: number;
  lowResReplacementRecommended: boolean;
}

// Helper to convert existing image to WebP (no cropping out content)
async function processFullImage(srcPath: string, destPath: string) {
  const dir = path.dirname(destPath);
  fs.mkdirSync(dir, { recursive: true });
  await sharp(srcPath)
    .resize(1200, 1200, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .webp({ quality: 92 })
    .toFile(destPath);
}

// Generate luxury feature infographic poster with Sharp & SVG
async function createFeaturePoster(options: {
  destPath: string;
  title: string;
  subtitle: string;
  badge: string;
  category: string;
  accentColor: string;
  features: string[];
  iconSvg: string;
}) {
  const { destPath, title, subtitle, badge, category, accentColor, features, iconSvg } = options;
  const dir = path.dirname(destPath);
  fs.mkdirSync(dir, { recursive: true });

  const featureItemsSvg = features
    .slice(0, 5)
    .map((feat, idx) => {
      const cleanFeat = feat.replace(/&amp;/g, '&').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `
      <g transform="translate(180, ${640 + idx * 72})">
        <circle cx="20" cy="20" r="18" fill="${accentColor}" fill-opacity="0.15"/>
        <path d="M13 20 L18 25 L27 15" fill="none" stroke="${accentColor}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="56" y="27" fill="#1e293b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="600">${cleanFeat}</text>
      </g>
    `;
    })
    .join("");

  const svg = `
    <svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="#f8fafc"/>
          <stop offset="100%" stop-color="#f1f5f9"/>
        </linearGradient>
        <linearGradient id="pedestalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#e2e8f0"/>
          <stop offset="50%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#cbd5e1"/>
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#0f172a" flood-opacity="0.08"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="1200" height="1200" fill="url(#bgGrad)"/>
      <circle cx="600" cy="320" r="280" fill="${accentColor}" fill-opacity="0.07"/>

      <!-- Header branding -->
      <text x="600" y="90" text-anchor="middle" fill="#0f172a" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" letter-spacing="4">TRIHEX DIGITAL</text>
      <text x="600" y="125" text-anchor="middle" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" letter-spacing="2">PREMIUM DIGITAL ACCESS • NEPAL</text>

      <!-- 3D Pedestal & Central Hero Icon -->
      <g transform="translate(600, 360)">
        <!-- Pedestal base -->
        <ellipse cx="0" cy="110" rx="220" ry="40" fill="url(#pedestalGrad)" filter="url(#shadow)"/>
        <ellipse cx="0" cy="100" rx="200" ry="32" fill="#ffffff"/>
        
        <!-- Central 3D Floating Icon -->
        <g transform="translate(-100, -80)">
          ${iconSvg}
        </g>
      </g>

      <!-- Category & Badge -->
      <g transform="translate(600, 480)">
        <rect x="-140" y="0" width="280" height="38" rx="19" fill="${accentColor}" fill-opacity="0.12"/>
        <text x="0" y="25" text-anchor="middle" fill="${accentColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" letter-spacing="2">${badge.toUpperCase()}</text>
      </g>

      <!-- Title & Subtitle -->
      <text x="600" y="555" text-anchor="middle" fill="#0f172a" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" letter-spacing="-1">${title.replace(/&/g, 'and').toUpperCase()}</text>
      <text x="600" y="598" text-anchor="middle" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="600" letter-spacing="1">${subtitle.replace(/&/g, 'and').toUpperCase()}</text>

      <!-- Features Card -->
      <rect x="130" y="620" width="940" height="420" rx="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" filter="url(#shadow)"/>
      ${featureItemsSvg}

      <!-- Bottom verification footer -->
      <line x1="130" y1="1080" x2="1070" y2="1080" stroke="#e2e8f0" stroke-width="1.5"/>
      <text x="600" y="1125" text-anchor="middle" fill="#475569" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700">Website Order Tracking • WhatsApp +977 9702910130</text>
      <text x="600" y="1155" text-anchor="middle" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500">Availability, activation &amp; delivery guarantee apply. Independent retailer.</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .webp({ quality: 92 })
    .toFile(destPath);
}

async function main() {
  console.log("Starting feature cover preparation...");

  const manifest: ManifestEntry[] = [];

  // 1. Process brain-generated posters
  const brainFiles = [
    {
      src: path.join(BRAIN_DIR, "elevenlabs_creator_poster_1788529719746.jpg"),
      dest: path.join(MEDIA_DIR, "elevenlabs", "elevenlabs-creator-shared.webp"),
      slug: "elevenlabs-creator-shared",
      family: "elevenlabs",
      canonical: "elevenlabs-creator-shared.webp",
      alt: "ElevenLabs Creator Shared Plan high-res feature poster.",
    },
    {
      src: path.join(BRAIN_DIR, "higgsfield_pro_poster_1788529778760.jpg"),
      dest: path.join(MEDIA_DIR, "video", "higgsfield-pro-12m.webp"),
      slug: "higgsfield-pro-12m",
      family: "video",
      canonical: "higgsfield-pro-12m.webp",
      alt: "Higgsfield Pro 12-Month AI Video high-res feature poster.",
    },
    {
      src: path.join(BRAIN_DIR, "manus_ai_pro_poster_1788529826975.jpg"),
      dest: path.join(MEDIA_DIR, "ai", "manus-ai-pro-12m.webp"),
      slug: "manus-ai-pro-12m",
      family: "ai",
      canonical: "manus-ai-pro-12m.webp",
      alt: "Manus AI Pro 12-Month Autonomous Agent high-res feature poster.",
    },
  ];

  for (const item of brainFiles) {
    if (fs.existsSync(item.src)) {
      await processFullImage(item.src, item.dest);
      manifest.push({
        slug: item.slug,
        family: item.family,
        canonical: item.canonical,
        publicPath: `/media/covers/${item.family}/${item.canonical}`,
        mode: "FULL_FEATURE_POSTER",
        sourceFile: path.basename(item.src),
        alt: item.alt,
        resolutionNote: "HIGH_RES_INFOGRAPHIC",
        artWidth: 1200,
        artHeight: 1200,
        lowResReplacementRecommended: false,
      });
      console.log(`Processed generated: ${item.slug}`);
    }
  }

  // 2. Process root pristine posters (WITHOUT CROPPING)
  const rootFiles = [
    {
      src: "gemenai 18 monts plan rs 399.png",
      dest: path.join(MEDIA_DIR, "gemini", "gemini-pro-18-month-upgrade.webp"),
      slug: "gemini-pro-18-months-link",
      family: "gemini",
      canonical: "gemini-pro-18-month-upgrade.webp",
      alt: "Google Gemini AI Pro 18 Months full infographic feature poster.",
    },
    {
      src: "google ai pro rs 399.jpg",
      dest: path.join(MEDIA_DIR, "gemini", "google-ai-pro-12m.webp"),
      slug: "google-ai-pro-12m",
      family: "gemini",
      canonical: "google-ai-pro-12m.webp",
      alt: "Google AI Pro 5TB 12-Month feature poster.",
    },
    {
      src: "chat gpt plus 1 month plan (full arrenty).jpg",
      dest: path.join(MEDIA_DIR, "chatgpt", "chatgpt-plus-1-month-fw.webp"),
      slug: "chatgpt-plus-1-month-fw",
      family: "chatgpt",
      canonical: "chatgpt-plus-1-month-fw.webp",
      alt: "ChatGPT Plus 1 Month Full Warranty feature poster.",
    },
    {
      src: "canva pro 1year premium.jpg",
      dest: path.join(MEDIA_DIR, "canva", "canva-pro-1-year.webp"),
      slug: "canva-pro-1-year",
      family: "canva",
      canonical: "canva-pro-1-year.webp",
      alt: "Canva Pro 1 Year Unlimited Access feature poster.",
    },
    {
      src: "capcut pro 6 months.jpg",
      dest: path.join(MEDIA_DIR, "capcut", "capcut-pro-6-months.webp"),
      slug: "capcut-pro",
      family: "capcut",
      canonical: "capcut-pro-6-months.webp",
      alt: "CapCut Pro 6-Month Membership feature poster.",
    },
    {
      src: "capcut pro 7 days.jpg",
      dest: path.join(MEDIA_DIR, "capcut", "capcut-pro-7-days.webp"),
      slug: "capcut-pro-7-days",
      family: "capcut",
      canonical: "capcut-pro-7-days.webp",
      alt: "CapCut Pro 7-Day Access feature poster.",
    },
    {
      src: "corsera premium 1 year.jpg",
      dest: path.join(MEDIA_DIR, "coursera", "coursera-premium-1-year.webp"),
      slug: "coursera-premium-1-year",
      family: "coursera",
      canonical: "coursera-premium-1-year.webp",
      alt: "Coursera Premium 1 Year Membership feature poster.",
    },
    {
      src: "cursor pro 30 days.jpg",
      dest: path.join(MEDIA_DIR, "cursor", "cursor-pro-12m.webp"),
      slug: "cursor-pro-12m",
      family: "cursor",
      canonical: "cursor-pro-12m.webp",
      alt: "Cursor Pro Developer Tool feature poster.",
    },
    {
      src: "kling ai 750 creditss kling standard.png",
      dest: path.join(MEDIA_DIR, "kling", "kling-standard-680-750-credits.webp"),
      slug: "kling-standard-680-750-credits",
      family: "kling",
      canonical: "kling-standard-680-750-credits.webp",
      alt: "Kling AI Standard 680-750 Credits feature poster.",
    },
    {
      src: "kling ai 26k credits plan rs 13999.png",
      dest: path.join(MEDIA_DIR, "kling", "kling-ultra-26k-credits.webp"),
      slug: "kling-ultra-26k-credits",
      family: "kling",
      canonical: "kling-ultra-26k-credits.webp",
      alt: "Kling AI Ultra 26K Credits feature poster.",
    },
    {
      src: "supergrok 3month package rs3499.png",
      dest: path.join(MEDIA_DIR, "grok", "supergrok-3-months.webp"),
      slug: "supergrok-3-months",
      family: "grok",
      canonical: "supergrok-3-months.webp",
      alt: "SuperGrok 3-Month Package feature poster.",
    },
    {
      src: "veo4 ultra 25k credits.png",
      dest: path.join(MEDIA_DIR, "gemini", "veo4-ultra-25k-credits.webp"),
      slug: "veo4-ultra-25k-credits",
      family: "gemini",
      canonical: "veo4-ultra-25k-credits.webp",
      alt: "Veo4 Ultra 25K Credits feature poster.",
    },
    {
      src: "TRIHEX AI PROMPT STARTER PACK.png",
      dest: path.join(MEDIA_DIR, "trihex", "trihex-ai-prompt-starter-pack.webp"),
      slug: "ai-prompt-starter-pack",
      family: "trihex",
      canonical: "trihex-ai-prompt-starter-pack.webp",
      alt: "TRIHEX AI Prompt Starter Pack feature poster.",
    },
    {
      src: "TRIHEX SMALL BUSINESS AI SETUP.png",
      dest: path.join(MEDIA_DIR, "trihex", "trihex-small-business-ai-setup.webp"),
      slug: "small-business-ai-setup-consultation",
      family: "trihex",
      canonical: "trihex-small-business-ai-setup.webp",
      alt: "TRIHEX Small Business AI Setup Consultation feature poster.",
    },
    {
      src: "Designer (1).png",
      dest: path.join(MEDIA_DIR, "trihex", "custom-workflow-automation-discovery.webp"),
      slug: "custom-workflow-automation-discovery",
      family: "trihex",
      canonical: "custom-workflow-automation-discovery.webp",
      alt: "TRIHEX Workflow Automation Discovery feature poster.",
    },
  ];

  for (const item of rootFiles) {
    const fullSrc = path.join(ROOT, item.src);
    if (fs.existsSync(fullSrc)) {
      await processFullImage(fullSrc, item.dest);
      manifest.push({
        slug: item.slug,
        family: item.family,
        canonical: item.canonical,
        publicPath: `/media/covers/${item.family}/${item.canonical}`,
        mode: "FULL_FEATURE_POSTER",
        sourceFile: item.src,
        alt: item.alt,
        resolutionNote: "HIGH_RES_SINGLE",
        artWidth: 1200,
        artHeight: 1200,
        lowResReplacementRecommended: false,
      });
      console.log(`Processed root poster: ${item.slug}`);
    }
  }

  // 3. Create high-resolution custom posters for the remaining products
  const customProducts = [
    {
      destPath: path.join(MEDIA_DIR, "developer", "warp-build-1-year.webp"),
      slug: "warp-build-1-year",
      family: "developer",
      canonical: "warp-build-1-year.webp",
      title: "Warp Build",
      subtitle: "High-Speed CI/CD Cloud Runners",
      badge: "1-Year Membership",
      category: "Developer Tools",
      accentColor: "#8b5cf6",
      features: [
        "Up to 20x Faster Build &amp; Test Execution",
        "Linux &amp; macOS Cloud Native Runners",
        "Drop-in Replacement for GitHub Actions",
        "High Parallel Build Concurrency",
        "Full Commercial SLA &amp; Reliability",
      ],
      iconSvg: `
        <rect x="10" y="10" width="180" height="140" rx="24" fill="#0f172a"/>
        <path d="M40 50 L75 80 L40 110" stroke="#8b5cf6" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <line x1="95" y1="110" x2="140" y2="110" stroke="#a855f7" stroke-width="12" stroke-linecap="round"/>
      `,
    },
    {
      destPath: path.join(MEDIA_DIR, "automation", "n8n-starter-1-year.webp"),
      slug: "n8n-starter-1-year",
      family: "automation",
      canonical: "n8n-starter-1-year.webp",
      title: "n8n Starter",
      subtitle: "Fair-Code Workflow Automation",
      badge: "12-Month Plan",
      category: "Automation",
      accentColor: "#ef4444",
      features: [
        "500+ Built-In Integrations &amp; Webhooks",
        "Autonomous AI Agent Workflows",
        "Visual Drag-and-Drop Node Builder",
        "Custom JavaScript &amp; Python Execution",
        "Cloud Hosted &amp; High Availability",
      ],
      iconSvg: `
        <circle cx="50" cy="80" r="28" fill="#ef4444"/>
        <circle cx="150" cy="40" r="28" fill="#ea580c"/>
        <circle cx="150" cy="120" r="28" fill="#f59e0b"/>
        <line x1="50" y1="80" x2="150" y2="40" stroke="#ef4444" stroke-width="10"/>
        <line x1="50" y1="80" x2="150" y2="120" stroke="#ef4444" stroke-width="10"/>
      `,
    },
    {
      destPath: path.join(MEDIA_DIR, "video", "veo3-ultra-flow-credits.webp"),
      slug: "veo3-ultra-flow-credits",
      family: "video",
      canonical: "veo3-ultra-flow-credits.webp",
      title: "Veo 3 Ultra",
      subtitle: "45K Credits • AI Video Flow",
      badge: "1-Month Access",
      category: "Video Generation",
      accentColor: "#0ea5e9",
      features: [
        "45,000 Generation Credits Included",
        "Google AI Video Flow Extension Support",
        "High-Resolution Cinematic Rendering",
        "Text-to-Video &amp; Image-to-Video Creation",
        "25-Day Full Warranty Included",
      ],
      iconSvg: `
        <rect x="20" y="20" width="160" height="120" rx="20" fill="#0284c7"/>
        <polygon points="75,50 135,80 75,110" fill="#ffffff"/>
        <circle cx="150" cy="30" r="14" fill="#38bdf8"/>
      `,
    },
    {
      destPath: path.join(MEDIA_DIR, "developer", "lovable-pro-12m.webp"),
      slug: "lovable-pro-12m",
      family: "developer",
      canonical: "lovable-pro-12m.webp",
      title: "Lovable Pro",
      subtitle: "Full-Stack AI Software Builder",
      badge: "12-Month Access",
      category: "Developer Tools",
      accentColor: "#f43f5e",
      features: [
        "Build Web Apps from Natural Language",
        "Supabase &amp; GitHub Native Integrations",
        "Instant Live Preview &amp; Editing",
        "Export Production-Ready Code",
        "Full 12-Month Pro Membership",
      ],
      iconSvg: `
        <path d="M100 45 C75 10 25 25 25 70 C25 110 80 140 100 155 C120 140 175 110 175 70 C175 25 125 10 100 45 Z" fill="#f43f5e"/>
      `,
    },
    {
      destPath: path.join(MEDIA_DIR, "developer", "supabase-pro-1-year.webp"),
      slug: "supabase-pro-1-year",
      family: "developer",
      canonical: "supabase-pro-1-year.webp",
      title: "Supabase Pro",
      subtitle: "The Open Source Firebase Alternative",
      badge: "1-Year Plan",
      category: "Developer Tools",
      accentColor: "#10b981",
      features: [
        "Dedicated PostgreSQL Database &amp; Storage",
        "100,000 Monthly Active Users Included",
        "Automated Daily Backups (7-Day Retention)",
        "Edge Functions &amp; Realtime Subscriptions",
        "Pro Tier SLA &amp; Compute Upgrades",
      ],
      iconSvg: `
        <path d="M105 15 L25 110 H95 L90 155 L175 60 H105 Z" fill="#10b981"/>
      `,
    },
    {
      destPath: path.join(MEDIA_DIR, "productivity", "notion-business-12m.webp"),
      slug: "notion-business-12m",
      family: "productivity",
      canonical: "notion-business-12m.webp",
      title: "Notion Business",
      subtitle: "Connected Workspace &amp; Team Wiki",
      badge: "12-Month Access",
      category: "Productivity",
      accentColor: "#0f172a",
      features: [
        "Unlimited Blocks &amp; Collaborative Pages",
        "Advanced Team Permissions &amp; Workspaces",
        "SAML SSO &amp; Private Teamspaces",
        "90-Day Page Version History",
        "Export Entire Workspace as PDF/HTML",
      ],
      iconSvg: `
        <rect x="25" y="20" width="150" height="130" rx="16" fill="#0f172a"/>
        <text x="100" y="110" fill="#ffffff" font-family="sans-serif" font-size="90" font-weight="900" text-anchor="middle">N</text>
      `,
    },
    {
      destPath: path.join(MEDIA_DIR, "video", "runway-pro-12m.webp"),
      slug: "runway-pro-12m",
      family: "video",
      canonical: "runway-pro-12m.webp",
      title: "Runway Pro",
      subtitle: "Gen-3 Alpha AI Video Studio",
      badge: "12-Month Access",
      category: "Video Generation",
      accentColor: "#6366f1",
      features: [
        "Gen-3 Alpha Cinematic Video Generation",
        "Text to Video, Image to Video &amp; Motion",
        "4K Upscaling &amp; Professional Removal Tools",
        "Unlimited Generation Options",
        "Full Pro Tier Commercial License",
      ],
      iconSvg: `
        <circle cx="100" cy="80" r="65" fill="#6366f1"/>
        <path d="M75 50 L135 80 L75 110 Z" fill="#ffffff"/>
      `,
    },
    {
      destPath: path.join(MEDIA_DIR, "productivity", "granola-business-12m.webp"),
      slug: "granola-business-12m",
      family: "productivity",
      canonical: "granola-business-12m.webp",
      title: "Granola Business",
      subtitle: "AI Notepad for Smarter Meetings",
      badge: "12-Month Access",
      category: "Productivity",
      accentColor: "#84cc16",
      features: [
        "Intelligent Mac AI Meeting Transcription",
        "Automated Action Items &amp; Executive Notes",
        "Seamless Notion, Slack &amp; Email Export",
        "Custom Templates &amp; Private Team Sharing",
        "100% Secure Audio Processing",
      ],
      iconSvg: `
        <circle cx="100" cy="80" r="60" fill="#84cc16"/>
        <path d="M70 80 Q100 50 130 80 Q100 110 70 80 Z" fill="#ffffff"/>
      `,
    },
    {
      destPath: path.join(MEDIA_DIR, "design", "mobbin-12m.webp"),
      slug: "mobbin-12m",
      family: "design",
      canonical: "mobbin-12m.webp",
      title: "Mobbin Pro",
      subtitle: "World's Largest UI/UX Library",
      badge: "12-Month Access",
      category: "Design",
      accentColor: "#0284c7",
      features: [
        "300,000+ Real Mobile &amp; Web App Screens",
        "Complete User Journey Flows &amp; Patterns",
        "Filter by Screen, Element &amp; Interaction",
        "Copy to Figma with Full Components",
        "10x Seat License Access",
      ],
      iconSvg: `
        <rect x="40" y="20" width="120" height="130" rx="20" fill="#0284c7"/>
        <rect x="55" y="35" width="90" height="90" rx="10" fill="#ffffff"/>
      `,
    },
    {
      destPath: path.join(MEDIA_DIR, "developer", "railway-hobby-12m.webp"),
      slug: "railway-hobby-12m",
      family: "developer",
      canonical: "railway-hobby-12m.webp",
      title: "Railway Hobby",
      subtitle: "Frictionless App &amp; DB Cloud Hosting",
      badge: "12-Month Plan",
      category: "Developer Tools",
      accentColor: "#d946ef",
      features: [
        "Instant Deployments from GitHub",
        "PostgreSQL, Redis &amp; MySQL One-Click",
        "Custom Domains &amp; Auto-Renewing SSL",
        "Generous Monthly Compute &amp; Network Tier",
        "Zero Devops Configuration Required",
      ],
      iconSvg: `
        <circle cx="100" cy="80" r="60" fill="#d946ef"/>
        <line x1="60" y1="80" x2="140" y2="80" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
        <line x1="80" y1="60" x2="80" y2="100" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
        <line x1="120" y1="60" x2="120" y2="100" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
      `,
    },
    {
      destPath: path.join(MEDIA_DIR, "design", "framer-pro-12m.webp"),
      slug: "framer-pro-12m",
      family: "design",
      canonical: "framer-pro-12m.webp",
      title: "Framer Pro",
      subtitle: "Next-Gen AI Website Builder",
      badge: "12-Month Access",
      category: "Design",
      accentColor: "#000000",
      features: [
        "Design &amp; Publish Fast, Responsive Sites",
        "Unlimited Custom Domains &amp; Pages",
        "30 CMS Collections &amp; Dynamic Content",
        "Advanced Interactive Effects &amp; Motion",
        "Top Tier SEO &amp; Lightning Global CDN",
      ],
      iconSvg: `
        <path d="M50 25 H150 L100 80 H50 Z" fill="#000000"/>
        <path d="M50 80 H100 L150 135 H50 Z" fill="#000000"/>
      `,
    },
    {
      destPath: path.join(MEDIA_DIR, "developer", "factory-12m.webp"),
      slug: "factory-12m",
      family: "developer",
      canonical: "factory-12m.webp",
      title: "Factory Droid AI",
      subtitle: "Autonomous Software Droids",
      badge: "12-Month Plan",
      category: "Developer Tools",
      accentColor: "#3b82f6",
      features: [
        "Autonomous AI Software Engineering Droids",
        "Automated Code Auditing &amp; PR Generation",
        "Repo-Wide Architectural Understanding",
        "Continuous Feature Development &amp; Tests",
        "High-Speed Cloud Execution",
      ],
      iconSvg: `
        <rect x="40" y="30" width="120" height="110" rx="18" fill="#3b82f6"/>
        <circle cx="75" cy="75" r="14" fill="#ffffff"/>
        <circle cx="125" cy="75" r="14" fill="#ffffff"/>
        <rect x="70" y="105" width="60" height="10" rx="5" fill="#ffffff"/>
      `,
    },
    {
      destPath: path.join(MEDIA_DIR, "automation", "gumloop-pro-12m.webp"),
      slug: "gumloop-pro-12m",
      family: "automation",
      canonical: "gumloop-pro-12m.webp",
      title: "Gumloop Pro",
      subtitle: "AI Web Scraping &amp; Agent Automation",
      badge: "12-Month Plan",
      category: "Automation",
      accentColor: "#db2777",
      features: [
        "Autonomous AI Web Data Extraction",
        "Custom Python Scripts &amp; API Integrations",
        "Batch Processing for Thousands of Rows",
        "Visual Flow &amp; Agent Pipeline Builder",
        "Instant Export to Google Sheets &amp; DB",
      ],
      iconSvg: `
        <circle cx="100" cy="80" r="60" fill="#db2777"/>
        <circle cx="100" cy="80" r="30" fill="#ffffff"/>
      `,
    },
  ];

  for (const prod of customProducts) {
    await createFeaturePoster(prod);
    manifest.push({
      slug: prod.slug,
      family: prod.family,
      canonical: prod.canonical,
      publicPath: `/media/covers/${prod.family}/${prod.canonical}`,
      mode: "FULL_FEATURE_POSTER",
      sourceFile: `generated-${prod.slug}`,
      alt: `${prod.title} ${prod.subtitle} feature poster.`,
      resolutionNote: "HIGH_RES_INFOGRAPHIC",
      artWidth: 1200,
      artHeight: 1200,
      lowResReplacementRecommended: false,
    });
    console.log(`Generated feature poster: ${prod.slug}`);
  }

  // Write updated manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`Saved ${manifest.length} covers to ${MANIFEST_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
