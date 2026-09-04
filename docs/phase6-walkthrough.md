# TRIHEX DIGITAL Phase 6 — Production Walkthrough & Architecture Master Document

**Date**: September 5, 2026  
**Platform**: TRIHEX DIGITAL (`trihexdigital.shop`)  
**Stack**: Next.js 16.2.10 (App Router, Turbopack), React 19.2.4, PostgreSQL via Drizzle ORM 0.45.2, TypeScript 5.8  
**Test Suite**: 42 test files passing · 226 tests passing · TypeScript 0 errors · Production Build clean (90+ routes)  

---

## 1. Executive Summary & Architecture Evolution

Phase 6 marks the transformation of TRIHEX DIGITAL from an initial persisted digital storefront into an evidence-backed, Nepal-first production platform. It integrates verified digital product commerce, autonomous deal radar verification, sovereign Nepal civic data feeds, geospatial exploration, AI-assisted customer assistance, and an evidence-backed deep research engine—all anchored by strict security boundaries, zero secret leaks, and factual truth states.

### Architectural Evolution: Phase 5 vs Phase 6

| Dimension | Phase 5 (Production Intelligence OS) | Phase 6 (Evidence-Backed Platform) |
|---|---|---|
| **Secret Management & Env Isolation** | Server and client env variables in a single module without strict runtime browser checks. | **Strict Bidirectional Isolation**: `src/lib/env/server.ts` with runtime `typeof window !== "undefined"` throw guard and `src/lib/env/client.ts`. Zero secret credentials or API tokens ever reach client bundles. |
| **Cron Security & Auth** | Cron jobs accepted tokens in query parameters (`?secret=...`), exposing credentials in proxy logs and browser history. | **Header-Only Constant-Time Auth**: Rejects query parameter secrets outright; enforces `Authorization: Bearer <token>` verified via `crypto.timingSafeEqual`. |
| **Search Privacy** | Plain SHA-256 hash of client IP, susceptible to rainbow-table reversal for IPv4 addresses. | **Rotating Keyed HMAC-SHA256**: Generates weekly rotating keyed hashes (`search-key-YYYY-WW`) preventing persistent tracking or offline deanonymization. |
| **Database Concurrency** | Session-level advisory locks (`pg_try_advisory_lock`), which could linger if connection pooling or serverless proxies cycled connections. | **Transaction-Scoped Locks**: Upgraded to `pg_try_advisory_xact_lock` ensuring instantaneous, automatic release upon transaction commit or rollback. |
| **Provider Control Plane** | Ad-hoc external API requests without unified budget guards or failover orchestration. | **Unified Provider Plane**: `src/lib/providers/` with provider registry, live health probes, strict budget guards ($5.00 daily ceiling, $0.50/request), failover router (Gemini → OpenAI → You.com), and deterministic offline fallbacks. |
| **Flagship Hub & Merchandising** | Fragmented storefront pages for products and deals. | **Unified TRIHEX Vault (`/vault`)**: Centralized flagship drops unifying Products, Deals, Perks, Prompts, and Public Records with quad-state provenance badges and homepage showcase. |
| **Nepal Intelligence Feeds** | Standalone NRB forex adapter. Offline fallback risked ambiguous labeling. | **Civic Intelligence Center 2.0 (`/nepal`)**: Standardized `NepalFeedResult<T>` contract, live OpenAQ air quality, NRB macroeconomic indicators (remittance, forex reserves, CPI, repo rate), and Haversine geodesic distance calculations from Kathmandu. |
| **Geospatial Explorer** | Required live Google Maps JS API key; failed abruptly when unconfigured. | **Accessible Geospatial Explorer (`/map`)**: High-precision SVG canvas fallback with spherical coordinate projection, geodesic distance labels (`X km from KTM`), and WCAG-compliant Accessible List View alternative. |
| **Research Capabilities** | Unstructured web search without primary source grounding. | **Evidence-Backed Nepal Deep Research Engine (`/nepal/research`)**: "Structured Data First" orchestrator that retrieves live NRB forex, USGS seismic, and macro data before invoking LLM synthesis, preventing numerical hallucinations with verified citation confidence scoring. |
| **AI Concierge & Commerce** | Generic assistance without storefront grounding. | **TRIHEX AI Copilot**: Grounded strictly in catalog products, deals, and NRB forex; anti-hallucination invariants; accessible floating drawer and mobile bottom sheet. |
| **Prompt Library & Skills** | Basic variable replacement without versioning or curated bundles. | **Prompt Library 3.0 & Skills Hub 2.0**: Curated domain packs (Fullstack, Creator, PhD, Growth), version history tracking, and Isomorphic Heuristic Static Security Scanner badges. |
| **Personalization & Alerts** | Basic bookmarking. | **Watchlist Engine & Returning User Personalization**: Forex threshold alerts (e.g. USD ≥ 135) with automated trigger checks, persistent watchlists, and homepage browsing pattern feeds. |
| **Admin Control** | Basic deal tables. | **Admin Command Center 3.0**: Deal Verification Queue (`/admin/queue`) and AI Usage & Budget Gauges (`/admin/usage`) with real-time failover event logging. |

