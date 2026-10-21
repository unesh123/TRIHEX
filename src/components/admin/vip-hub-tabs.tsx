"use client";

import { useState } from "react";
import { Crown, Users, ShoppingBag, Clock, Sparkles } from "lucide-react";
import { VipMemberControlCenter } from "@/components/admin/vip-member-control-center";
import { VipVaultManager } from "@/components/admin/vip-vault-manager";
import { VipOrdersLiveFeed } from "@/components/admin/vip-orders-live-feed";
import type { VipMember } from "@/lib/vip/vip-member-store";
import type { VipVaultItem } from "@/lib/vip/vip-store";
import type { VipOrderRow } from "@/lib/vip/vip-order-store";

interface VipHubTabsProps {
  initialMembers: VipMember[];
  initialVaultItems: VipVaultItem[];
  initialOrders?: VipOrderRow[];
  defaultTab?: "orders" | "members" | "vault";
}

export function VipHubTabs({
  initialMembers,
  initialVaultItems,
  initialOrders = [],
  defaultTab = "orders",
}: VipHubTabsProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "members" | "vault">(defaultTab);

  const pendingOrdersCount = initialOrders.filter(
    (o) =>
      o.paymentStatus === "UNDER_REVIEW" ||
      o.orderStatus === "PROCESSING" ||
      o.orderStatus === "AWAITING_PAYMENT"
  ).length;

  return (
    <div className="space-y-6">
      {/* Tab Switcher Header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] pb-3">
        {/* Tab 1: VIP Package Orders Feed */}
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-150 cursor-pointer ${
            activeTab === "orders"
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-950/20"
              : "bg-white text-slate-600 border border-[var(--border)] hover:bg-slate-50"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>VIP Package Orders</span>
          <span
            className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
              activeTab === "orders"
                ? "bg-slate-950/20 text-slate-950"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {initialOrders.length}
          </span>
          {pendingOrdersCount > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-rose-500 text-white px-2 py-0.5 text-[10px] font-bold animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {pendingOrdersCount} New
            </span>
          )}
        </button>

        {/* Tab 2: VIP Members & Access Control */}
        <button
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-150 cursor-pointer ${
            activeTab === "members"
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-950/20"
              : "bg-white text-slate-600 border border-[var(--border)] hover:bg-slate-50"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>VIP Members &amp; Access Control</span>
          <span
            className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
              activeTab === "members"
                ? "bg-slate-950/20 text-slate-950"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {initialMembers.length}
          </span>
        </button>

        {/* Tab 3: VIP Vault Content & Drops */}
        <button
          onClick={() => setActiveTab("vault")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-150 cursor-pointer ${
            activeTab === "vault"
              ? "bg-slate-900 text-white shadow-md shadow-slate-950/20"
              : "bg-white text-slate-600 border border-[var(--border)] hover:bg-slate-50"
          }`}
        >
          <Crown className="h-4 w-4 text-amber-400" />
          <span>VIP Vault Content &amp; Drops</span>
          <span
            className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
              activeTab === "vault"
                ? "bg-slate-800 text-slate-200"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {initialVaultItems.length}
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "orders" ? (
        <VipOrdersLiveFeed initialOrders={initialOrders} />
      ) : activeTab === "members" ? (
        <VipMemberControlCenter initialMembers={initialMembers} />
      ) : (
        <VipVaultManager initialItems={initialVaultItems} />
      )}
    </div>
  );
}
