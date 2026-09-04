"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  navGroupsForRole,
  type AdminNavItem,
} from "@/components/admin/nav-config";
import { SystemHealthPanel } from "@/components/admin/system-health-panel";
import { Logo } from "@/components/brand/logo";
import type { SystemHealth } from "@/lib/admin/system-health";
import type { AppRole } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  role: AppRole;
  email: string | null;
  bypass: boolean;
  health: SystemHealth;
}

export function AdminSidebar({
  role,
  email,
  bypass,
  health,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const groups = navGroupsForRole(role);
  const [open, setOpen] = useState(false);

  const nav = (
    <>
      <div className="border-b border-border bg-[linear-gradient(180deg,#ffffff_0%,#f4f8fa_100%)] px-5 py-5">
        <Logo href="/admin" size="sm" />
        <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.17em] text-text-muted">Control center</p>
        {email ? (
          <p className="mt-1.5 truncate text-xs font-semibold text-text">{email}</p>
        ) : null}
        <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
          {role.replace(/_/g, " ")}
        </p>
        {bypass ? (
          <p className="mt-2 rounded-md border border-warning/40 bg-warning/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-warning">
            ADMIN_DEV_BYPASS
          </p>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin">
        {groups.map((group) => (
          <div key={group.id} className="mb-6">
            <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-text-muted">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  active={isActive(pathname, item.href)}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border bg-[var(--page-soft)]/55">
        <SystemHealthPanel health={health} />
      </div>
    </>
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-border bg-white px-4 py-3.5 shadow-sm lg:hidden">
        <Logo href="/admin" size="sm" />
        <button
          type="button"
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-bold text-text shadow-sm transition hover:border-primary/40 hover:text-primary"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-mobile-nav"
        >
          {open ? "Close menu" : "Menu"}
        </button>
      </div>

      {open ? (
        <div
          id="admin-mobile-nav"
          className="fixed inset-0 z-40 flex lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-80 max-w-[88vw] flex-col bg-surface shadow-2xl">
            {nav}
          </aside>
        </div>
      ) : null}

      <aside className="sticky top-0 hidden h-screen w-[17rem] shrink-0 flex-col border-r border-border bg-white/95 backdrop-blur-sm lg:flex">
        {nav}
      </aside>
    </>
  );
}

function SidebarLink({
  item,
  active,
  onNavigate,
}: {
  item: AdminNavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "relative block rounded-xl px-3 py-2.5 text-sm font-semibold transition-[background-color,color,transform] duration-200",
          active
            ? "bg-[var(--surface-ink)] font-bold text-white shadow-[0_8px_18px_rgba(11,34,53,.16)]"
            : "text-text-muted hover:-translate-y-0.5 hover:bg-surface-raised hover:text-text",
        )}
      >
        {item.label}
      </Link>
    </li>
  );
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/payments") {
    return pathname === "/admin/payments";
  }
  if (href === "/admin/payments/review") {
    return pathname.startsWith("/admin/payments/review");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
