/**
 * TRIHEX DIGITAL — Classified Vault & Developer Loots Dataset
 * High-value digital bundles, free developer perks, official public legal dockets,
 * and historical purchasing power / inflation metrics.
 */

export type VaultCategory =
  | "all"
  | "vip-bundles"
  | "developer-perks"
  | "public-records"
  | "interactive-tools";

export type VaultItemType =
  | "PAID_BUNDLE"
  | "FREE_PERK"
  | "PUBLIC_RECORD"
  | "INTERACTIVE_TOOL";

export interface VaultItem {
  id: string;
  slug: string;
  title: string;
  category: VaultCategory;
  type: VaultItemType;
  classificationBadge: string;
  securityLevel: "CLASSIFIED" | "PUBLIC" | "RESTRICTED" | "UNLOCKED";
  priceNpr: number | null;
  compareAtPriceNpr?: number | null;
  originalValuation: string;
  fileSize: string;
  /** Server-only secret reference ID (never exposed in client JS) */
  fulfillmentSecretId?: string | null;
  downloadUrl?: string | null;
  sourceCitation?: string | null;
  shortDescription: string;
  highlights: string[];
  deliverable: string;
  validFrom?: string;
  validUntil?: string;
  lastVerifiedAt?: string;
  status: "ACTIVE" | "EXPIRED" | "NEEDS_REVIEW";
  updatedAt: string;
  featured?: boolean;
}

