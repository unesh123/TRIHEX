# TRIHEX DIGITAL — Full Project Status (Share with other AIs)

**Last updated:** 2026-08-13 (Current Status)  
**Canonical handoff for other AIs:** see **`AI_HANDOFF.md`** (full process, left-to-do, password notes).  
**Live URL:** https://trihexdigital.shop (also https://www.trihexdigital.shop)  
**Admin:** https://trihexdigital.shop/admin (login at `/admin/login`)  
**Repo:** local workspace `AITRIHEX` · Vercel project `trihex-digital`  
**Stack:** Next.js 16 (App Router) · Supabase Auth + Postgres (Drizzle) · Vercel  
**Not Firebase.**

---

## 1. What this product is

Nepal-first digital storefront for AI / SaaS access packages (Gemini, ChatGPT, CapCut, Canva, Grok, Replit, etc.).

Customer flow:
1. Browse products → Buy Now / Check Availability  
2. Product page shows **plan features** + sticky highlights  
3. Checkout → bank QR / eSewa / Khalti + payment proof upload  
4. WhatsApp support for availability / verification / delivery  

Admin flow:
1. `/admin` dashboard (verified revenue + profit)  
2. Products CRUD — name, description, **features**, **image**, price, stock, status  
3. Orders / payments Approve-Reject → PAID + stock deduct  
4. Import cost→NPR at `/admin/products/import`  

---

## Admin password note

**Env password does NOT auto-change login.** Auth is Supabase. Use “Send password reset link” on `/admin/login` or reset in Supabase Dashboard. `ADMIN_BOOTSTRAP_EMAIL` is only the bootstrap email identity.

---

## 2. Production readiness (launch day)

| Area | Status |
|------|--------|
| Live catalogue from Supabase | ✅ |
| Unique product covers (28 live SKUs) | ✅ |
| CapCut ≠ Grok image swap fixed | ✅ |
| Discount UI (list price struck + sell price, ~70–90% off) | ✅ |
| Mobile grid 2 columns | ✅ |
| Product features on detail + cards + WhatsApp | ✅ |
| Structured WhatsApp enquiry (link + features) | ✅ |
| Admin create product (full fields) | ✅ |
| Admin upload image → Supabase → live immediately | ✅ |
| Admin status → Under review (instant save) + Buy Now → Check Availability | ✅ |
| Admin import: cost → NPR sell + profit + bulk Check Availability products | ✅ |
| Storefront inquire list (`/inquire`) + WhatsApp inquire flow | ✅ |
| Starter inquiry catalogue (128+ packages) ready to import in admin | ✅ |
| Payment Approve fixed (reviewer profile FK) + revenue/profit overview | ✅ |
| Stock deducts on Approve (restores on Reject if previously approved) | ✅ |
| Admin hide product (ARCHIVED) | ✅ |
| Admin manual stock (`seedVisibleQuantity`) | ✅ |
| Checkout + **bank QR on checkout page** + proof upload | ✅ |
| Buy Now only for approved `OWNER_AVAILABLE` SKUs | ✅ |
| Under Review → Check Availability (not website checkout) | ✅ |
| Soft-delete / no hard deletes | ✅ |

**Buy Now list** is curated in `src/db/catalogue-overrides.ts` → `OWNER_AVAILABLE`. Sync with:
`npx tsx scripts/sync-purchasable-flags.ts`

**Bank QR:** `public/media/payments/bank-qr.webp` (shown on checkout + success).

**After payment:** success page asks customer to message WhatsApp for verification and send the payment screenshot in chat (`orderVerificationMessage`).

**SEO (live):**
- Sitemap: https://trihexdigital.shop/sitemap.xml (products + blog + key pages)
- Robots: https://trihexdigital.shop/robots.txt
- Blog guides: https://trihexdigital.shop/blog
- JSON-LD: Organization, WebSite, Store, Product, Article, FAQ
- Open Graph image + product/page meta titles for Nepal keywords

---

## 2b. What’s left for “perfect” admin + tracking

| Priority | Item | Why |
|----------|------|-----|
| Done | Live **Order detail**: customer, products, payment screenshot, Approve/Reject | `/admin/orders/[id]` |
| Done | **Payment review** queue: proof image + Approve / Reject → order PAID | `/admin/payments/review` |
| Done | Checkout price-inquiry warning + success WhatsApp payment-status CTA | Storefront |
| Done | Stock decrement on order + out-of-stock checkout block | create-order + inventory |
| High | **Fulfillment checklist** per order (email sent / activated / notes) | Track delivery |
| Medium | Wire **inventory lots** pages to live DB (not seed placeholders) | Real stock ledger |
| Medium | Admin **eSewa / Khalti** IDs + optional QR upload in payment-methods | Wallet UX |
| Medium | Customer order timeline emails / WhatsApp status templates | Pro feel |
| Medium | Dashboard KPIs: today’s orders, pending proofs, low stock | Ops at a glance |
| Done | Clean bank QR (cropped) + scan-to-pay card UI | Checkout / success |
| Done | Storefront stock badges (“Only X left” / Out of stock) | Merch + inventory admin |
| Lower | Coupons / campaigns modules (shells exist) | Growth later |
| Lower | Designer HQ art replace for generated covers | Brand polish |

### Traffic (≈1000 users at once)

**Yes, the site can handle ~1000 concurrent visitors** for browsing on Vercel + Supabase if:
- Pages stay mostly read-heavy (catalogue is dynamic but cheap)
- Checkout / uploads stay a smaller % of traffic
- Supabase connection pooling (`prepare: false` / pooler) is used (already)

