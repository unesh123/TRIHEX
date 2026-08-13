# Domain Setup

Custom domain planning for TRIHEX DIGITAL. **No DNS records are configured in this repository** — values below are placeholders until Hostinger (or another registrar) is connected at go-live.

## Intended setup

| Item | Plan |
|------|------|
| Registrar | Hostinger (`.com` TBD) |
| Hosting | Vercel (frontend + API routes) |
| Email | Provider TBD (`EMAIL_FROM` in env) |

## Steps (when ready — do not invent records early)

1. **Purchase domain** on Hostinger (e.g. `trihex.digital` or chosen `.com` name)
2. **Add domain in Vercel** project → Settings → Domains
3. **Copy DNS records from Vercel** — use exact values Vercel displays (typically):
   - `A` record → Vercel anycast IP (shown in dashboard)
   - `CNAME` for `www` → `cname.vercel-dns.com` (or current Vercel target)
4. **Paste into Hostinger DNS zone** — remove conflicting old records
5. Wait for propagation (up to 48h; often minutes)
6. Enable **HTTPS** (automatic on Vercel once verified)
7. Set production env: `NEXT_PUBLIC_APP_URL=https://your-domain.com`

## Do not

- Commit real DNS IPs or verification tokens to git
- Point production domain before staging pass on [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)
- Enable `ADMIN_DEV_BYPASS` on production URL

## Subdomains (optional future)

| Subdomain | Use |
|-----------|-----|
| `www` | Redirect to apex or serve same app |
| `admin` | Optional separate entry — currently `/admin` path on same host |

## Email DNS (when email provider chosen)

Add SPF, DKIM, DMARC records per provider docs — not configured in v0.1.0.

## WhatsApp links

WhatsApp number is independent of domain: **9779702910130**. Update env display strings if branding changes.

## Verification

After DNS live:

```bash
curl -s https://your-domain.com/api/health
```

Expect `status: ok` and correct `database` / `supabase` flags.
