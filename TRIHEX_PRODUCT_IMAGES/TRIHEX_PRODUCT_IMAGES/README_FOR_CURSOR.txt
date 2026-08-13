========================================================
TRIHEX DIGITAL — PRODUCT IMAGE PACKAGE (FOR CURSOR)
========================================================
Prepared for: https://trihex-digital.vercel.app/products
Purpose: High-quality product images to replace low-res / SVG-fallback covers.

--------------------------------------------------------
FOLDER STRUCTURE
--------------------------------------------------------
01_single_product_covers/
   -> Clean SINGLE-product poster covers (one product per file).
   -> SAFE to use directly as product cover images.
   -> Some contain baked-in price/text: use ARTWORK-ONLY crop (MODE B)
      if the baked price/status conflicts with the live database.

02_abstract_artwork/
   -> Single-product ABSTRACT artwork (no baked price/status text).
   -> BEST choice for clean product covers — no text conflict risk.
   -> Map to the correct product family by VISUAL CONTENT.

03_contact_sheets_DO_NOT_USE_AS_COVER/
   -> These contain MULTIPLE products in one image (grids / catalogues).
   -> DO NOT use any of these directly as a product cover.
   -> Use only as a reference, or crop individual cards if a single
      high-res version is missing.

04_reference_supplier_screenshots/
   -> Tiny supplier listing crops. Reference only. NOT product images.

--------------------------------------------------------
EXCLUDED ON PURPOSE (SECURITY)
--------------------------------------------------------
The bank / payment QR screenshot was NOT included in this ZIP.
Never publish it. Owner must upload an approved cropped QR via admin.

--------------------------------------------------------
MAPPING RULES FOR CURSOR
--------------------------------------------------------
1. Match every product/variant to an image by VISUAL CONTENT, not filename order.
2. Prefer 02_abstract_artwork for clean covers (no text-conflict risk).
3. If using a 01_single_product_covers poster that has a baked price:
      - if baked price == live DB price  -> may use full poster
      - if baked price != live DB price  -> crop artwork only, show price as live HTML
4. NEVER use any file from 03_contact_sheets as a product cover.
5. Optimize to WebP, min 1200x1200 where source allows, sRGB, strip metadata,
   fixed aspect ratio, no upscaling blur.
6. Update product-cover-manifest.json + PRODUCT_IMAGE_MATRIX.md.
7. Live HTML remains the source of truth for name, package, price, stock, status.

--------------------------------------------------------
SUGGESTED FAMILY MAPPING (verify visually before publishing)
--------------------------------------------------------
Gemini families        -> gemini-* / gemini-star-*
Google AI Pro          -> google-ai-pro-18month-rs399-poster
Grok / SuperGrok       -> grok-* / grok-super-*
Claude                 -> claude-abstract-modular
Adobe Creative Cloud   -> (use abstract or contact-sheet crop)
Canva                  -> canva-ribbon-abstract
Coursera               -> coursera-learning-abstract
CapCut                 -> video-ai-abstract (or dedicated crop)
Kling Standard / Ultra -> kling-* / kling-gold-camera-abstract
Cursor                 -> cursor-code-abstract
TRIHEX Prompt Pack     -> trihex-ai-prompt-starter-pack
TRIHEX AI Setup        -> trihex-small-business-ai-setup
TRIHEX Automation      -> trihex-workflow-automation-discovery

--------------------------------------------------------
COMPLIANCE REMINDERS
--------------------------------------------------------
- Keep Cursor / Canva EDU / Claude / VEO / Antigravity / Google AI Pro as
  "Under Review" (no Add-to-Cart) until supply authorization is confirmed.
- Do not print "Official" / "Full Warranty" / "Unlimited" on a live card
  unless verified true for that package.
- Safe-to-sell-now: TRIHEX Prompt Pack, TRIHEX AI Setup, TRIHEX Automation,
  Gemini 18m, CapCut, Canva Pro.
========================================================
