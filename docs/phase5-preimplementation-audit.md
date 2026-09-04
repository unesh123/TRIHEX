# TRIHEX DIGITAL Phase 5 — Pre-Implementation Truth Audit

**Audit Date**: September 5, 2026  
**Auditor**: Principal Systems Architect & Engineering Organization  
**Repository**: `c:\Users\unesh\OneDrive\all my cloud stroge\Desktop\APPS\AITRIHEX`  
**Deployment Target**: Next.js 16.2.10 (App Router, Turbopack, React 19.2.4, PostgreSQL via Drizzle ORM 0.45.2, Supabase)  

---

## Executive Summary

This truth audit was performed directly against the running source code, Drizzle schema, file system, network adapters, and configuration files of TRIHEX DIGITAL. No claims from previous walkthroughs or documentation were taken at face value.

While the security foundations (server-only secrets store, HMAC-SHA256 order tokens, SSRF protection core, inert sanitization, real-order social proof querying) are genuinely implemented in code, **the Phase 4 intelligence platform is largely backed by in-memory stores and in-code registries**. 
Specifically:
- **Deal Radar**: Persistence is completely `IN_MEMORY` (`dealsStore = [...INITIAL_DEAL_CANDIDATES]`). State changes, revisions, and approvals are wiped on process restart.
- **Prompts Library**: Persistence is `IN_MEMORY` (`promptStore = [...]`). Remote sync adapter contains seed data only without remote fetch logic or versioning.
- **Agent Skills**: `CONFIRMED_BUT_STATIC` in-code file objects. No database schema or remote sync.
- **Nepal Pulse**: Functional live integration with NRB Forex and USGS Seismic API, but fallback baseline lacks persistent snapshot history and does not display an explicit `STALE` or `CACHED` badge when offline.
- **Google Maps**: Functional client script injection with SVG fallback canvas, but lacks admin configuration visibility (`YES/NO`), usage quotas, and accessible textual alternatives.
- **Universal Search**: Rebuilds search indexes in memory on every query across multiple arrays, rather than querying indexed PostgreSQL Full-Text Search.
- **Automated Jobs / Scheduler**: Only one single cron route exists (`/api/cron/release-reservations`). No background job scheduler, distributed locking, or automated refresh jobs exist for deals, forex, seismic data, or link health.

---

## Detailed Subsystem Classification Matrix

