# TRIHEX DIGITAL — Professional Commerce, Automation, UX, and SEO Blueprint

**Prepared:** 13 August 2026  
**Scope:** Current codebase audit, live-store review, professional upgrade blueprint, delivery priorities, and measurable launch criteria.

> **Bottom line.** TRIHEX already has a credible storefront foundation: a public catalogue, product detail routes, a checkout/proof flow, a tracking page, an operational domain model, SEO routes, and a visually solid hero. It is **not yet a fully verified, high-end commerce operation**. The priority is not more surface-area or 1,000 thin SEO pages. First make the existing order, payment, fulfillment, product data, and admin workflows demonstrably reliable; then elevate the interface and scale content around genuine buyer needs.

## 1. Executive assessment

| Dimension | Current assessment | Evidence | Upgrade standard |
|---|---|---|---|
| Public storefront | **Strong foundation; needs product-data and UX refinement.** The public homepage is live, polished at first glance, and exposes 57 packages, category navigation, search, cart, checkout paths, WhatsApp, and tracking. | Live review of `trihexdigital.shop` | A deliberate mobile-first commerce system with consistent product cards, transparent package information, predictable conversion paths, and measured interactions. |
| Product catalogue | **Usable but inconsistent.** Products, packages, stock badges, prices, family cards, and inquiry routing exist. Copy and cover treatment are uneven; some naming/content patterns look unfinished. | Live catalogue + `product-card.tsx` + current cover tests | One governed catalogue source with editorial validation, normalized benefit/eligibility/delivery fields, product-family comparison, and asset quality rules. |
| Checkout and payment proof | **Implemented, not fully proven end-to-end in production.** The code supports checkout, payment preference, QR/proof handling, and manual payment review. | `checkout-form.tsx`, payment routes, project reports | One verified synthetic order run and production proof that creation, upload, review, stock, notification, and audit trail work together. |
| Order tracking | **Basic and privacy-aware, but not a premium self-service experience.** It requires order number plus email or mobile; it also shows device-local orders. | Live `/track-order`, `api/orders/track/route.ts` | Phone-first OTP verification, meaningful delivery timeline, notification preferences, quote/order links, and a human fallback. |
| Admin | **Core screens exist, but product reports conflict about completion and numerous navigation modules remain shells.** | `ROUTE_AUDIT.md`, `PROJECT_STATUS.md`, live admin login | A compact operator console showing only working modules, live queues, role-appropriate actions, and full auditability. |
| Production administration | **Critical issue.** The public live admin-login page reports `ADMIN_BOOTSTRAP_EMAIL is not configured`. | Live `/admin/login` | A real owner account, recovery procedure, MFA policy, role matrix, and an authentication test completed before feature expansion. |
| Engineering checks | **Build and TypeScript pass; test suite is not green.** Lint has 10 warnings; 69 of 71 unit tests pass and two product-image mapping tests fail. | Local runs on audited commit `8fd15f9` | Zero test failures, deliberate lint policy, production smoke suite, visual regression coverage, and pre-deploy gate. |
| SEO foundation | **Good technical start.** Sitemap, robots, blog routes, JSON-LD, product/meta routes, and canonical-aware URL structure exist. | Live public routes + source | Search Console measurement, canonical/variant validation, Merchant-eligible structured data only where truthful, authoritative Nepal-focused content, and conversion attribution. |

## 2. Immediate reality checks — complete these before redesign work

The public health endpoint reports database and Supabase configuration as present, but that only verifies flags. It does **not** prove migrations, RLS, private proof storage, persisted orders, payment review, permissions, or notification delivery. The repository’s production reports disagree: one says the live flow is operational, while an earlier readiness report records credential-blocked testing and many placeholders. Treat the application as **partially verified until a production acceptance run proves the critical path**.

