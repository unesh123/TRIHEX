import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ComplianceDisclaimer } from "@/components/storefront/compliance-disclaimer";

const SHOP = [
  { href: "/products", label: "All products" },
  { href: "/inquire", label: "Check availability list" },
  { href: "/blog", label: "Blog & guides" },
  { href: "/ai-tools-nepal", label: "AI tools Nepal" },
  { href: "/categories", label: "Categories" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing-transparency", label: "Pricing transparency" },
  { href: "/verified-supply", label: "Authorized supply" },
] as const;

const SUPPORT = [
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact / Support" },
  { href: "/track-order", label: "Track order" },
  { href: "/grievance", label: "Grievance redressal" },
] as const;

const LEGAL = [
  { href: "/terms", label: "Terms of service" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/refund-policy", label: "Refund policy" },
  { href: "/warranty-policy", label: "Warranty policy" },
  { href: "/delivery-policy", label: "Delivery policy" },
  { href: "/acceptable-use", label: "Acceptable use" },
  { href: "/business-disclosures", label: "Business disclosures" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-1">
          <Logo href="/" size="sm" />
          <p className="max-w-xs text-sm leading-relaxed text-text-muted">
            Nepal-first digital products with verified access paths and clear
            pricing. Affiliation is stated only where verified.
          </p>
          <Link
            href="/business-disclosures"
            className="inline-block text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            Business disclosures
          </Link>
        </div>

        <FooterColumn title="Shop" links={SHOP} />
        <FooterColumn title="Support" links={SUPPORT} />
        <FooterColumn title="Legal" links={LEGAL} />
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl space-y-3 px-4 py-6 sm:px-6">
          <ComplianceDisclaimer />
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} TRIHEX DIGITAL. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-text">
        {title}
      </h2>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-text-muted transition-colors hover:text-text"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
