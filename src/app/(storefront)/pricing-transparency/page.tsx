import { StorefrontPageShell } from "@/components/storefront/page-shell";

export default function PricingTransparencyPage() {
  return (
    <StorefrontPageShell
      title="Pricing transparency"
      description="How TRIHEX sets NPR prices and what you see at checkout."
    >
      <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-text-muted">
        <p>
          Listed NPR prices include our operational costs, payment allowances, and
          minimum margin targets where formula pricing applies. Checkout always
          recomputes totals on the server — browser cart totals are estimates only.
        </p>
        <p>
          We do not display fake reference prices or unverifiable discount badges.
          When we run a promotion, it will show explicit dates and conditions.
        </p>
        <p>
          Low owner-controlled pricing may carry sustainability warnings in admin
          tools; public pages show the final customer price only.
        </p>
      </div>
    </StorefrontPageShell>
  );
}
