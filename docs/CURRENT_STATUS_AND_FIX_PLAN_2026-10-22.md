# Current status and fix plan — 22 October 2026, Nepal time

This report follows the latest security commits through `88790ae`. Antigravity is actively implementing authentication, VIP and admin changes. The image release must preserve those commits; do not deploy the older isolated release from 21 October.

## Image release

- All 72 required artwork files have been generated with the built-in imagegen tool. They cover all 168 current public/draft catalogue products, including duration variants.
- All images are 960×960 sRGB WebP with no prices baked in. Largest file: 179,864 bytes; complete set: 8,214,026 bytes. Responsive Next Image delivery remains enabled.
- The partial-release allowlist admitted only 14 images. Expand it now that all 72 assets exist, otherwise the remaining products continue displaying legacy posters.
- MuseAI is NPR 399 for 1 billion tokens, without a time duration. Activation/account details remain subject to confirmation. ElevenLabs Creator's one-month SKU is NPR 1,000 during the fixed campaign ending 24 October at 19:45 Nepal time.
- Asset audit: 168 products, 72 artwork assets, zero errors. Tests: 59 files / 302 tests passed. Deployment and final live results are recorded in PRODUCT_ARTWORK_RELEASE.md.

## Priority 0 — before enabling Google login or claiming VIP isolation

| Finding | Code evidence | Required fix and acceptance check |
| --- | --- | --- |
| Customer cookie is only base64 JSON; timestamp cutoff does not authenticate it. The caller supplies email, role and verified fields. | `src/lib/auth/user-session.ts`, encodeUserSession/decodeUserSession/getCurrentStorefrontUser | Use a provider-verified server session or authenticated, expiring server-issued tokens. Derive roles from server records. A modified cookie must never create a user or grant VIP access. |
| A URL query flag grants the full VIP vault without an authenticated membership. | `src/app/(storefront)/vip/page.tsx`, isVipActive and first vault return | Remove query-based clearance. Anonymous, expired and suspended users must receive no protected vault content, including in HTML/RSC/API responses. |
| Google is disabled only in the button UI. Direct OAuth start/callback handlers remain. The custom state is unsigned base64 and not tied to a browser session; next targets are not restricted to local paths. | `src/components/auth/google-auth-button.tsx`; `src/app/api/auth/google/start/route.ts`; `src/app/api/auth/google/callback/route.ts`; `src/app/auth/callback/route.ts` | Centralize the maintenance switch across server routes. Consolidate onto one OAuth implementation with browser-bound one-time state/PKCE, verified provider identity, and local return-path validation. Reject missing/reused state and external next URLs. Verify both customer and allowlisted admin account flows. |
| Admin/session code includes static fallback secrets and a master-password fallback. Source-controlled fallbacks undermine production credential configuration. | `src/lib/admin/session-cookie.ts`; `src/app/admin/login/actions.ts` | Remove production fallbacks, require configured secrets, rotate affected credentials and invalidate old tokens. Check missing-secret startup/login fails closed, wrong passwords fail, and customer identities cannot access admin APIs. Do not put credentials in client bundles or logs. |

Disabling the Google button and revoking older timestamps do not resolve these server-side findings. Keep Google login offline until the server checks pass. No live account impersonation or private vault extraction was performed for this report.

### Active workspace change observed during the image release

The new, uncommitted `src/app/api/auth/quick-login/route.ts` accepts a submitted email and issues a session marked `provider: google`, `verified: true`, including an owner-derived role, without verifying a Google credential. This is not a Google identity check. Do not ship that route until the server verifies the provider credential and derives identity from it. It is deliberately excluded from this image deployment, along with other uncommitted auth work. The uncommitted customer-session changes still retain base64-only decoding; removing the timestamp cutoff does not solve the signature issue.

## Priority 1 — durable VIP and admin behavior

1. Replace in-memory VIP member mutation with transactional database records. `src/lib/vip/vip-member-store.ts` currently maintains a mutable memory list, merges some profile data, and includes seeded founder identities. Membership grants, suspension, expiry and bonuses must survive process restarts and agree across instances.
2. Use one authoritative membership entitlement check across the VIP page, download/API endpoints and admin mutations. Enforce expiry and suspension on every protected operation; require staff authorization for changes and append audit records.
3. Test order approval → entitlement activation → customer access → expiry/suspension → access removal. Check duplicate approvals and retries do not double-grant or double-charge.
4. Reconcile storefront availability with order eligibility. Existing ElevenLabs supplier authorization/proof fields can block checkout despite an Available badge. Preserve real supplier evidence requirements; do not invent proof. MuseAI's confirmed token allowance and price do not establish account delivery details.

## Priority 2 — quality and performance

1. Current repository lint has zero errors and 631 warnings. Resolve warnings by affected feature; passing tests alone are insufficient.
2. Keep database connection pools small per worker/instance. The earlier ten-connection pools exhausted the shared 200-client limit. Verify the two-connection setting under builds and concurrent requests.
3. Database table audit now finds all 62 expected tables. The earlier missing-table finding is resolved at the table-presence level; verify columns, migrations, and actual prompt/deal/feed persistence separately.
4. Measure mobile page performance after image deployment. Keep artwork lazy-loaded below the fold, correctly sized, and cached. Audit the large home/catalogue HTML payload before claiming the site is fully optimized.
5. Verify catalogue filters, token labels, variant prices, image lightbox, cart, enquiry links, admin primary media and mobile layouts. Run a controlled real checkout only with an appropriate test payment/order lifecycle.

## Coordination

This task owns image generation, complete asset mapping, compression, catalogue media synchronization, image validation, and this handoff plan. Antigravity's current Google/VIP/admin security changes are retained. The findings above are implementation work still required; they are not claims of completed security repairs.
