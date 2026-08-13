# TRIHEX Live Experience Observations

**Captured:** 2026-08-13, public production site: `https://trihexdigital.shop`

## Homepage

The homepage is publicly available and presents a clean desktop first screen with a primary hero, two calls to action, a fixed navigation system, category shortcuts, WhatsApp support, and a product catalogue. The page states that 57 packages are live. The hero’s key positioning is “Premium AI & Digital Tools for Nepal,” supported by local NPR pricing, website checkout, and WhatsApp support.

The desktop header exposes Products, Inquire list, AI Tools, Blog, Deals, Search, Track Order, WhatsApp, Account, and Cart. This is broad but visually dense; a future mobile-specific priority order is required so order tracking, search, account, and cart remain easy to reach without an overloaded menu.

The product catalogue is information-rich but long. Cards communicate availability, stock, price, product features, duration, action controls, and WhatsApp. Card content varies materially across packages; naming and feature copy contain quality issues such as empty product suffixes and inconsistent descriptor patterns. The primary conversion mechanism is already implemented: approved offers show Buy Now; bundles present View Plans; review-only stock uses inquiry/WhatsApp. The next iteration needs standardized merchandising contracts, family-level comparison, clearer availability language, and concise editorial quality control.

Visual impression: the hero’s Gemini promotional poster looks polished and strong. The surrounding site foundation is professional but not yet at a premium interaction-system level. The page needs deliberate motion, higher visual hierarchy, product-card image consistency, superior filter/search discovery, and a mobile-first product browsing system before it can be described as a fully polished high-end commerce experience.

## Order Tracking

The public page is live at `/track-order`. It asks for an order number plus either checkout email or Nepali mobile number. It also displays browser-local “On this device” order history and statuses such as PROCESSING.

The privacy design is directionally correct because phone or email alone does not appear sufficient; however, this is not phone-first self-service tracking. For the requested mobile-number / Telegram experience, it needs OTP verification, normalized `+977` handling, masked confirmations, authenticated notification consent, a Telegram deep link / bot lifecycle, and a structured status event timeline. The current page has no visible expected fulfilment time, progress stages, delivery evidence, resend update control, or cross-channel subscriptions.

## Important constraints

No real order was placed, no order data was entered, and no admin actions were attempted. These observations are public and visual only.

## Automated baseline captured separately

`npm run lint` completed with 10 warnings and no errors. `npm run typecheck` passed. The unit suite ran 71 tests with 69 passing and 2 failing; both failures concern `FULL_CARD` product-cover modes in `tests/product-image-mapping.test.ts`, which contradict the test rule that public product covers must use `ARTWORK_ONLY` modes.

## Source-document caveat

Repository documents conflict: `PROJECT_STATUS.md` reports the Supabase-backed production flow as live while `PRODUCTION_READINESS_REPORT.md` contains an earlier, credential-blocked verification state. The source code and production environment must be re-validated against the actual configured Supabase/Vercel project before declaring operational readiness.

## Production Configuration Checks

The public admin login at `/admin/login` is reachable but displays: `ADMIN_BOOTSTRAP_EMAIL is not configured. Set it in .env.local and Vercel, then run npx tsx scripts/bootstrap-admin.ts.` This is a **critical operational-readiness issue**: it means a defined initial administrator identity is not configured in the deployed environment, or the deployed login implementation is surfacing setup-only instructions to production visitors. It prevents closing the loop on the live administration claim and should be fixed before any operational overhaul.

The public health endpoint at `/api/health` returned `status: ok`, `database: configured`, and `supabase: configured` at 2026-08-13T08:04:48.831Z. This validates connection flags only; it does not prove migrations, RLS, storage, order persistence, payment proof storage, or admin authorization work in production. The live configuration result therefore resolves only part of the contradiction between repository reports.
