import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { Button } from "@/components/ui/button";

const FAQ = [
  {
    q: "Does WhatsApp mark my order as paid?",
    a: "No. Payment is verified only after finance confirms funds in the official receiving account. WhatsApp is for communication and proof upload.",
  },
  {
    q: "Why are some brands not available?",
    a: "Listings stay hidden until authorization and compliance documentation is verified. We do not sell blocked activation methods.",
  },
  {
    q: "Are prices on the cart final?",
    a: "Checkout recalculates server-side. Cart totals are indicative.",
  },
  {
    q: "How do I track an order?",
    a: "Use the Track order page with your order number and checkout email or phone.",
  },
] as const;

export default function FaqPage() {
  return (
    <StorefrontPageShell title="FAQ" description="Common questions about TRIHEX DIGITAL.">
      <dl className="max-w-3xl space-y-8">
        {FAQ.map((item) => (
          <div key={item.q}>
            <dt className="font-semibold text-text">{item.q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-text-muted">{item.a}</dd>
          </div>
        ))}
      </dl>
      <Button href="/contact" variant="secondary" className="mt-10">
        Still need help?
      </Button>
    </StorefrontPageShell>
  );
}
