# TRIHEX DIGITAL — Route Audit

**Generated:** 2026-07-21  
**Scope:** All `page.tsx` under `src/app` (98 routes) + all `route.ts` under `src/app/api` (8 routes)  
**Environment:** Demo mode (no `DATABASE_URL`; in-memory repos + `demo-catalog` seed data)

## Classification Legend

| Status | Meaning |
|---|---|
| **FUNCTIONAL** | End-to-end behavior works in demo mode (reads/writes via demo repos, localStorage, or server actions). |
| **READ_ONLY_FUNCTIONAL** | Renders real data or useful static content; no persistence or mutation on the page itself. |
| **PLACEHOLDER** | Shell, empty state, disabled form, or copy-only page without wired backend. |
| **BROKEN** | Route exists but fails or is unusable without missing config. |
| **NOT_REQUIRED** | Redirect-only alias; no standalone page content. |

## Summary

| Area | FUNCTIONAL | READ_ONLY_FUNCTIONAL | PLACEHOLDER | BROKEN | NOT_REQUIRED |
|---|---:|---:|---:|---:|---:|
| Storefront pages | 7 | 29 | 8 | 0 | 0 |
| Admin pages | 2 | 11 | 36 | 0 | 5 |
| API routes | 5 | 2 | 0 | 1 | 0 |
| **Total** | **14** | **42** | **44** | **1** | **5** |

### P0 routes (confirmed working in demo mode)

`/`, `/products`, `/products/[slug]`, `/cart`, `/checkout`, `/checkout/success`, `/track-order`, `/orders/[secureToken]`, `/admin` (with bypass), `/admin/products`, `/admin/pricing`, `/admin/payments`, and all `/api/*` handlers except cron (see below).

---

## Storefront Pages (`src/app/(storefront)`)