Caveats at that spike:
- Many simultaneous **checkouts + proof uploads** need Supabase Storage + DB capacity (free tier may throttle)
- No custom CDN tuning required for static covers under `/media`
- For bigger spikes: enable Vercel Pro / Supabase paid pooler, cache catalogue briefly, watch payment-proof API

**Already solid for launch:** products CRUD, images, prices, stock qty, hide, storefront Buy Now vs Under Review, checkout QR card, proof upload, WhatsApp verification CTA.

---

## 3. Key prices (owner overrides — NPR)

| Slug | Sell | Notes |
|------|------|--------|
| `gemini-pro-18-months-link` | **399** | Featured |
| `chatgpt-plus-1-month-fw` | **699** | Featured |
| `gemini-ai-pro-5tb-12m-mail-a` | **999** | Featured |
| CapCut 7d / 30d / 6m | 49–139 / 419 / 3559 | Unique covers |
| Office 100GB vs 1TB | 149 vs 209 | **Not duplicates** — keep both |

Compare-at (list) prices are set in DB (`compare_at_price_npr_minor`) and editable in admin. Script: `scripts/apply-compare-at-and-features.ts`.

---

## 4. Admin how-to (ops)

### Add product
1. `/admin/products/new`  
2. Fill name, description, **features (one per line)**, sell price, **original list price**, stock, status  
3. Create → lands on edit page → **Upload from PC** (publishes to Supabase immediately)

### Change image
Edit product → Upload from PC → image is live (no need to re-save for URL, but Save product still updates alt/details).

### Hide from store
Status = **ARCHIVED**, or button “Hide from storefront”.

### Stock
Edit → “Visible stock qty” → Save price & stock.  
`null` = unlimited / made-to-order · `0` = out of stock · `≤5` = low stock badge.

### Discount display
Set **Original / list package price** higher than sell price → storefront shows strike-through + “−X%”.

---

## 5. Important file map

| Concern | Path |
|---------|------|
| Live catalogue load | `src/lib/catalog/live-catalogue.ts` |
| Merch cards / visibility | `src/lib/catalog/merchandising.ts` |
| Package features | `src/lib/catalog/package-features.ts` |
| Cover manifest | `src/lib/catalog/product-cover-manifest.json` |
| WhatsApp messages | `src/lib/whatsapp/index.ts` |
| Price overrides | `src/db/catalogue-overrides.ts` |
| Admin product actions | `src/app/admin/(protected)/products/actions.ts` |
| Cover upload API | `src/app/api/admin/product-cover/route.ts` |
| Storage adapter | `src/lib/storage/adapter.ts` |
| Product card UI | `src/components/storefront/product-card.tsx` |
| Product grid (2-col mobile) | `src/components/storefront/product-grid.tsx` |
| Schema | `src/db/schema.ts` (`compare_at_price_npr_minor`, `long_description`, `seed_visible_quantity`) |

### Scripts
- `scripts/apply-catalogue-updates.ts` — sync owner prices/status  
- `scripts/apply-compare-at-and-features.ts` — list prices + features into DB  
- `scripts/publish-generated-covers.ts` / `fix-grok-covers.ts` / `sync-covers-from-manifest.ts`

---

## 6. Env (Vercel)

Required for production:
- `DATABASE_URL` / `POSTGRES_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PRODUCT_MEDIA_STORAGE_BUCKET` (public bucket `product-media`)
- Auth/admin session secrets as already configured
- Optional: `NEXT_PUBLIC_SITE_URL=https://trihex-digital.vercel.app` (WhatsApp product links)
- Optional: `NEXT_PUBLIC_BUSINESS_WHATSAPP_NUMBER=9779702910130`

**Critical:** Product images must go to Supabase Storage — writing to `public/` on Vercel does **not** persist.

Server Actions body limit: `experimental.serverActions.bodySizeLimit = 8mb` in `next.config.ts`.

---

## 7. Hide / status semantics

| Status | Shop effect |
|--------|-------------|
| PUBLIC + purchasable | Buy Now |
| DRAFT | Visible as Under Review, no cart |
| BLOCKED | Unavailable |
| ARCHIVED | Hidden from catalogue |

---

## 8. WhatsApp message shape (product)

```
Hello TRIHEX DIGITAL 👋

I want to order / check availability for:
• Product: …
• Package: …
• Price: Rs. X (was Rs. Y)
• Product link: https://trihex-digital.vercel.app/products/{slug}

What this plan includes:
✓ …
```

---

## 9. Known caveats / next polish (post-launch OK)

- Some admin modules (inventory lots, marketing shells) are placeholders — day-to-day ops use **Products** + **Pricing** + **Orders** + **Payments**.
- Designer-grade branded art still preferred for Office/Grammarly/etc. (generated motifs are live).
- File `TRIHEX_PRODUCT_IMAGES/.../grok-super-3month-rs3499-poster.png` was **misnamed** (video art); real Grok 3m poster lived under `video-ai-abstract.png`. Live Grok covers use generated xAI sphere art.
- Never map CapCut to `video-ai-abstract.png` / `video-abstract-portrait.png`.
- Claude sell price is high vs cost — left Under Review intentionally.

---

## 10. Deploy

```bash
npx vercel --prod --yes
```

DB scripts (from repo root with `.env.local`):
```bash
npx tsx scripts/apply-catalogue-updates.ts
npx tsx scripts/apply-compare-at-and-features.ts
npx tsx scripts/sync-covers-from-manifest.ts
```

---

## 11. Agent rules

This is **not** classic Next.js — read `node_modules/next/dist/docs/` and `AGENTS.md` before changing framework APIs.