export const VAULT_ITEMS: VaultItem[] = [
  // 1. Paid VIP Vault Drops
  {
    id: "v-01",
    slug: "ai-money-maker-digital-course-2026",
    title: "AI Money Maker Digital Products & Marketing Course (2026)",
    category: "vip-bundles",
    type: "PAID_BUNDLE",
    classificationBadge: "LEVEL 5 ENCRYPTED ARCHIVE",
    securityLevel: "RESTRICTED",
    priceNpr: 499,
    compareAtPriceNpr: 2999,
    originalValuation: "Rs. 2,999 (~$22 USD)",
    fileSize: "1.8 GB Cloud Vault",
    fulfillmentSecretId: "sec-vault-aimoney-2026",
    downloadUrl: null, // delivered upon verified order with expiring signed token
    shortDescription:
      "Comprehensive 2026 master course on building, automating, and scaling digital asset stores using cutting-edge AI agents and high-converting funnels.",
    highlights: [
      "50+ Uncensored system prompts for research, copy & conversion",
      "Automated dropshipping & digital download blueprint",
      "Plug-and-play landing page templates & email closing sequences",
      "Single-use cryptographically signed expiring delivery link",
      "Zero prior technical skills required",
    ],
    deliverable: "Expiring Signed Single-Use Access Token",
    status: "ACTIVE",
    updatedAt: "March 2026",
    featured: true,
  },
  {
    id: "v-02",
    slug: "the-psychology-of-closing-bundle",
    title: "The Psychology of Closing + Complete Sales Frameworks",
    category: "vip-bundles",
    type: "PAID_BUNDLE",
    classificationBadge: "HIGH-TICKET SALES VAULT",
    securityLevel: "RESTRICTED",
    priceNpr: 399,
    compareAtPriceNpr: 2499,
    originalValuation: "Rs. 2,499 ($19 USD)",
    fileSize: "680 MB Vault",
    fulfillmentSecretId: "sec-vault-psych-close",
    downloadUrl: null,
    shortDescription:
      "Battle-tested sales objection handling scripts, psychology closing frameworks, cold DM outreach playbooks, and negotiation psychology.",
    highlights: [
      "47 Word-for-word high-ticket objection rebuttal scripts",
      "B2B cold email & WhatsApp conversion sequences",
      "Price resistance elimination and value anchoring formulas",
      "Customer decision psychology matrix",
    ],
    deliverable: "Digital Video & PDF Master Vault",
    status: "ACTIVE",
    updatedAt: "March 2026",
    featured: true,
  },
  {
    id: "v-03",
    slug: "the-passive-rebel-antisocial-leads",
    title: "The Passive Rebel (Antisocial Leads Generation)",
    category: "vip-bundles",
    type: "PAID_BUNDLE",
    classificationBadge: "COVERT TRAFFIC BLUEPRINT",
    securityLevel: "RESTRICTED",
    priceNpr: 399,
    compareAtPriceNpr: 5999,
    originalValuation: "$500 (Rs. 67,000+ Value)",
    fileSize: "440 MB Systems & SOPs",
    fulfillmentSecretId: "sec-vault-passive-rebel",
    downloadUrl: null,
    shortDescription:
      "Covert inbound client acquisition without personal branding, dancing on social media, or spending thousands on paid ads.",
    highlights: [
      "Faceless organic traffic funnels across Reddit, LinkedIn & SEO",
      "Programmatic lead scraping pipelines",
      "Inbound funnel architecture converting passive lurkers",
      "Full SOPs, templates, and execution checklists",
    ],
    deliverable: "Complete Systems Vault & Automation Blueprints",
    status: "ACTIVE",
    updatedAt: "March 2026",
    featured: true,
  },
  {
    id: "v-04",
    slug: "udemy-16-developer-ai-agent-pack",
    title: "Udemy 16 Package Developer AI Agent Masterclass Pack",
    category: "vip-bundles",
    type: "PAID_BUNDLE",
    classificationBadge: "DEVELOPER INTEL ARCHIVE",
    securityLevel: "RESTRICTED",
    priceNpr: 499,
    compareAtPriceNpr: 3999,
    originalValuation: "Rs. 3,999 ($30 USD)",
    fileSize: "14.5 GB Video & Repos",
    fulfillmentSecretId: "sec-vault-udemy-16",
    downloadUrl: null,
    shortDescription:
      "16 Complete developer courses covering autonomous AI agents, Cursor Pro mastery, Claude Code terminal workflows, and full-stack AI deployment.",
    highlights: [
      "16 Full courses: autonomous agents, LangChain, MCP & tool use",
      "Claude Code & Cursor engineering workflows",
      "Production deployment to Cloud Run, Supabase & Next.js",
      "Prompt repositories and ready-to-run GitHub starters",
    ],
    deliverable: "Mega Cloud Archive with Lifetime Access",
    status: "ACTIVE",
    updatedAt: "March 2026",
    featured: true,
  },

  // 2. Free Developer Perks & Cloud Loots
  {
    id: "p-01",
    slug: "pcloud-500gb-90-days-voucher",
    title: "pCloud 500GB Premium Cloud (90 Days Free)",
    category: "developer-perks",
    type: "FREE_PERK",
    classificationBadge: "EXPIRED PROMO PERK",
    securityLevel: "UNLOCKED",
    priceNpr: 0,
    originalValuation: "$15 Free Value",
    fileSize: "Cloud License Guide",
    downloadUrl: "https://www.pcloud.com/promo/90days500gb",
    shortDescription:
      "Official 90-day extended trial for pCloud 500GB Swiss encrypted cloud storage. (Note: Campaign expired on August 22, 2026).",
    highlights: [
      "500GB Swiss-grade secure cloud storage",
      "Encrypted link sharing with password protection",
      "Automatic photo & document backup across mobile and desktop",
      "Campaign concluded on 22 August 2026",
    ],
    deliverable: "Archived Promo Link (Expired)",
    validUntil: "2026-08-22",
    lastVerifiedAt: "2026-09-05",
    status: "EXPIRED",
    updatedAt: "September 2026",
  },
  {
    id: "p-02",
    slug: "wasmer-pro-3-months-promo",
    title: "Wasmer Pro Serverless Cloud (3 Months Free)",
    category: "developer-perks",
    type: "FREE_PERK",
    classificationBadge: "DEVELOPER CLOUD PERK",
    securityLevel: "UNLOCKED",
    priceNpr: 0,
    originalValuation: "$90 Free Value",
    fileSize: "Edge Serverless Voucher",
    downloadUrl: "https://wasmer.io",
    shortDescription:
      "Deploy WebAssembly backend applications globally in milliseconds with Wasmer Edge serverless compute. 3 months free Wasmer Pro voucher guide.",
    highlights: [
      "Deploy any language (Rust, Python, Go, JS) via WebAssembly",
      "Zero-cold-start edge execution across 50+ global locations",
      "Includes Wasmer Pro deployment credits ($90 value)",
      "Instant activation via GitHub authentication",
    ],
    deliverable: "Wasmer Edge Setup Guide & Coupon Link",
    validUntil: "2026-12-31",
    lastVerifiedAt: "2026-09-05",
    status: "ACTIVE",
    updatedAt: "March 2026",
  },
  {
    id: "p-03",
    slug: "bitdefender-total-security-6m",
    title: "Bitdefender Total Security (6 Months Trial)",
    category: "developer-perks",
    type: "FREE_PERK",
    classificationBadge: "CYBERSECURITY PERK",
    securityLevel: "UNLOCKED",
    priceNpr: 0,
    originalValuation: "$45 Free Value",
    fileSize: "Multi-Device Security",
    downloadUrl: "https://www.bitdefender.com",
    shortDescription:
      "Top-rated endpoint antivirus and multi-layer ransomware defense for Windows, macOS, Android, and iOS devices with high-speed VPN.",
    highlights: [
      "Multi-device protection (up to 5 devices)",
      "Real-time anti-phishing & ransomware shield",
      "Ultra-low system impact during compilation and gaming",
      "Official vendor extended trial verification",
    ],
    deliverable: "Direct Vendor Trial Registration",
    validUntil: "2026-12-31",
    lastVerifiedAt: "2026-09-05",
    status: "ACTIVE",
    updatedAt: "March 2026",
  },
  {
    id: "p-04",
    slug: "postman-enterprise-ide-setup",
    title: "Postman Enterprise + VS Code Automation Suite",
    category: "developer-perks",
    type: "FREE_PERK",
    classificationBadge: "DEV TOOL SUITE",
    securityLevel: "UNLOCKED",
    priceNpr: 0,
    originalValuation: "Open Developer Asset",
    fileSize: "15 MB Template & Configs",
    downloadUrl: "https://www.postman.com",
    shortDescription:
      "Production-ready API development suite integrating Postman CLI, VS Code workspace settings, automated Newman tests, and mock endpoints.",
    highlights: [
      "Pre-configured Postman collection test runners",
      "Environment token rotation & secret masking scripts",
      "Next.js & Supabase API schema import templates",
      "Instant copy-paste workflow configs",
    ],
    deliverable: "GitHub Config Repo & Workflow Setup Guide",
    lastVerifiedAt: "2026-09-05",
    status: "ACTIVE",
    updatedAt: "March 2026",
  },

  // 3. Official Public Transparency Disclosures (DOJ / Court Dockets)
  {
    id: "r-01",
    slug: "doj-epstein-unsealed-court-records",
    title: "US District Court SDNY Unsealed Dockets & Exhibits (2024–2026)",
    category: "public-records",
    type: "PUBLIC_RECORD",
    classificationBadge: "OFFICIAL PUBLIC COURT DOCKET",
    securityLevel: "PUBLIC",
    priceNpr: 0,
    originalValuation: "Public Domain Record",
    fileSize: "4.2 GB / 1,200+ Exhibits",
    sourceCitation:
      "United States District Court for the Southern District of New York (Docket 15-cv-07433-LAP)",
    downloadUrl: "https://www.courtlistener.com/docket/4355835/giuffre-v-maxwell/",
    shortDescription:
      "Direct public legal archive of unsealed depositions, flight manifests, exhibit indexes, and judicial orders released by the US District Court for the Southern District of New York.",
    highlights: [
      "Verifiable federal court dockets (Docket No. 15-cv-07433-LAP)",
      "Includes 1,200+ unsealed exhibit files and deposition transcripts",
      "Complete judicial redaction indexes preserved without editorial modification",
      "100% Free public civic disclosure and journalistic archive",
    ],
    deliverable: "Official Court Docket Index & Download Gateway",
    lastVerifiedAt: "2026-09-05",
    status: "ACTIVE",
    updatedAt: "February 2026",
  },

  // 4. Interactive Tools
  {
    id: "t-01",
    slug: "the-silent-tax-purchasing-power",
    title: "The Silent Tax — Historical Purchasing Power & Fiat Decay (1913–2026)",
    category: "interactive-tools",
    type: "INTERACTIVE_TOOL",
    classificationBadge: "ECONOMIC SIMULATION WIDGET",
    securityLevel: "PUBLIC",
    priceNpr: 0,
    originalValuation: "Interactive Financial Tool",
    fileSize: "Client-side Computation",
    shortDescription:
      "Interactive data visualization tool measuring cumulative currency devaluation, purchasing power collapse, and asset comparison across 113 years of BLS CPI-U data.",
    highlights: [
      "Official US Bureau of Labor Statistics (BLS) CPI-U dataset (1913–2026)",
      "Real-time slider: see how much $100 in any year is worth in 2026",
      "Visualizes 97.2% fiat purchasing power erosion since 1913",
      "Compare inflation against Gold, Oil, Real Estate, and AI Compute",
    ],
    deliverable: "Live Interactive Calculator Engine",
    lastVerifiedAt: "2026-09-05",
    status: "ACTIVE",
    updatedAt: "March 2026",
  },
];

