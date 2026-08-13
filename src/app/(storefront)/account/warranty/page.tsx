import Link from "next/link";
import { AccountShell } from "@/components/storefront/account-shell";

export default function AccountWarrantyPage() {
  return (
    <AccountShell
      title="Warranty"
      description="Warranty claims require sign-in and order verification."
    >
      <p className="mt-6 text-sm text-text-muted">
        Read our{" "}
        <Link href="/warranty-policy" className="text-primary hover:underline">
          warranty policy
        </Link>{" "}
        for eligible products and services.
      </p>
    </AccountShell>
  );
}