| Route | Status | Evidence |
|---|---|---|
| `/` | READ_ONLY_FUNCTIONAL | `getDemoFeaturedProducts` / `getDemoCatalogProducts` / `getDemoCategories` render home catalogue; search form is GET-only. |
| `/products` | READ_ONLY_FUNCTIONAL | `getDemoCatalogProducts()` → `ProductGrid`; browse-only demo catalogue. |
| `/products/[slug]` | FUNCTIONAL | `getDemoProductBySlug` + `AddToCartButton` writes `trihex_cart` to localStorage. |
| `/cart` | FUNCTIONAL | `CartView` reads/writes localStorage cart against `getDemoCatalogWithVariants()`. |
| `/checkout` | FUNCTIONAL | `CheckoutForm` POSTs cart lines to `/api/checkout`, clears cart, redirects to success. |
| `/checkout/success` | FUNCTIONAL | Displays order number/total/token from checkout redirect query params + WhatsApp link. |
| `/checkout/failure` | READ_ONLY_FUNCTIONAL | Static failure copy with links back to checkout/cart/contact; no order mutation. |
| `/track-order` | FUNCTIONAL | `TrackOrderForm` POSTs to `/api/orders/track` and renders order timeline. |
| `/orders/[secureToken]` | FUNCTIONAL | Server loads order via `getOrderBySecureToken` from in-memory order store; 404 if missing. |
| `/categories` | READ_ONLY_FUNCTIONAL | `getDemoCategories()` lists category links with product counts. |
| `/categories/[slug]` | READ_ONLY_FUNCTIONAL | `getDemoProductsByCategory(slug)` → `ProductGrid`; 404 if slug missing. |
| `/collections/[slug]` | READ_ONLY_FUNCTIONAL | `getDemoCollection(slug)` for known slugs (`trihex-owned`, `featured`, `services`, `digital-assets`). |
| `/brands/[slug]` | READ_ONLY_FUNCTIONAL | `getDemoBrands()` + `getDemoProductsByBrand(slug)` → `ProductGrid`. |
| `/search` | READ_ONLY_FUNCTIONAL | `searchDemoProducts(q)` with GET form; browse-only results. |
| `/deals` | READ_ONLY_FUNCTIONAL | `getDemoProductsByBrand("trihex")` grid; no separate deal engine. |
| `/best-value` | READ_ONLY_FUNCTIONAL | Full `getDemoCatalogProducts()` grid with static value copy. |
| `/new-arrivals` | READ_ONLY_FUNCTIONAL | `getDemoProductsByBrand("trihex")` grid; no date-based filtering. |
| `/ai-tools-nepal` | READ_ONLY_FUNCTIONAL | `getDemoProductsByCategory("ai-tools")` + SEO metadata + product grid. |
| `/digital-tools-nepal` | READ_ONLY_FUNCTIONAL | Full demo catalogue grid + landing copy. |
| `/creator-tools-nepal` | READ_ONLY_FUNCTIONAL | Merges design/video-editing/digital-assets categories into one grid. |
| `/student-tools-nepal` | READ_ONLY_FUNCTIONAL | Merges learning + digital-assets categories into one grid. |
| `/automation-services` | READ_ONLY_FUNCTIONAL | `getDemoProductsByCategory("services")` grid + link to discovery product. |
| `/business-ai-setup` | READ_ONLY_FUNCTIONAL | Filters demo products by slug (`business`/`consultation`) + product link. |
| `/account` | PLACEHOLDER | `AccountShell` states “Authentication is not enabled”; only outbound links. |
| `/account/orders` | PLACEHOLDER | Empty shell: “Order history appears here after authentication is enabled.” |
| `/account/orders/[id]` | PLACEHOLDER | Empty shell: “Detailed order view requires sign-in.” |
| `/account/preferences` | PLACEHOLDER | Empty shell: “Email and notification preferences require sign-in.” |
| `/account/privacy` | PLACEHOLDER | Shell + link to `/privacy`; no data export/delete actions. |
| `/account/support` | PLACEHOLDER | Shell + WhatsApp button only; signed-in tickets not implemented. |
| `/account/warranty` | PLACEHOLDER | Shell + link to warranty policy; no claim submission. |
| `/about` | READ_ONLY_FUNCTIONAL | Static company copy + nav buttons; no backend. |
| `/how-it-works` | READ_ONLY_FUNCTIONAL | Static 6-step ordering guide + checkout CTA. |
| `/faq` | READ_ONLY_FUNCTIONAL | Hard-coded FAQ array; contact link only. |
| `/contact` | READ_ONLY_FUNCTIONAL | WhatsApp URL builder + links to track-order/FAQ; email TBD. |
| `/pricing-transparency` | READ_ONLY_FUNCTIONAL | Static pricing philosophy copy. |
| `/verified-supply` | READ_ONLY_FUNCTIONAL | Static compliance/supply explanation + disclaimer. |
| `/privacy` | READ_ONLY_FUNCTIONAL | Draft policy text + `LegalReviewNotice`; retention/processors TBD. |
| `/terms` | READ_ONLY_FUNCTIONAL | Draft ToS + `LegalReviewNotice`; marked internal review draft. |
| `/refund-policy` | READ_ONLY_FUNCTIONAL | Draft refund rules + `LegalReviewNotice`; owner sign-off pending. |
| `/warranty-policy` | READ_ONLY_FUNCTIONAL | Draft warranty rules + `LegalReviewNotice`. |
| `/delivery-policy` | READ_ONLY_FUNCTIONAL | Draft fulfillment timelines + `LegalReviewNotice`. |
| `/acceptable-use` | READ_ONLY_FUNCTIONAL | Draft prohibited-use rules + `LegalReviewNotice`. |
| `/business-disclosures` | PLACEHOLDER | `LegalReviewNotice` + “PAN/VAT… will be published here before production payments.” |
| `/grievance` | PLACEHOLDER | Draft process only; officer name/address “will be added after business disclosures.” |

**Notes:** No `/brands` or `/collections` index pages exist (only dynamic `[slug]` routes). No storefront routes classified BROKEN.

---

## Admin Pages (`src/app/admin`)