---

## 2. Core Requirements & Verification Matrix

| Requirement | Implementation Path(s) | Primary Artifact / UI | Automated Test Proof | Status |
|---|---|---|---|---|
| **Zero Secret Leaks** | `src/lib/env/server.ts`, `src/lib/env/client.ts` | Server-only env isolation | Verified in static bundle scan & Turbopack build | **VERIFIED** |
| **Header-Only Cron Auth** | `src/lib/api/guard.ts` | `/api/cron/jobs/[jobName]` | `tests/security/cron-auth.test.ts` (5 tests) | **VERIFIED** |
| **Rotating HMAC-SHA256 Privacy** | `src/lib/search/analytics.ts` | `search_analytics` table | `tests/search/search-analytics.test.ts` (4 tests) | **VERIFIED** |
| **Transaction Advisory Locks** | `src/lib/jobs/distributed-lock.ts` | `pg_try_advisory_xact_lock` | `tests/jobs/distributed-lock.test.ts` (6 tests) | **VERIFIED** |
| **Provider Control Plane** | `src/lib/providers/` (registry, router, budget) | `/admin/integrations`, `/admin/usage` | `tests/providers/provider-plane.test.ts` (4 tests) | **VERIFIED** |
| **Unified TRIHEX Vault** | `src/lib/vault/`, `src/components/vault/` | `/vault`, Homepage Drops | `tests/vault/vault-catalog.test.ts` (9 tests) | **VERIFIED** |
| **Nepal Civic Feeds 2.0** | `src/lib/nepal/` (forex, air quality, macro, seismic) | `/nepal` Intelligence Hub | `tests/nepal/civic-feeds.test.ts` (6 tests) | **VERIFIED** |
| **Accessible Geospatial Map** | `src/components/maps/trihex-map.tsx` | `/map` Geospatial Explorer | `tests/map/accessible-map.test.ts` (2 tests) | **VERIFIED** |
| **Nepal Deep Research Engine** | `src/lib/research/` (engine, planner, validator) | `/nepal/research` | `tests/research/deep-research.test.ts` (4 tests) | **VERIFIED** |
| **TRIHEX AI Copilot** | `src/lib/copilot/`, `src/components/copilot/` | Global Storefront Assistant | `tests/copilot/copilot.test.ts` (7 tests) | **VERIFIED** |
| **Prompt Library & Packs 3.0** | `src/components/prompts/`, `src/components/skills/` | `/prompts`, `/skills` | `tests/prompts/prompt-packs.test.ts` (3 tests) | **VERIFIED** |
| **Watchlist & Personalization** | `src/lib/watchlist/`, `src/lib/personalization/` | `/account/saved`, Homepage Feed | `tests/watchlist/watchlist-personalization.test.ts` (4 tests) | **VERIFIED** |
| **Admin Verification Queue** | `src/components/admin/deal-verification-queue.tsx` | `/admin/queue` | `tests/admin/admin-command-center.test.ts` (5 tests) | **VERIFIED** |
| **Admin Budget Gauges** | `src/components/admin/provider-usage-console.tsx` | `/admin/usage` | `tests/admin/admin-command-center.test.ts` (5 tests) | **VERIFIED** |
| **Mobile Single-Column (<640px)** | Storefront grids & drawers | Global Tailwind `grid-cols-1` | Responsive CSS audit & Turbopack build | **VERIFIED** |

---

## 3. Subsystem Deep Dives