/**
 * Historical US BLS Consumer Price Index (CPI-U) data points from 1913 to 2026.
 * Base 1982-1984 = 100
 */
export const HISTORICAL_CPI_DATA: { year: number; cpi: number; event: string }[] = [
  { year: 1913, cpi: 9.9, event: "Federal Reserve Act passed" },
  { year: 1920, cpi: 20.0, event: "Post-WWI inflation wave" },
  { year: 1930, cpi: 16.7, event: "Great Depression deflation" },
  { year: 1940, cpi: 14.0, event: "Pre-WWII recovery" },
  { year: 1950, cpi: 24.1, event: "Post-WWII economic expansion" },
  { year: 1960, cpi: 29.6, event: "Post-war stable growth" },
  { year: 1971, cpi: 40.5, event: "Nixon closes the gold window (Bretton Woods ends)" },
  { year: 1980, cpi: 82.4, event: "Volcker stagflation peak (14.8% inflation)" },
  { year: 1990, cpi: 130.7, event: "Gulf War energy surge" },
  { year: 2000, cpi: 172.2, event: "Dot-com tech boom" },
  { year: 2008, cpi: 215.3, event: "Global Financial Crisis & QE1" },
  { year: 2015, cpi: 237.0, event: "Near-zero interest rate era" },
  { year: 2020, cpi: 258.8, event: "Global fiscal stimulus expansion" },
  { year: 2022, cpi: 292.7, event: "Global supply chain & energy peak (9.1% CPI)" },
  { year: 2024, cpi: 314.1, event: "AI infrastructure capital cycle" },
  { year: 2026, cpi: 325.0, event: "Present day benchmark" },
];