| Route | Status | Evidence |
|---|---|---|
| `/admin/login` | FUNCTIONAL | `adminLoginAction` sets session cookie, appends audit event, redirects to `/admin`; dev bypass supported. |
| `/admin` | READ_ONLY_FUNCTIONAL | KPIs from `ALL_SEED_PRODUCTS` + last 5 in-memory audit events; banner says not live DB counts. |
| `/admin/products` | READ_ONLY_FUNCTIONAL | Renders full seed catalogue table from `ALL_SEED_PRODUCTS`; explicitly not persisted. |
| `/admin/products/new` | PLACEHOLDER | Form inputs disabled, Save button disabled; copy says creation needs `DATABASE_URL`. |
| `/admin/products/[id]` | READ_ONLY_FUNCTIONAL | Seed product detail with section tabs; all fields are `readOnly` inputs; footer says display-only. |
| `/admin/products/[id]/edit` | NOT_REQUIRED | Redirect-only to `/admin/products/[id]?section=edit`. |
| `/admin/products/[id]/pricing` | NOT_REQUIRED | Redirect-only to `?section=pricing`. |
| `/admin/products/[id]/inventory` | NOT_REQUIRED | Redirect-only to `?section=inventory`. |
| `/admin/products/[id]/media` | NOT_REQUIRED | Redirect-only to `?section=media`. |
| `/admin/products/[id]/compliance` | NOT_REQUIRED | Redirect-only to `?section=compliance`. |
| `/admin/pricing` | FUNCTIONAL | `PricingCalculatorPanel` interactively computes contribution from FX/sell inputs (client-side, no save). |
| `/admin/payments` | READ_ONLY_FUNCTIONAL | Lists payments via `listManualPayments()` from in-memory demo repository; no write UI. |
| `/admin/payments/review` | READ_ONLY_FUNCTIONAL | Read-only queue from `listManualPayments()`; copy points to `POST /api/payments/manual/review`, no UI actions. |
| `/admin/payment-methods` | PLACEHOLDER | Static security policy and upload instructions; “Upload UI connects when storage integration is configured.” |
| `/admin/compliance` | PLACEHOLDER | Static blurb + link to reviews queue; no data or forms. |
| `/admin/compliance/reviews` | READ_ONLY_FUNCTIONAL | Table from `productsNeedingVerification()` seed filter; links to read-only product compliance section. |
| `/admin/orders` | PLACEHOLDER | Hard-coded empty state; does not call order repo even after checkout creates orders. |
| `/admin/orders/[id]` | PLACEHOLDER | `AdminSectionPage` shell with title only; default dashed “Module shell ready”. |
| `/admin/inventory` | READ_ONLY_FUNCTIONAL | Table derived from seed product variants (`ALL_SEED_PRODUCTS` flatMap); not live ledger. |
| `/admin/inventory/lots` | PLACEHOLDER | Bare `AdminSectionPage` → dashed “Module shell ready — wire to database”. |
| `/admin/inventory/movements` | PLACEHOLDER | Same empty shell pattern via `AdminSectionPage`. |
| `/admin/inventory/reconciliation` | PLACEHOLDER | Same empty shell pattern via `AdminSectionPage`. |
| `/admin/fx-rates` | PLACEHOLDER | Static “160 NPR/USD” text; no editable FX table or persistence. |
| `/admin/audit` | READ_ONLY_FUNCTIONAL | Renders up to 100 events from in-memory `getRecentAuditEvents()`. |
| `/admin/settings` | READ_ONLY_FUNCTIONAL | Working nav hub with links to sub-settings; no config forms. |
| `/admin/settings/business` | PLACEHOLDER | `AdminSectionPage` only → default dashed shell. |
| `/admin/settings/storefront` | PLACEHOLDER | Same shell-only pattern. |
| `/admin/settings/whatsapp` | PLACEHOLDER | Same shell-only pattern. |
| `/admin/settings/payments` | PLACEHOLDER | Same shell-only pattern. |
| `/admin/settings/orders` | PLACEHOLDER | Same shell-only pattern. |
| `/admin/settings/inventory` | PLACEHOLDER | Same shell-only pattern. |
| `/admin/settings/pricing` | PLACEHOLDER | Same shell-only pattern. |
| `/admin/settings/legal` | PLACEHOLDER | Same shell-only pattern. |
| `/admin/settings/security` | PLACEHOLDER | Same shell-only pattern. |
| `/admin/settings/integrations` | PLACEHOLDER | Same shell-only pattern. |
| `/admin/settings/notifications` | PLACEHOLDER | Same shell-only pattern. |
| `/admin/marketing` | PLACEHOLDER | `AdminSectionPage` shell only. |
| `/admin/marketing/campaigns` | PLACEHOLDER | Shell only via `getSectionMeta("marketing-campaigns")`. |
| `/admin/marketing/media` | PLACEHOLDER | Shell only. |
| `/admin/marketing/coupons` | PLACEHOLDER | Shell only. |
| `/admin/customers` | PLACEHOLDER | Dashed module shell; no customer data. |
| `/admin/support` | PLACEHOLDER | Dashed module shell. |
| `/admin/warranties` | PLACEHOLDER | Dashed module shell. |
| `/admin/refunds` | PLACEHOLDER | Dashed module shell. |
| `/admin/reviews` | PLACEHOLDER | Dashed module shell. |
| `/admin/reports` | PLACEHOLDER | Dashed module shell. |
| `/admin/team` | PLACEHOLDER | Dashed module shell. |
| `/admin/variants` | PLACEHOLDER | Dashed module shell. |
| `/admin/suppliers` | PLACEHOLDER | Dashed module shell. |
| `/admin/promotions` | PLACEHOLDER | Dashed module shell. |
| `/admin/legal` | PLACEHOLDER | Dashed module shell. |
| `/admin/integrations` | PLACEHOLDER | Dashed module shell. |
| `/admin/system` | PLACEHOLDER | Dashed module shell. |
| `/admin/fulfillment` | PLACEHOLDER | Dashed module shell. |

