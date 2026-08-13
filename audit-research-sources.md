# TRIHEX Research Notes and Sources

## Telegram webhook architecture

Telegram’s official Bot API states that bots can receive updates through either `getUpdates` or an outgoing webhook. A configured webhook results in Telegram sending HTTPS POST requests containing serialized updates. The official API documents `secret_token` as a request-validation header and notes that polling cannot run while an outgoing webhook is configured.

The official webhook guide describes webhook push as avoiding frequent polling and enabling immediate delivery. It specifies HTTPS/TLS requirements and supported ports. For TRIHEX, this supports event-driven website-hosted notifications: an order transaction should write an event and enqueue a notification; the bot webhook should consume user linking/status commands, validate the Telegram secret token, and deduplicate update IDs.

Sources:

1. https://core.telegram.org/bots/api
2. https://core.telegram.org/bots/webhooks

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
