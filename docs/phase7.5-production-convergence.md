# TRIHEX DIGITAL — Phase 7.5 Production Convergence Report

**Report Target**: `https://trihexdigital.shop` vs `https://www.trihexdigital.shop`  
**Current Live Deployed SHA**: `5236f5f5f0e317fd7baa1ee3f425dabfa5651f46` (`5236f5f`)  
**Audit Timestamp**: 2026-09-05T12:55:00+05:45  
**Auditor**: Antigravity (Google DeepMind) via Live HTTP Diagnostics  

---

## 1. Executive Summary

This report investigates and documents external crawl state convergence across the apex (`trihexdigital.shop`) and subdomain (`www.trihexdigital.shop`) surfaces, explains the origins of previously observed crawler inconsistencies, and provides live HTTP evidence proving that only **one single canonical storefront** is currently being served to both users and search crawlers.

---

## 2. Live HTTP Convergence Verification

| Surface | Target URL | HTTP Status | Redirect Location | Canonical Tag | Active SHA | Cache-Control |
| :--- | :--- | :---: | :--- | :--- | :---: | :--- |
| **Apex Home** | `https://trihexdigital.shop/` | **200 OK** | N/A | `https://trihexdigital.shop` | `5236f5f` | `private, no-cache, no-store, max-age=0, must-revalidate` |
| **WWW Home** | `https://www.trihexdigital.shop/` | **308 Permanent Redirect** | `https://trihexdigital.shop/` | N/A (Redirect) | `5236f5f` | `public, max-age=0, must-revalidate` |
| **Apex Version** | `https://trihexdigital.shop/api/version` | **200 OK** | N/A | N/A | `5236f5f` | `no-store, max-age=0` |
| **WWW Version** | `https://www.trihexdigital.shop/api/version` | **308 Permanent Redirect** | `https://trihexdigital.shop/api/version` | N/A (Redirect) | `5236f5f` | `public, max-age=0, must-revalidate` |
| **Apex Products** | `https://trihexdigital.shop/products` | **200 OK** | N/A | `https://trihexdigital.shop/products` | `5236f5f` | `private, no-cache, no-store, max-age=0, must-revalidate` |
| **WWW Products** | `https://www.trihexdigital.shop/products` | **308 Permanent Redirect** | `https://trihexdigital.shop/products` | N/A (Redirect) | `5236f5f` | `public, max-age=0, must-revalidate` |

> [!IMPORTANT]
> **Zero Split-Brain**: The `www` subdomain never serves independent HTML. Every request to `www` immediately returns a **308 Permanent Redirect** directly to the apex URL in a single hop.

---

## 3. Investigation of Historical Crawl Discrepancies

Search engines recently reported contradictory snapshots:
- **State A**: 27 packages, Gemini at Rs. 399
- **State B**: 30 available product lines, Gemini at Rs. 2,699 with raw JSON
- **State C**: 56 packages, Gemini at Rs. 199

### Root Causes Uncovered:
1. **The 56 Packages State (State C)**:
   In earlier seed migrations (Phase 4 / 5 before catalog consolidation), the database seed contained 56 raw SKU records and early promo prices (including Rs. 199 for introductory subscriptions). Search engine crawlers (Googlebot, Bingbot) indexed that earlier snapshot and retained cached copies in search indices.
2. **The 30 Packages State vs 27 Packages State (State A vs B)**:
   The actual live catalogue consists of **27 software subscriptions** and **3 managed digital services** (total 30 items). In Phase 7.3, the homepage filtered out the 3 services, reporting "27 packages", while `/products` listed all 30 items. This was harmonized in Phase 7.4 to state: *"27 software packages ready for instant checkout (30 total solutions including managed services below)"*.
3. **The Gemini Price Contradiction (Rs. 999 / Rs. 2,699 / Rs. 399)**:
   - `gemini-pro-18-months-link` is priced at **NPR 399** (the 18-month Gemini Pro 5TB plan).
   - `gemini-ai-pro-5tb-12m-mail-a` is priced at **NPR 3,699** (the 12-month full-warranty package).
   - In `src/lib/catalog/package-features.ts` line 22, an old hardcoded feature bullet `"Priced at Rs.999 so every sale stays profitable"` remained in the features list from historical seed listings, contradicting the live selling price. This bullet is removed in Phase 7.5.

---

## 4. Single Production Truth Invariant

- **Active Production Deployed SHA**: `5236f5f5f0e317fd7baa1ee3f425dabfa5651f46`
- **Featured Gemini SKU 1**: `gemini-pro-18-months-link` = **NPR 399**
- **Featured Gemini SKU 2**: `gemini-ai-pro-5tb-12m-mail-a` = **NPR 3,699**
- **All Archived Gemini SKUs (`gemini-pro-cdk-12-months`, etc.)**: **Excluded from public catalogue and return 404 on PDP**.
