"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildWhatsAppUrl,
  getWhatsAppDisplay,
} from "@/lib/whatsapp";

const NAV = [
  { href: "/products", label: "Products" },
  { href: "/inquire", label: "Inquire list" },
  { href: "/ai-tools-nepal", label: "AI Tools" },
  { href: "/blog", label: "Blog" },
  { href: "/deals", label: "Deals" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const waHref = buildWhatsAppUrl(
    "Hello TRIHEX DIGITAL. I need information about your products.",
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/95 backdrop-blur-md">
      <div className="store-container flex h-16 items-center justify-between gap-4">
        <Logo size="sm" />

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-2.5 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--page-soft)] hover:text-[var(--text)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/search"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Search
          </Link>
          <Link
            href="/track-order"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Track Order
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "whatsapp", size: "sm" }))}
            aria-label={`WhatsApp ${getWhatsAppDisplay()}`}
          >
            WhatsApp
          </a>
          <Link
            href="/account"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Account
          </Link>
          <Link
            href="/cart"
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            Cart
          </Link>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <Link
            href="/cart"
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            Cart
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--text)]"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="flex flex-col gap-1.5" aria-hidden>
              <span
                className={cn(
                  "block h-0.5 w-5 bg-[var(--text)] transition-transform",
                  open && "translate-y-2 rotate-45",
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5 bg-[var(--text)] transition-opacity",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5 bg-[var(--text)] transition-transform",
                  open && "-translate-y-2 -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-[var(--border)] bg-white xl:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav
          className="store-container flex flex-col gap-1 py-3"
          aria-label="Mobile"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-3 text-sm font-medium text-[var(--text)] hover:bg-[var(--page-soft)]"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/search"
            className="rounded-lg px-3 py-3 text-sm font-medium"
            onClick={() => setOpen(false)}
          >
            Search
          </Link>
          <Link
            href="/track-order"
            className="rounded-lg px-3 py-3 text-sm font-medium"
            onClick={() => setOpen(false)}
          >
            Track Order
          </Link>
          <Link
            href="/account"
            className="rounded-lg px-3 py-3 text-sm font-medium"
            onClick={() => setOpen(false)}
          >
            Account
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 rounded-xl bg-[#1f9e5a] px-3 py-3 text-center text-sm font-semibold text-white"
            onClick={() => setOpen(false)}
          >
            WhatsApp {getWhatsAppDisplay()}
          </a>
        </nav>
      </div>
    </header>
  );
}
