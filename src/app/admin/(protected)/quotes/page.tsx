import Link from "next/link";
import { AdminSectionPage, StatusPill } from "@/components/admin/admin-section-page";
import { Button } from "@/components/ui/button";
import { listRecentQuotes, type QuoteStatus } from "@/lib/quotes/store";
import { updateQuoteStatusAction } from "@/app/admin/(protected)/quotes/actions";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS: QuoteStatus[] = [
  "REQUESTED",
  "SCOPING",
  "PROPOSAL_READY",
  "APPROVED",
  "DECLINED",
  "EXPIRED",
  "CONVERTED",
];

function humanize(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusVariant(status: QuoteStatus) {
  if (["APPROVED", "CONVERTED"].includes(status)) return "success" as const;
  if (["DECLINED", "EXPIRED"].includes(status)) return "danger" as const;
  if (["REQUESTED", "SCOPING"].includes(status)) return "warning" as const;
  return "default" as const;
}

export default async function AdminQuotesPage() {
  const quotes = await listRecentQuotes(50);
  const requested = quotes.filter((quote) => quote.status === "REQUESTED").length;
  const scoping = quotes.filter((quote) => quote.status === "SCOPING").length;
  const proposalReady = quotes.filter((quote) => quote.status === "PROPOSAL_READY").length;

  return (
    <AdminSectionPage
      title="Quote requests"
      description="Website-recorded business AI and automation requests. Update the status here to create a customer-visible quote event."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          ["New requests", requested, "Review the business goal and choose the next action."],
          ["In scoping", scoping, "Clarify scope, milestones, exclusions, and budget."],
          ["Proposal ready", proposalReady, "Send a clear scope and next approval step."],
        ].map(([label, value, detail]) => (
          <div key={label as string} className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label as string}</p>
            <p className="mt-2 font-[family-name:var(--font-sora)] text-2xl font-semibold text-[var(--text)]">{value as number}</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">{detail as string}</p>
          </div>
        ))}
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white px-5 py-12 text-center shadow-sm">
          <p className="font-semibold text-[var(--text)]">No quote requests yet.</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">New website requests will appear here with their business brief and private customer quote link.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <article key={quote.id} className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
                <div>
                  <p className="font-mono text-xs font-bold text-[var(--primary)]">{quote.reference}</p>
                  <h2 className="mt-1 text-lg font-semibold text-[var(--text)]">{quote.businessName}</h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{quote.customerName} · {quote.customerPhone}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill label={humanize(quote.status)} variant={statusVariant(quote.status)} />
                  <Link href={`/quotes/${quote.secureToken}`} target="_blank" className="text-xs font-semibold text-[var(--primary)] hover:underline">Customer view ↗</Link>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_300px]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Requested outcome</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{quote.goal}</p>
                  <p className="mt-3 text-xs text-[var(--text-muted)]">Team: {quote.teamSize || "Not specified"} · Budget: {quote.budgetRange || "Not specified"} · Current tools: {quote.currentTools || "Not specified"}</p>
                </div>
                <form action={updateQuoteStatusAction} className="rounded-xl bg-[var(--page-soft)] p-3">
                  <input type="hidden" name="quoteId" value={quote.id} />
                  <label className="block text-xs font-semibold text-[var(--text)]">Customer-visible status
                    <select name="status" defaultValue={quote.status} className="mt-1.5 h-10 w-full rounded-lg border border-[var(--border-strong)] bg-white px-2 text-sm">
                      {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{humanize(status)}</option>)}
                    </select>
                  </label>
                  <label className="mt-3 block text-xs font-semibold text-[var(--text)]">Status message
                    <textarea name="message" rows={2} placeholder="Explain the next step clearly." className="mt-1.5 w-full resize-y rounded-lg border border-[var(--border-strong)] bg-white px-2 py-2 text-sm" />
                  </label>
                  <Button type="submit" size="sm" className="mt-3 w-full">Save status update</Button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminSectionPage>
  );
}