| Priority | Required action | Acceptance criterion |
|---|---|---|
| P0 | Configure and bootstrap the real owner administrator identity; remove setup instructions from the public production login view. | Owner can sign in, recover account, and see only authorized functions. |
| P0 | Execute a controlled real-environment test order using a low-value internal test package. | Order number, DB row, payment proof upload, admin review, stock movement, fulfillment status, customer tracking, and audit event all match one another. Refund/reject path is tested too. |
| P0 | Fix the two failing cover-mapping tests and decide the permanent asset policy. | `npm run lint`, `npm run typecheck`, `npm test`, build, and critical E2E all exit zero. |
| P0 | Hide all placeholder admin modules from production navigation. | No operator sees a “module shell” for a business-critical action; unfinished routes are inaccessible or explicitly feature-flagged. |
| P0 | Reconcile database migration, RLS, storage, and production environment configuration. | A signed-off checklist confirms backups, least privilege, private proof objects, and no sensitive environment output. |
| P0 | Verify seller authorization and product-policy evidence per SKU. | Every public offer has a `verified / authorization review / unavailable` state, source evidence, scope, delivery method, warranty, refund/replace rule, and owner approval. |

> **Important commercial constraint:** do not claim “verified,” “official,” “genuine,” discounts, warranty duration, or delivery speed unless the product-level records and supporting evidence make the claim true. The site should win by transparent, defensible service—not exaggerated promises.

## 3. The ideal customer experience

### 3.1 Storefront journey

The customer should move through a simple six-stage journey: **discover → compare → trust → order → pay → track**. The homepage should answer three questions inside its first screen: *what can TRIHEX provide, why should I trust the process, and what should I do next?* The global WhatsApp button must become contextual support, not an alternative checkout that divides the order record.

| Stage | Experience to build | Required data / behavior | Success signal |
|---|---|---|---|
| Discover | Outcome-led hero, curated collections, AI tools by audience, search with intent suggestions. | Search synonym map; use cases; categories; clear India/Nepal differentiation where relevant. | Search-to-product click-through rises. |
| Compare | Product family pages with a plan comparison table and a “best for” indicator. | Parent product, variant plan, price, availability, activation method, eligibility, warranty, delivery SLA. | More visitors select a plan without WhatsApp clarification. |
| Trust | An evidence panel: payment process, transparent policy, support response promise, proof of fulfilled orders only with consent. | Policy version, testimonial/review governance, real approval state, dispute process. | Reduced pre-purchase support questions and payment-proof failures. |
| Order | Two clearly separated flows: **Buy now** for approved inventory and **Request availability / quote** for custom or review-only offers. | Cart/order draft; tax/price clarity; consent; fraud/rate limits; final amount lock. | Higher order completion with fewer manual corrections. |
| Pay | One payment step with eSewa, Khalti, bank QR, exact payment instructions, proof upload, and resubmit support. | Payment method configuration; proof file validation; expiration; review queue. | Proof completion rate and review turnaround are measurable. |
| Track | Phone-first verified tracking with human-readable timeline, next expected time, help controls, and notification subscription. | Status events; OTP; channel subscriptions; private token; escalation reason. | “Where is my order?” manual support load falls. |

### 3.2 Product-page contract

Every buyable product must contain the same commercial contract. No visual design can compensate for missing facts.

| Required section | Customer question answered |
|---|---|
| Product title, brand, plan/duration, live NPR price, availability | What exactly am I purchasing today? |
| “Best for” and 3–5 precise included benefits | Is it right for my use case? |
| Eligibility and activation method | Can I use it on my account and device? |
| Delivery target / time | When and how do I receive it? |
| Warranty and replacement policy | What happens when delivery or access fails? |
| Restrictions, exclusions, and authorization disclosure | What should I not assume? |
| Plan comparison / alternatives | Which option gives me the best value? |
| FAQs, real support path, and related products | Can I decide without waiting for a chat reply? |

## 4. Premium visual and interaction blueprint

TRIHEX should retain its clean navy/green base, but systematize it. Current styles support a sound base; Framer Motion is not installed and the existing visual motion foundation is limited. Add a defined motion layer only after P0 commerce reliability is clean.