| Subsystem / Feature | Audit Classification | Code Evidence | Actual Status & Remediation Needed |
|---|---|---|---|
| **Server-Only Fulfillment Secrets** | `CONFIRMED_PRODUCTION` | `src/lib/fulfillment/secrets-store.ts`, `/api/fulfillment/access/route.ts` | Server-only guard present; HMAC-SHA256 token verification works. **Remediation**: Remove hardcoded fallback secret `"trihex_sec_signing_key_production_2026"`; enforce strict fail-safe in production if `FULFILLMENT_SIGNING_SECRET` is unset. |
| **Real Order Social Proof** | `CONFIRMED_PRODUCTION` | `src/app/api/social-proof/recent/route.ts` | Queries genuine orders from PostgreSQL via Drizzle ORM; PII masking enforced; returns empty array if no orders exist. |
| **Claims Verification Engine** | `CONFIRMED_BUT_STATIC` | `src/lib/catalog/claims-engine.ts` | In-code catalog of audited product claims; automated expiration check works for static dates. |
| **Promotion Expiration Logic** | `CONFIRMED_PRODUCTION` | `src/lib/catalog/claims-engine.ts`, `tests/commerce/warranty-policy.test.ts` | Evaluates expiration dates correctly; pCloud marked expired. |
| **Safe Fetch Core (SSRF Defense)** | `PARTIAL` | `src/lib/ingestion/safe-fetch.ts` | Blocks standard IPv4/IPv6 private ranges and localhost. **Vulnerabilities**: Follows redirects (`redirect: "follow"`) without validating redirect targets; lacks DNS rebinding protection; vulnerable to decimal/hex IP representations; downloads entire body before size check. |
| **Inert Parser (HTML & Prompt Injection)** | `CONFIRMED_PRODUCTION` | `src/lib/ingestion/inert-parser.ts`, `tests/ingestion/inert-parser.test.ts` | Strips dangerous tags, scripts, and neutralizes prompt-injection markers (`<|im_start|>`, etc.). |
| **Source Registry** | `CONFIRMED_BUT_STATIC` | `src/lib/ingestion/source-registry.ts` | Static array in TypeScript. No database table `sources` exists. |
| **Deal Radar Persistence** | `CONFIRMED_IN_MEMORY` | `src/lib/deals/store.ts` | `let dealsStore: DealCandidate[] = [...]`. Completely lost upon server restart. Must migrate to PostgreSQL `deal_candidates` and `deal_revisions` tables. |
| **Deal Discovery Pipeline (Resourify)** | `CONFIRMED_BUT_STATIC` | `src/lib/deals/resourify-adapter.ts` | Normalization function works, but no scheduled fetcher exists to discover live deals. |
| **Vendor Verification Engine** | `PARTIAL` | `src/lib/deals/vendor-verification.ts` | Uses crude keyword-matching on vendor homepage. Assigns +40 base score just for HTTP 200. Lacks structured field comparison (price, duration, eligibility). |
| **Admin Deal Review Console** | `CONFIRMED_PRODUCTION` (UI) / `CONFIRMED_IN_MEMORY` (State) | `src/app/admin/(protected)/deal-radar/page.tsx`, `src/app/api/admin/deals/route.ts` | UI and API routes work, audit log records actions, but mutations only update runtime in-memory array. |
| **Prompt Library Persistence** | `CONFIRMED_IN_MEMORY` | `src/lib/prompts/store.ts` | `let promptStore: Prompt[] = [...]`. Lost on server restart. Must migrate to PostgreSQL `prompts` table with versioning. |
| **Prompt Playground & Variables** | `CONFIRMED_PRODUCTION` | `src/components/prompts/prompt-playground.tsx`, `tests/prompts/prompt-variables.test.ts` | Interactive variable extraction and live template interpolation works client-side. |
| **prompts.chat Remote Sync** | `MOCK` / `STUB` | `src/lib/prompts/prompts-chat-adapter.ts` | Contains 3 hardcoded seed prompts in `SEED_PROMPTS_CHAT_PROMPTS`. No network call to prompts.chat API/repo exists. |
| **Agent Skills Hub** | `CONFIRMED_BUT_STATIC` | `src/lib/skills/store.ts`, `src/components/skills/skill-viewer.tsx` | Static curated skills rendered in tabbed file viewer. No database backing, no static security scanner. |
| **Nepal Pulse — NRB Forex** | `PARTIAL` | `src/lib/nepal/nrb-forex-adapter.ts` | Fetches live NRB API when network permits. Falls back to static snapshot, but UI does not show explicit `CACHED` or `STALE` indicator with timestamp age. No historical rate snapshots stored in DB. |
| **Nepal Pulse — USGS Seismic Feed** | `CONFIRMED_PRODUCTION` | `src/lib/nepal/earthquake-adapter.ts` | Live queries to USGS FDSN GeoJSON API bounded to Nepal coordinates. |
| **Nepal Pulse — Civic Datasets** | `CONFIRMED_BUT_STATIC` | `src/lib/nepal/open-data-adapter.ts` | In-code list of 6 civic datasets. No database storage or metadata freshness check. |
| **Google Maps Platform Explorer** | `PARTIAL` | `src/components/maps/trihex-map.tsx`, `src/app/(storefront)/map/page.tsx` | Script loads if `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is present; SVG fallback works. Lacks admin configuration indicator, quota tracking, and accessible list alternative. |
| **Research Vault (Public Records)** | `CONFIRMED_BUT_STATIC` | `src/lib/vault/research-registry.ts` | In-code registry of 3 public records with checksums and provenance. No DB table. |
| **TRIHEX Guides (Editorial Engine)** | `CONFIRMED_BUT_STATIC` | `src/lib/guides/guide-registry.ts`, `src/components/guides/guide-article.tsx` | In-code articles with print stylesheet. No editorial workflow (draft/review) or DB table. |
| **Universal Search 2.0** | `CONFIRMED_IN_MEMORY` | `src/lib/search/universal-search.ts`, `src/app/api/search/route.ts` | Re-queries all in-memory arrays on every search request and filters using JS `.includes()`. No PostgreSQL full-text search, no search analytics, no zero-result logging. |
| **Command Palette (`Cmd+K`)** | `CONFIRMED_PRODUCTION` | `src/components/search/command-palette.tsx` | Keyboard shortcut listener, modal trapping, category display works. |
| **Cron / Background Jobs** | `STUB` | `src/app/api/cron/release-reservations/route.ts` | Only 1 route exists for inventory release. Zero scheduled jobs for deal sync, forex history, prompt sync, link checks, or data freshness. No distributed locking mechanism. |
| **User Accounts & Saved Items** | `NOT_FOUND` | N/A | No `/account` routes, no `saved_items` table, no watchlists table. |
| **System Observability & Health** | `PARTIAL` | `src/app/api/health/route.ts` | Only checks if database and Supabase env vars are set. No `/admin/system-health` dashboard with adapter latencies, job status, or error tracking. |

---

## Critical Production Blockers Identified

1. **In-Memory Volatility**:
   - `dealsStore` in `src/lib/deals/store.ts` loses approved deals and revisions on restart.
   - `promptStore` in `src/lib/prompts/store.ts` loses additions and upvotes on restart.
   - External deals approved by admins cannot be reliably served to customers across instances.

2. **Deceptive Live State in Nepal Pulse**:
   - When NRB API fails, the application returns `BASELINE_NRB_RATES` and displays it inside a banner labeled "Real-Time Civic Feeds".
   - The UI must distinguish `LIVE`, `CACHED` (with relative age, e.g. "Cached 45m ago"), `STALE`, and `UNAVAILABLE`.

3. **SSRF & Fetch Security Gaps (SafeFetch 1.0)**:
   - Node `fetch` with `redirect: "follow"` will follow HTTP 302 redirects to internal IP addresses or cloud metadata (`169.254.169.254`) after initial host check passes.
   - Hex (`0x7f000001`), decimal (`2130706433`), and octal IP notations bypass simple regex checks.
   - DNS rebinding allows a domain to resolve to a public IP on pre-check and a private IP on fetch.
   - Payload size is measured after downloading the whole body into memory.

4. **Search Scalability & Analytics Absence**:
   - Universal search performs unindexed sequential scans across 7 separate in-memory collections.
   - Zero-result searches are not logged, preventing administrators from identifying in-demand software and content.

5. **Hardcoded Fallback Secret in Production**:
   - `TOKEN_SIGNING_SECRET` in `secrets-store.ts` falls back to a plaintext constant string. Production runtime must strictly throw `ConfigurationError` if `FULFILLMENT_SIGNING_SECRET` is missing.

---

## Target Database Schema for Phase 5

To eliminate in-memory stores and satisfy the Phase 5 specification without redundant duplication, the following tables will be added to Drizzle ORM (`src/db/schema.ts`) and migrated via additive Drizzle migration:

1. **`sources`**: External and internal ingestion sources (Resourify, prompts.chat, NRB, USGS, etc.) with sync intervals, health status, and failure counters.
2. **`ingestion_runs`**: Execution log of every scheduled or manual ingestion job with item counts, duration, and error category.
3. **`deal_candidates`**: Persistent deal storage with fields for vendor, title, slug, dealType, minor value, promoCode, eligibility, verificationScore, status, approvalType, and timestamps.
4. **`deal_revisions`**: Immutable audit log of field changes detected during periodic reverification.
5. **`prompts`**: Persistent prompt catalog with categories, prompt type, license, variables JSON, content hash, and publication status.
6. **`prompt_versions`**: Historical versions when external prompts change upstream.
7. **`feed_snapshots`**: Historical records of forex and earthquake feeds enabling 24h/7d delta calculations and true `CACHED`/`STALE` resolution.
8. **`saved_items`**: User and guest saved items across products, deals, prompts, skills, and guides.
9. **`watchlists`**: User price and deal alert subscriptions.
10. **`search_analytics`**: Aggregated anonymous search query logs tracking hit count and zero-result queries.
11. **`resource_health`**: Circuit breaker state and latency tracking for all external dependencies.

---

## Phase 5 Implementation Order & Milestones

- **Milestone 1: Database Migration & Persistence Core**
  - Add tables to `src/db/schema.ts`.
  - Generate and verify additive migration.
  - Implement Drizzle-backed persistent repositories for Deals, Prompts, Feeds, and Sources with fallback to demo repository only in development.
  - Fix secret fallback in `secrets-store.ts`.

- **Milestone 2: SafeFetch 2.0 & Ingestion Engine**
  - Implement manual redirect handling with re-validation on every redirect hop.
  - Implement DNS resolution validation (SSRF & DNS rebinding defense).
  - Implement streaming response limit enforcement (aborting stream when byte limit exceeded).
  - Add comprehensive attack-test suite covering hex/decimal IPs, redirect-to-private, and payload bombs.

- **Milestone 3: Background Job & Scheduler Abstraction**
  - Create `JobDefinition` and distributed locking using database advisory locks / `jobQueue` table.
  - Implement cron handlers for deal expiration, NRB forex sync, earthquake sync, and source health checks.

- **Milestone 4: Deal Radar & Vendor Verification 2.0**
  - Wire `/deals` and `/admin/deal-radar` to persistent database tables.
  - Implement explainable 0-100 verification scoring with structured field evidence.
  - Implement deal change detection (`deal_revisions`) and expiration status.

- **Milestone 5: Prompts & Skills Productionization**
  - Wire `/prompts` and admin to database persistence with version tracking.
  - Implement real remote synchronization adapter for prompts.chat public archive with CC0 license attribution.
  - Add static security risk scanner for agent skill files.

- **Milestone 6: Nepal Pulse Truth & Historical Snapshots**
  - Add `LIVE`, `CACHED`, `STALE`, and `UNAVAILABLE` states to Forex and Seismic feeds with explicit timestamp indicators.
  - Persist daily forex snapshots in `feed_snapshots` table for genuine 24h change calculations.
  - Update currency calculator to explicitly show BUY vs SELL rates.

- **Milestone 7: Universal Search 2.0 & Zero-Result Analytics**
  - Implement PostgreSQL full-text search query across products, deals, prompts, and content.
  - Log search queries and provide admin view of top searches with zero results.

- **Milestone 8: Personalization (Saved Items & Watchlists)**
  - Implement persistent saved items API (`/api/saved`) and watchlists engine with guest localStorage sync.

- **Milestone 9: Admin Content OS 2.0 & Observability**
  - Add `/admin/sources` health dashboard with circuit breakers and parser drift alerts.
  - Add `/admin/system-health` and `/admin/usage` dashboards.

- **Milestone 10: Storefront & Mobile Polish**
  - Preserve strict 1-card-per-row mobile view on `< 640px`.
  - Verify WCAG accessibility, focus trapping in Cmd+K, and mobile sticky purchase bar safety.
  - Update full documentation in `docs/`.
