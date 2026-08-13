# TRIHEX DIGITAL — Premium Commerce Design System Blueprint

## Design direction

TRIHEX should evolve from a catalogue page into a **calm, trusted Nepal-first digital services experience**. The visual system should communicate clarity before novelty: real NPR prices, exact delivery expectations, transparent activation method, visible authorization status, and human local support. The current navy/green identity is a credible base; retain it, but introduce one restrained violet/blue signal reserved for AI intelligence, review state, and interactive focus.

The experience should feel quick, composed, and premium on a 360–430px mobile viewport before it is optimized for desktop. Product imagery is an enhancement, not the source of truth: all price, duration, availability, eligibility, and delivery claims must be live interface data rather than baked into promotional artwork.

## Token layer

| Layer | Standard |
|---|---|
| Type | Use existing Sora for display numbers and headings; pair with a highly legible sans-serif body face. Establish a five-step type scale, not per-component text sizes. |
| Colour | Keep dark navy as primary action and system authority; use green only for verified / paid / delivered success states; reserve amber for low-stock / action-needed and red for failures. Do not use green for generic actions. |
| Layout | Mobile: 16px page gutters, 12px compact-card gaps, 24px section rhythm. Desktop: max-width 1200–1280px, 24–32px gutters, 32–48px major section rhythm. |
| Surface | Warm white primary canvas, soft blue-gray field, white raised cards, no harsh gradients behind text. Use one soft AI halo only on hero and selected featured cards. |
| Radius and depth | 12px field controls, 16px cards, 20px modal/sheet; one subtle border plus elevation layer. Avoid mixing excessive rounded styles. |
| Iconography | Lucide icon set only, 18–20px default, always paired with readable labels for payment, status, and fulfillment decisions. |

## Information architecture

The main navigation should be reduced to five customer goals: **Shop, Categories, Deals, Track order, Help**. Search, cart, and account stay as labelled icons on desktop and a persistent bottom action bar on mobile. WhatsApp becomes contextual support rather than a competing global conversion action on every surface.

The mobile bottom action bar should contain Home, Browse, Search, Track, and Cart. The floating WhatsApp button should avoid covering purchase controls; show it only after a short scroll threshold and suppress it when a product page sticky buy bar or payment action is on screen.

## Storefront component contracts

| Component | Required content | Interaction quality bar |
|---|---|---|
| Hero | One headline, one outcome-led subhead, one shop CTA, one tracking/help CTA, one evidence module. | 300–450ms entry sequence, but no animation that blocks LCP or loads before the hero image/text. |
| Trust evidence strip | Verified fulfillment process, local NPR pricing, payment proof review, transparent policy. | Each item links to the relevant proof/policy; never imply certifications or guarantees that cannot be evidenced. |
| Product card | Brand, precise product/package, availability, delivery window, verified price, discount only when real, two outcome benefits, one primary CTA. | Image gently scales on hover; card receives 2–4px lift with shadow. Entire card remains keyboard-friendly. |
| Product-family card | Parent product, plan selector/comparison, “best for” label, live price range and fulfilment method. | Variant selection updates available price, stock, structured data, and checkout item in one source of truth. |
| Product detail | Clear package selection, proof of what is supplied, eligibility, activation steps, support/warranty terms, FAQ, review proof, related alternatives. | Sticky mobile CTA, section anchors, accordion open/close animation at 200–250ms, no mystery pricing. |
| Checkout | Stepper: Contact → Payment → Proof → Confirmation. | Validate inline; persist draft; give a precise order number and tracking path after creation. |
| Order status | Event timeline, current stage, expected next action/time, contact fallback, notification subscription. | Only one prominent next action; stages are human language, not raw internal enum labels. |

## Motion system

Add Framer Motion as the orchestration layer; honor `prefers-reduced-motion` completely. Use transform and opacity only for routine animation, preserve focus visibility, and avoid continuous decorative animation. Product grids can use staggered entrance only on initial view, cards use 160–220ms hover/focus feedback, drawers and sheets use 220–280ms spring transitions, and success/status changes use explicit one-time confirmation motion.

Do not animate navigation height, expensive filters, images, layout measurements, or every card on every client-side navigation. Motion must help task orientation: search open/close, plan selection, cart quantity, payment-proof upload, status-timeline progress, and confirmation only.

## Admin design rules

The admin should be an operator console rather than an expanded navigation tree. The first view needs only: Today’s orders, payment proofs waiting, fulfillment due/overdue, low-stock or supplier-risk flags, revenue/profit, and a chronological work queue. A contextual command bar (“Create product”, “Review proof”, “Fulfill next order”, “Create quote”) should be present in the header.

Admin workflows require dense, accessible data tables with saved views, filter chips, keyboard navigation, sticky bulk-action rows, audit-visible confirmation dialogs, and reversible status changes. Every status change must show who changed it, when, why, and whether the customer was notified. A placeholder page should never be visible in production navigation; hide unfinished modules behind a capability flag until it is operational.

## Product creative direction

Use an image family, not mixed supplier posters. Each product should have a 4:5 or square artwork master with: official/authorized brand treatment where permitted, a product-relevant abstract visual, consistent TRIHEX quality mark, and no hard-coded price, duration, discount, warranty, or stock copy. Create three cover templates: AI assistants, creative/video tools, and business automation services. The current hero-grade poster quality becomes a starting point, while inconsistent or baked-text covers are replaced systematically.

## Quote experience

Introduce a dedicated “Request a business AI setup quote” route. The quote card asks for business type, team size, goal, budget range, preferred tools, current workflow, and WhatsApp number. The result is a branded quote draft with package line items, optional recurring fee, delivery milestones, scope exclusions, validity date, approval button, and payment/order conversion. Quotes must have their own reference number and event log; they should not be stored as informal WhatsApp text.

## Accessibility and quality gates

Every redesign component requires keyboard operation, visible focus, 44px minimum touch targets, semantic status labels, contrast validation, zero colour-only meaning, and image alt text. Client interactions must keep input state on validation failure. Decorative assets must use empty alternative text, while commercial product art needs descriptive product alternative text.
