"use client";

import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2, FileText, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type QuoteFormState = {
  name: string;
  business: string;
  phone: string;
  teamSize: string;
  goal: string;
  budget: string;
  tools: string;
};

const initialState: QuoteFormState = {
  name: "",
  business: "",
  phone: "",
  teamSize: "",
  goal: "",
  budget: "",
  tools: "",
};

function createQuoteReference() {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `THX-Q-${date}-${suffix}`;
}

export function QuoteRequestForm() {
  const [form, setForm] = useState<QuoteFormState>(initialState);
  const [quoteReference, setQuoteReference] = useState<string | null>(null);

  const whatsappHref = useMemo(() => {
    if (!quoteReference) return null;
    return buildWhatsAppUrl(
      [
        "Hello TRIHEX DIGITAL, I would like a business AI setup quote.",
        `Quote reference: ${quoteReference}`,
        `Name: ${form.name}`,
        `Business: ${form.business}`,
        `Nepali mobile: ${form.phone}`,
        `Team size: ${form.teamSize || "Not specified"}`,
        `Budget range: ${form.budget || "Not specified"}`,
        `Goal: ${form.goal}`,
        `Current tools/workflow: ${form.tools || "Not specified"}`,
      ].join("\n"),
    );
  }, [form, quoteReference]);

  function update(key: keyof QuoteFormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuoteReference(createQuoteReference());
  }

  if (quoteReference && whatsappHref) {
    return (
      <section className="rounded-[1.5rem] border border-[var(--success)]/30 bg-[var(--success-soft)] p-6 shadow-soft sm:p-8" aria-live="polite">
        <div className="flex gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--success)] shadow-sm"><CheckCircle2 className="h-6 w-6" aria-hidden="true" /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--success)]">Quote draft ready</p>
            <h2 className="mt-1 font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">Your request reference is {quoteReference}.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">Send this structured request to TRIHEX on WhatsApp. The team can confirm scope, price, delivery milestones, and a formal proposal before any payment is requested.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button href={whatsappHref} external variant="whatsapp"><MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />Send request on WhatsApp</Button>
              <Button variant="outline" onClick={() => setQuoteReference(null)}>Edit request</Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-soft sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Business AI quote</p>
          <h2 className="mt-2 font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-[-0.03em]">Tell us what you want to improve.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">Give TRIHEX enough context to prepare a useful first proposal—not a generic tool list.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-soft)] px-3 py-2 text-xs font-bold text-[var(--primary)]"><FileText className="h-3.5 w-3.5" aria-hidden="true" /> Structured first brief</span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-[var(--text)]">Your name
          <input required value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Full name" className="mt-2 h-12 w-full rounded-xl border border-[var(--border-strong)] px-3.5 text-sm font-normal outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]" />
        </label>
        <label className="block text-sm font-semibold text-[var(--text)]">Business or organization
          <input required value={form.business} onChange={(event) => update("business", event.target.value)} placeholder="Business name" className="mt-2 h-12 w-full rounded-xl border border-[var(--border-strong)] px-3.5 text-sm font-normal outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]" />
        </label>
        <label className="block text-sm font-semibold text-[var(--text)]">Nepali mobile
          <input required inputMode="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="98XXXXXXXX" className="mt-2 h-12 w-full rounded-xl border border-[var(--border-strong)] px-3.5 text-sm font-normal outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]" />
        </label>
        <label className="block text-sm font-semibold text-[var(--text)]">Team size
          <select value={form.teamSize} onChange={(event) => update("teamSize", event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[var(--border-strong)] bg-white px-3.5 text-sm font-normal outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]">
            <option value="">Select team size</option>
            <option>Just me</option>
            <option>2–5 people</option>
            <option>6–20 people</option>
            <option>21–100 people</option>
            <option>100+ people</option>
          </select>
        </label>
        <label className="block text-sm font-semibold text-[var(--text)]">Budget range (NPR)
          <select value={form.budget} onChange={(event) => update("budget", event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[var(--border-strong)] bg-white px-3.5 text-sm font-normal outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]">
            <option value="">Select a comfortable range</option>
            <option>Under Rs. 5,000</option>
            <option>Rs. 5,000–15,000</option>
            <option>Rs. 15,000–50,000</option>
            <option>Rs. 50,000+</option>
            <option>Need guidance first</option>
          </select>
        </label>
        <label className="block text-sm font-semibold text-[var(--text)]">Current tools or workflow
          <input value={form.tools} onChange={(event) => update("tools", event.target.value)} placeholder="For example: Excel, WhatsApp, Google Workspace" className="mt-2 h-12 w-full rounded-xl border border-[var(--border-strong)] px-3.5 text-sm font-normal outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]" />
        </label>
        <label className="block text-sm font-semibold text-[var(--text)] sm:col-span-2">What outcome do you want?
          <textarea required value={form.goal} onChange={(event) => update("goal", event.target.value)} rows={4} placeholder="Describe the workflow, bottleneck, customer experience, or business result you want to improve." className="mt-2 w-full resize-y rounded-xl border border-[var(--border-strong)] px-3.5 py-3 text-sm font-normal leading-relaxed outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]" />
        </label>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-[var(--text-muted)]">Submitting this form creates a structured draft in your browser. You choose whether to send it to TRIHEX on WhatsApp. No payment is requested at this stage.</p>
      <Button type="submit" size="lg" className="mt-5">Create quote request</Button>
    </form>
  );
}
