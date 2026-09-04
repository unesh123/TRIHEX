import { ShieldCheck, Check, Info } from "lucide-react";
import { getVerifiedClaimsForProduct } from "@/lib/catalog/claims-engine";

interface PDPVerifiedClaimsProps {
  slug: string;
}

export function PDPVerifiedClaims({ slug }: PDPVerifiedClaimsProps) {
  const claims = getVerifiedClaimsForProduct(slug);

  if (claims.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/50 via-white to-slate-50/50 p-6 shadow-sm sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-blue-100/80 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/30">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-sora)] text-base font-bold text-slate-900">
              Verified Product Entitlements
            </h3>
            <p className="text-[11px] text-slate-500">
              Audited by TRIHEX Operations &amp; Legal Desk
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-100/80 px-2.5 py-1 text-[10px] font-bold text-blue-800">
          <Check className="h-3 w-3 text-blue-600" />
          Zero False Promises Policy
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {claims.map((claim) => (
          <div
            key={claim.id}
            className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs"
          >
            <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-2.5 w-2.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 leading-snug">
                {claim.claim}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                <span className="uppercase font-bold tracking-wider text-slate-500">
                  {claim.category}
                </span>
                <span>•</span>
                <span>Verified {claim.verifiedAt}</span>
                {claim.reviewedBy && (
                  <>
                    <span>•</span>
                    <span>Reviewed by {claim.reviewedBy}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-slate-500 leading-relaxed flex items-center gap-1.5">
        <Info className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        All inclusions listed above are backed by our fulfillment guarantee. We do not advertise speculative limits or unverified features.
      </p>
    </section>
  );
}
