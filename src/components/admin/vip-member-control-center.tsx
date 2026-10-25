"use client";

import { useState, useEffect, useRef } from "react";
import {
  Crown,
  Search,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Trash2,
  Edit3,
  Calendar,
  MessageCircle,
  X,
  Check,
  Clock,
  Laptop,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  User,
  ArrowUpRight,
  Zap,
  Tag,
  RefreshCw,
  Lock,
  Unlock,
  Gift,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VipMember, VipTag, VipTier, VipStatus } from "@/lib/vip/vip-member-store";
import { formatNpr } from "@/lib/money";

interface VipMemberControlCenterProps {
  initialMembers: VipMember[];
}

export function VipMemberControlCenter({
  initialMembers,
}: VipMemberControlCenterProps) {
  const [members, setMembers] = useState<VipMember[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [lockingId, setLockingId] = useState<string | null>(null);
  const [bonusModalMember, setBonusModalMember] = useState<VipMember | null>(null);
  const [bonusDays, setBonusDays] = useState<number>(15);
  const [bonusPerk, setBonusPerk] = useState<string>("Priority Founder Hotline");
  const [isApplyingBonus, setIsApplyingBonus] = useState<boolean>(false);

  // 24/7 Live Member Radar State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString());

  const handleRefreshMembers = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/vip-members");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.members)) {
          setMembers(data.members);
          setLastSyncTime(new Date().toLocaleTimeString());
        }
      }
    } catch (e) {
      console.error("Refresh members error", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 24/7 Background Polling Loop (Runs every 8s)
  useEffect(() => {
    if (!autoSyncEnabled) return;

    const pollMembers = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (isModalOpen || updatingId || lockingId || bonusModalMember || loading) return;

      try {
        const res = await fetch("/api/admin/vip-members");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.members)) {
            setMembers(data.members);
            setLastSyncTime(new Date().toLocaleTimeString());
          }
        }
      } catch (err) {
        // Silently retry next cycle
      }
    };

    const intervalId = setInterval(pollMembers, 8000);
    return () => clearInterval(intervalId);
  }, [autoSyncEnabled, isModalOpen, updatingId, lockingId, bonusModalMember, loading]);

  // Form State for granting VIP
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [tier, setTier] = useState<VipTier>("1_MONTH");
  const [vipTag, setVipTag] = useState<VipTag>("VIP");
  const [status, setStatus] = useState<VipStatus>("ACTIVE");
  const [isLifetime, setIsLifetime] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  // Quick WhatsApp Dispatch link builder
  const buildWhatsAppDispatchUrl = (member: VipMember) => {
    const cleanPhone = member.phone.replace(/\D/g, "");
    const nepPhone = cleanPhone.startsWith("977") ? cleanPhone : `977${cleanPhone}`;
    const tagLabel =
      member.vipTag === "VIP"
        ? "👑 TRIHEX VIP ELITE"
        : member.vipTag === "PRO"
        ? "⚡ PRO OPERATOR"
        : member.vipTag === "STARTER"
        ? "🔰 STARTER VERIFIED"
        : "STANDARD ACCESS";

    const text = encodeURIComponent(
      `Hello ${member.name}! 👑 Your TRIHEX VIP Clearance has been approved & verified by the Administrator.\n\n` +
      `Clearance Tag: ${tagLabel}\n` +
      `Tier Plan: ${member.tierName}\n` +
      `Status: ${member.status}\n` +
      `Registered Mobile: ${member.phone}\n` +
      `Access Token: ${member.verificationToken}\n\n` +
      `Track your VIP clearance and orders anytime here: https://trihexdigital.shop/track-order?phone=${encodeURIComponent(member.phone)}\n` +
      `Access the VIP Vault: https://trihexdigital.shop/vip\n\n` +
      `Welcome to TRIHEX Private Intelligence!`
    );
    return `https://wa.me/${nepPhone}?text=${text}`;
  };

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const cleanQ = q.replace(/\D/g, "");
    const cleanPhone = m.phone ? m.phone.replace(/\D/g, "") : "";
    const matchesPhone = cleanQ.length >= 4 && cleanPhone.includes(cleanQ);

    const matchesSearch =
      !q ||
      m.phone.includes(q) ||
      matchesPhone ||
      m.email.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.verificationToken.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      (m.adminNotes && m.adminNotes.toLowerCase().includes(q));

    let matchesFilter = true;
    if (selectedFilter === "PENDING_VERIFICATION") {
      matchesFilter = m.status === "PENDING_VERIFICATION";
    } else if (selectedFilter === "LIFETIME") {
      matchesFilter = m.isLifetime;
    } else if (selectedFilter === "VIP") {
      matchesFilter = m.vipTag === "VIP";
    } else if (selectedFilter === "PRO") {
      matchesFilter = m.vipTag === "PRO";
    } else if (selectedFilter === "STARTER") {
      matchesFilter = m.vipTag === "STARTER";
    } else if (selectedFilter === "SUSPENDED") {
      matchesFilter = m.status === "SUSPENDED";
    }

    return matchesSearch && matchesFilter;
  });

  const lifetimeCount = members.filter((m) => m.isLifetime).length;
  const activeCount = members.filter((m) => m.status === "ACTIVE").length;
  const pendingCount = members.filter((m) => m.status === "PENDING_VERIFICATION").length;

  const handleGrantVip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      alert("Please provide the customer's phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/vip-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          email: email.trim(),
          name: name.trim(),
          tier,
          vipTag,
          status,
          isLifetime: tier === "LIFETIME" || isLifetime,
          avatarUrl: avatarUrl || null,
          adminNotes,
        }),
      });

      const data = await res.json();
      if (data.success && data.member) {
        setMembers((prev) => [
          data.member,
          ...prev.filter((m) => m.id !== data.member.id),
        ]);
        setIsModalOpen(false);
        // Reset form
        setPhone("");
        setEmail("");
        setName("");
        setAvatarUrl("");
        setAdminNotes("");
      } else {
        alert(data.error || "Failed to grant VIP access.");
      }
    } catch (err) {
      console.error("Grant VIP error", err);
      alert("Failed to communicate with VIP administration gateway.");
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Tag Switcher
  const handleTagChange = async (member: VipMember, newTag: VipTag) => {
    setUpdatingId(member.id);
    try {
      const res = await fetch("/api/admin/vip-members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: member.id,
          vipTag: newTag,
          adminNotes: `${member.adminNotes} [Tag updated to ${newTag} by admin]`,
        }),
      });
      const data = await res.json();
      if (data.success && data.member) {
        setMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, vipTag: newTag } : m)),
        );
      }
    } catch (err) {
      console.error("Tag update error", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // 1-Click Approve for Pending Bank QR Payments
  const handleApproveVip = async (member: VipMember) => {
    setUpdatingId(member.id);
    try {
      const currentExp = member.expiresAt ? new Date(member.expiresAt).getTime() : Date.now();
      const days = member.tier === "6_MONTHS" ? 180 : member.tier === "PRO" ? 60 : 30;
      const newExp = member.isLifetime ? null : new Date(currentExp + days * 24 * 60 * 60 * 1000).toISOString();

      const res = await fetch("/api/admin/vip-members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: member.id,
          status: "ACTIVE",
          vipTag: member.vipTag === "NORMAL" ? "VIP" : member.vipTag,
          expiresAt: newExp,
          adminNotes: `${member.adminNotes} [Bank QR Payment Approved & Activated by Admin]`,
        }),
      });

      const data = await res.json();
      if (data.success && data.member) {
        setMembers((prev) =>
          prev.map((m) => (m.id === member.id ? data.member : m)),
        );
      }
    } catch (err) {
      console.error("Approve error", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to suspend VIP access for this member?")) return;

    try {
      const res = await fetch(`/api/admin/vip-members?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMembers((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: "SUSPENDED" } : m)),
        );
      }
    } catch (err) {
      console.error("Revoke error", err);
    }
  };

  const handlePurgeDelete = async (id: string) => {
    if (!confirm("Permanently delete this customer record from VIP database?")) return;

    try {
      const res = await fetch(`/api/admin/vip-members?id=${id}&purge=true`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const handleExtend30Days = async (member: VipMember) => {
    try {
      const currentExp = member.expiresAt ? new Date(member.expiresAt).getTime() : Date.now();
      const newExp = new Date(currentExp + 30 * 24 * 60 * 60 * 1000).toISOString();

      const res = await fetch("/api/admin/vip-members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: member.id,
          status: "ACTIVE",
          expiresAt: newExp,
          adminNotes: `${member.adminNotes} [+30 Days Extension added by admin]`,
        }),
      });

      const data = await res.json();
      if (data.success && data.member) {
        setMembers((prev) =>
          prev.map((m) => (m.id === member.id ? data.member : m)),
        );
      }
    } catch (err) {
      console.error("Extend error", err);
    }
  };

  // Advanced Cryptographic Lock / Freeze
  const handleToggleLock = async (member: VipMember) => {
    const isCurrentlyLocked = Boolean(member.isLocked);
    const actionLabel = isCurrentlyLocked ? "Unlock Clearance" : "Emergency Lock / Freeze Access";
    const promptReason = !isCurrentlyLocked
      ? prompt("Enter security reason for freezing this clearance:", "Security Sentinel Inspection / Administrative Freeze")
      : "Administrative clearance restored";

    if (!isCurrentlyLocked && promptReason === null) return;

    setLockingId(member.id);
    try {
      const res = await fetch("/api/admin/vip-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TOGGLE_LOCK",
          memberId: member.id,
          lock: !isCurrentlyLocked,
          reason: promptReason || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.member) {
        setMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, ...data.member } : m))
        );
      } else {
        alert(data.error || "Failed to update security lock status.");
      }
    } catch (err) {
      console.error("Lock toggle error", err);
      alert("Network error toggling security lock.");
    } finally {
      setLockingId(null);
    }
  };

  // Open Bonus Allocator Modal
  const handleOpenBonusModal = (member: VipMember) => {
    setBonusModalMember(member);
    setBonusDays(member.tier === "6_MONTHS" ? 30 : member.tier === "LIFETIME" ? 0 : 15);
    setBonusPerk(
      member.tier === "LIFETIME"
        ? "Priority Founder Hotline & Uncapped AI Leaks"
        : member.tier === "6_MONTHS"
        ? "Midjourney Pro Prompts Pack"
        : "Standard Fast-Track Support"
    );
  };

  // Apply Bonus
  const handleApplyBonus = async () => {
    if (!bonusModalMember) return;
    setIsApplyingBonus(true);

    try {
      const res = await fetch("/api/admin/vip-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ALLOCATE_BONUS",
          memberId: bonusModalMember.id,
          bonusDays,
          bonusPerk,
        }),
      });

      const data = await res.json();
      if (data.success && data.member) {
        setMembers((prev) =>
          prev.map((m) => (m.id === bonusModalMember.id ? { ...m, ...data.member } : m))
        );
        const mem = data.member;
        setBonusModalMember(null);

        // Offer WhatsApp notification
        const cleanPhone = mem.phone.replace(/\D/g, "");
        const nepPhone = cleanPhone.startsWith("977") ? cleanPhone : `977${cleanPhone}`;
        const msg = encodeURIComponent(
          `Namaste ${mem.name}! 👑\n\n` +
          `You have received an exclusive VIP Bonus from TRIHEX Operations!\n\n` +
          `🎁 Bonus Validity: +${bonusDays} Free Days Added\n` +
          `⚡ Exclusive Perk: ${bonusPerk}\n` +
          `🔑 Access Token: ${mem.verificationToken}\n\n` +
          `Access your upgraded VIP Vault: https://trihexdigital.shop/vip`
        );
        if (confirm(`Bonus granted to ${mem.name}! 🎁\n\nOpen WhatsApp to send customer bonus notification?`)) {
          window.open(`https://wa.me/${nepPhone}?text=${msg}`, "_blank");
        }
      } else {
        alert(data.error || "Failed to allocate VIP bonus.");
      }
    } catch (err) {
      console.error("Bonus allocation error", err);
      alert("Network error allocating bonus.");
    } finally {
      setIsApplyingBonus(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Stat Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-900 p-5 text-white shadow-sm">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total VIP Members
            </span>
            <Crown className="h-5 w-5" />
          </div>
          <p className="mt-3 text-3xl font-black text-amber-300">{members.length}</p>
          <p className="mt-1 text-xs text-slate-400">
            Registered phone intelligence
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active VIP Passes
            </span>
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <p className="mt-3 text-3xl font-black text-emerald-600">{activeCount}</p>
          <p className="mt-1 text-xs text-slate-400">
            Currently valid &amp; verified
          </p>
        </div>

        <div
          onClick={() => setSelectedFilter("PENDING_VERIFICATION")}
          className={`rounded-2xl border p-5 shadow-sm transition cursor-pointer ${
            pendingCount > 0
              ? "border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/15"
              : "border-[var(--border)] bg-white"
          }`}
        >
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Bank QR Orders
            </span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-black text-amber-600">{pendingCount}</p>
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 animate-pulse">
                ACTION NEEDED
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Awaiting 1-click admin approval
          </p>
        </div>

        <div className="flex items-center justify-center rounded-2xl border border-dashed border-amber-500/50 bg-amber-500/5 p-5">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full h-full min-h-[4.5rem] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-950/20 text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Grant VIP Access by Phone</span>
          </Button>
        </div>
      </div>

      {/* Control Bar: Search & Filters & Live Radar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by Customer User ID (THX-USR-...), phone (98...), email, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm border-slate-200"
            />
          </div>

          {/* 24/7 Live Radar Indicator & Refresh */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition ${
                autoSyncEnabled
                  ? "border-emerald-500/40 bg-emerald-50 text-emerald-700"
                  : "border-slate-300 bg-slate-100 text-slate-500"
              }`}
              title={autoSyncEnabled ? "24/7 Live Sync Active (Click to Pause)" : "Live Sync Paused (Click to Enable)"}
            >
              <span className="flex h-2 w-2 relative">
                {autoSyncEnabled && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    autoSyncEnabled ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
              </span>
              <span className="hidden sm:inline font-mono">
                {autoSyncEnabled ? "24/7 LIVE (8s)" : "PAUSED"}
              </span>
              <span className="text-[9px] text-slate-400 hidden xl:inline font-mono">
                ({lastSyncTime})
              </span>
            </button>

            <button
              onClick={handleRefreshMembers}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition disabled:opacity-50 cursor-pointer shrink-0"
              title="Refresh VIP Members from Database"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-amber-500" : ""}`} />
              <span className="hidden sm:inline">{isRefreshing ? "Syncing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "ALL", label: "All Members" },
            { id: "PENDING_VERIFICATION", label: `Pending QR (${pendingCount})` },
            { id: "VIP", label: "👑 VIP Elite" },
            { id: "PRO", label: "⚡ Pro Tag" },
            { id: "STARTER", label: "🔰 Starter" },
            { id: "LIFETIME", label: "Permanent Lifetime" },
            { id: "SUSPENDED", label: "Suspended" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                selectedFilter === f.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => {
          const isPending = member.status === "PENDING_VERIFICATION";

          return (
            <div
              key={member.id}
              className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 ${
                isPending
                  ? "border-amber-400/90 bg-amber-50/50 shadow-md shadow-amber-950/5 ring-1 ring-amber-400/50"
                  : member.isLifetime
                  ? "border-amber-500/40 bg-gradient-to-b from-amber-950/10 via-white to-white shadow-md shadow-amber-950/5"
                  : member.status === "ACTIVE"
                  ? "border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md"
                  : "border-slate-200 bg-slate-50/70 opacity-75"
              }`}
            >
              <div>
                {/* Member Header & Avatar */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-13 w-13 shrink-0 overflow-hidden rounded-full border-2 border-amber-400/80 bg-slate-100 shadow-sm">
                      {member.avatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-bold text-slate-700 bg-amber-100">
                          {member.name[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      {member.isLifetime && (
                        <div className="absolute -bottom-1 -right-1 rounded-full bg-amber-500 p-0.5 text-slate-950 shadow">
                          <Crown className="h-3 w-3" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 line-clamp-1">{member.name}</h4>
                        {member.status === "ACTIVE" ? (
                          <span className="h-2 w-2 rounded-full bg-emerald-500" title="Active Clearance" />
                        ) : isPending ? (
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" title="Pending Verification" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-rose-500" title="Suspended" />
                        )}
                      </div>

                      {/* Phone Number Display */}
                      <div className="flex items-center gap-1 text-xs font-mono font-bold text-indigo-700 mt-0.5">
                        <Phone className="h-3 w-3" />
                        <span>{member.phone || "No phone linked"}</span>
                      </div>

                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {member.email}
                      </div>

                      {/* Customer User ID Badge */}
                      <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1.5 inline-flex">
                        <span className="text-slate-500 font-sans text-[9px] uppercase font-bold">USER ID:</span>
                        <span>{member.verificationToken}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Security Lock Badges */}
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 font-mono ${
                        member.isLocked
                          ? "bg-rose-100 text-rose-800 border border-rose-300"
                          : isPending
                          ? "bg-amber-100 text-amber-800 border border-amber-400"
                          : member.isLifetime
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : member.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {member.isLocked ? "🔒 Locked" : isPending ? "Pending Review" : member.status}
                    </span>
                    {member.isLocked && (
                      <span className="text-[9px] font-black text-rose-600 font-mono tracking-tighter">
                        CIPHER-FROZEN
                      </span>
                    )}
                  </div>
                </div>

                {/* VIP Tag & Quick Switcher Row */}
                <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-100/80 p-2.5 border border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Clearance Tag:
                    </span>
                  </div>

                  <select
                    value={member.vipTag || "VIP"}
                    onChange={(e) => handleTagChange(member, e.target.value as VipTag)}
                    disabled={updatingId === member.id}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="VIP">👑 VIP Elite Tag</option>
                    <option value="PRO">⚡ Pro Operator Tag</option>
                    <option value="STARTER">🔰 Starter Verified Tag</option>
                    <option value="NORMAL">⚪ Standard Customer</option>
                  </select>
                </div>

                {/* Telemetry & Validity Details */}
                <div className="mt-3 rounded-xl bg-slate-50 p-3 space-y-1.5 text-[11px] text-slate-600 border border-slate-100 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tier:</span>
                    <strong className="text-slate-900">{member.tierName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Spent:</span>
                    <strong className="text-emerald-700">Rs. {member.totalSpentNpr?.toLocaleString() || 0}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Clearance Expiry:</span>
                    <span className="text-amber-700 font-bold">
                      {member.isLifetime ? "Permanent Lifetime" : member.expiresAt ? new Date(member.expiresAt).toLocaleDateString() : isPending ? "Pending Activation" : "Expired"}
                    </span>
                  </div>
                  {member.bonusDays && member.bonusDays > 0 ? (
                    <div className="flex items-center justify-between text-purple-700 font-bold">
                      <span>VIP Bonus Days:</span>
                      <span>+{member.bonusDays} Free Days Added</span>
                    </div>
                  ) : null}
                  {member.bonusPerks && member.bonusPerks.length > 0 ? (
                    <div className="flex items-center justify-between text-cyan-700">
                      <span>VIP Perks:</span>
                      <span className="truncate max-w-[170px] text-right font-sans font-semibold">
                        {member.bonusPerks.join(", ")}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                    <span className="text-slate-400">Token:</span>
                    <span className="font-bold text-slate-700 truncate max-w-[170px]">{member.verificationToken}</span>
                  </div>
                  {member.isLocked && member.cipherLockHash && (
                    <div className="flex items-center justify-between border-t border-rose-200/60 pt-1 text-rose-600 text-[10px]">
                      <span>Lock Hash:</span>
                      <span className="font-mono truncate max-w-[170px]">{member.cipherLockHash}</span>
                    </div>
                  )}
                </div>

                {/* Admin Notes */}
                {member.adminNotes ? (
                  <p className="mt-2 text-[11px] italic text-slate-500 line-clamp-2">
                    &ldquo;{member.adminNotes}&rdquo;
                  </p>
                ) : null}
              </div>

              {/* Action Buttons Row */}
              <div className="mt-5 space-y-2 border-t border-slate-100 pt-3">
                {/* If Pending Verification: Show Prominent Approve Button */}
                {isPending && (
                  <button
                    type="button"
                    onClick={() => handleApproveVip(member)}
                    disabled={updatingId === member.id}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-2 text-xs font-bold text-white hover:from-emerald-400 hover:to-emerald-500 transition shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Approve &amp; Activate VIP Pass</span>
                  </button>
                )}

                <div className="flex items-center justify-between gap-2">
                  <a
                    href={buildWhatsAppDispatchUrl(member)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <div className="flex items-center gap-1">
                    {/* VIP Bonus Allocator Button */}
                    <button
                      onClick={() => handleOpenBonusModal(member)}
                      title="Grant VIP Bonus & Perks (+Days)"
                      className="rounded-lg p-1.5 text-purple-600 hover:bg-purple-50 transition cursor-pointer"
                    >
                      <Gift className="h-4 w-4" />
                    </button>

                    {/* Advanced Cryptographic Lock / Freeze Button */}
                    <button
                      onClick={() => handleToggleLock(member)}
                      disabled={lockingId === member.id}
                      title={member.isLocked ? "Unlock VIP Clearance" : "Emergency Lock / Freeze Access"}
                      className={`rounded-lg p-1.5 transition cursor-pointer ${
                        member.isLocked
                          ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                          : "text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      }`}
                    >
                      {member.isLocked ? (
                        <Lock className="h-4 w-4 text-rose-600" />
                      ) : (
                        <Unlock className="h-4 w-4" />
                      )}
                    </button>

                    {!member.isLifetime && member.status === "ACTIVE" && (
                      <button
                        onClick={() => handleExtend30Days(member)}
                        title="Extend +30 Days"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition cursor-pointer"
                      >
                        <Calendar className="h-4 w-4" />
                      </button>
                    )}

                    {member.status === "ACTIVE" ? (
                      <button
                        onClick={() => handleRevoke(member.id)}
                        title="Suspend / Revoke VIP"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                      >
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApproveVip(member)}
                        title="Re-activate VIP"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition cursor-pointer"
                      >
                        <Check className="h-4 w-4 text-emerald-600" />
                      </button>
                    )}

                    <button
                      onClick={() => handlePurgeDelete(member.id)}
                      title="Permanently Delete Member"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-700 transition cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 text-slate-400 hover:text-rose-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-sm text-slate-400">
          No VIP members found matching &quot;{searchQuery}&quot;. Use the button above to grant VIP access.
        </div>
      )}

      {/* Modal: Grant VIP Access by Phone Number */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Crown className="h-5 w-5" />
                <h3 className="font-bold text-lg text-white">Grant VIP Clearance by Phone</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGrantVip} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 font-mono">
                  Customer Nepali Phone Number <span className="text-rose-400">*</span>
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 font-bold">
                    +977
                  </span>
                  <Input
                    type="tel"
                    required
                    placeholder="98XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-14 bg-slate-950 border-slate-800 font-mono text-white text-sm"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  The primary identifier. Customer can track their VIP clearance at /track-order using this number.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 font-mono">
                    Customer Name
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Ramesh Shrestha"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 bg-slate-950 border-slate-800 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 font-mono">
                    Email (Optional)
                  </label>
                  <Input
                    type="email"
                    placeholder="user@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 bg-slate-950 border-slate-800 text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 font-mono">
                    VIP Tier Plan
                  </label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as VipTier)}
                    className="mt-1.5 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="1_MONTH">1 Month VIP Pass (30 Days)</option>
                    <option value="6_MONTHS">6 Months VIP Pass (180 Days)</option>
                    <option value="LIFETIME">Permanent Lifetime VIP Pack</option>
                    <option value="PRO">PRO Operator Clearance</option>
                    <option value="STARTER">Starter Verified Pass</option>
                    <option value="CUSTOM">Custom Intelligence Pass</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 font-mono">
                    VIP Tag Badge
                  </label>
                  <select
                    value={vipTag}
                    onChange={(e) => setVipTag(e.target.value as VipTag)}
                    className="mt-1.5 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="VIP">👑 VIP Elite Tag</option>
                    <option value="PRO">⚡ Pro Operator Tag</option>
                    <option value="STARTER">🔰 Starter Verified Tag</option>
                    <option value="NORMAL">⚪ Normal Customer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 font-mono">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as VipStatus)}
                  className="mt-1.5 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="ACTIVE">ACTIVE (Immediate Access)</option>
                  <option value="PENDING_VERIFICATION">PENDING VERIFICATION (Awaiting Bank Slip)</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 font-mono">
                  Admin Notes &amp; Payment Reference
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Paid Rs 3,999 via Bank QR / Fonepay Ref #99281. Verified on WhatsApp."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-slate-800 bg-slate-950 p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {loading ? "Granting Clearance…" : "Confirm VIP Clearance"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIP Bonus Allocator Modal */}
      {bonusModalMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in"
          onClick={() => !isApplyingBonus && setBonusModalMember(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-purple-500/40 bg-slate-900 p-6 text-white shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-md">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Allocate VIP Bonus &amp; Perks
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {bonusModalMember.name} · {bonusModalMember.phone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isApplyingBonus && setBonusModalMember(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Current Member Status Overview */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Plan:</span>
                <span className="text-amber-300 font-bold">{bonusModalMember.tierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Validity:</span>
                <span className="text-white">
                  {bonusModalMember.isLifetime
                    ? "Permanent Lifetime"
                    : bonusModalMember.expiresAt
                    ? new Date(bonusModalMember.expiresAt).toLocaleDateString()
                    : "Unactivated"}
                </span>
              </div>
              {bonusModalMember.bonusDays && bonusModalMember.bonusDays > 0 ? (
                <div className="flex justify-between text-purple-400">
                  <span>Prior Bonus Granted:</span>
                  <span>+{bonusModalMember.bonusDays} Days</span>
                </div>
              ) : null}
            </div>

            {/* Bonus Days Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Select Free Bonus Days (+Extension):</span>
                <span className="text-purple-300 font-mono font-bold">
                  {bonusDays > 0 ? `+${bonusDays} Free Days` : "Zero Extra Days"}
                </span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 7, 15, 30, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setBonusDays(d)}
                    className={`py-2 rounded-xl text-xs font-bold font-mono transition ${
                      bonusDays === d
                        ? "bg-purple-600 text-white shadow-md shadow-purple-950/50"
                        : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                    }`}
                  >
                    {d === 0 ? "None" : `+${d}d`}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Bonus Perk Tag */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Grant Custom VIP Bonus Perk:
              </label>
              <input
                type="text"
                value={bonusPerk}
                onChange={(e) => setBonusPerk(e.target.value)}
                placeholder="e.g. Priority Founder Hotline, Lovable Prompts Pack..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
                {[
                  "Priority Founder Hotline",
                  "Uncapped AI Leaks",
                  "Free AI Agent Setup Consultation",
                  "Midjourney Pro Prompts Pack",
                  "20% Lifetime App Discount",
                ].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setBonusPerk(p)}
                    className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-purple-300"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={isApplyingBonus}
                onClick={() => setBonusModalMember(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isApplyingBonus}
                onClick={handleApplyBonus}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:brightness-110 flex items-center gap-1.5 shadow-lg shadow-purple-950/50"
              >
                {isApplyingBonus ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Gift className="h-4 w-4" />
                )}
                <span>Grant VIP Bonus &amp; Notify</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

