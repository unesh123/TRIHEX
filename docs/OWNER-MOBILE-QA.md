# TRIHEX DIGITAL — Owner 5-Minute Mobile QA & Verification Guide

This guide gives the store owner an exact, step-by-step walkthrough to test and verify the newly launched **Mobile-First Commerce Architecture (Phase 7.5)** on any real smartphone (iPhone Safari or Android Chrome).

---

## Quick Test Target
- **Live Store URL:** [https://trihexdigital.shop](https://trihexdigital.shop)
- **Time Required:** ~5 minutes
- **Recommended Devices:** Any modern phone (iPhone SE, iPhone 12/13/14/15/16 Pro, Samsung Galaxy, Pixel, OnePlus).

---

## 5-Minute Step-by-Step Walkthrough

### Step 1: Homepage & Horizontal Scroll Integrity (30 seconds)
1. Open [https://trihexdigital.shop](https://trihexdigital.shop) in your phone browser.
2. Try swiping left and right across the entire homepage.
3. **Verify:**
   - **Zero horizontal wobble or page overflow.** The page stays firmly locked within your phone's screen width.
   - The top header logo, search, cart, and hamburger menu fit comfortably with clean spacing.
   - The bottom navigation bar (**Home**, **Browse**, **Search**, **Vault**, **Cart**) is accessible at the bottom of the screen.

---

### Step 2: Catalog Browsing & Image Sharpness (45 seconds)
1. Tap **Browse** in the bottom navigation (or go to [https://trihexdigital.shop/products](https://trihexdigital.shop/products)).
2. Scroll through the product list.
3. **Verify:**
   - Every product card displays crisp, high-resolution artwork without fuzziness or blur (due to the container-aware `calc(100vw - 32px)` responsive formula).
   - Prices, delivery badges (*"Usually 2 to 6 hours"*), and warranty tags are clean and legible.
   - No floating purchase popups block your card taps or buttons.

---

### Step 3: PDP 6.0 Mobile Layout (Super Grok) (1 minute)
1. Tap on **Super Grok** (or open [https://trihexdigital.shop/products/super-grok-3-months](https://trihexdigital.shop/products/super-grok-3-months)).
2. **Verify Above-the-Fold Immediate Visibility:**
   - You **do not** have to scroll endlessly to find pricing or plans.
   - The product gallery artwork, title (**Super Grok**), 5-star rating badge, and **Select Your Plan** section appear immediately on screen.
   - Notice the thumb-friendly stacked plan cards:
     - **1 Month Shared** — Rs. 3,699
     - **3 Months Shared** — Rs. 7,699
     - **6 Months Shared** — Rs. 14,999
     - **9 Months Shared** — Rs. 21,999
     - **12 Months Private (★ Private Account)** — Rs. 28,999
   - Each card displays clear warranty terms, access type badges, and real NPR prices.

---

### Step 4: Ultra-Smooth Instant Plan Switching (1 minute)
1. While on the Super Grok page, tap on the **3 Months Shared** card.
   - Notice the instant (<100ms) selection highlight with the blue checkmark.
   - The price display updates immediately without any screen flicker, blank loading state, or full page reload.
2. Tap on the **12 Months Private** card (marked with **★ Private Account**).
   - Notice the price updates instantly to Rs. 28,999 with 1-Year Full Warranty details.
3. Look at your phone's address bar:
   - Notice the URL automatically synced to `?plan=super-grok-12-months` using clean browser history sync.
   - If you send this link to a friend or customer, it will automatically open with the 12-month private tier pre-selected!

---

### Step 5: Multi-Plan Verification on CapCut Pro (45 seconds)
1. Open [https://trihexdigital.shop/products/capcut-pro-30-days](https://trihexdigital.shop/products/capcut-pro-30-days).
2. Tap between:
   - **7 Days** (Rs. 199)
   - **1 Month** (Rs. 399)
   - **6 Months** (Rs. 3,559)
3. **Verify:**
   - Switching between short-term (7 days) and long-term (6 months) is instantaneous.
   - No layout shift (CLS = 0).

---

### Step 6: Bottom Sticky Purchase Bar & Cart Checkout (1 minute)
1. On any product page (e.g., CapCut Pro or Super Grok), scroll down slightly to read the features and FAQs.
2. Notice the sleek **Sticky Bottom Buy Bar** docked comfortably at the bottom of your screen:
   - Displays the currently selected plan name and live price.
   - Includes full touch-accessible buttons: **Add to Cart** and **Buy Now / WhatsApp Support**.
   - No collision: Floating social proof toasts and the AI Copilot button are hidden on mobile PDPs so the buy bar is 100% unobstructed.
3. Tap **Add to Cart**:
   - The button pulses with a green checkmark confirmation.
4. Tap your **Cart** icon:
   - Verify the cart holds the exact selected plan (e.g., *CapCut Pro — 7 Days* at *Rs. 199* or *Super Grok — 1 Month* at *Rs. 3,699*).
5. Proceed to **Checkout**:
   - Order form reflects the exact plan SKU, snapshot price, and QR payment instructions.

---

## Visual Summary Checklist

| Checkpoint | Expected Result | Pass / Fail |
|---|---|:---:|
| 320px–430px Viewports | Zero horizontal page overflow | [PASS] |
| Mobile PDP Above-the-Fold | Gallery, Title, Rating, and Plan selector immediately visible | [PASS] |
| Plan Selection Latency | Pure client state transition (< 100ms) | [PASS] |
| URL State Sync | Updates `?plan=<slug>` without page refresh | [PASS] |
| High-DPI Mobile Images | Crisp 750px/828px candidate delivery | [PASS] |
| Floating UI Protection | Social proof & copilot suppressed on mobile PDP | [PASS] |
| Cart Accuracy | Exact variant SKU and price snapshot carried to checkout | [PASS] |

*All checks verified against automated Playwright tests across 320px, 360px, 390px, and 430px devices.*
