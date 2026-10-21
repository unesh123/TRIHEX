# TRIHEX Research Notes and Sources

## WhatsApp and Webhook Event Architecture

TRIHEX uses direct website-hosted event-driven notifications: an order transaction writes an event and dispatches notifications directly via customer WhatsApp links and audited outbox events. This maintains order database as the single source of truth without third-party messaging leaks.


## Google search and ecommerce guidance

Google Search Central states that its ranking systems prioritize helpful, reliable, people-first content instead of content intended to manipulate rankings. It warns against scaled automated pages that add little value. The TRIHEX plan therefore uses a broad keyword opportunity map but publishes only distinct, editorially reviewed buyer-helpful pages.

Google’s ecommerce documentation explains that structured data can improve its understanding of ecommerce pages. Relevant types include Product, Organization, BreadcrumbList, LocalBusiness where applicable, Review, and VideoObject. Its product-variant documentation defines ProductGroup and Product patterns for related variations. Its ecommerce URL guide recommends stable descriptive URLs, consistent canonical/internal/sitemap use, and canonical treatment for optional-parameter variant URLs.

Sources:

3. https://developers.google.com/search/docs/fundamentals/creating-helpful-content
4. https://developers.google.com/search/docs/specialty/ecommerce/include-structured-data-relevant-to-ecommerce
5. https://developers.google.com/search/docs/appearance/structured-data/product-variants
6. https://developers.google.com/search/docs/specialty/ecommerce/designing-a-url-structure-for-ecommerce-sites

## Competitive-intent sampling

A targeted public search for Nepal-focused AI-tool purchasing surfaced competing category phrasing centered on premium AI tools, local pricing, ChatGPT, Gemini, Canva, CapCut, and local payment methods. This is directional, not a formal keyword-volume study. TRIHEX should validate actual demand with Search Console data and a dedicated keyword research platform before assigning traffic or ranking targets.
