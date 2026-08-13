# Storage Audit

**Status:** Adapter implemented (`src/lib/storage/adapter.ts`). Live buckets **NOT_CONFIGURED** (credentials MISSING).

| Bucket env | Purpose | Public? | Validation | Signed URL | Live test |
|------------|---------|---------|------------|------------|-----------|
| PRODUCT_MEDIA_STORAGE_BUCKET | Product covers/gallery | Optional public read | MIME/size | Optional | BLOCKED_BY_CREDENTIALS |
| PAYMENT_PROOF_STORAGE_BUCKET | Customer payment proofs | **Private** | MIME/size ≤5MB | Required | BLOCKED_BY_CREDENTIALS |
| PRIVATE_DOCUMENT_STORAGE_BUCKET | Supplier authorization docs | **Private** | MIME/size | Required | BLOCKED_BY_CREDENTIALS |
| PAYMENT_QR_STORAGE_BUCKET | Approved cropped QR | **Private** | MIME/size | Order-scoped | BLOCKED_BY_CREDENTIALS |

Protections in adapter:

- Allowed types: jpeg, png, webp, pdf
- Max 5 MB
- Random UUID object names (no customer filename trust)
- Fail-closed if Supabase service role / bucket env missing
- No commit of bank UI screenshots

Owner must create buckets in Supabase and set env names (see OWNER_ACTIONS.md).
