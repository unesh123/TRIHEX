"use client";

import { useState } from "react";
import {
  Crown,
  Search,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Copy,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Zap,
  Filter,
  Check,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Gift,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { formatNpr } from "@/lib/money";
import type { VipOrderRow } from "@/lib/vip/vip-order-store";
import type { VipTag } from "@/lib/vip/vip-member-store";

interface VipOrdersLiveFeedProps {
  initialOrders: VipOrderRow[];
  onOrderUpdated?: () => void;
}

export function VipOrdersLiveFeed({
  initialOrders,
  onOrderUpdated,
}: VipOrdersLiveFeedProps) {
  const [orders, setOrders] = useState<VipOrderRow[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Lightbox Modal for Payment Screenshot
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);
  const [previewProofOrderNum, setPreviewProofOrderNum] = useState<string | null>(null);

  // Approve & Grant VIP Modal State
  const [approveModalOrder, setApproveModalOrder] = useState<VipOrderRow | null>(null);
  const [grantBonusDays, setGrantBonusDays] = useState<number>(0);
  const [grantBonusPerk, setGrantBonusPerk] = useState<string>("");
  const [grantTag, setGrantTag] = useState<VipTag>("VIP");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [isApproving, setIsApproving] = useState<boolean>(false);

  // Copy to clipboard helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Build WhatsApp Message URL
  const buildWhatsAppUrl = (order: VipOrderRow, memberToken?: string) => {
    const cleanPhone = order.customerPhone.replace(/\D/g, "");
    const nepPhone = cleanPhone.startsWith("977") ? cleanPhone : `977${cleanPhone}`;
    const token = memberToken || `THX-VIP-${order.tier}-${order.orderNumber.slice(-6)}`;
    const bonusText =
      order.bonusDays && order.bonusDays > 0
        ? `\n🎁 Exclusive Bonus: +${order.bonusDays} Free Days Added!`
        : "";

    const text = encodeURIComponent(
      `Namaste ${order.customerName}! 👑\n\n` +
      `Your TRIHEX VIP Access order is confirmed!\n\n` +
      `📦 Package: ${order.tierTitle}\n` +
      `🔖 Order #: ${order.orderNumber}\n` +
      `💰 Amount: Rs. ${order.amountNpr.toLocaleString()}\n` +
      `⚡ VIP Clearance: ACTIVE\n` +
      `🔑 VIP Access Token: ${token}${bonusText}\n\n` +
      `You can track your order & clearance anytime:\n` +
      `https://trihexdigital.shop/track-order?phone=${encodeURIComponent(order.customerPhone)}\n\n` +
      `Unlock your VIP Vault assets:\n` +
      `https://trihexdigital.shop/vip\n\n` +
      `Thank you for powering with TRIHEX Digital!`
    );

    return `https://wa.me/${nepPhone}?text=${text}`;
  };

  // 1-Click Status Modifier
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch("/api/admin/vip-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_STATUS",
          orderId,
          status: newStatus,
          notes: `Status changed to ${newStatus} via VIP Command Feed`,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...data.order } : o))
        );
        if (onOrderUpdated) onOrderUpdated();
      } else {
        alert(data.error || "Failed to update order status.");
      }
    } catch (err) {
      console.error("Status update error", err);
      alert("Network error updating status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Open Approval Modal
  const openApproveModal = (order: VipOrderRow) => {
    setApproveModalOrder(order);
    setGrantTag(order.tier === "6_MONTHS" ? "PRO" : "VIP");
    if (order.tier === "1_MONTH") {
      setGrantBonusDays(7);
      setGrantBonusPerk("Standard Fast-Track Support");
    } else if (order.tier === "6_MONTHS") {
      setGrantBonusDays(30);
      setGrantBonusPerk("Midjourney & Lovable Pro Prompts Pack");
    } else if (order.tier === "LIFETIME") {
      setGrantBonusDays(0);
      setGrantBonusPerk("Priority Founder Hotline & Uncapped AI Leaks");
    }
    setAdminNotes(`Approved payment & granted VIP clearance for Order #${order.orderNumber}`);
  };

  // Execute Approval & Activation with Bonuses
  const handleConfirmApproval = async () => {
    if (!approveModalOrder) return;
    setIsApproving(true);

    try {
      const res = await fetch("/api/admin/vip-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "APPROVE_ACTIVATE",
          orderId: approveModalOrder.id,
          bonusDays: grantBonusDays,
          bonusPerk: grantBonusPerk,
          customTag: grantTag,
          adminNotes,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === approveModalOrder.id
              ? {
                  ...o,
                  orderStatus: "FULFILLED",
                  paymentStatus: "PAID",
                  fulfillmentStatus: "DELIVERED",
                  isMemberActive: true,
                  currentVipTag: grantTag,
                  bonusDays: (o.bonusDays || 0) + grantBonusDays,
                  bonusPerks: grantBonusPerk
                    ? [...(o.bonusPerks || []), grantBonusPerk]
                    : o.bonusPerks,
                }
              : o
          )
        );

        const waUrl = buildWhatsAppUrl(
          approveModalOrder,
          data.member?.verificationToken
        );
        setApproveModalOrder(null);
        if (onOrderUpdated) onOrderUpdated();

        // Prompt WhatsApp dispatch
        if (
          confirm(
            `VIP Access for ${approveModalOrder.customerName} is now ACTIVE! 👑\n\nWould you like to open WhatsApp to send the activation & token message?`
          )
        ) {
          window.open(waUrl, "_blank");
        }
      } else {
        alert(data.error || "Failed to approve and activate VIP.");
      }
    } catch (err) {
      console.error("Approval error", err);
      alert("Network error processing approval.");
    } finally {
      setIsApproving(false);
    }
  };

  // Filter logic
  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      (o.senderReference && o.senderReference.toLowerCase().includes(q)) ||
      (o.notes && o.notes.toLowerCase().includes(q));

    let matchesTier = true;
    if (tierFilter !== "ALL") {
      matchesTier = o.tier === tierFilter;
    }

    let matchesStatus = true;
    if (statusFilter === "PENDING") {
      matchesStatus =
        o.orderStatus === "PROCESSING" ||
        o.orderStatus === "AWAITING_PAYMENT" ||
        o.paymentStatus === "UNDER_REVIEW" ||
        o.paymentStatus === "UNPAID";
    } else if (statusFilter === "PAID") {
      matchesStatus = o.paymentStatus === "PAID" || o.orderStatus === "PAID";
    } else if (statusFilter === "FULFILLED") {
      matchesStatus = o.orderStatus === "FULFILLED";
    } else if (statusFilter === "CANCELLED") {
      matchesStatus = o.orderStatus === "CANCELLED";
    }

    return matchesSearch && matchesTier && matchesStatus;
  });

  // KPI Calculations
  const totalRevenueNpr = orders
    .filter((o) => o.paymentStatus === "PAID" || o.orderStatus === "FULFILLED" || o.orderStatus === "PAID")
    .reduce((sum, o) => sum + o.amountNpr, 0);

  const pendingApprovalsCount = orders.filter(
    (o) =>
      o.paymentStatus === "UNDER_REVIEW" ||
      o.orderStatus === "PROCESSING" ||
      o.orderStatus === "AWAITING_PAYMENT"
  ).length;

  const count1Month = orders.filter((o) => o.tier === "1_MONTH").length;
  const count6Months = orders.filter((o) => o.tier === "6_MONTHS").length;
  const countLifetime = orders.filter((o) => o.tier === "LIFETIME").length;

  return (
    <div className="space-y-6">
      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
            <Crown className="h-4 w-4" />
            <span>Total VIP Revenue</span>
          </div>
          <div className="text-xl font-black text-amber-300 font-mono">
            {formatNpr(totalRevenueNpr * 100)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Verified Collections</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border border-rose-500/30 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 mb-1">
            <Clock className="h-4 w-4" />
            <span>Pending Approvals</span>
          </div>
          <div className="text-xl font-black text-rose-300 font-mono">
            {pendingApprovalsCount}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Requires Verification</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Lifetime Passes</span>
          </div>
          <div className="text-xl font-black text-purple-300 font-mono">
            {countLifetime}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Rs. 7,999 Permanent</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/30 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-1">
            <Zap className="h-4 w-4" />
            <span>6-Month Passes</span>
          </div>
          <div className="text-xl font-black text-cyan-300 font-mono">
            {count6Months}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Rs. 5,999 (180 Days)</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>1-Month Passes</span>
          </div>
          <div className="text-xl font-black text-emerald-300 font-mono">
            {count1Month}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Rs. 3,999 (30 Days)</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
            <Filter className="h-4 w-4" />
            <span>Total VIP Orders</span>
          </div>
          <div className="text-xl font-black text-white font-mono">
            {orders.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">All Time Placed</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-md p-4 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search VIP orders by customer name, phone 98XXXXXXXX, order #, ref code..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Tier Filters */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <button
              onClick={() => setTierFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tierFilter === "ALL"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
            >
              All Packages ({orders.length})
            </button>
            <button
              onClick={() => setTierFilter("LIFETIME")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tierFilter === "LIFETIME"
                  ? "bg-gradient-to-r from-purple-500 to-amber-500 text-slate-950 shadow-md"
                  : "bg-slate-800 text-purple-300 hover:bg-purple-950/40"
              }`}
            >
              👑 Lifetime Rs. 7,999 ({countLifetime})
            </button>
            <button
              onClick={() => setTierFilter("6_MONTHS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tierFilter === "6_MONTHS"
                  ? "bg-cyan-500 text-slate-950 shadow-md"
                  : "bg-slate-800 text-cyan-300 hover:bg-cyan-950/40"
              }`}
            >
              ⚡ 6 Months Rs. 5,999 ({count6Months})
            </button>
            <button
              onClick={() => setTierFilter("1_MONTH")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tierFilter === "1_MONTH"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "bg-slate-800 text-emerald-300 hover:bg-emerald-950/40"
              }`}
            >
              🔰 1 Month Rs. 3,999 ({count1Month})
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-slate-500 self-center font-bold">Status:</span>
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-2.5 py-1 rounded-md font-semibold ${
              statusFilter === "ALL" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 ${
              statusFilter === "PENDING"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                : "text-slate-400 hover:text-rose-400"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
            Pending Verification ({pendingApprovalsCount})
          </button>
          <button
            onClick={() => setStatusFilter("PAID")}
            className={`px-2.5 py-1 rounded-md font-semibold ${
              statusFilter === "PAID"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-emerald-400"
            }`}
          >
            Paid / Active
          </button>
          <button
            onClick={() => setStatusFilter("CANCELLED")}
            className={`px-2.5 py-1 rounded-md font-semibold ${
              statusFilter === "CANCELLED"
                ? "bg-slate-800 text-slate-300 border border-slate-700"
                : "text-slate-500 hover:text-slate-400"
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
            <Crown className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No VIP Orders Found</h3>
            <p className="text-sm text-slate-400 mt-1">
              {searchQuery
                ? "Try searching for a different customer name, phone number, or clear your filters."
                : "VIP package orders placed via the checkout page will appear here automatically."}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isPending =
              order.paymentStatus === "UNDER_REVIEW" ||
              order.orderStatus === "PROCESSING" ||
              order.orderStatus === "AWAITING_PAYMENT";
            const isFulfilled =
              order.orderStatus === "FULFILLED" || order.paymentStatus === "PAID";
            const isCancelled = order.orderStatus === "CANCELLED";

            return (
              <div
                key={order.id}
                className={`relative rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isPending
                    ? "border-rose-500/40 bg-gradient-to-r from-rose-950/20 via-slate-900/90 to-slate-950 shadow-lg shadow-rose-950/20"
                    : isFulfilled
                    ? "border-emerald-500/30 bg-slate-900/80 shadow-md"
                    : "border-slate-800 bg-slate-900/60"
                }`}
              >
                {/* Glowing Top Tier Bar */}
                <div
                  className={`h-1 w-full ${
                    order.tier === "LIFETIME"
                      ? "bg-gradient-to-r from-purple-500 via-amber-400 to-purple-600"
                      : order.tier === "6_MONTHS"
                      ? "bg-gradient-to-r from-cyan-400 to-blue-500"
                      : "bg-gradient-to-r from-emerald-400 to-teal-500"
                  }`}
                />

                <div className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                  {/* Left Column: Order details & Customer */}
                  <div className="space-y-3 flex-1 min-w-[280px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-black text-white">
                        {order.orderNumber}
                      </span>
                      <button
                        onClick={() => handleCopy(order.orderNumber, `order-${order.id}`)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
                        title="Copy Order Number"
                      >
                        {copiedText === `order-${order.id}` ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {/* Tier Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 ${
                          order.tier === "LIFETIME"
                            ? "bg-gradient-to-r from-amber-400 to-purple-400 text-slate-950 shadow-md shadow-amber-900/30"
                            : order.tier === "6_MONTHS"
                            ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950"
                            : "bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950"
                        }`}
                      >
                        <Crown className="h-3 w-3" />
                        {order.tierTitle.split("(")[0].trim()}
                      </span>

                      {/* Payment Status Pill */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                          order.paymentStatus === "PAID"
                            ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                            : order.paymentStatus === "UNDER_REVIEW"
                            ? "bg-rose-950/80 text-rose-300 border border-rose-500/40"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        Payment: {order.paymentStatus}
                      </span>

                      {/* Date */}
                      <span className="text-[11px] text-slate-500">
                        {new Date(order.placedAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Customer Profile */}
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="font-bold text-white text-sm">
                        {order.customerName}
                      </div>

                      {/* Mobile Phone with 1-click WhatsApp */}
                      <div className="flex items-center gap-1.5 text-slate-300 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800">
                        <Phone className="h-3 w-3 text-emerald-400" />
                        <span className="font-mono font-bold">{order.customerPhone}</span>
                        <button
                          onClick={() => handleCopy(order.customerPhone, `phone-${order.id}`)}
                          className="text-slate-400 hover:text-white ml-0.5"
                          title="Copy Phone"
                        >
                          {copiedText === `phone-${order.id}` ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>

                      {order.customerEmail && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Mail className="h-3 w-3" />
                          <span>{order.customerEmail}</span>
                        </div>
                      )}

                      {/* Correlated VIP Member Tag */}
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-slate-500">Member Status:</span>
                        {order.isMemberActive ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            👑 ACTIVE ({order.currentVipTag || "VIP"})
                          </span>
                        ) : order.isLocked ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            🔒 CIPHER-LOCKED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            ⏳ Unverified
                          </span>
                        )}
                        {order.bonusDays && order.bonusDays > 0 ? (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                            +{order.bonusDays}d Bonus
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Order Notes / Payment Ref */}
                    <div className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-300">Method:</span>
                        <span className="text-white font-mono">{order.paymentMethod}</span>
                        {order.senderReference && (
                          <>
                            <span className="text-slate-600">·</span>
                            <span className="font-semibold text-slate-300">Ref:</span>
                            <span className="text-amber-300 font-mono font-bold">
                              {order.senderReference}
                            </span>
                          </>
                        )}
                      </div>
                      {order.notes && (
                        <span className="text-[11px] text-slate-400 italic">
                          {order.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Price & Proof Thumbnail */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:px-4 lg:border-l lg:border-r border-slate-800">
                    <div className="text-left sm:text-right">
                      <div className="text-2xl font-black text-amber-300 font-mono tracking-tight">
                        Rs. {order.amountNpr.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {order.tier === "LIFETIME"
                          ? "Lifetime VIP"
                          : order.tier === "6_MONTHS"
                          ? "180 Days VIP"
                          : "30 Days VIP"}
                      </div>
                    </div>

                    {/* Screenshot Preview */}
                    {order.proofUrl ? (
                      <button
                        onClick={() => {
                          setPreviewProofUrl(order.proofUrl);
                          setPreviewProofOrderNum(order.orderNumber);
                        }}
                        className="group relative h-16 w-16 rounded-xl overflow-hidden border border-amber-500/40 bg-slate-950 flex items-center justify-center hover:scale-105 transition"
                        title="Click to view payment screenshot"
                      >
                        <img
                          src={order.proofUrl}
                          alt="Payment Screenshot"
                          className="h-full w-full object-cover opacity-90 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <Eye className="h-4 w-4 text-white" />
                        </div>
                      </button>
                    ) : (
                      <div className="h-14 w-14 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 flex flex-col items-center justify-center text-[9px] text-slate-600 text-center px-1">
                        <ImageIcon className="h-3.5 w-3.5 mb-0.5 opacity-50" />
                        <span>No Slip</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Status Modifier & VIP Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2.5 w-full lg:w-auto min-w-[210px]">
                    {/* Status Changer Select */}
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Status:
                      </label>
                      <select
                        value={order.orderStatus}
                        disabled={updatingOrderId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`flex-1 text-xs font-bold font-mono py-1.5 px-2.5 rounded-xl border bg-slate-950 focus:outline-none transition ${
                          order.orderStatus === "FULFILLED" || order.orderStatus === "PAID"
                            ? "text-emerald-300 border-emerald-500/50"
                            : order.orderStatus === "PROCESSING"
                            ? "text-rose-300 border-rose-500/50"
                            : order.orderStatus === "CANCELLED"
                            ? "text-slate-400 border-slate-700"
                            : "text-amber-300 border-amber-500/50"
                        }`}
                      >
                        <option value="AWAITING_PAYMENT">Awaiting Payment</option>
                        <option value="PROCESSING">Processing / Under Review</option>
                        <option value="PAID">Paid (Payment Verified)</option>
                        <option value="FULFILLED">Fulfilled &amp; VIP Active</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>

                    {/* 1-Click Approve & Grant VIP Button */}
                    <button
                      onClick={() => openApproveModal(order)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                        order.isMemberActive
                          ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                          : "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-amber-950/40"
                      }`}
                    >
                      <Crown className="h-3.5 w-3.5" />
                      <span>{order.isMemberActive ? "Modify VIP & Bonuses" : "Approve & Grant VIP"}</span>
                    </button>

                    {/* WhatsApp Dispatch Button */}
                    <a
                      href={buildWhatsAppUrl(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600 hover:text-slate-950 transition"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Dispatch WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Lightbox Modal for Payment Screenshot */}
      {previewProofUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewProofUrl(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ImageIcon className="h-4 w-4 text-amber-400" />
                <span>Payment Screenshot · {previewProofOrderNum}</span>
              </div>
              <button
                onClick={() => setPreviewProofUrl(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="py-4 flex justify-center max-h-[70vh] overflow-auto">
              <img
                src={previewProofUrl}
                alt="Payment Slip Proof"
                className="max-h-[65vh] object-contain rounded-xl border border-slate-800"
              />
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setPreviewProofUrl(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve & Grant VIP Modal */}
      {approveModalOrder && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => !isApproving && setApproveModalOrder(null)}
        >
          <div
            className="relative max-w-lg w-full bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Approve &amp; Activate VIP Clearance
                  </h3>
                  <p className="text-xs text-slate-400">
                    Order {approveModalOrder.orderNumber} · {approveModalOrder.customerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isApproving && setApproveModalOrder(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Customer & Package Overview */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Package:</span>
                <span className="text-amber-300 font-bold font-mono">
                  {approveModalOrder.tierTitle}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Paid Amount:</span>
                <span className="text-white font-mono font-bold">
                  Rs. {approveModalOrder.amountNpr.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Registered Phone:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {approveModalOrder.customerPhone}
                </span>
              </div>
            </div>

            {/* VIP Tag Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Assign VIP Tag to Customer:</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["VIP", "PRO", "STARTER", "NORMAL"] as VipTag[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setGrantTag(t)}
                    className={`py-2 px-2 rounded-xl text-xs font-black transition-all ${
                      grantTag === t
                        ? t === "VIP"
                          ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40"
                          : t === "PRO"
                          ? "bg-cyan-400 text-slate-950 shadow-md shadow-cyan-950/40"
                          : t === "STARTER"
                          ? "bg-emerald-400 text-slate-950 shadow-md shadow-emerald-950/40"
                          : "bg-slate-700 text-white"
                        : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* VIP Bonus Days Allocator */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Gift className="h-3.5 w-3.5 text-purple-400" />
                  <span>VIP Bonus Days (+Extension):</span>
                </span>
                <span className="text-purple-300 font-mono font-bold text-xs">
                  {grantBonusDays > 0 ? `+${grantBonusDays} Days Added` : "Standard Duration"}
                </span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 7, 15, 30, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setGrantBonusDays(d)}
                    className={`py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                      grantBonusDays === d
                        ? "bg-purple-600 text-white shadow-md shadow-purple-950/40"
                        : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                    }`}
                  >
                    {d === 0 ? "None" : `+${d}d`}
                  </button>
                ))}
              </div>
            </div>

            {/* Bonus Perk Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                <span>Special VIP Bonus Perk:</span>
              </label>
              <input
                type="text"
                value={grantBonusPerk}
                onChange={(e) => setGrantBonusPerk(e.target.value)}
                placeholder="e.g. Priority Founder Hotline, Lovable Prompts Pack..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
              />
              <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
                {[
                  "Priority Founder Hotline",
                  "Uncapped AI Leaks",
                  "Free Agent Setup Consultation",
                  "Midjourney Pro Prompts Pack",
                ].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setGrantBonusPerk(p)}
                    className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-300"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Internal Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Admin Note / Audit Reason:
              </label>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3 justify-end border-t border-slate-800">
              <button
                type="button"
                disabled={isApproving}
                onClick={() => setApproveModalOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isApproving}
                onClick={handleConfirmApproval}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:brightness-110 flex items-center gap-1.5 shadow-lg shadow-amber-950/40"
              >
                {isApproving ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span>Activate VIP &amp; Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
