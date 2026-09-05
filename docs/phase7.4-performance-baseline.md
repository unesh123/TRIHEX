# TRIHEX DIGITAL — Phase 7.4 Performance & Web Vitals Baseline Report

**Audit Target Domain:** `https://trihexdigital.shop`  
**Production Commit SHA:** `697789d5f600776500b548eb1f6c274c3b9da1ae` (`697789d`)  
**Audit Timestamp:** 2026-09-05T12:20:00+05:45  
**Auditor:** Antigravity (Google DeepMind) via Lighthouse CLI v13.4.1 & Live Fetch Scraper  

---

## 1. Executive Summary

This document establishes the official pre-optimization baseline for **Phase 7.4: Production Performance, Image Delivery, Core Web Vitals, Catalogue Truth & Full-Site Optimization Sprint**.

All measurements in this report were gathered directly from the live public production domain (`https://trihexdigital.shop`) without simulated local shortcuts.

---

## 2. Live Lighthouse Performance Matrix

| Viewport | Route | Performance | Accessibility | Best Practices | SEO | FCP | LCP | CLS | TBT | Speed Index | Transfer Size |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Desktop** | `/` (Home) | **95** | 87 | 100 | 100 | 0.5 s | 0.7 s | 0.001 | 10 ms | 2.2 s | ~557 KiB |
| **Mobile** | `/` (Home) | **89** | 87 | 100 | 100 | 1.5 s | 2.9 s | 0.000 | 160 ms | 5.0 s | 557 KiB |
| **Desktop** | `/products` | **90** | 95 | 100 | 92 | 0.5 s | 0.9 s | 0.000 | 0 ms | 3.7 s | ~663 KiB |
| **Mobile** | `/products` | **87** | 95 | 100 | 92 | 1.4 s | 2.8 s | 0.000 | 300 ms | 4.1 s | 663 KiB |

---

## 3. Critical Findings & Root Causes

### 3.1 Unnecessary 3840px Image Requests
- **Symptom:** Live PDP crawls request `/_next/image?url=%2Fmedia%2Fproducts%2Frunway-pro-12m%2Frunway-pro-12m-thumbnail.webp&w=3840&q=75` and generate `3840w` candidate entries in responsive `srcset`.
- **Root Cause:** Next.js default `deviceSizes` includes `3840` and `2048`. In `src/components/storefront/product-cover.tsx`, `<Image fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px" />` generates candidates up to 3840w. High-DPI/retina viewports automatically select the largest candidate.
- **Remediation:** Configure `images.deviceSizes: [640, 750, 828, 1080, 1200, 1920]` in `next.config.ts` (dropping 2048 and 3840) and specify tight `sizes` on all `<Image>` calls.

### 3.2 Unoptimized Product Thumbnails Wasting Bandwidth
- **Symptom:** Lighthouse flagged `image-delivery-insight` with estimated savings of **1,973 KiB** on `/products` desktop and **236 KiB** on mobile.
- **Root Cause:** `src/components/storefront/product-image.tsx` had hardcoded `unoptimized` on line 78. This completely bypassed Next.js image resizing and format conversion, forcing the browser to download raw 1200x1500px WebP images (~74 KiB each) for 200px display thumbnails.
- **Remediation:** Remove `unoptimized` from `product-image.tsx` to enable Next.js optimizer, serving optimized 256px/384px WebP/AVIF images (~6-10 KiB each).

### 3.3 Catalogue Split-Brain (27 vs 30 Product Lines)
- **Symptom:** Crawlers observed "27 packages" on homepage but "30 product lines ready to order" on `/products`.
- **Root Cause:** Homepage filters out 3 Trihex services (`brandSlug === "trihex" && (categorySlug === "services" || categorySlug === "digital-assets")`), leaving 27 store products. `/products` did not apply the same separation, showing all 30 items.
- **Remediation:** Align count terminology sitewide: clarify 27 software subscriptions + 3 managed services = 30 total active solutions, or unify the filters so both pages report identical categories and numbers.

### 3.4 Missing Canonical Tag on `/products`
- **Symptom:** SEO score on `/products` dropped to 92 (compared to 100 on Homepage).
- **Root Cause:** `src/app/(storefront)/products/page.tsx` lacked `export const metadata` with `alternates: { canonical: "/products" }`.
- **Remediation:** Export static metadata with canonical tag on `/products/page.tsx`.

### 3.5 Duplicate Delivery Note String
- **Symptom:** Renders as `Fulfillment note: Delivery: Usually 2 to 6 hours`.
- **Root Cause:** `fulfillmentEstimate()` in `merchandising.ts` prefixed string with `"Delivery: "`. When rendered under `<dt>Fulfillment note</dt>`, the label was repeated.
- **Remediation:** Strip `"Delivery: "` prefix from `fulfillmentEstimate()`.

### 3.6 Accessibility Headings & Contrast Opportunities
- **Symptom:** Accessibility scored 87 on Homepage and 95 on Products.
- **Root Cause:**
  - `heading-order`: Skipped heading levels (e.g. `<h1>` followed by `<h3>`).
  - `list` / `listitem`: `<li>` items outside `<ul>`.
  - `color-contrast`: Subtext `#71717a` against dark slate backgrounds failing 4.5:1 ratio.
- **Remediation:** Correct heading hierarchy, wrap orphan list items, and raise text color contrast to meet WCAG AA.
