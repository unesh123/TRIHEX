import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl, getWhatsAppDisplay } from "@/lib/whatsapp";

export default function ContactPage() {
  const waUrl = buildWhatsAppUrl(
    "Hello TRIHEX DIGITAL. I would like to get in touch about your products or an order.",
  );

  return (
    <StorefrontPageShell
      title="Contact & support"
      description="Reach TRIHEX for product questions, orders, and payment verification."
    >
      <div className="max-w-xl space-y-6">
        <p className="text-sm text-text-muted">
          For fastest order help, include your website order number. For payment
          verification, use the WhatsApp link from your checkout success page when
          possible.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button href={waUrl} external variant="whatsapp">
            WhatsApp {getWhatsAppDisplay()}
          </Button>
          <Button href="/track-order" variant="secondary">
            Track order
          </Button>
          <Button href="/faq" variant="outline">
            FAQ
          </Button>
        </div>
        <p className="text-xs text-text-muted">
          Email support will be published here when operational addresses are
          confirmed for production.
        </p>
      </div>
    </StorefrontPageShell>
  );
}
