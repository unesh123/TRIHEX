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
      <div className="border-b border-border px-4 py-4">
        <Logo href="/admin" size="sm" />
        <p className="mt-3 text-xs text-text-muted">Control center</p>
        {email ? (
          <p className="mt-1 truncate text-xs text-text">{email}</p>
        ) : null}
        <p className="mt-1 text-[10px] uppercase tracking-wide text-text-muted">
          {role.replace(/_/g, " ")}
        </p>
        {bypass ? (
          <p className="mt-2 rounded-md border border-warning/40 bg-warning/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-warning">
            ADMIN_DEV_BYPASS
          </p>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Admin">
        {groups.map((group) => (
          <div key={group.id} className="mb-4">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
              {group.label}
            </p>
            <ul className="space-y-0.5">
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

      <div className="border-t border-border">
        <SystemHealthPanel health={health} />
      </div>
    </>
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <Logo href="/admin" size="sm" />
        <button
          type="button"
          className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-text"
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
          <aside className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col bg-surface shadow-xl">
            {nav}
          </aside>
        </div>
      ) : null}

      <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-border bg-surface/95 backdrop-blur-sm lg:flex">
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
          "block rounded-lg px-3 py-2 text-sm transition-colors",
          active
            ? "bg-primary/15 font-medium text-text"
            : "text-text-muted hover:bg-surface-raised hover:text-text",
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
