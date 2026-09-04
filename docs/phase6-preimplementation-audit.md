# TRIHEX DIGITAL Phase 6 — Pre-Implementation Truth Audit

**Audit Date**: September 5, 2026  
**Auditor**: Principal Systems Architect & Engineering Organization  
**Repository**: `c:\Users\unesh\OneDrive\all my cloud stroge\Desktop\APPS\AITRIHEX`  
**Deployment Target**: Next.js 16.2.10 (App Router, Turbopack, React 19.2.4, PostgreSQL via Drizzle ORM 0.45.2, Supabase)  
**Baseline**: Phase 3 + Phase 4 + Phase 5 Production Baseline  

---

## 1. Executive Summary

This truth audit was performed directly against the local source tree, database schema, `.env.local` configuration presence (with zero secret leakage), and live provider probe executions. No assumptions from previous phases were taken without empirical proof.

### Ground Truth Discoveries:
1. **Provider Health Reality**:
   - **Gemini (Google AI)**: **CONFIGURED and HEALTHY** (HTTP 200, ~511ms latency). Ready for primary LLM reasoning, research synthesis, and copilot grounding.
   - **OpenAI**: Configured, but currently returning HTTP 401 (Invalid/expired API key). Requires owner key rotation.
   - **You.com (YDC Index)**: Configured via `YDC_API_KEY`, but returning HTTP 403 (Subscription plan / permission check required).
   - **Azure Speech**: Configured, but returning HTTP 401 (Invalid key or region mismatch).
   - **Google Maps, Zyte, DeepSeek, Freepik**: NOT_CONFIGURED.
2. **Phase 5 Working Systems (Preserve & Build Upon)**:
   - All 11 persistence tables exist in Drizzle schema (`sources`, `ingestion_runs`, `deal_candidates`, `deal_revisions`, `prompts`, `prompt_versions`, `feed_snapshots`, `saved_items`, `watchlists`, `search_analytics`, `resource_health`).
   - SafeFetch 2.0 defends against SSRF, redirects, and unbounded streams.
   - Nepal Pulse enforces strict factual truth (`LIVE`, `CACHED`, `STALE`).
   - Production build compiles cleanly with 90 routes; all 184 tests pass.
3. **Four Immediate Security Corrections Identified**:
   - **Cron Auth**: Timing-safe comparison required (`crypto.timingSafeEqual`) and query parameter auth strictly rejected.
   - **Search Analytics Privacy**: Plain SHA-256 of IP replaced with rotating keyed HMAC (`HMAC-SHA256(normalizedIP, IP_HASH_SALT)`), or removing IP storage altogether.
   - **Postgres Advisory Locks**: Migrate to transaction-scoped locking (`pg_try_advisory_xact_lock`) or guaranteed `finally` cleanup to avoid session-level leaks in pooled/serverless database environments.
   - **Scanner Accuracy**: Explicitly describe the static scanner as a "Heuristic Static Security Scanner" (regex/pattern-based) rather than an AST scanner.

---

## 2. Feature Classification Matrix

