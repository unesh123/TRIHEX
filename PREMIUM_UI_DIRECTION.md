# TRIHEX Premium UI Direction

## Creative Position

TRIHEX should feel like a **premium Nepal-first digital-access studio**, not a generic software catalogue. The visual language will use **editorial clarity, technical confidence, and restrained depth**. Its primary job is to make discovery feel curated, payment feel dependable, and customer support feel immediate.

> The site should communicate: *“I can confidently find the right digital access, pay in NPR, and remain informed until delivery.”*

## Live Audit: High-Impact Gaps

| Area | Current issue | Premium correction |
| --- | --- | --- |
| Catalogue | The filters, trust strip, and product grid compete at a similar visual weight. The initial product-card region can appear visually empty while covers load. | Convert the catalogue into a **curated discovery canvas** with a compact filter rail, image-led cards, clearer spacing, and a deliberately designed fallback visual for every product. |
| Product cards | The card anatomy is technically complete but text-heavy, with too many equally prominent labels and actions. | Use a single clear primary purchase action, quieter secondary actions, richer image framing, a compact trust summary, and a purposeful price block. |
| Home hero | The hero is structurally strong but relies on a product poster to carry most of the visual drama. | Build a more composed hero frame with ambient depth, a refined featured-offer capsule, and supporting data points that create confidence without clutter. |
| Navigation | The navigation works but reads as a familiar utility bar rather than a premium commerce header. | Add stronger active-state treatment, a more elegant grouped utility area, a higher-quality mobile bottom action dock, and clearer page transitions. |
| Page rhythm | Long vertical grids are functional but lack editorial pacing. | Insert intentional visual breaks: editorial collection blocks, concise outcome cards, customer-journey proof, and a focused service CTA. |
| Admin | The active operations pages focus on information density more than hierarchy. | Evolve the console into a calm dark-on-light workspace with stronger metrics, queue prioritization, and status chips that feel operational rather than decorative. |

## Design Tokens

| System | Direction |
| --- | --- |
| Typography | **Sora** for decisive product names and numeric emphasis; **Manrope** for highly readable operational body copy. Tight display tracking; generous line-height for descriptions. |
| Core palette | Midnight ink `#101827`, TRIHEX blue `#0F4C81`, signal teal `#0C8469`, electric lilac `#7656FF`, pearl `#F7F9FC`, and cloud `#EDF3F2`. |
| Surface system | Soft pearl cards with one sharp elevated surface per visual zone; no excessive glassmorphism. Use 20–28px radii consistently, thin cool-grey strokes, and measured shadows. |
| Motion | Fast, tactile, and quiet: 160–280ms button feedback, 280–420ms section transition. Never hide content before JavaScript hydration. Respect reduced-motion preferences. |
| Imagery | Use real product cover artwork where it exists. When unavailable, use TRIHEX-original **3D abstract access tiles** and family-specific gradient motifs; never create misleading branded product artwork. |

## Storefront Priorities

1. Rework catalogue discovery so it feels curated before it feels filtered.
2. Redesign product cards around visual hierarchy, not metadata accumulation.
3. Upgrade the home page into an editorial conversion page with high-confidence proof and services discovery.
4. Bring product detail, checkout, tracking, and quote pages into the same visual vocabulary.
5. Make mobile the primary touch target: bottom actions, filter drawers, condensed details, and clear purchase affordances.

## Acceptance Criteria

The premium release is considered complete when a first-time customer can identify the featured offer, compare a package, understand availability and delivery, begin checkout, and find support within one screen on desktop or mobile. No major card may render as a blank image block. The visual system must remain fast, accessible, and legible without animation or JavaScript-dependent reveal behavior.

## Local Visual Verification

The premium homepage now renders with a stronger editorial hero, refined featured-offer frame, confident CTA hierarchy, structured trust block, and the existing Gemini product artwork intact. The catalogue shell now renders a clearer premium page header and a compact, structured filter studio with a live readiness summary. The redesigned product cards expose a direct product-detail affordance and a single primary action; their visual hierarchy is materially calmer than the original metadata-heavy cards.

The local developer data source exposes 25 product lines and 13 currently ready-to-order packages, whereas the live production source has a larger catalogue. The presentation changes are data-agnostic and therefore apply to both sources after deployment.
