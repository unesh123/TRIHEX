/**
 * TRIHEX Knowledge Guides & Architectural Whitepapers
 */

export interface GuideSection {
  id: string;
  heading: string;
  body: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
}

export interface GuideCitation {
  id: string;
  title: string;
  source: string;
  url?: string;
  year: number;
}

export interface Guide {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: "STUDENTS" | "DEVELOPERS" | "CREATORS" | "SECURITY";
  author: string;
  authorRole: string;
  publishedAt: string;
  readingTimeMinutes: number;
  summary: string;
  sections: GuideSection[];
  citations: GuideCitation[];
  tags: string[];
}

export const TRIHEX_GUIDES: Guide[] = [
  {
    id: "guide-ai-students-nepal-2026",
    slug: "ai-tools-for-students-nepal-2026",
    title: "AI Tools & Free Software Packs for Students in Nepal (2026 Guide)",
    subtitle: "How to legally unlock over $2,000 in developer perks, cloud compute, and AI models using your college email or student ID.",
    category: "STUDENTS",
    author: "TRIHEX Academic Desk",
    authorRole: "Student Software Access Initiative",
    publishedAt: "2026-03-01",
    readingTimeMinutes: 6,
    summary: "A practical, verified blueprint for Nepali computer science, engineering, and high school students to access GitHub Student Developer Pack, JetBrains IDEs, free cloud servers, and free AI assistance without an international credit card.",
    tags: ["nepal-students", "github-student-pack", "free-perks", "ai-tools", "education"],
    sections: [
      {
        id: "github-student-pack-nepal",
        heading: "1. Unlocking the GitHub Student Developer Pack with .edu.np or Student ID",
        body: "The GitHub Student Developer Pack is the single highest-value student entitlement in the software industry. If your university (such as Tribhuvan University, Kathmandu University, Pokhara University, or Purwanchal University) provides a .edu.np email address, verification is usually approved within 24 to 48 hours.\n\nIf your college does not provide .edu.np emails, you can submit a clear photo of your college student identity card showing your name, college stamp, and valid academic year. Ensure the name on your GitHub profile matches your student card exactly.",
      },
      {
        id: "top-student-entitlements",
        heading: "2. Key Software You Get 100% Free",
        body: "Once verified on GitHub Education, you immediately unlock:\n- GitHub Copilot Pro for intelligent coding assistance directly inside VS Code.\n- Complete JetBrains All Products Pack (IntelliJ, PyCharm, WebStorm, Rider, CLion).\n- Free .me domain name and SSL certificate from Namecheap for 1 year.\n- Microsoft Azure $100 student cloud credits without requiring a credit card.\n- DigitalOcean $200 cloud infrastructure credits valid for 60 days.",
      },
      {
        id: "payment-solutions-nepal",
        heading: "3. Handling Payments in Nepal for AI Tools",
        body: "For AI tools that require payment (such as ChatGPT Plus, Claude Pro, or Midjourney), most international services reject local Nepali bank debit cards unless you have activated an NRB $500 USD Dollar Prepaid Card.\n\nTRIHEX DIGITAL provides local eSewa, Khalti, and Fonepay QR checkout with instant verified access, eliminating the need for international payment gateways.",
      },
    ],
    citations: [
      { id: "c-1", title: "GitHub Education Student Benefits", source: "GitHub Inc.", url: "https://education.github.com", year: 2026 },
      { id: "c-2", title: "Nepal Rastra Bank Foreign Exchange Circular for Prepaid Dollar Cards", source: "Nepal Rastra Bank", url: "https://www.nrb.org.np", year: 2024 },
    ],
  },
  {
    id: "guide-fullstack-ai-stack",
    slug: "modern-fullstack-ai-developer-stack",
    title: "The 2026 Production Fullstack AI Stack: Next.js 16, Cursor, and Supabase",
    subtitle: "Architectural blueprint for building autonomous, scalable web apps with React Server Components and Postgres Row-Level Security.",
    category: "DEVELOPERS",
    author: "Prasid & TRIHEX Engineering",
    authorRole: "Principal Systems Architect",
    publishedAt: "2026-02-28",
    readingTimeMinutes: 8,
    summary: "An in-depth technical analysis of why pairing Next.js App Router with Supabase PostgreSQL and agentic IDEs like Cursor and Claude Code provides the fastest, most reliable software delivery pipeline in 2026.",
    tags: ["nextjs16", "cursor", "supabase", "react19", "architecture"],
    sections: [
      {
        id: "server-components-architecture",
        heading: "1. The Server-First Paradigm in Next.js 16",
        body: "With React 19 Server Components and Next.js 16 App Router, client-side bundle weight is drastically reduced. Data fetching occurs directly on the server next to the database, eliminating API waterfalls, hydration mismatches, and exposed backend tokens.\n\nAlways enforce granular Suspense boundaries around dynamic data segments to guarantee instant initial page loads for your visitors.",
      },
      {
        id: "supabase-security-boundary",
        heading: "2. Bulletproof Authorization with Postgres RLS",
        body: "Never rely purely on application-layer checks for data isolation. Postgres Row-Level Security (RLS) ensures that even if an application route has a logic vulnerability, the database itself refuses to return unauthorized rows.\n\nAlways test both authenticated and unauthenticated contexts using automated integration test suites.",
      },
    ],
    citations: [
      { id: "c-3", title: "Next.js App Router Architecture", source: "Vercel Inc.", url: "https://nextjs.org/docs", year: 2026 },
      { id: "c-4", title: "PostgreSQL Row Level Security Documentation", source: "PostgreSQL Global Development Group", year: 2025 },
    ],
  },
  {
    id: "guide-api-key-protection",
    slug: "protecting-ai-api-keys-cost-control",
    title: "Securing AI API Keys & Preventing Runaway Ingestion Costs",
    subtitle: "How to avoid $10,000 surprise billing alerts through rate limits, token budgeting, and server-only cryptographic secrets.",
    category: "SECURITY",
    author: "TRIHEX Security Lab",
    authorRole: "Cloud Security & Threat Modeling",
    publishedAt: "2026-03-02",
    readingTimeMinutes: 5,
    summary: "Essential defensive security patterns to prevent LLM API key leaks in GitHub commits, client-side JS bundles, and infinite recursive agent loops.",
    tags: ["security", "api-keys", "cost-control", "llm-security", "cloud-defense"],
    sections: [
      {
        id: "leaked-keys-prevention",
        heading: "1. The Server-Only Invariant",
        body: "Never prefix an API key or database credential with 'NEXT_PUBLIC_'. Anything prefixed with NEXT_PUBLIC_ is embedded in plain text into client JavaScript bundles and can be inspected by anyone using browser developer tools.\n\nAlways use server-only modules ('import server-only') to guarantee that sensitive credentials fail compilation if accidentally imported by client components.",
      },
      {
        id: "hard-spend-caps",
        heading: "2. Enforcing Hard Spend Caps at the Provider Level",
        body: "Configure hard billing limits in your OpenAI, Anthropic, and Google Cloud consoles. Soft limits send an email notification, but do not stop requests; a hard limit immediately halts API calls when the threshold is reached, protecting your bank account from unexpected automated loops.",
      },
    ],
    citations: [
      { id: "c-5", title: "OWASP Top 10 for Large Language Model Applications", source: "OWASP Foundation", url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/", year: 2025 },
    ],
  },
];

export function getAllGuides(): Guide[] {
  return [...TRIHEX_GUIDES];
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return TRIHEX_GUIDES.find((g) => g.slug === slug);
}
