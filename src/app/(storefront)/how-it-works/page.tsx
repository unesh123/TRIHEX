import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    title: "Browse verified listings",
    body: "Explore public products with clear activation types, fulfillment estimates, and NPR prices.",
  },
  {
    title: "Place a website order",
    body: "Checkout on trihex.digital captures your contact details and recalculates prices server-side.",
  },
  {
    title: "Pay using selected method",
    body: "Follow manual eSewa, Khalti, or bank transfer instructions shown after checkout.",
  },
  {
    title: "Verify payment",
    body: "Upload proof on the website or WhatsApp. Finance marks paid only after confirming the receiving account.",
  },
  {
    title: "Receive activation or service",
    body: "Downloads, consultations, or setup sessions are delivered per product fulfillment type.",
  },
  {
    title: "Track and get support",
    body: "Use order tracking on the website, or WhatsApp to inquire about payment / order status after you pay.",
  },
] as const;

export default function HowItWorksPage() {
  return (
    <StorefrontPageShell
      title="How it works"
      description="Website-first ordering with manual payment verification suited to Nepal."
    >
      <ol className="max-w-3xl space-y-6">
        {STEPS.map((step, i) => (
          <li key={step.title} className="border-l-2 border-primary/40 pl-4">
            <span className="font-mono text-sm text-primary">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2 className="mt-1 font-semibold text-text">{step.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
      <Button href="/checkout" className="mt-10">
        Start checkout
      </Button>
    </StorefrontPageShell>
  );
}
