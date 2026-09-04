import { AgentSkill } from "./types";

export const CURATED_SKILLS: AgentSkill[] = [
  {
    id: "skill-supabase-fullstack-ops",
    slug: "supabase-fullstack-ops",
    name: "Supabase Fullstack Engineering & RLS Guardian",
    summary: "Complete agent skill for Supabase PostgreSQL schema migrations, Row-Level Security policies, SSR auth cookies, and Edge Functions.",
    description: "Equips autonomous coding agents with the exact patterns for implementing secure Postgres Row-Level Security (RLS) policies, handling Next.js @supabase/ssr cookie auth sessions, writing idempotently runnable migration scripts, and managing Postgres indexes safely.",
    category: "CODING",
    tags: ["supabase", "postgres", "rls", "auth", "nextjs", "database"],
    author: "TRIHEX Architecture Lab",
    license: "MIT",
    version: "1.2.0",
    verifiedSafe: true,
    compatibility: ["Antigravity", "Claude Code", "Cursor", "Windsurf"],
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-09-04T00:00:00Z",
    files: [
      {
        path: "SKILL.md",
        filename: "SKILL.md",
        language: "markdown",
        sizeBytes: 1840,
        content: `# Supabase Fullstack Engineering & RLS Guardian

Use this skill whenever building or refactoring applications with Supabase (Database, Auth, Storage, Edge Functions, or Vector).

## Golden Rules
1. **Never Disable RLS**: Always enable Row Level Security on every table:
   \`ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;\`
2. **Use Server-Side getUser()**: Never trust \`getSession()\` for server-side authorization in Next.js. Always call \`supabase.auth.getUser()\` to validate the JWT with the Supabase Auth server.
3. **Keep Service Role Keys Server-Only**: Never expose \`SUPABASE_SERVICE_ROLE_KEY\` to client code or environment variables prefixed with \`NEXT_PUBLIC_\`.

## Workflow
1. Inspect existing migrations in \`supabase/migrations/\`.
2. Draft incremental schema changes with explicit foreign keys and check constraints.
3. Define granular RLS policies for SELECT, INSERT, UPDATE, and DELETE.
4. Test with authenticated and anonymous roles before committing.`,
      },
      {
        path: "references/rls-patterns.sql",
        filename: "rls-patterns.sql",
        language: "sql",
        sizeBytes: 1120,
        content: `-- Pattern 1: Tenant / User Isolation
CREATE POLICY "Users can only access own data"
ON public.user_profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Pattern 2: Public Read, Authenticated Write
CREATE POLICY "Public read active items"
ON public.catalog_items
FOR SELECT
TO anon, authenticated
USING (status = 'ACTIVE');

CREATE POLICY "Admins full management"
ON public.catalog_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);`,
      },
      {
        path: "scripts/validate-rls.ts",
        filename: "validate-rls.ts",
        language: "typescript",
        sizeBytes: 950,
        content: `import { createClient } from "@supabase/supabase-js";

export async function auditTableSecurity(supabaseUrl: string, serviceKey: string) {
  const admin = createClient(supabaseUrl, serviceKey);
  const { data, error } = await admin.rpc("get_tables_without_rls");
  if (error) {
    console.error("Failed to query RLS status:", error.message);
    return;
  }
  if (data && data.length > 0) {
    console.warn("CRITICAL: Tables without RLS detected:", data);
  } else {
    console.log("All tables have active Row Level Security.");
  }
}`,
      },
    ],
  },
  {
    id: "skill-nextjs-performance-audit",
    slug: "nextjs-performance-audit",
    name: "Next.js 16 Production Performance & Bundle Auditor",
    summary: "Systematic protocol for diagnosing server waterfall requests, optimizing Core Web Vitals (LCP, INP, CLS), and eliminating bloated client bundles.",
    description: "Detailed diagnostic instructions, script snippets, and architectural rules to keep Next.js App Router applications blazing fast, maintaining 99+ Lighthouse scores and instant interaction responsiveness.",
    category: "CODING",
    tags: ["nextjs", "performance", "lighthouse", "core-web-vitals", "optimization"],
    author: "TRIHEX Performance Lab",
    license: "MIT",
    version: "2.0.1",
    verifiedSafe: true,
    compatibility: ["Antigravity", "Claude Code", "Cursor"],
    createdAt: "2026-02-28T00:00:00Z",
    updatedAt: "2026-09-04T00:00:00Z",
    files: [
      {
        path: "SKILL.md",
        filename: "SKILL.md",
        language: "markdown",
        sizeBytes: 1540,
        content: `# Next.js Performance & Bundle Auditor

## Audit Checklist
1. **Server Waterfall Detection**: Are sequential \`await\` calls delaying SSR response? Use \`Promise.all()\` or stream data with React Suspense.
2. **Client Component Boundary**: Push \`'use client'\` down to the smallest possible leaf components. Never put \`'use client'\` on high-level layout containers.
3. **Font & Image Optimization**: Use \`next/font\` with \`display: swap\` and \`next/image\` with \`priority\` for the largest above-the-fold image.
4. **Third-Party Script Offloading**: Use \`next/script\` with strategy \`lazyOnload\` or \`worker\` for analytics and non-critical trackers.`,
      },
      {
        path: "scripts/measure-bundle.mjs",
        filename: "measure-bundle.mjs",
        language: "javascript",
        sizeBytes: 820,
        content: `import fs from "node:fs";
import path from "node:path";

const buildDir = path.join(process.cwd(), ".next/static/chunks");
if (fs.existsSync(buildDir)) {
  const files = fs.readdirSync(buildDir);
  const largeChunks = files
    .map((file) => {
      const stat = fs.statSync(path.join(buildDir, file));
      return { file, sizeKb: (stat.size / 1024).toFixed(1) };
    })
    .filter((f) => f.sizeKb > 150)
    .sort((a, b) => b.sizeKb - a.sizeKb);

  console.log("Chunks over 150KB:", largeChunks);
}`,
      },
    ],
  },
  {
    id: "skill-defensive-security-audit",
    slug: "defensive-security-audit",
    name: "Defensive Web Security & SSRF Prevention Engine",
    summary: "Security verification skill for detecting SSRF, Insecure Direct Object References (IDOR), prompt injection, and authorization flaws.",
    description: "Provides autonomous coding agents with rigorous automated and manual testing rules to audit API routes, webhook receivers, file upload pipelines, and external fetch wrappers against OWASP Top 10 vulnerabilities.",
    category: "SECURITY",
    tags: ["security", "owasp", "ssrf", "defense", "penetration-testing", "audit"],
    author: "TRIHEX Security Lab",
    license: "MIT",
    version: "1.4.0",
    verifiedSafe: true,
    compatibility: ["Antigravity", "Claude Code", "Cursor"],
    createdAt: "2026-03-02T00:00:00Z",
    updatedAt: "2026-09-04T00:00:00Z",
    files: [
      {
        path: "SKILL.md",
        filename: "SKILL.md",
        language: "markdown",
        sizeBytes: 1650,
        content: `# Defensive Web Security & SSRF Audit

## Threat Models Covered
1. **Server-Side Request Forgery (SSRF)**: Ensure all outgoing HTTP requests validate URL schemes, reject private IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.1, 169.254.169.254), and enforce max download limits.
2. **Cryptographic Key Exposure**: Scan for hardcoded API keys, JWT secret phrases, and unencrypted fulfillment tokens.
3. **Prompt Injection in LLM Ingestion**: Treat untrusted third-party summaries as inert plain strings. Neutralize instruction override markers.
4. **Session Hijacking**: Verify all auth cookies specify \`HttpOnly\`, \`Secure\`, and \`SameSite=Lax\`.`,
      },
      {
        path: "references/ssrf-checklist.md",
        filename: "ssrf-checklist.md",
        language: "markdown",
        sizeBytes: 890,
        content: `### SSRF Blocklist Validation Matrix
- [x] 127.0.0.1 / localhost (Loopback)
- [x] 169.254.169.254 (AWS/GCP/Azure Instance Metadata)
- [x] 10.0.0.0 - 10.255.255.255 (RFC 1918 Class A)
- [x] 172.16.0.0 - 172.31.255.255 (RFC 1918 Class B)
- [x] 192.168.0.0 - 192.168.255.255 (RFC 1918 Class C)
- [x] ::1 (IPv6 Loopback)
- [x] fe80:: (IPv6 Link-Local)`,
      },
    ],
  },
  {
    id: "skill-academic-research-synthesizer",
    slug: "academic-research-synthesizer",
    name: "Open Scholarly Research & arXiv Paper Fetcher",
    summary: "Agent skill for querying open academic repositories (arXiv, PubMed, OpenAlex), retrieving bibtex citations, and generating methodology matrices.",
    description: "Guides agents through scholarly literature searches, metadata extraction from open scientific preprint servers, automated BibTeX citation formatting, and structured synthesis across research corpora.",
    category: "RESEARCH",
    tags: ["arxiv", "openalex", "scholar", "research", "citations", "academic"],
    author: "TRIHEX Research Lab",
    license: "MIT",
    version: "1.1.0",
    verifiedSafe: true,
    compatibility: ["Antigravity", "Claude Code", "Cursor"],
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-09-04T00:00:00Z",
    files: [
      {
        path: "SKILL.md",
        filename: "SKILL.md",
        language: "markdown",
        sizeBytes: 1420,
        content: `# Scholarly Research & arXiv Paper Synthesizer

## Retrieval Protocol
1. **Target Open Repositories**: Query official open APIs (arXiv Export API, PubMed E-utilities, OpenAlex REST API).
2. **Download Clean Metadata**: Extract DOI, title, author list, publication year, journal/venue, and abstract.
3. **BibTeX Verification**: Generate compliant BibTeX entry with canonical DOI URL.
4. **Synthesis Matrix**: Group papers by theoretical lineage, empirical dataset, and comparative benchmark metrics.`,
      },
      {
        path: "references/arxiv-api-guide.md",
        filename: "arxiv-api-guide.md",
        language: "markdown",
        sizeBytes: 910,
        content: `### arXiv Query Syntax
Endpoint: \`https://export.arxiv.org/api/query?search_query=all:electron&start=0&max_results=10\`
Fields supported:
- \`ti\`: Title
- \`au\`: Author
- \`abs\`: Abstract
- \`cat\`: Subject Category (e.g. cs.AI, cs.SE)`,
      },
    ],
  },
];

export function getAllSkills(): AgentSkill[] {
  return [...CURATED_SKILLS];
}

export function getSkillBySlug(slug: string): AgentSkill | undefined {
  return CURATED_SKILLS.find((s) => s.slug === slug);
}
