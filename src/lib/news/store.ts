import { NewsArticle, NewsCategory, NewsFilterOptions } from "./types";
import { calculateHotScore } from "./ingestion";

const INITIAL_NEWS: NewsArticle[] = [
  {
    id: "news-np-ai-framework-2026",
    title: "Nepal Ministry of Communication Releases Draft National AI Policy 2026",
    slug: "nepal-releases-draft-national-ai-policy-2026",
    source: "TechLekh / MoCIT",
    sourceUrl: "https://techlekh.com",
    publishedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    category: "NEPAL_TECH",
    excerpt: "The Ministry of Communication and Information Technology has published the preliminary draft of Nepal's first comprehensive National Artificial Intelligence Policy, focusing on digital sovereignty, local LLM evaluation frameworks, and public sector automation.",
    bulletPoints: [
      "Prioritizes low-compute Nepali language dataset preservation and open civic tokenization.",
      "Introduces ethical standards for AI deployment in financial audits and civil registry services.",
      "Outlines pilot funding for Kathmandu University and IOE Pulchowk computing infrastructure."
    ],
    hotScore: 95,
    geoCoordinates: { lat: 27.7007, lng: 85.3184, locationName: "Singha Durbar, Kathmandu" },
    tags: ["Nepal AI", "Policy", "MoCIT", "Governance"],
    isPinned: true,
    readTimeMinutes: 3,
  },
  {
    id: "news-nrb-qr-cross-border-2026",
    title: "Nepal Rastra Bank Expands Cross-Border Retail QR Interoperability with India",
    slug: "nrb-expands-cross-border-qr-interoperability",
    source: "Nepal Rastra Bank / Bizshala",
    sourceUrl: "https://www.nrb.org.np",
    publishedAt: new Date(Date.now() - 7 * 3600000).toISOString(),
    category: "ECONOMIC_POLICY",
    excerpt: "Nepal Rastra Bank has issued revised unified circulars expanding real-time merchant QR settlements between Fonepay and India's UPI, streamlining payments for tourists and traders without requiring international credit cards.",
    bulletPoints: [
      "Caps daily merchant settlement volume while ensuring strict AML/KYC ledger auditing.",
      "Eliminates traditional 3.5% foreign currency exchange spreads on cross-border merchant transfers.",
      "Requires integrated payment switches to settle within a maximum of T+1 banking hours."
    ],
    hotScore: 89,
    geoCoordinates: { lat: 27.7062, lng: 85.3261, locationName: "NRB Central Office, Baluwatar" },
    tags: ["NRB", "Fintech", "Fonepay", "UPI", "Forex"],
    isPinned: true,
    readTimeMinutes: 4,
  },
  {
    id: "news-google-gemini-36-release",
    title: "Google Deploys Gemini 3.6 Flash Across Asia-Pacific Cloud Gateways",
    slug: "google-deploys-gemini-36-flash-cloud-gateways",
    source: "Google Cloud / AI Research",
    sourceUrl: "https://cloud.google.com",
    publishedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    category: "AI_GLOBAL",
    excerpt: "Google Generative AI has promoted Gemini 3.6 Flash to the primary production tier for developer workloads, deprecating legacy 1.5 and 2.5 checkpoints while reducing token processing latency by 38% for multi-lingual and coding inference.",
    bulletPoints: [
      "Native support for 1M token context windows with native tool use and structured JSON schemas.",
      "Benchmarked at 91.2% accuracy on complex coding synthesis across C#, Go, and TypeScript.",
      "Full backward compatibility with existing Vertex AI and AI Studio REST invocations."
    ],
    hotScore: 92,
    tags: ["Google AI", "Gemini", "LLM", "Developer Tools"],
    readTimeMinutes: 3,
  },
  {
    id: "news-nea-smart-meter-rollout",
    title: "Nepal Electricity Authority Connects 500,000 Smart Meters to Automated Billing Grid",
    slug: "nea-connects-500000-smart-meters-automated-grid",
    source: "OnlineKhabar / NEA",
    sourceUrl: "https://onlinekhabar.com",
    publishedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    category: "CIVIC_INFRASTRUCTURE",
    excerpt: "The Nepal Electricity Authority has completed Phase 2 of its smart grid modernization in the Kathmandu Valley, allowing real-time power consumption monitoring and automated outage detection.",
    bulletPoints: [
      "Reduces technical and commercial line losses from 14.3% down to 8.7% in urban corridors.",
      "Integrates consumer load metrics directly with national substation SCADA infrastructure.",
      "Prepares grid capacity for rapid EV fast-charger expansion across Ring Road arteries."
    ],
    hotScore: 82,
    geoCoordinates: { lat: 27.6975, lng: 85.3180, locationName: "Ratnapark, Kathmandu" },
    tags: ["NEA", "Energy", "Smart Grid", "Infrastructure"],
    readTimeMinutes: 3,
  },
  {
    id: "news-cursor-nextjs-16-tooling",
    title: "Cursor & Anthropic Announce Streamlined Agentic Refactoring Pipelines for Next.js 16",
    slug: "cursor-anthropic-nextjs-16-refactoring-pipelines",
    source: "Cursor Changelog / HackerNews",
    sourceUrl: "https://cursor.com",
    publishedAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    category: "AI_GLOBAL",
    excerpt: "The Cursor development team has rolled out native deep codebase context indexing optimized for Next.js 16 Turbopack workspaces, allowing multi-file refactors without memory exhaustion.",
    bulletPoints: [
      "Integrates AST-level dependency resolution preventing client/server module boundary violations.",
      "Reduces index synchronization overhead in large monorepos by over 60%.",
      "Supplies automated test generation hooks for Vitest and Playwright suites."
    ],
    hotScore: 88,
    tags: ["Cursor", "Next.js", "AI Coding", "Turbopack"],
    readTimeMinutes: 4,
  },
  {
    id: "news-pokhara-tech-hub-launch",
    title: "Gandaki Province Inaugurates Tech Incubator to Support Western Nepal IT Startups",
    slug: "gandaki-province-inaugurates-tech-incubator-pokhara",
    source: "The Kathmandu Post",
    sourceUrl: "https://kathmandupost.com",
    publishedAt: new Date(Date.now() - 32 * 3600000).toISOString(),
    category: "NEPAL_TECH",
    excerpt: "A new state-backed technology hub has launched in Lakeside, Pokhara, providing high-speed fiber uplinks, cloud workstation credits, and seed mentorship for local software export agencies.",
    bulletPoints: [
      "Partnership with regional universities to offer subsidized digital tooling licenses.",
      "Includes a hardware testing laboratory for drone topography and hydro-sensor development.",
      "Hosts quarterly developer hackathons focused on civic data and tourism tech."
    ],
    hotScore: 78,
    geoCoordinates: { lat: 28.2096, lng: 83.9575, locationName: "Lakeside, Pokhara" },
    tags: ["Pokhara", "Startups", "Gandaki", "Incubator"],
    readTimeMinutes: 3,
  },
  {
    id: "news-nepal-remittance-forex-stability",
    title: "NRB Macroeconomic Review: Formal Remittance Inflows Exceed NPR 140B in Shrawan",
    slug: "nrb-remittance-inflows-exceed-140b-shrawan",
    source: "Nepal Rastra Bank Research Dept",
    sourceUrl: "https://www.nrb.org.np",
    publishedAt: new Date(Date.now() - 40 * 3600000).toISOString(),
    category: "ECONOMIC_POLICY",
    excerpt: "Foreign exchange reserves at Nepal Rastra Bank reached a historic record of over 15 months of import cover, buoyed by banking incentive schemes for digital remittance transfers.",
    bulletPoints: [
      "Digital banking channels accounted for 74% of total inward personal transfers.",
      "Foreign exchange liquidity stabilizes commercial bank lending rates for IT sector loans.",
      "NRB maintains managed peg of NPR to INR at 1.60 with resilient USD buffer."
    ],
    hotScore: 84,
    tags: ["NRB", "Forex", "Remittance", "Economy"],
    readTimeMinutes: 4,
  },
  {
    id: "news-open-data-nepal-survey",
    title: "National Statistics Office Publishes Standardized 2026 District Economic Registry",
    slug: "national-statistics-office-publishes-2026-district-economic-registry",
    source: "National Statistics Office (NSO)",
    sourceUrl: "https://cbs.gov.np",
    publishedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    category: "CIVIC_INFRASTRUCTURE",
    excerpt: "Nepal's National Statistics Office has released machine-readable CSV and GeoJSON datasets detailing enterprise registrations, agricultural yields, and internet penetration across all 77 districts.",
    bulletPoints: [
      "Openly licensed for civic researchers, software developers, and commercial market studies.",
      "Standardized geographic coordinates mapped onto local administrative ward boundaries.",
      "Directly ingested and catalogued inside the TRIHEX Nepal Pulse civic data directory."
    ],
    hotScore: 80,
    geoCoordinates: { lat: 27.6931, lng: 85.3130, locationName: "Thapathali, Kathmandu" },
    tags: ["NSO", "Open Data", "GeoJSON", "Nepal Pulse"],
    readTimeMinutes: 3,
  },
];

