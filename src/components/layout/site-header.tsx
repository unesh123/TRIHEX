"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  Menu,
  PackageSearch,
  Search,
  ShoppingBag,
  ShoppingCart,
  Truck,
  User,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildWhatsAppUrl,
  getWhatsAppDisplay,
} from "@/lib/whatsapp";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/ai-finder", label: "AI Finder 🎯" },
  { href: "/compare", label: "Compare" },
  { href: "/vault", label: "Vault ⚡" },
  { href: "/categories", label: "Categories" },
  { href: "/track-order", label: "Track order" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

const MOBILE_ACTIONS = [
  { href: "/", label: "Home", icon: ShoppingBag },
  { href: "/products", label: "Browse", icon: PackageSearch },
  { href: "/search", label: "Search", icon: Search },
  { href: "/track-order", label: "Track", icon: Truck },
  { href: "/account", label: "Account", icon: User },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
] as const;

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const waHref = buildWhatsAppUrl(
    "Hello TRIHEX DIGITAL. I need information about your products.",
  );

  const menuTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--border)]/80 bg-white/88 shadow-[0_8px_28px_rgba(13,28,43,.045)] backdrop-blur-xl">
        <div className="store-container flex h-[4.5rem] items-center justify-between gap-3">
          <Logo size="sm" />

          <nav className="hidden items-center gap-6 xl:flex" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-semibold transition-colors duration-150",
                  isActivePath(pathname, item.href)
                    ? "text-slate-900"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right actions: Search pill, Account, Cart */}
          <div className="hidden items-center gap-4 md:flex">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem("search") as HTMLInputElement;
                const q = input?.value?.trim();
                window.location.href = q ? `/search?q=${encodeURIComponent(q)}` : "/search";
              }}
              className="relative flex items-center"
            >
              <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="search"
                placeholder="Search products..."
                className="h-10 w-48 rounded-xl border border-slate-200/90 bg-slate-50/80 pl-10 pr-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition lg:w-60"
              />
            </form>

            <Link
              href="/account"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 transition hover:text-slate-900"
            >
              <User className="h-4 w-4" />
              <span>Sign in</span>
            </Link>

            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="View shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/cart"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm"
              aria-label="View Cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              id="mobile-nav"
              initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, height: 0 }}
              transition={menuTransition}
              className="overflow-hidden border-t border-[var(--border)] bg-white md:hidden"
            >
              <nav className="store-container grid gap-1 py-3" aria-label="Mobile">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-xl px-3 py-3 text-sm font-semibold transition-colors",
                      isActivePath(pathname, item.href)
                        ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                        : "text-[var(--text)] hover:bg-[var(--page-soft)]",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-3">
                  <Link
                    href="/track-order"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border-strong)] px-3 text-sm font-semibold text-[var(--text)]"
                    onClick={() => setOpen(false)}
                  >
                    Track order
                  </Link>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#1f9e5a] px-3 text-sm font-semibold text-white"
                    onClick={() => setOpen(false)}
                  >
                    WhatsApp
                  </a>
                </div>
              </nav>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-white/95 px-2 pb-[max(0.45rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden"
        aria-label="Quick actions"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {MOBILE_ACTIONS.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-h-13 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold transition-colors",
                  active
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--page-soft)] hover:text-[var(--text)]",
                )}
              >
                <Icon className="h-4.5 w-4.5" strokeWidth={2.2} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
