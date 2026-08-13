import { AccountShell } from "@/components/storefront/account-shell";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  return (
    <AccountShell
      title="Account"
      description="Manage orders, support, and preferences after sign-in."
    >
      <div className="mt-6 flex flex-wrap gap-3">
        <Button href="/track-order" variant="secondary">
          Track order without account
        </Button>
        <Button href="/contact" variant="outline">
          Contact support
        </Button>
      </div>
    </AccountShell>
  );
}
