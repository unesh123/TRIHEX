# OWNER ACTIONS — TRIHEX DIGITAL Live Infrastructure

**Updated:** 2026-07-21  
**Vercel:** Authenticated as `uneshbastola888-2837` · Project **trihex-digital** (`uneshs-projects`)  
**Blocker:** Supabase is **not installed** on the Vercel team. Marketplace terms require a **human interactive terminal** (Cursor agents cannot accept them). Until Supabase is connected, release remains **BLOCKED_BY_CREDENTIALS**.

Do **not** paste secrets into Cursor chat.

---

## 0. REQUIRED FIRST — Connect Supabase via Vercel Marketplace (interactive)

Open a **normal Windows Terminal / PowerShell** (not Cursor agent chat), `cd` to this repo, then run:

```powershell
npx vercel whoami
npx vercel link   # confirm trihex-digital if prompted
npx vercel integration accept-terms supabase
```

Review and accept:

- https://vercel.com/legal/integration-marketplace-end-users-addendum  
- https://supabase.com/privacy  
- https://supabase.com/terms  

Then provision and connect (Singapore region matches `vercel.json` `sin1`):

```powershell
npx vercel integration add supabase -n trihex-digital -m region=sin1 -e development -e preview -e production
npx vercel env pull .env.local
npx vercel env ls
```

**Dashboard alternative:**  
https://vercel.com/uneshs-projects/trihex-digital/stores → **Create Database** / **Supabase** → authorize → select/create TRIHEX project → scope to Preview + Production (+ Development).

After pull, Cursor will map Marketplace names automatically:

| Marketplace variable | TRIHEX expects |
|----------------------|----------------|
| `POSTGRES_URL` | `DATABASE_URL` |
| `POSTGRES_URL_NON_POOLING` | `DIRECT_URL` |
| `NEXT_PUBLIC_SUPABASE_URL` | same |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `SUPABASE_SECRET_KEY` | `SUPABASE_SERVICE_ROLE_KEY` |

Then **rerun the deployment prompt in Cursor** — do not send another prompt until this step succeeds.

---

## 1. Also set non-Marketplace secrets (local + Vercel Preview/Production)

Add these in `.env.local` and Vercel env (never commit):

```
AUTH_SECRET=                 # 32+ random chars
ENCRYPTION_KEY=
IP_HASH_SALT=
CRON_SECRET=
ADMIN_BOOTSTRAP_EMAIL=       # your admin email
ADMIN_BOOTSTRAP_NAME=
DEMO_MODE=false
ADMIN_DEV_BYPASS=false
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BUSINESS_WHATSAPP_NUMBER=9779702910130
NEXT_PUBLIC_BUSINESS_WHATSAPP_DISPLAY=+977 9702910130
PRODUCT_MEDIA_STORAGE_BUCKET=product-media
PAYMENT_PROOF_STORAGE_BUCKET=payment-proofs
PRIVATE_DOCUMENT_STORAGE_BUCKET=private-documents
PAYMENT_QR_STORAGE_BUCKET=payment-qr
```

---

## 2. Run migrations & seed (local)

```bash
npm run db:migrate
# apply functions + RLS with your SQL client / psql using DIRECT_URL
npm run seed
```

Verify Gemini NPR 300 still DRAFT / not purchasable.

---

## 3. Storage buckets (Supabase Storage)

| Bucket env | Suggested name | Public |
|------------|----------------|--------|
| PRODUCT_MEDIA_STORAGE_BUCKET | product-media | public read optional |
| PAYMENT_PROOF_STORAGE_BUCKET | payment-proofs | **private** |
| PRIVATE_DOCUMENT_STORAGE_BUCKET | private-documents | **private** |
| PAYMENT_QR_STORAGE_BUCKET | payment-qr | **private** |

Upload **cropped approved QR only** via Admin. Never commit the full bank screenshot.

---

## 4. Auth callbacks

In Supabase Auth URL config, add localhost + Preview URL + Production URL.

---

## 5. Preview then Production

Only after migrations + seed + RLS + storage + Auth work:

```bash
npx vercel          # Preview
# smoke-test Preview URL
npx vercel --prod   # ONLY if release gate PASS
```

Env changes require a **new** deployment.

---

## 6. Git checkpoint

Git `user.name` / `user.email` are **not configured** on this machine. Set your identity locally, then:

```bash
git add -A
git status   # confirm .env.local and .vercel are NOT staged
git commit -m "checkpoint: TRIHEX before live Supabase migration"
```

---

## 7. MFA

Enable TOTP MFA in Supabase Auth for admin users before public launch.

---

## 8. Domain (later)

Follow `DOMAIN_SETUP.md` after purchasing the .com. Do not invent DNS records.