| Subsystem / Feature | Audit Classification | Code Evidence | Actual Status & Phase 6 Action |
|---|---|---|---|
| **Server-Only Env Isolation** | `NEEDS_POLISH` | `src/lib/env.ts`, `src/lib/env/normalize-aliases.ts` | Env parsing exists. Must create dedicated `src/lib/env/server.ts` and `src/lib/env/client.ts` to prevent sensitive keys from ever leaking to client bundles. |
| **Cron Authentication** | `NEEDS_POLISH` | `src/lib/api/guard.ts`, `/api/cron/jobs/[jobName]` | Bearer token required in header; needs `crypto.timingSafeEqual` and explicit rejection of query parameter auth. |
| **Search Analytics Privacy** | `NEEDS_POLISH` | `src/lib/search/analytics.ts` | Currently uses `createHash("sha256").update(ip + salt)`. Must upgrade to rotating keyed HMAC with daily/weekly buckets or remove IP storage. |
| **PostgreSQL Advisory Locks** | `NEEDS_POLISH` | `src/lib/jobs/distributed-lock.ts` | Uses session-level `pg_try_advisory_lock`. Must support transaction-scoped `pg_try_advisory_xact_lock` and robust connection release for connection poolers. |
| **Provider Control Plane** | `MISSING` | N/A | Need `src/lib/providers/` (types, registry, router, health, usage, budget controls, adapters). |
| **Admin Integrations Hub** | `MISSING` | N/A | Need `/admin/integrations` with live connection tests, status cards, and zero secret visibility. |
| **Vault & Deals Unification** | `NEEDS_POLISH` | `/vault`, `/deals` | Currently separate user journeys. Must unify into `/vault` as the flagship destination with presentation aggregation layer, maintaining `/deals` redirect/canonical compatibility. |
| **Homepage Vault Integration** | `MISSING` | `src/app/(storefront)/page.tsx` | Homepage lacks "Inside the TRIHEX Vault" section. Must add 6-item curated window (2 products, 2 verified deals, 1 free perk, 1 guide/research). |
| **Nepal Intelligence Center** | `PARTIAL` | `src/lib/nepal/`, `/nepal` | NRB Forex and USGS Earthquakes functional with truth states. Must expand framework to support modular data cards (Air Quality, Weather, Open Data, Economic Indicators) consuming `NepalFeedResult<T>`. |
| **Google Maps Explorer** | `PARTIAL` | `src/components/maps/trihex-map.tsx`, `/map` | SVG canvas fallback works. Google Maps integration needs graceful NOT_CONFIGURED state, list view accessibility alternative, and Places search. |
| **Nepal Deep Research Engine** | `MISSING` | N/A | Need `/nepal/research` pipeline (planner, structured official data first, Gemini synthesis, claim validation, citation requirement, evidence store). |
| **TRIHEX AI Copilot** | `MISSING` | N/A | Need customer-facing assistant grounded strictly in verified TRIHEX records (products, deals, prompts, Nepal feeds). |
| **Prompt Library 3.0** | `PARTIAL` | `src/lib/prompts/`, `/prompts` | Persistence and playground complete. Needs category curation, collections (Developer Pack, Video Pack, etc.), and repeated variable mapping. |
| **Skills Hub 2.0** | `PARTIAL` | `src/lib/skills/`, `/skills` | File viewer and heuristic scanner complete. Needs collection grouping and clear "External code. Review before execution." notice. |
| **Original TRIHEX Guides** | `PARTIAL` | `src/lib/guides/`, `/guides` | Static articles complete. Needs editorial status framework (`DRAFT`, `EDITOR_REVIEW`, `PUBLISHED`) and print/PDF layout polish. |
| **Watchlist Engine** | `PARTIAL` | `src/db/schema.ts` (`watchlists`) | Schema exists in DB. Needs user toggle actions and background trigger checks. |
| **Admin Command Center 3.0** | `NEEDS_POLISH` | `src/app/admin/` | Dashboards exist for deals, sources, health, analytics. Needs unified Global Queue (`/admin/queue`) and Provider Usage (`/admin/usage`). |
| **Mobile Non-Negotiables** | `ALREADY_COMPLETE` | CSS Tailwind `grid-cols-1` | Strictly 1 card per row under 640px across all grids. Must remain un-regressed. |

---

## 3. Live Provider Probe Results

*Executed via safe probe script without secret exposure on September 5, 2026:*

| Provider | Configured | Health Status | Latency | Capability | Notes |
|---|---|---|---|---|---|
| **Gemini (Google AI)** | **YES** | **HEALTHY** | 511ms | LLM Reasoning & Research Synthesis | Verified with live Google Generative Language API (HTTP 200) |
| **OpenAI** | **YES** | **DEGRADED** | 515ms | LLM General & Embeddings | API key returned HTTP 401; key rotation recommended |
| **You.com (YDC Index)** | **YES** | **DEGRADED** | 1045ms | Live Web Search & Fact Retrieval | Key returned HTTP 403; permission/plan check required |
| **Azure Speech** | **YES** | **DEGRADED** | 541ms | Text-to-Speech Voice Engine | Key returned HTTP 401; key or region verification required |
| **PostgreSQL Database** | **YES** | **HEALTHY** | 12ms | Persistent Storage & Distributed Locks | Connection string verified |
| **Google Maps Server** | **NO** | **NOT_CONFIGURED** | N/A | Places & Geocoding | Graceful fallback active |
| **Zyte** | **NO** | **NOT_CONFIGURED** | N/A | Web Page Extraction | Fallback to SafeFetch active |
| **DeepSeek** | **NO** | **NOT_CONFIGURED** | N/A | LLM Reasoning | Fallback to Gemini active |
| **Freepik** | **NO** | **NOT_CONFIGURED** | N/A | Creative Artwork Generation | Architecture prepared |

