# TRIHEX DIGITAL — Complete Project Handoff (share with any AI)

**Last updated:** 2026-07-22 (evening NPT)  
**Live:** https://trihexdigital.shop · https://www.trihexdigital.shop  
**Admin:** https://trihexdigital.shop/admin/login  
**Vercel project:** `trihex-digital` · Region `sin1`  
**Stack:** Next.js 16 App Router · Supabase Auth + Postgres (Drizzle) · Vercel  
**Not Firebase.**

---

## 1. What the business is

Nepal-first digital store for AI / SaaS / creative tool access (Gemini, ChatGPT, CapCut, Canva, Grok, Replit, etc.).

**Money loop**
1. Customer browses → **Buy Now** (approved) or **Check Availability / Inquire** (under review)
2. Checkout: name, email, phone → pay via **same bank QR** (bank app / eSewa / Khalti)
3. Upload **payment screenshot** → order `PROCESSING`, payment `UNDER_REVIEW`
4. Admin **Approves** → order `PAID`, revenue/profit count, **stock decreases**
5. Owner delivers package on **WhatsApp** after verification

**WhatsApp:** +977 9702910130 (`9779702910130`)

---

## 2. Customer product journey (current)

| Step | What happens |
|------|----------------|
| Home / Products | Cards show price, stock badge, 2 feature lines, Buy Now or Check Availability |
| Product detail `/products/[slug]` | Cover, **Plan features** list, package details, sticky buy box with highlights |
| Inquire list `/inquire` | List of under-review packages → WhatsApp inquire |
| Cart → Checkout | QR + required screenshot + payer name/ref → processing overlay ~2.5s |
| Success | WhatsApp CTAs to confirm payment / ask status |
| Track / Account orders | Guest orders saved on device (`localStorage`) + server track by order # |

**Status meanings on shop**
| Status | Button | Meaning |
|--------|--------|---------|
| PUBLIC + purchasable | Buy Now | Website checkout |
| DRAFT / under review | Check Availability | WhatsApp first |
| BLOCKED | Unavailable | Contact only |
| ARCHIVED | Hidden | Not in catalogue |

---

## 3. Admin product / payment process

### Products
- List: `/admin/products`
- Edit: `/admin/products/[id]` — name, description, **features (one per line)**, image upload, status (instant), price/cost/stock/purchasable
- Import cost→NPR: `/admin/products/import` (USDT/USD/NPR → sell + profit preview)
- Status control saves immediately → DRAFT turns off Buy Now

### Payments (manual verify = your revenue truth)
- Queue: `/admin/payments/review`
- Order detail: `/admin/orders/[id]` (customer, lines, screenshot, Approve/Reject)
- **Approve** → payment VERIFIED, order PAID, stock deduct, overview revenue/profit update
- **Reject** → awaiting payment again; stock restored if previously approved

### Overview KPIs
- Verified revenue, estimated profit, pending proofs, orders, Buy Now count, low stock

---

## 4. Admin password / env — IMPORTANT

**Changing a password in `.env` / Vercel env does NOT change the login password.**

Login uses **Supabase Auth** (`signInWithPassword`):
- Env `ADMIN_BOOTSTRAP_EMAIL` = which email is allowed to bootstrap as SUPER_ADMIN (not the password)
- Password lives in **Supabase Auth user**, not in env

**How to change password**
1. Admin login page → **Send password reset link** (for bootstrap email), **or**
2. Supabase Dashboard → Authentication → Users → reset password, **or**
3. Logged-in user updates password in Supabase

After env change for email, redeploy. Password must be changed in Supabase Auth itself.

---

## 5. July 2026 stock batch (already applied)

- Sell margin policy: **cost = USDT × 160**, sell ≈ **+50%** (editable in admin)
- Unique covers under `public/media/covers/**` + manifest
- Doc: `IMAGES_STILL_NEEDED.md`
- Script: `scripts/apply-new-stock-july2026.ts`, `scripts/process-new-stock-covers.ts`

**Best-deal rules used**
- No duplicate overwrite when existing cost is **lower** (kept Gemini 18M Buy Now Rs.399)
- SELL / REVIEW / BLOCK by risk
- Skipped 0-stock: Super Grok 1M, NordVPN 3M (Nord SKUs blocked)

---

## 6. Features on product pages

Features come from:
1. Admin **Plan features** field → stored as `products.long_description` (one per line)
2. Fallback map: `src/lib/catalog/package-features.ts`

Shown on:
- Product detail → **What this plan includes**
- Sticky buy box → Plan highlights
- Product cards → 2 feature lines (mobile + desktop)
- WhatsApp enquire message

**To edit features:** Admin → Product → Plan features → Save product.

---

## 7. Critical file map