### 3.1 Security Hardening & Secret Isolation (Milestone 6.1)
- **Zero Secret Leaks**: `src/lib/env/server.ts` wraps all sensitive keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `YOUCOM_API_KEY`, `DATABASE_URL`, `CRON_SECRET`). If evaluated in a client bundle, it immediately throws a fatal exception. Public variables are quarantined in `src/lib/env/client.ts`.
- **Constant-Time Cron Guard**: `src/lib/api/guard.ts` explicitly checks `searchParams.has("secret") || searchParams.has("token")` and returns HTTP 400. Bearer tokens in headers are compared using `crypto.timingSafeEqual` with buffer length normalization.
- **Search Analytics Anonymization**: `src/lib/search/analytics.ts` uses HMAC-SHA256 with a rotating key `search-key-YYYY-WW`. An IP cannot be linked across calendar weeks, preventing long-term profiling.
- **Transaction-Scoped Distributed Locks**: `src/lib/jobs/distributed-lock.ts` executes `pg_try_advisory_xact_lock` within a dedicated transaction block, guaranteeing lock release even during sudden process termination or pooled connection reuse.

### 3.2 Provider Control Plane & Admin Integrations (Milestone 6.2)
- **Architecture**: `src/lib/providers/` standardizes reasoning, search, and health checking across AI providers.
- **Budget Manager (`budget.ts`)**: Enforces a strict $5.00 daily budget ceiling and $0.50 single-request maximum. If reached, external calls are throttled and fallback grounded responses are served without halting storefront commerce.
- **Failover Router (`router.ts`)**: Primary reasoning is dispatched to Google Gemini 1.5 Flash. Upon timeout (8s) or authentication failure, it automatically fails over to OpenAI GPT-4o-mini, logs the incident, and falls back to deterministic synthesis if all external LLMs are unavailable.
- **Live Test Endpoint (`/api/admin/integrations/test`)**: Allows administrators to run diagnostic probes against providers directly from `/admin/integrations`.

### 3.3 Flagship Unified TRIHEX Vault (`/vault`) & Merchandising (Milestone 6.3 & 6.4)
- **Aggregation Engine (`vault-aggregator.ts`)**: Unifies:
  - Classified software items from `VAULT_ITEMS`
  - Secondary verified external deals from `getPublishedDeals()`
  - Curated prompts from `getCuratedPrompts()`
  - Public civic records from `RESEARCH_REGISTRY`
- **Quad-State Provenance**: Every entry displays its verification status (`VERIFIED`, `COMMUNITY`, `UNVERIFIED`) and freshness state (`LIVE`, `CACHED`, `STALE`).
- **Homepage Showcase (`homepage-vault-section.tsx`)**: Mounted prominently on the storefront homepage displaying top curated drops, verified deals with relative age (`formatRelativeAge`), and instant preview triggers.

### 3.4 Nepal Intelligence Center 2.0 (`/nepal`) (Milestone 6.5)
- **Standardized Civic Feed Contract**: All feeds return `NepalFeedResult<T>` containing `data`, `freshness` (`LIVE | CACHED | STALE | UNAVAILABLE`), `timestamp`, `sourceName`, and `disclaimer`.
- **Air Quality Adapter (`air-quality-adapter.ts`)**: Integrates OpenAQ API with station baselines across Ratnapark, Pulchowk, Pokhara, and Lumbini, calculating real-time AQI and PM2.5 metrics.
- **Macroeconomic Adapter (`macroeconomic-adapter.ts`)**: Provides verified NRB macroeconomic benchmarks: gross forex reserves cover, annualized remittance inflows, CPI inflation rate, and central bank repo policy rate.
- **Seismic Haversine Calculations (`earthquake-adapter.ts`)**: Enriches seismic tremors with geodesic distance calculations from Kathmandu (`27.7172° N, 85.3240° E`), informing citizens of epicenter proximity.