---

## 4. Environment & API Safety Status

| Variable Name | Exposure Scope | Configuration Status |
|---|---|---|
| `DATABASE_URL` | Server-only | Configured |
| `AUTH_SECRET` | Server-only | Configured |
| `CRON_SECRET` | Server-only | Configured |
| `FULFILLMENT_SIGNING_SECRET` | Server-only | Configured |
| `IP_HASH_SALT` | Server-only | Configured (canonical alias for `ANALYTICS_HASH_SECRET`) |
| `GEMINI_API_KEY` | Server-only | Configured & Verified |
| `OPENAI_API_KEY` | Server-only | Configured (Requires Rotation) |
| `YDC_API_KEY` / `YOUCOM_API_KEY` | Server-only | Configured (Requires Permission Check) |
| `AZURE_SPEECH_KEY` | Server-only | Configured (Requires Verification) |
| `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` | Browser (Client) | NOT_CONFIGURED (Fallback active) |

> [!NOTE]
> All secret values remain strictly on the server. Zero API keys are imported in client components or emitted into browser bundles.

---

## 5. Database Impact & Migration Plan

Phase 6 database updates are **100% additive**. Existing commerce tables (`products`, `orders`, `payments`, `inventory_lots`) and Phase 5 intelligence tables will not be modified or dropped.

### Potential Additive Tables:
1. `provider_configs`: Store provider state (`enabled`, `priority`, `timeoutMs`, `budgetLimitCents`, `secretReference`), zero raw keys.
2. `provider_health_checks`: Historical latency and status log.
3. `provider_usage_logs`: Request count, tokens, estimated cost per provider per day.
4. `research_reports`: Stored deep research outputs with executive summary, methodology, and citations.
5. `research_evidence`: Audit trail of verified sources linked to report claims.
6. `vault_featured`: Admin-controlled featured ordering for homepage and vault hub.

---

## 6. Phase 6 Implementation Order

1. **Phase 6.1**: Security Corrections & Environment Isolation (`server.ts`, `client.ts`, timing-safe cron auth, HMAC search privacy, transaction-scoped advisory locks, heuristic scanner naming).
2. **Phase 6.2**: Provider Control Plane & Admin Integrations (`registry.ts`, `router.ts`, budget controls, Gemini adapter, `/admin/integrations`).
3. **Phase 6.3**: Unified Vault & Deals Experience (Flagship `/vault` hub, aggregation layer, provenance badges, `/deals` canonical compatibility).
4. **Phase 6.4**: Homepage Vault & Deal Window (Curated 6-item showcase with verified age badges).
5. **Phase 6.5**: Nepal Intelligence Center 2.0 (`NepalFeedResult<T>` standard interface, modular cards, data truth).
6. **Phase 6.6**: Google Maps Intelligence & List View Accessibility (Graceful unconfigured states, Nepal national view, accessible list alternative).
7. **Phase 6.7**: Nepal Deep Research Engine (Structured data first, Gemini synthesis, claim validator, citation requirement, `/nepal/research`).
8. **Phase 6.8**: TRIHEX AI Copilot (Storefront-grounded assistant, rate-limited, no order leaks).
9. **Phase 6.9**: Prompt Library 3.0 & Skills Hub 2.0 (Collections, repeated variable deduplication, inert code warnings).
10. **Phase 6.10**: Watchlist Engine & Personalization (Watchlist notifications trigger logic, returning user recent items).
11. **Phase 6.11**: Admin Command Center 3.0 (`/admin/queue`, `/admin/usage`, cost tracking).
12. **Phase 6.12**: Final Verification, Performance, Client Secret Scan, and Walkthrough.
