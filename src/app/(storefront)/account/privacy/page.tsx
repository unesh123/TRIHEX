import Link from "next/link";
import { AccountShell } from "@/components/storefront/account-shell";

export default function AccountPrivacyPage() {
  return (
    <AccountShell
      title="Account privacy"
      description="Download or delete account data after authentication is enabled."
    >
      <p className="mt-6 text-sm text-text-muted">
        See also our public{" "}
        <Link href="/privacy" className="text-primary hover:underline">
          privacy policy
        </Link>
        .
      </p>
    </AccountShell>
  );
}