| Area | Blueprint | Performance and accessibility guardrail |
|---|---|---|
| Brand | Navy is authority; green means verified/success; amber means action required; red means error. Use a restrained blue-violet AI accent only for intelligence/selection. | Never communicate status by colour alone. |
| Typography | Use a five-step type scale. Keep display type for price and major headings; use a highly legible body face. | Preserve 16px base readable text and adequate line height. |
| Mobile shell | 16px gutters, persistent bottom navigation for Browse, Search, Track, Cart, and Help. Suppress floating WhatsApp over checkout/buy actions. | 44px minimum targets; one thumb-friendly primary action per view. |
| Cards | Uniform 4:5 or square art masters; no baked price, stock, discount, or warranty text. Live UI overlays contain commercial data. | Optimized responsive images, consistent `sizes`, stable aspect ratio. |
| Product interactions | Sticky mobile buy bar, plan selector, comparison drawer, price/stock live update, clear unavailable state. | State changes are keyboard-operable and announced. |
| Admin interactions | Dense work queues, saved filters, command bar, audit-confirmed changes, low-stock/pending-proof priority. | No animation on critical tables; keyboard and screen-reader support. |
| Motion | Initial hero and card entry; hover/focus feedback; sheets, search, plan selection, upload completion, and timeline changes. | Respect `prefers-reduced-motion`; use transform/opacity, 160–280ms, no perpetual motion. |

### Product creative system

Create three reusable art directions—**AI assistants**, **creative/video tools**, and **business automation services**—rather than adding unrelated supplier posters. Each master is product-relevant, compatible with licensed brand usage, and visually consistent. It includes no commercial facts that can become stale. Create image assets only after the catalogue’s approved product data is complete; generated images must not mimic logos or imply an official relationship without permission.

## 5. Order, tracking, quote, and notification architecture

The application already has an order model, payment model, public timeline function, and a current lookup endpoint. Build on that existing stack rather than replacing the commerce core.

### 5.1 Canonical order lifecycle

```text
DRAFT → AWAITING_PAYMENT → PROOF_SUBMITTED → PAYMENT_REVIEW
      → PAID → FULFILLMENT_QUEUED → IN_PROGRESS → DELIVERED
      → CUSTOMER_CONFIRMED / REPLACEMENT_REQUIRED / CANCELLED / REFUNDED
```

The existing state machine is a useful base. The upgrade is an immutable `order_events` ledger, an explicit `customer-visible` flag, and transactional event emission. All user-visible timeline labels must be mapped from internal states and include a next-step expectation.

| New table / capability | Purpose |
|---|---|
| `order_events` | Immutable status/time/actor/reason/event metadata. Use as the source for tracking timeline and audit display. |
| `order_contact_channels` | Normalized mobile, WhatsApp consent, email, Telegram chat ID, verification state, opt-in timestamps, and unsubscribe state. |
| `otp_challenges` | Phone verification hashed OTP, expiry, attempt count, rate limits, and consumption. Do not store usable OTPs. |
| `notification_outbox` | Idempotent queued delivery events with channel, payload version, provider result, retry state, and a dead-letter view. |
| `quotes` + `quote_items` | Quote number, customer/organization, scope, terms, line items, validity, approval, conversion to order, and audit log. |
| `fulfillment_tasks` | Assigned owner, SLA target, activation/delivery checklist, notes, customer proof, and completion state. |

### 5.2 Mobile-number tracking

**Recommended UX:** The order confirmation collects and normalizes a Nepali mobile number to E.164 (`+977...`) and requests consent for transactional updates. “Track with mobile” requests the number, sends a one-time code, then exposes only the customer’s matching orders. The order number remains a convenient secondary lookup and the existing secure token remains a short-lived/deep-link fallback.

The current form’s order number plus email/phone verification is reasonable as a minimal privacy gate, but it is not enough for a mobile-first “all my orders” experience. Do not expose order totals, items, or status based solely on an unverified phone number. Apply rate limits, generic failure messages, OTP expiry, attempt caps, and audit events.

### 5.3 Telegram bot: two viable delivery routes

Telegram supports both webhook push and polling, but its official documentation recommends webhook delivery for immediate updates and provides a `secret_token` request header to authenticate webhook calls. [1] [2]

| Approach | User experience and trade-offs | Cost | Setup complexity |
|---|---|---:|---|
| **A. Website-hosted Telegram webhook** | Customer starts the bot from a signed deep link after checkout; bot verifies the phone/order using OTP or a short secure code, saves the chat ID, shows status, and sends event notifications. It is immediate, avoids polling, and keeps the order database as the source of truth. | Normal application hosting and messaging provider costs only. | Medium. Requires BotFather token, secret webhook token, an HTTPS endpoint, idempotency, and an admin notification log. |
| **B. Website tracking first; Telegram only as an opt-in notification channel** | The website remains the complete tracking experience. Telegram sends minimal “status changed—open secure tracking page” messages after the customer explicitly links it. Lower bot UX scope and lower privacy risk; fewer self-service features. | Normal application hosting and messaging provider costs only. | Low–medium. Requires token, signed start link, webhook receiver, and notification outbox. |

