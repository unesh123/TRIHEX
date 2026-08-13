import { AccountShell } from "@/components/storefront/account-shell";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl, getWhatsAppDisplay } from "@/lib/whatsapp";

export default function AccountSupportPage() {
  const waUrl = buildWhatsAppUrl(
    "Hello TRIHEX DIGITAL. I need help with my account or an order.",
  );

  return (
    <AccountShell
      title="Account support"
      description="Signed-in support tickets will appear here when enabled."
    >
      <Button href={waUrl} external variant="whatsapp" className="mt-6">
        WhatsApp {getWhatsAppDisplay()}
      </Button>
    </AccountShell>
  );
}