let newsStore: NewsArticle[] = [...INITIAL_NEWS];

export function getAllNews(options?: NewsFilterOptions): NewsArticle[] {
  let list = [...newsStore];

  if (options?.category && options.category !== "ALL") {
    list = list.filter((a) => a.category === options.category);
  }

  if (options?.query && options.query.trim()) {
    const q = options.query.toLowerCase();
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.source.toLowerCase().includes(q)
    );
  }

  if (options?.minHotScore != null) {
    list = list.filter((a) => a.hotScore >= options.minHotScore!);
  }

  // Pinned items first, then highest hot score, then latest
  return list.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return Number(b.isPinned) - Number(a.isPinned);
    if (b.hotScore !== a.hotScore) return b.hotScore - a.hotScore;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

export function getNewsBySlug(slug: string): NewsArticle | undefined {
  return newsStore.find((a) => a.slug === slug);
}

export function getBreakingNews(limit = 4): NewsArticle[] {
  return getAllNews().slice(0, limit);
}

export function getGeoNewsEvents(): Array<{ id: string; title: string; lat: number; lng: number; location: string; slug: string }> {
  return newsStore
    .filter((a) => a.geoCoordinates != null)
    .map((a) => ({
      id: a.id,
      title: a.title,
      lat: a.geoCoordinates!.lat,
      lng: a.geoCoordinates!.lng,
      location: a.geoCoordinates!.locationName,
      slug: a.slug,
    }));
}

export function saveNewsArticle(article: NewsArticle): void {
  const existingIdx = newsStore.findIndex((a) => a.id === article.id || a.slug === article.slug);
  if (existingIdx >= 0) {
    newsStore[existingIdx] = article;
  } else {
    newsStore.unshift(article);
  }
}