Both choices use event-driven delivery. Do **not** build periodic polling for order status: status changes originate in TRIHEX, so the payment-review/fulfillment transaction should publish a notification event immediately. Webhook requests must validate Telegram’s secret header, deduplicate `update_id`, and receive only needed update types. Telegram’s `getUpdates` and webhooks are mutually exclusive; use a secure HTTPS webhook in production. [1] [2]

### 5.4 WhatsApp and email

Keep WhatsApp as the local support channel, but make customer communication governed. Create template versions for: order received, proof received, payment accepted/rejected, activation information needed, fulfillment in progress, delivered, replacement required, and refund/cancellation. Every template sends a secure tracking link, never the full activation secret. Store consent and per-event delivery result.

Email should provide the same event messages, but the tracking page—not the message—is the canonical source. Do not embed account credentials, one-time access links without expiry, raw payment proof URLs, or unnecessary customer data in outbound messages.

### 5.5 Quotes and service selling

Create a **Request an AI setup quote** flow for business automation, creator setup, and custom requirements. The customer describes organization type, goal, team size, budget, preferred tools, current workflow, preferred contact time, and WhatsApp number. The operator creates structured quote items from reusable service packages, adds scope/exclusions and milestones, publishes a branded quote, and converts an accepted quote into an order without duplicate entry.

The quote should display a quote number, validity date, payment schedule, delivery timeframe, change-control clause, and a one-click “approve and create order” step. This is the right system for high-value AI services; it is more professional and traceable than a chat-only sales process.

## 6. Admin-panel rebuild priorities

The current admin should become a focused **Operations Center**. Existing visible placeholder routes must be removed from the navigation, not cosmetically redesigned.

| Admin view | Must be functional | Key UI outcomes |
|---|---|---|
| Today | Pending proofs, unassigned paid orders, due/overdue fulfillment, low-stock risk, today revenue/profit, status-change feed. | Operator identifies the next most important action in under 10 seconds. |
| Orders | Filterable list and detail: payment, fraud signals, status events, items, contact consent, fulfillment tasks, quote linkage, audit history. | No manual cross-checking between pages or chats. |
| Payment review | Side-by-side proof, order, expected amount/method, previous risk/attempts, approve/reject with controlled reason. | Approval/rejection creates the correct transaction, stock change, event, customer notification, and audit record. |
| Fulfillment | Personal queue, SLA, template/checklist, safe delivery notes, resend notification, mark delivered/needs information/replacement. | Work is assignable and measurable. |
| Catalogue | Product family/variant editor, visual QA, pricing policy, availability state, evidence/supplier fields, copy completeness meter. | No public SKU can publish with unknown activation or policy data. |
| Quotes | Pipeline: new → scoping → sent → viewed → approved → converted / expired. | B2B AI service sales are visible and forecastable. |
| Customers | Privacy-safe customer profile: identity, consent, orders, quotes, support events, restricted notes. | Customer service is personal without creating duplicate/shadow records. |
| Reporting | Payment turnaround, fulfillment SLA, refund/replacement rate, channel attribution, conversion, top search terms, product profitability. | Decisions are made from metrics rather than chat anecdotes. |

## 7. Engineering, security, and performance blueprint

