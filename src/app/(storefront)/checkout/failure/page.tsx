import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { Button } from "@/components/ui/button";

export default function CheckoutFailurePage() {
  return (
    <StorefrontPageShell
      title="Checkout could not be completed"
      description="Your order was not placed. No payment should be sent for this attempt."
    >
      <div className="max-w-xl space-y-4 rounded-lg border border-border bg-surface/60 p-6">
        <p className="text-sm text-text-muted">
          Common causes include invalid contact details, empty cart, or a product
          that is no longer purchasable. Review your cart and try again, or contact
          support if the problem persists.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button href="/checkout">Return to checkout</Button>
          <Button href="/cart" variant="secondary">
            View cart
          </Button>
          <Button href="/contact" variant="outline">
            Contact support
          </Button>
        </div>
      </div>
    </StorefrontPageShell>
  );
}