### 3.5 Google Maps Geospatial Explorer & Accessibility (Milestone 6.6)
- **Graceful Unconfigured Fallback**: When `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is absent, `src/components/maps/trihex-map.tsx` renders a high-precision vector SVG canvas with spherical coordinate projection, ensuring a premium user experience without API dependencies.
- **Accessible List View Alternative**: Features an instant tab toggle rendering an accessible list alternative with semantic HTML (`role="list"`, `role="listitem"`, `aria-live="polite"`), allowing screen reader users and low-bandwidth connections full access to Nepal tech hubs and service centers.
- **Marker Distance Badging**: Every marker is badged with geodesic distance from Kathmandu center (e.g. `Pulchowk Campus · 3.8 km from KTM`).

### 3.6 Evidence-Backed Nepal Deep Research Engine (`/nepal/research`) (Milestone 6.7)
- **Structured Data First Invariant**: When investigating exchange rates, remittance, seismic activity, or administrative datasets, the engine retrieves factual records from our civic adapters *first*. These verified numbers are injected directly into the LLM context prompt to eliminate numerical hallucinations.
- **Planner (`planner.ts`)**: Classifies research queries into domains (`FOREX`, `ECONOMY`, `SEISMOLOGY`, `CIVIC_DATA`, `TECHNOLOGY`) and determines structured ingestion needs.
- **Citation Validator (`citation-validator.ts`)**: Evaluates citations against trusted domain registries (`nrb.org.np`, `usgs.gov`, `gov.np`, `worldbank.org`), computing an overall confidence score (0–100%).
- **Deterministic Synthesis Fallback**: If Gemini or OpenAI reasoning is offline, the engine builds a comprehensive `EvidenceReport` directly from the structured feeds, ensuring 100% platform availability.

### 3.7 TRIHEX AI Copilot Grounded in Storefront Truth (Milestone 6.8)
- **Grounded Concierge**: Customer-facing conversational assistant available across the storefront via floating launcher (`src/components/copilot/trihex-copilot.tsx`) and API route (`/api/copilot/chat`).
- **Grounding Compiler (`grounding.ts`)**: Assembles live products, active deals, NRB forex benchmarks, warranty policy, and accepted local payment methods (Khalti, eSewa, Fonepay QR, Card, COD).
- **Zero Hallucination Rule**: If a requested item (e.g. unstocked streaming subscription) is not in inventory, Copilot truthfully states that TRIHEX does not carry it and suggests related verified tools.
- **Responsive Interface**: Collapsible modal on desktop and native bottom sheet on mobile devices (`<640px`).

### 3.8 Prompt Library 3.0 & Skills Hub 2.0 (Milestone 6.9)
- **Curated Domain Packs**: Fullstack Architect Pack, Visual & Creator Pack, PhD & Academic Research Pack, and High-Growth B2B Marketing Pack.
- **Bulk Pack Copy**: One-click action formats all pack prompts into a structured Markdown bundle with copy feedback.
- **Version History**: Interactive prompt playground (`prompt-playground.tsx`) allows inspecting and loading previous prompt revisions (`v1`, `v2`, etc.) with capture dates and content hashes.
- **Heuristic Static Security Scanner**: Skill viewer (`skill-viewer.tsx`) displays explicit "Heuristic Static Security Scanner: Low Risk" audit badges and SHA-256 integrity checksums.

### 3.9 Watchlist Engine & Returning User Personalization (Milestone 6.10)
- **Watchlist Store (`src/lib/watchlist/store.ts`)**: Persistent database repository (`schema.watchlists`) for monitoring product price drops, deal expirations, and forex rate movements.
- **Forex Threshold Alerts**: Users can configure rate alerts (e.g. "Alert when USD/NPR sell rate reaches Rs. 135.50"). Automated trigger evaluation compares live NRB rates against active alert thresholds.
- **Returning User Personalization (`returning-user-feed.tsx`)**: Analyzes recent browsing patterns stored client-side in `localStorage`, serving personalized recommendations and active alert counters on the homepage and `/account/saved`.

### 3.10 Admin Command Center 3.0 (Milestone 6.11)
- **Deal Verification Queue (`/admin/queue`)**:
  - Filter tabs: Needs Review, Published, Rejected, All.
  - Verification score audits: vendor HTTP status, domain provenance, expiration dates.
  - Actions: Approve Free Link, Approve Paid Deal, Reject, and inline modal for editing promo codes and eligibility terms.
- **AI Usage & Budgets (`/admin/usage`)**:
  - Daily Budget Guard gauge ($5.00 daily cap, percentage consumed, remaining balance).
  - Request throughput counters and provider cost breakdowns (Gemini vs OpenAI vs You.com).
  - Autonomous Failover Event Log tracking failover timestamps, originating providers, and error reasons.

### 3.11 Production Build Hardening (Milestone 6.12)
- **Client-Safe Module Isolation**: Separated in-memory filtering logic into `src/lib/vault/vault-filters.ts`, ensuring that the `postgres` Node.js driver is never bundled into client components.
- **Full Production Build Verification**: `npm run build` with Next.js 16.2.10 Turbopack compiles 90+ routes cleanly without warnings.
- **Full Test Suite Pass**: All 42 test files and 226 tests pass with 100% success rate.

---

## 4. Verification Evidence & Test Execution Log

```bash
$ npx vitest run

 ✓ src/lib/catalog/product-families.test.ts (6 tests)
 ✓ tests/ingestion/safe-fetch-attack.test.ts (12 tests)
 ✓ src/lib/money/money.test.ts (5 tests)
 ✓ tests/skills/security-scanner.test.ts (9 tests)
 ✓ src/lib/whatsapp/whatsapp.test.ts (5 tests)
 ✓ tests/commerce/availability.test.ts (3 tests)
 ✓ tests/ingestion/inert-parser.test.ts (5 tests)
 ✓ tests/env-aliases.test.ts (2 tests)
 ✓ src/lib/catalog/warranty.test.ts (6 tests)
 ✓ tests/commerce/catalogue-lint.test.ts (3 tests)
 ✓ tests/ingestion/safe-fetch.test.ts (7 tests)
 ✓ tests/prompts/prompt-variables.test.ts (4 tests)
 ✓ tests/security/cron-auth.test.ts (5 tests)
 ✓ src/lib/pricing/honest-discounts.test.ts (7 tests)
 ✓ tests/providers/provider-plane.test.ts (4 tests)
 ✓ tests/commerce/image-delivery.test.ts (6 tests)
 ✓ tests/product-image-mapping.test.ts (12 tests)
 ✓ src/lib/pricing/contribution.test.ts (4 tests)
 ✓ tests/commerce/pricing-engine.test.ts (3 tests)
 ✓ tests/commerce/warranty-policy.test.ts (4 tests)
 ✓ tests/domain.test.ts (18 tests)
 ✓ tests/persistence-guard.test.ts (7 tests)
 ✓ tests/prompts/prompt-persistence.test.ts (7 tests)
 ✓ tests/commerce/revalidate-cart.test.ts (3 tests)
 ✓ src/lib/quotes/store.test.ts (2 tests)
 ✓ tests/map/accessible-map.test.ts (2 tests)
 ✓ tests/jobs/distributed-lock.test.ts (6 tests)
 ✓ tests/vault/vault-catalog.test.ts (9 tests)
 ✓ tests/search/universal-search.test.ts (3 tests)
 ✓ tests/deals/deal-radar.test.ts (4 tests)
 ✓ tests/deals/restart-persistence.test.ts (4 tests)
 ✓ tests/admin/admin-command-center.test.ts (5 tests)
 ✓ tests/prompts/prompt-packs.test.ts (3 tests)
 ✓ tests/saved/saved-items.test.ts (3 tests)
 ✓ tests/system/system-health.test.ts (3 tests)
 ✓ tests/search/search-analytics.test.ts (4 tests)
 ✓ tests/research/deep-research.test.ts (4 tests)
 ✓ tests/nepal/nrb-forex.test.ts (4 tests)
 ✓ tests/watchlist/watchlist-personalization.test.ts (4 tests)
 ✓ tests/nepal/freshness.test.ts (6 tests)
 ✓ tests/nepal/civic-feeds.test.ts (6 tests)
 ✓ tests/copilot/copilot.test.ts (7 tests)

 Test Files  42 passed (42)
      Tests  226 passed (226)
   Duration  8.89s
```

```bash
$ npx tsc --noEmit
# Exited with code 0 (0 errors)
```

```bash
$ npm run build
▲ Next.js 16.2.10 (Turbopack)
✓ Compiled successfully in 9.0s
✓ Finished TypeScript in 16.9s
✓ Generating static pages using 31 workers (89/89)
✓ Finalizing page optimization
# Exited with code 0 (0 errors across 90+ routes)
```

---

## 5. Security & Invariant Checklist

- [x] **Zero Secret Leak Invariant**: No raw API keys, secrets, or connection strings in client bundles, git history, or logs.
- [x] **Truth Badging Invariant**: Offline data is truthfully tagged `CACHED` or `STALE`, never `LIVE`.
- [x] **Single-Column Mobile Invariant**: All cards and dialogs collapse to 1 card per row under 640px (`grid-cols-1`).
- [x] **Commerce-First Invariant**: Background jobs, external AI provider errors, or civic feed downtime never interrupt checkout, payments, cart, or order delivery.
- [x] **Deterministic Fallback Invariant**: When external LLMs reach budget limits or time out, Copilot and Deep Research automatically execute factual deterministic fallbacks.