| Workstream | Implementation standard | Definition of done |
|---|---|---|
| Quality gate | Resolve 2 failing cover tests and 10 lint warnings; add test cases for status events, OTP/rate limits, quote conversion, payment idempotency, and notification retries. | CI runs lint, typecheck, unit, integration, build, and critical end-to-end tests with no failure. |
| Database integrity | Unique reference numbers; database constraints; transactional stock/payment/order-event writes; idempotency keys; migrations applied once. | No duplicate orders/payments/events after retries or concurrent action. |
| Authentication | Configure owner account; role matrix; MFA rollout; account recovery; session/CSRF posture; admin action audit. | A new operator cannot exceed assigned permissions; privileged events are traceable. |
| Storage/privacy | Private payment proof storage, signed short-lived URLs, MIME/content and size checks, retention policy, deletion process. | No proof URL is public; access is logged and expires. |
| API resilience | Rate limiting for checkout, tracking, OTP, upload, payment review; request schemas; safe error messages; structured logs. | Abuse tests and wrong-input tests do not leak customer/order data. |
| Performance | Image-quality budget; responsive image sizes; server-side catalogue caching with safe invalidation; optimized fonts; no large animation runtime on initial interaction. | Measured Core Web Vitals targets on mobile are met: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 at the 75th percentile. |
| Observability | Error tracking, uptime, payment-proof alerting, queue failures, admin action alerts, dashboard. | Owner receives an actionable alert before orders silently fail. |
| Release control | Preview deploy, environment validation, migration plan, rollback, release notes, backup verification. | No direct untested deployment to production. |

## 8. SEO and content strategy — grow relevance, not spam

TRIHEX can become highly visible for Nepal-focused AI-tool and digital-service purchase intent, but organic rank cannot be promised. Google recommends people-first, original, complete, accurate content—not scaled pages produced mainly to manipulate rankings. [3] The right plan is a **1,000+ query opportunity model** built from buyer-intent clusters, while publishing only pages that add distinct decision value.

### 8.1 Technical SEO priorities

Google states that ecommerce structured data can improve its understanding of page content, with Product, Organization, BreadcrumbList, LocalBusiness (where relevant), Review, and VideoObject among the relevant types. [4] Use only claims that are true in the visible page experience. For family products, `ProductGroup` and associated variants help describe a shared product with variations. [5]

| Priority | Technical work | Result |
|---|---|---|
| P0 | Verify sitemap coverage, canonical tags, `robots`, 200/404 behavior, noindex on empty categories and pre-production URLs, title/meta uniqueness, and Search Console ownership. | Crawlable, clean index set. |
| P0 | Validate existing Product, Offer, Organization, FAQ, Article, and Breadcrumb schema in Google Rich Results Test. Remove invalid or unsupported claims. | Accurate eligibility, no schema spam. |
| P1 | Model product families as variant groups. Give variants stable product data; canonicalize alternate/parameter routes consistently. | Less duplication and clearer product relationships. |
| P1 | Add `MerchantReturnPolicy`, availability, price currency, shipping/delivery disclosure only when fully accurate; keep policy pages live and internally linked. | Stronger trust/crawling semantics. |
| P1 | Generate high-quality Open Graph cards from live product data rather than static posters. | Better social click-through and visual consistency. |
| P2 | Add a Search Console dashboard: impressions, clicks, CTR, query/page position, indexed pages, CWV, structured-data errors. | SEO becomes an operating discipline. |

Google recommends descriptive stable URLs, consistent canonical/internal/sitemap URLs, and canonical handling for product variants to avoid duplication and improve crawl efficiency. [6]

### 8.2 Keyword architecture

The goal is not to rank one generic phrase such as “AI products Nepal.” Build a semantic inventory using **intent × product × audience × price/payment × location/language × support question**. This produces more than 1,000 discoverable combinations while protecting quality.

| Cluster | Example queries to target | Destination |
|---|---|---|
| Core commercial | `buy AI tools Nepal`, `affordable AI subscription Nepal`, `digital tools Nepal price`, `AI services Nepal` | Category hubs and comparison guides. |
| Brand + purchase | `ChatGPT Plus Nepal price`, `Gemini AI Pro Nepal`, `Canva Pro Nepal`, `CapCut Pro Nepal`, `Grok Nepal`, `Cursor Pro Nepal` | Product-family pages with real plan, eligibility, delivery, warranty, and FAQ data. |
| Audience + outcome | `AI tools for Nepali students`, `AI tools for content creators Nepal`, `AI tools for small business Nepal`, `AI tools for developers Nepal` | Curated audience collections plus editorial guides. |
| Payment + trust | `buy AI tools with eSewa`, `Khalti AI subscription Nepal`, `bank QR digital tools Nepal`, `digital product payment proof Nepal` | Payment/how-it-works pages. |
| Service / quote | `AI automation service Nepal`, `small business AI setup Nepal`, `AI workflow automation Nepal`, `AI content setup Nepal` | Service pages and quote funnel. |
| Comparison | `ChatGPT vs Gemini Nepal`, `best AI tool for students Nepal`, `Canva vs Adobe Nepal`, `CapCut vs alternative Nepal` | Expert comparison guides linked to transparent, relevant offers. |
| Help / post-purchase | `how to track digital order Nepal`, `AI subscription activation Nepal`, `digital tools refund Nepal`, `AI tool warranty Nepal` | Support, policy, and FAQ resources. |
| Nepali-language | Nepali equivalents written and reviewed by a fluent Nepali editor; do not merely transliterate English keywords. | Purpose-built bilingual guides where user demand and product support justify them. |

