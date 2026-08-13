import { notFound } from "next/navigation";
import { CheckCircle2, Clock3, FileText, MessageCircle } from "lucide-react";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { Button } from "@/components/ui/button";
import { getQuoteBySecureToken, type QuoteStatus } from "@/lib/quotes/store";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

type StatusCopy = {
  label: string;
  detail: string;
  tone: string;
};

const STATUS_COPY: Record<QuoteStatus, StatusCopy> = {
  REQUESTED: {
    label: "Request received",
    detail: "TRIHEX has your brief and will review the workflow, tools, and scope before preparing a proposal.",
    tone: "bg-[var(--primary-soft)] text-[var(--primary)]",
  },
  SCOPING: {
    label: "Scope in review",
    detail: "The requested outcome and delivery approach are being shaped into a practical scope.",
    tone: "bg-[var(--warning-soft)] text-[var(--warning)]",
  },
  PROPOSAL_READY: {
    label: "Proposal ready",
    detail: "Your proposed scope, price, milestones, and next action are ready for review.",
    tone: "bg-[var(--success-soft)] text-[var(--success)]",
  },
  APPROVED: {
    label: "Approved",
    detail: "The quote has been approved. TRIHEX will guide the next order or project-start step.",
    tone: "bg-[var(--success-soft)] text-[var(--success)]",
  },
  DECLINED: {
    label: "Not proceeding",
    detail: "This request is not currently moving forward. Contact TRIHEX if you need to revisit the scope.",
    tone: "bg-[var(--danger-soft)] text-[var(--danger)]",
  },
  EXPIRED: {
    label: "Quote expired",
    detail: "The scope or price needs an updated review before it can proceed.",
    tone: "bg-[var(--warning-soft)] text-[var(--warning)]",
  },
  CONVERTED: {
    label: "Converted to an order",
    detail: "This quote has been converted into a TRIHEX order or active project record.",
    tone: "bg-[var(--success-soft)] text-[var(--success)]",
  },
};

export default async function SecureQuotePage({
  params,
}: {
  params: Promise<{ secureToken: string }>;
}) {
  const { secureToken } = await params;
  const quote = await getQuoteBySecureToken(secureToken);
  if (!quote) notFound();

  const status = STATUS_COPY[quote.status];
  const whatsappHref = buildWhatsAppUrl(
    `Hello TRIHEX DIGITAL, I need help with quote ${quote.reference}.`,
  );

  return (
    <StorefrontPageShell
      title="Your business AI quote"
      description="A private TRIHEX quote reference for your requested business AI setup or automation scope."
    >
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">TRIHEX quote reference</p>
              <h1 className="mt-1 font-[family-name:var(--font-sora)] text-3xl font-semibold tracking-[-0.04em] text-[var(--text)]">{quote.reference}</h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Created {new Date(quote.createdAt).toLocaleString("en-NP")}</p>
            </div>
            <span className={`rounded-xl px-3 py-2 text-xs font-bold ${status.tone}`}>{status.label}</span>
          </div>

          <div className="mt-5 rounded-2xl bg-[var(--page-soft)] p-4">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{status.detail}</p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Business brief</p>
              <p className="mt-2 text-sm font-semibold text-[var(--text)]">{quote.businessName}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{quote.teamSize || "Team size not specified"} · {quote.budgetRange || "Budget to be discussed"}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Requested outcome</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{quote.goal}</p>
            </div>
          </div>

          <div className="mt-7 border-t border-[var(--border)] pt-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Quote activity</p>
            <ol className="mt-4 space-y-4">
              {quote.events.map((event, index) => (
                <li key={event.id} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                    {index === 0 ? <FileText className="h-4 w-4" aria-hidden="true" /> : <Clock3 className="h-4 w-4" aria-hidden="true" />}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">{event.message}</p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{new Date(event.createdAt).toLocaleString("en-NP")}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button href={whatsappHref} external variant="whatsapp"><MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />Ask TRIHEX about this quote</Button>
            <Button href="/business-ai-setup" variant="outline">Create another quote</Button>
          </div>
        </div>
      </section>
    </StorefrontPageShell>
  );
}