**Notes:** Admin inventory receive/correct APIs exist but have no wired admin UI pages. No admin page routes classified BROKEN.

---

## API Routes (`src/app/api`)

| Route | Method | Status | Evidence |
|---|---|---|---|
| `/api/health` | GET | READ_ONLY_FUNCTIONAL | Returns `{ status: "ok" }` plus config flags from `isDatabaseConfigured()` / `isSupabaseConfigured()`; no DB or auth required. |
| `/api/checkout` | POST | FUNCTIONAL | Validates payment method, runs `createOrder()` against seed catalogue, persists via demo `orders.save()`; wired by `CheckoutForm`. |
| `/api/orders/track` | POST | READ_ONLY_FUNCTIONAL | Looks up order in demo repo, verifies email/phone match, returns order + timeline; no mutations. |
| `/api/payments/manual` | POST | FUNCTIONAL | Validates body with Zod, calls `submitManualPayment()` into demo payments Map, appends audit event. |
| `/api/payments/manual/review` | POST | FUNCTIONAL | Gated by `requireAdminApi()`, transitions payment via `reviewManualPayment()`, audits result; works with `ADMIN_DEV_BYPASS=true`. |
| `/api/admin/inventory/receive` | POST | FUNCTIONAL | Admin-gated, creates/updates in-memory lot via `seedMemoryLot()` and audits; no admin UI wired. |
| `/api/admin/inventory/correct` | POST | FUNCTIONAL | Admin-gated, validates delta with `validateMovement()`, updates lot via `seedMemoryLot()`; 404 if lot missing. |
| `/api/cron/release-reservations` | GET | BROKEN | `requireCronSecret()` returns 503 when `CRON_SECRET` is unset (default in `.env.example`); non-blocking for core demo checkout path. |

---

## Key Gaps (honest assessment)

1. **`/admin/orders` does not list checkout-created orders** — orders exist in the in-memory repo but the admin orders page shows a static empty message without fetching.
2. **~36 admin routes are `AdminSectionPage` shells** — navigation exists; persistence and forms are not wired.
3. **Account area is entirely placeholder** — auth is explicitly disabled; use `/track-order` and `/orders/[secureToken]` instead.
4. **Legal/compliance pages are drafts** — `/business-disclosures` and `/grievance` are incomplete placeholders pending production data.
5. **Cron route requires `CRON_SECRET`** — only API route classified BROKEN out of the box; checkout does not create inventory reservations, so this does not block P0 demo flow.