export const CURRENT_2026_CPI = 325.0;

/**
 * Calculates purchasing power metrics based on historical CPI-U
 */
export function calculatePurchasingPower(startYear: number, amount: number = 100) {
  // Find nearest CPI entry
  const sorted = [...HISTORICAL_CPI_DATA].sort(
    (a, b) => Math.abs(a.year - startYear) - Math.abs(b.year - startYear)
  );
  const match = sorted[0] ?? HISTORICAL_CPI_DATA[0];

  const inflationMultiplier = CURRENT_2026_CPI / match.cpi;
  const equivalentToday = amount * inflationMultiplier;
  const purchasingPowerLostPercent = ((1 - match.cpi / CURRENT_2026_CPI) * 100);

  return {
    year: match.year,
    cpi: match.cpi,
    event: match.event,
    originalAmount: amount,
    equivalentToday: Math.round(equivalentToday),
    multiplier: Number(inflationMultiplier.toFixed(2)),
    purchasingPowerLostPercent: Number(purchasingPowerLostPercent.toFixed(1)),
    valueRetainedCents: Number(((match.cpi / CURRENT_2026_CPI) * 100).toFixed(1)),
  };
}

export function getVaultItemBySlug(slug: string): VaultItem | undefined {
  return VAULT_ITEMS.find((item) => item.slug === slug);
}

export function getVaultItemsByCategory(category: VaultCategory): VaultItem[] {
  if (category === "all") return VAULT_ITEMS;
  return VAULT_ITEMS.filter((item) => item.category === category);
}
