# TRIHEX Phase 0 Production Runbook

**Scope:** This runbook activates the permanent TRIHEX owner identity, the persistent website quote workflow, site-first order support, and the optional You.com research helper. It intentionally **does not** deploy Telegram or a third-party SMS/WhatsApp automation provider.

> **Confirmed owner identity:** `uneshbastola888@gmail.com` is the canonical TRIHEX super-admin email. The application now rejects a conflicting `ADMIN_BOOTSTRAP_EMAIL` in production rather than silently assigning ownership elsewhere.

| Area | Implemented behavior | Production action required |
| --- | --- | --- |
| Owner access | The owner email is defined in `src/lib/auth/owner.ts`; Supabase bootstrap creates or upgrades it to `SUPER_ADMIN`. | Configure Supabase and database credentials, then run the bootstrap step below. |
| Quotes | Website quote requests receive a durable `THX-Q-…` reference, secure URL, event log, and admin work queue. | Apply `drizzle/0003_quote_workflow.sql` to the production PostgreSQL database before using quote persistence. |
| Order support | Customers track orders on-site with order number plus checkout email or Nepali mobile. WhatsApp is contextual and includes the order reference. | Keep the existing business WhatsApp environment values accurate. |
| Telegram | Not integrated, by owner decision. | No action required. |
| You.com research | An optional **admin-only**, server-side public-web research endpoint is prepared. It never sends order, payment, phone, email, or quote data to You.com. | Add `YOUCOM_API_KEY` only if this capability is wanted. The provided attachment contained no API key value. |

## 1. Set production environment values

Set these values in the hosting platform’s **Production** environment. Do not commit any secret to Git.

```dotenv
ADMIN_BOOTSTRAP_EMAIL=uneshbastola888@gmail.com
ADMIN_BOOTSTRAP_NAME=Unesh Bastola
ADMIN_DEV_BYPASS=false
DEMO_MODE=false
PERSISTENCE_MODE=postgres
DATABASE_URL=postgresql://…
DIRECT_URL=postgresql://…
NEXT_PUBLIC_SUPABASE_URL=https://….supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=…
SUPABASE_SERVICE_ROLE_KEY=…
AUTH_SECRET=<at-least-32-random-characters>
```

The existing production storage and payment variables remain required for their respective functions. The deployment must continue to pass the project’s production environment validation.

## 2. Apply the quote migration

Apply the forward-only migration **once** against the same production PostgreSQL database used by TRIHEX:

```bash
psql "$DATABASE_URL" -f drizzle/0003_quote_workflow.sql
```

This creates the `quote_status` enum, `quotes` table, `quote_events` table, foreign keys, and lookup indexes. It does not modify orders, payments, or historical product data.

## 3. Bootstrap the permanent owner

With the production environment loaded locally or in a trusted deployment shell, run:

```bash
npx tsx scripts/bootstrap-admin.ts
```

The script creates or upgrades `uneshbastola888@gmail.com` in Supabase Auth and the `profiles` table as `SUPER_ADMIN`. For the first access path, omit `ADMIN_BOOTSTRAP_PASSWORD` and use the password-reset email. If a temporary password is deliberately set through `ADMIN_BOOTSTRAP_PASSWORD`, rotate it after first login and enroll MFA from **Admin → Security / MFA**.

## 4. Optional You.com admin research

The optional connector uses the officially documented `POST https://ydc-index.io/v1/search` endpoint and the `X-API-Key` header.[1] It is deliberately server-only and is exposed only through the permission-protected internal route:

```text
POST /api/admin/ai/web-research
```

To enable it, add the secret below to the server/hosting environment only; never prefix it with `NEXT_PUBLIC_` and never enter it in source code.

```dotenv
YOUCOM_API_KEY=<your-private-you.com-api-key>
```

The endpoint is suitable for a staff member’s manually entered **public research query**, such as competitor or tool research. It must never receive customer names, phones, emails, payment proofs, order numbers, checkout notes, or quote briefs. You.com’s documentation describes the endpoint as web/news search with structured results and states that a unique API key authorizes access.[1] [2]

## 5. Validate before and after deployment

Run the following in the repository before pushing a release:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e:smoke
```

After deployment, verify the following manually on the production domain: the admin login page defaults to the confirmed owner email; a business quote submission creates a secure quote page; the same quote appears in **Admin → Quote requests**; an operator status update adds an event on the secure quote page; and order tracking continues to require an order number plus a matching email or Nepali mobile.

## References

[1]: https://you.com/docs/api-reference/search/v1-search "You.com Search API reference"
[2]: https://you.com/docs/guides/search "You.com Web Search API overview"