| Area | Path |
|------|------|
| Live catalogue | `src/lib/catalog/live-catalogue.ts` |
| Visibility / cards | `src/lib/catalog/merchandising.ts` |
| Features | `src/lib/catalog/package-features.ts` |
| Covers | `src/lib/catalog/product-cover-manifest.json` + `public/media/covers/` |
| New stock data | `src/db/new-stock-july2026.ts` |
| Price overrides (seed) | `src/db/catalogue-overrides.ts` |
| Checkout UI | `src/components/storefront/checkout-form.tsx` |
| Checkout API | `src/app/api/checkout/route.ts` |
| Proof upload | `src/app/api/payment-proof/route.ts` |
| Approve payment | `src/app/api/payments/manual/review/route.ts` + `src/lib/payments/store.ts` |
| Stock on approve | `src/lib/inventory/order-stock.ts` |
| Revenue KPIs | `src/lib/admin/revenue-stats.ts` |
| Guest orders | `src/lib/storefront/guest-orders.ts` |
| WhatsApp | `src/lib/whatsapp/index.ts` |
| Admin product actions | `src/app/admin/(protected)/products/actions.ts` |
| Status apply | `src/lib/catalog/apply-product-status.ts` |
| Schema | `src/db/schema.ts` |
| Agent rules (Next.js) | `AGENTS.md` |

---

## 8. What is DONE (production)

- [x] Live catalogue from Postgres
- [x] Buy Now vs Check Availability vs Blocked
- [x] Instant admin status change
- [x] Cost→NPR import + profit preview
- [x] Checkout + same QR (bank/eSewa/Khalti) + proof required
- [x] Processing overlay (no scroll) 2–3s
- [x] Payment Approve/Reject (profile FK fixed)
- [x] Revenue + profit on overview (verified payments)
- [x] Stock deduct on Approve
- [x] Guest device order history + track
- [x] Inquire list `/inquire`
- [x] Product features on detail + cards + WA
- [x] SEO: sitemap, robots, blog, JSON-LD, OG
- [x] July 2026 stock + generated covers
- [x] Mobile 2-col product grid
- [x] Daraz Phase 1+2 (2026-07-22) — see `PHASE_1_2_EVIDENCE.md`

---

## 9. What is LEFT (to feel “Daraz-level” premium)

### Must-have next (ops)
1. ~~**Fulfillment checklist**~~ (shipped)
2. **Email notifications** (order placed, payment approved, delivered) — checklist flag exists; send still manual
3. ~~Fix **Supabase product-media bucket**~~ (shipped — `product-media`)
4. **Hostinger DNS**: only A `@` → `76.76.21.21` (remove parking IP if still present)
5. Smoke-test full path weekly: checkout → approve → checklist → stock → WA delivery

### High polish (conversion / trust)
6. ~~Sticky mobile bottom CTA~~ (shipped)
7. ~~Trust strip~~ (shipped)
8. ~~Reviews / ratings~~ (manual admin — shipped)
9. ~~Order timeline UI~~ (shipped)
10. ~~Search autocomplete + filters (brand/price/duration)~~ (shipped)
11. “Recently viewed” on device
12. Image lightbox on product detail
13. Compare 2 packages side-by-side
14. FAQ accordion per product category
15. Exit-intent / soft WhatsApp help (non-spammy)
16. PWA install + offline shell (optional)

### Growth / marketing
21. Coupons / referral codes (shells exist)
22. Abandoned checkout WhatsApp/email nudge
23. Blog → product deep links with UTM
24. Facebook/TikTok pixel + GA4 events (view_item, purchase)
25. Promo banners (admin-controlled, not cluttered)

### Ops / finance
26. Daily/weekly P&L report export (CSV)
27. Supplier cost audit trail
28. Duplicate payment-reference detection UI
29. Refund workflow end-to-end
30. Inventory lots ledger wired to live DB (pages exist as shells)

### Security / reliability
31. Rate-limit checkout + proof upload
32. CAPTCHA on checkout if abuse appears
33. Backup/restore runbook for Supabase
34. Staging environment + preview deploys before prod
35. Uptime monitor (Better Stack / Checkly) on `/api/health`

### Content / brand
36. Replace generated covers with licensed brand art where allowed
37. Consistent duration labels (already partially fixed)
38. Nepali language toggle (en-NP first is fine)
39. Stronger homepage hero photography / brand film (one composition)

---

## 10. How another AI should work on this repo

1. Read `AGENTS.md` — this Next.js has breaking changes; check `node_modules/next/dist/docs/`
2. Read this file + `PROJECT_STATUS.md`
3. Prefer **Postgres live data** over seed when `DATABASE_URL` / `POSTGRES_URL` is set
4. Never double-save orders after `createOrder`
5. Never invent Buy Now on DRAFT/BLOCKED
6. Cost NPR ↔ USD minor: `costUsdMinor = round((costNpr/160)*100)`
7. Deploy: `npx vercel --prod --yes` (covers must be in git for `/media/covers` to ship)
8. Do not commit `.env*`; do not force-push; commit only when user asks (except when deploy requires tracked assets)

---

## 11. Quick verify checklist

- [ ] https://trihexdigital.shop/products — Buy Now + Under Review mix
- [ ] Open any product — **Plan features** visible
- [ ] Checkout with screenshot → admin Approve → PAID + stock down
- [ ] Overview shows verified revenue
- [ ] `/inquire` list + WhatsApp message includes features
- [ ] Admin status PUBLIC ↔ DRAFT changes button text
- [ ] Mobile: 2-col grid, readable CTAs, no horizontal overflow

---

## 12. One-sentence truth

**TRIHEX is a production Nepal digital-goods store with manual payment verification, WhatsApp fulfillment, admin catalogue control, and guest order tracking — solid for launch; “Daraz-level” polish is mostly notifications, fulfillment UX, analytics, and trust layers still to build.**