### 8.3 Content program: 12 initial authority pieces

Create the first twelve pieces deeply, with author/reviewer, original screenshots/process explanations, update date, source disclosure, and conversion link to a relevant product/service—not a generic product grid.

| Month | Piece | Search intent / business value |
|---:|---|---|
| 1 | How to choose AI tools in Nepal: price, payment, activation, support | Core trust and first-time buyer intent. |
| 1 | ChatGPT Plus vs Gemini AI Pro for Nepali students, creators, and businesses | Product comparison and audience intent. |
| 1 | How TRIHEX payment proof review and order tracking work | Removes payment anxiety. |
| 2 | Best AI toolkit for a Nepali content creator | Curated bundle/service lead generation. |
| 2 | AI setup for small businesses in Nepal: a practical 30-day roadmap | Quote pipeline for services. |
| 2 | Choosing video AI and editing tools: CapCut, Veo, and alternatives | Category/product discovery. |
| 3 | A transparent guide to digital-product delivery, warranties, and replacement handling | Trust and policy authority. |
| 3 | AI tools for Nepal developers: coding, research, design, and automation | Developer collection traffic. |
| 3 | How to reduce monthly AI-tool spend without compromising legitimate use | Price-sensitive conversion. |
| 4 | AI productivity stack for Nepali university students | Student vertical. |
| 4 | How to create a small-business AI workflow quote | Service-conversion education. |
| 4 | Digital tool support guide: activation, tracking, and getting help | Reduces support burden. |

Each piece must contain original experience, useful decision criteria, citations for external claims, author/reviewer transparency, and a genuinely relevant internal journey. Google’s people-first guidance explicitly warns against mass-producing content, superficial rewrites, and content made chiefly to capture search traffic. [3]

### 8.4 SEO operating cadence

| Cadence | Action |
|---|---|
| Weekly | Review Search Console coverage, broken links, crawl errors, non-indexed product pages, checkout availability, and title/meta duplicates. |
| Biweekly | Review top queries with low CTR; improve page titles, opening answer, comparison tables, and visual proof—never create duplicate pages as a shortcut. |
| Monthly | Publish 2–3 major editorial guides or comparisons, refresh factual price/policy information, and remove/redirect discontinued pages. |
| Quarterly | Audit brand/product claims, customer questions, reviews, content helpfulness, performance budget, schema output, and content conversion. |

## 9. Sequenced implementation roadmap

This sequence turns TRIHEX into a reliable professional platform without destabilizing a currently live catalogue.

| Phase | Duration* | Deliverables | Non-negotiable exit criteria |
|---|---:|---|---|
| **0. Stabilize and verify** | 3–5 days | Admin bootstrap, environment/RLS/storage review, controlled production order test, green test suite, hide placeholders. | Owner access works; every critical order transition is proven; CI is green. |
| **1. Commerce truth layer** | 1–2 weeks | Product data contract, family/variant model, content QA, evidence fields, accurate policy templates, catalogue clean-up. | Every public SKU meets publication rules; no stale/baked commercial claims in art. |
| **2. Customer conversion redesign** | 2–3 weeks | Mobile navigation, redesigned cards/PDP, plans, trust modules, checkout stepper, accessible motion system, image master templates. | Mobile UX and accessibility review pass; field/click tracking is live. |
| **3. Operations center** | 2–3 weeks | Today queue, order/payment/fulfillment workflows, quote pipeline, working inventory/stock tools, audit and role gates. | An operator completes proof → fulfillment without chat spreadsheets. |
| **4. Tracking and notifications** | 2 weeks | OTP phone verification, customer timeline, notification outbox, customer channel preferences, selected Telegram option, WhatsApp/email templates. | Status change generates one audited, idempotent, secure update across selected channels. |
| **5. SEO and growth engine** | Continuous after phase 1 | Schema validation, Search Console, 12 authority pieces, Nepal query clusters, content operations, analytics dashboard. | Organic traffic and conversion are measured and content meets editorial standards. |
| **6. Scale hardening** | 1–2 weeks | Load tests, caching review, queues/retry policies, alerts, backup/restore test, runbooks. | Measured target load supports the agreed traffic profile without order loss. |

