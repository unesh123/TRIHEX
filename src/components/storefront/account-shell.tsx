import Link from "next/link";
import { StorefrontPageShell } from "@/components/storefront/page-shell";

const ACCOUNT_LINKS = [
  { href: "/account/orders", label: "Orders" },
  { href: "/account/support", label: "Support" },
  { href: "/account/warranty", label: "Warranty" },
  { href: "/account/preferences", label: "Preferences" },
  { href: "/account/privacy", label: "Privacy" },
] as const;

interface AccountShellProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function AccountShell({ title, description, children }: AccountShellProps) {
  return (
    <StorefrontPageShell title={title} description={description}>
      <div className="rounded-lg border border-border bg-surface-raised/60 p-5">
        <p className="text-sm leading-relaxed text-text-muted">
          No login needed for order history on this device. Orders you place are
          saved locally so you can track them anytime. For live status, use Track
          order with your order number + email/phone.
        </p>
      </div>
      <nav
        className="mt-8 flex flex-wrap gap-2"
        aria-label="Account sections"
      >
        {ACCOUNT_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full border border-border px-3 py-1.5 text-sm text-text-muted transition hover:border-primary hover:text-text"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {children ? <div className="mt-8">{children}</div> : null}
    </StorefrontPageShell>
  );
}
