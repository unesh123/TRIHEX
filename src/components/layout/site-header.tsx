"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ChevronDown,
  Menu,
  PackageSearch,
  Search,
  ShoppingBag,
  ShoppingCart,
  Truck,
  User,
  X,
  Sparkles,
  Flame,
  Zap,
  Cpu,
  BookOpen,
  Map,
  Scale,
  GitCompare,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import {
  buildWhatsAppUrl,
} from "@/lib/whatsapp";
import { CommandPalette } from "@/components/search/command-palette";

const PRIMARY_NAV = [
  { href: "/products", label: "Products" },
  { href: "/vault", label: "Vault 🔥" },
  { href: "/ai-finder", label: "AI Finder 🎯" },
  { href: "/prompts", label: "Prompts ⚡" },
  { href: "/nepal", label: "Nepal 🇳🇵" },
] as const;

const EXPLORE_ITEMS = [
  { href: "/deals", label: "Verified Deals Radar", icon: Flame, desc: "Direct software savings, coupons & perks" },
  { href: "/skills", label: "Agent Skills Library", icon: Cpu, desc: "Multi-file skills for coding agents" },
  { href: "/guides", label: "Technical Guides", icon: BookOpen, desc: "Whitepapers & student blueprints" },
  { href: "/nepal", label: "Nepal Pulse 🇳🇵", icon: Zap, desc: "Live NRB Forex & USGS seismic feed" },
  { href: "/map", label: "Interactive Map 🗺️", icon: Map, desc: "Geospatial civic explorer" },
  { href: "/vault/research", label: "Research Vault", icon: Scale, desc: "Audited public court dockets" },
  { href: "/compare", label: "Product Compare", icon: GitCompare, desc: "Side-by-side feature matrix" },
] as const;

const MOBILE_ACTIONS = [
  { href: "/", label: "Home", icon: ShoppingBag },
  { href: "/products", label: "Browse", icon: PackageSearch },
  { href: "/search", label: "Search", icon: Search },
  { href: "/vault", label: "Vault", icon: Flame },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
] as const;

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const waHref = buildWhatsAppUrl(
    "Hello TRIHEX DIGITAL. I need information about your products.",
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExploreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openPalette = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  const menuTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <>
      <CommandPalette />

      <header className="sticky top-0 z-40 border-b border-[var(--border)]/80 bg-white/90 shadow-[0_8px_28px_rgba(13,28,43,.045)] backdrop-blur-xl">
        <div className="store-container flex h-[4.5rem] items-center justify-between gap-3">
          <Logo size="sm" />

          {/* Desktop Primary Nav with Explore Dropdown */}
          <nav className="hidden items-center gap-5 xl:flex" aria-label="Primary">
            <Link
              href="/"
              className={cn(
                "text-sm font-semibold transition-colors duration-150",
                pathname === "/" ? "text-slate-900" : "text-slate-600 hover:text-slate-900",
              )}
            >
              Home
            </Link>

            {PRIMARY_NAV.map((item) => (
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

            {/* Explore Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setExploreOpen(!exploreOpen)}
                className={cn(
                  "inline-flex items-center gap-1 text-sm font-semibold transition-colors duration-150",
                  exploreOpen ? "text-slate-900" : "text-slate-600 hover:text-slate-900",
                )}
              >
                <span>Explore</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", exploreOpen ? "rotate-180" : "")} />
              </button>

              {exploreOpen && (
                <div className="absolute left-0 top-full mt-3 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 z-50">
                  <div className="space-y-1">
                    {EXPLORE_ITEMS.map((sub) => {
                      const Icon = sub.icon;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setExploreOpen(false)}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition group"
                        >
                          <div className="p-2 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                              {sub.label}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {sub.desc}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/faq"
              className={cn(
                "text-sm font-semibold transition-colors duration-150",
                isActivePath(pathname, "/faq") ? "text-slate-900" : "text-slate-600 hover:text-slate-900",
              )}
            >
              FAQ
            </Link>
          </nav>

          {/* Right actions: Search pill with Cmd+K, Account, Cart */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={openPalette}
              className="flex items-center justify-between h-10 w-48 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 text-xs font-medium text-slate-400 hover:border-slate-300 hover:bg-white transition lg:w-56"
            >
              <span className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <span>Search everything...</span>
              </span>
              <kbd className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
                ⌘K
              </kbd>
            </button>

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

          <div className="flex items-center gap-1.5 sm:gap-2 md:hidden shrink-0">
            <button
              type="button"
              onClick={openPalette}
              className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link
              href="/cart"
              className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm"
              aria-label="View Cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </Link>
            <button
              type="button"
              className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Full Menu */}
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
                <Link
                  href="/"
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                    pathname === "/" ? "bg-[var(--primary-soft)] text-[var(--primary)]" : "text-[var(--text)] hover:bg-[var(--page-soft)]",
                  )}
                  onClick={() => setOpen(false)}
                >
                  Home
                </Link>

                {PRIMARY_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                      isActivePath(pathname, item.href)
                        ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                        : "text-[var(--text)] hover:bg-[var(--page-soft)]",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="pt-2 pb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Explore Hubs
                </div>

                {EXPLORE_ITEMS.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                      isActivePath(pathname, sub.href)
                        ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                        : "text-slate-600 hover:bg-[var(--page-soft)]",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <sub.icon className="w-3.5 h-3.5" />
                    <span>{sub.label}</span>
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