\*Durations are planning ranges, not guarantees; they depend on product authorization evidence, payment-provider credentials, hosting access, content approval, and the owner’s choice for Telegram/notification provider.

## 10. Measurement dashboard

A “perfect” platform is maintained with visible metrics, not subjective review alone.

| Funnel / operation | Core measures |
|---|---|
| Acquisition | Organic impressions, clicks, CTR, indexed pages, branded/non-branded query share, social referral. |
| Discovery | Search use, zero-result rate, category-to-product click-through, product comparison use. |
| Conversion | Buy-now to checkout, checkout completion, payment-proof completion, approval rate, quote-to-order rate. |
| Service | First response time, proof-review time, fulfillment SLA, delivery confirmation, replacement/refund rate, tracking self-service rate. |
| Trust | Policy-page views before purchase, customer-reported clarity, dispute rate, review quality/consent. |
| Technical | LCP, INP, CLS, JavaScript weight, API error rate, payment/notification queue failure rate, uptime. |
| Unit economics | Product margin, support cost/order, payment fees, refund/replacement cost, customer lifetime value where consent allows. |

## 11. Exact current-code starting points

| Concern | Current starting point |
|---|---|
| Catalogue reads and merchandising | `src/lib/catalog/live-catalogue.ts`, `src/lib/catalog/merchandising.ts`, `src/lib/catalog/product-families.ts` |
| Product presentation | `src/components/storefront/product-card.tsx`, `product-cover.tsx`, `product-grid.tsx` |
| Checkout/order creation | `src/components/storefront/checkout-form.tsx`, `src/lib/checkout/create-order.ts`, `src/app/api/checkout/route.ts` |
| Tracking | `src/components/storefront/track-order-form.tsx`, `src/app/api/orders/track/route.ts`, `src/lib/checkout/order-timeline.ts` |
| Order states | `src/lib/orders/state-machine.ts`, `src/db/schema.ts` |
| Payments / proof | `src/app/api/payment-proof/route.ts`, `src/lib/payments/*`, `src/lib/storage/*` |
| Admin pages and controls | `src/app/admin/(protected)/*`, `src/components/admin/*`, `src/lib/admin/module-flags.ts` |
| SEO | `src/app/sitemap.ts`, `src/app/robots.ts`, `src/components/seo/json-ld.tsx`, `src/lib/seo/blog-posts.ts` |
| Messaging | `src/lib/whatsapp/index.ts` |

## 12. Implementation decisions needed from the owner

1. Select **Telegram Option A or Option B** from the table above; both are viable, but their customer experience and scope differ.
2. Confirm which payment methods are truly live and which provider credentials/QR assets may be configured.
3. Confirm the authorization and fulfillment model for every offered brand/product before enhancing promotional claims.
4. Provide the intended support SLA, warranty/replacement policy, company/legal identity, and public business address if one exists.
5. Decide whether account login is required for customers. Phone OTP plus secure tracking links is usually sufficient for lightweight digital commerce; traditional customer accounts add complexity and privacy obligations.

## References

[1] [Telegram Bot API — `setWebhook` and update delivery](https://core.telegram.org/bots/api)  
[2] [Telegram — Webhooks guide](https://core.telegram.org/bots/webhooks)  
[3] [Google Search Central — Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)  
[4] [Google Search Central — Ecommerce structured data](https://developers.google.com/search/docs/specialty/ecommerce/include-structured-data-relevant-to-ecommerce)  
[5] [Google Search Central — Product variant structured data](https://developers.google.com/search/docs/appearance/structured-data/product-variants)  
[6] [Google Search Central — Ecommerce URL structure](https://developers.google.com/search/docs/specialty/ecommerce/designing-a-url-structure-for-ecommerce-sites)
