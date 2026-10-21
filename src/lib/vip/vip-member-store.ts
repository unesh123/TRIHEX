import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { eq, or, ilike, sql } from "drizzle-orm";
import { isDatabaseConfigured } from "@/lib/env";
import { nanoid } from "nanoid";

export type VipTier =
  | "1_MONTH"
  | "6_MONTHS"
  | "LIFETIME"
  | "PRO"
  | "STARTER"
  | "NORMAL"
  | "CUSTOM";

export type VipTag = "VIP" | "PRO" | "STARTER" | "NORMAL";
export type VipStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "SUSPENDED"
  | "PENDING_VERIFICATION";

export interface VipMember {
  id: string;
  phone: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  tier: VipTier;
  tierName: string;
  vipTag: VipTag;
  status: VipStatus;
  grantedAt: string;
  expiresAt: string | null;
  isLifetime: boolean;
  totalOrders: number;
  totalSpentNpr: number;
  deviceTelemetry: string;
  lastLocation: string;
  adminNotes: string;
  whatsappVerified: boolean;
  verificationToken: string;

  // Advanced Security & Cryptographic Locking
  isLocked?: boolean;
  lockedAt?: string | null;
  lockReason?: string | null;
  cipherLockHash?: string;

  // VIP Bonuses & Customer Appreciation
  bonusDays?: number;
  bonusPerks?: string[];
  lastBonusGrantedAt?: string | null;
}

export function getVipTagMetadata(tag: VipTag) {
  switch (tag) {
    case "VIP":
      return {
        label: "TRIHEX VIP ELITE",
        shortLabel: "VIP",
        glow: "shadow-[0_0_25px_rgba(245,158,11,0.4)]",
        border: "border-amber-400/80",
        badgeBg: "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black",
        chipClass: "border border-amber-400/50 bg-amber-950/60 text-amber-300",
        icon: "Crown",
      };
    case "PRO":
      return {
        label: "PRO OPERATOR",
        shortLabel: "PRO",
        glow: "shadow-[0_0_25px_rgba(6,182,212,0.4)]",
        border: "border-cyan-400/80",
        badgeBg: "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black",
        chipClass: "border border-cyan-400/50 bg-cyan-950/60 text-cyan-300",
        icon: "Zap",
      };
    case "STARTER":
      return {
        label: "STARTER VERIFIED",
        shortLabel: "STARTER",
        glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
        border: "border-emerald-400/80",
        badgeBg: "bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black",
        chipClass: "border border-emerald-400/50 bg-emerald-950/60 text-emerald-300",
        icon: "ShieldCheck",
      };
    default:
      return {
        label: "STANDARD CUSTOMER",
        shortLabel: "NORMAL",
        glow: "",
        border: "border-slate-700",
        badgeBg: "bg-slate-800 text-slate-300 font-bold",
        chipClass: "border border-slate-700 bg-slate-900 text-slate-400",
        icon: "User",
      };
  }
}

// In-memory persistent baseline for rapid administration
const MEMORY_VIP_MEMBERS: VipMember[] = [
  {
    id: "vip-founder-trix",
    phone: "9702910130",
    email: "uneshbastola888@gmail.com",
    name: "Unesh Bastola (Trix)",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    tier: "LIFETIME",
    tierName: "Permanent Lifetime VIP Pack",
    vipTag: "VIP",
    status: "ACTIVE",
    grantedAt: "2026-01-01T00:00:00.000Z",
    expiresAt: null,
    isLifetime: true,
    totalOrders: 14,
    totalSpentNpr: 18500,
    deviceTelemetry: "Windows 11 · Antigravity IDE / Chrome 132",
    lastLocation: "Kathmandu, Nepal",
    adminNotes: "Platform Founder & Architect. Permanent unrestricted clearance.",
    whatsappVerified: true,
    verificationToken: "THX-VIP-ROOT-001",
  },
  {
    id: "vip-founder-trix-alias",
    phone: "9702910130",
    email: "unesh@trihex.digital",
    name: "Unesh (Trix)",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    tier: "LIFETIME",
    tierName: "Permanent Lifetime VIP Pack",
    vipTag: "VIP",
    status: "ACTIVE",
    grantedAt: "2026-01-01T00:00:00.000Z",
    expiresAt: null,
    isLifetime: true,
    totalOrders: 14,
    totalSpentNpr: 18500,
    deviceTelemetry: "Windows 11 · Antigravity IDE / Chrome 132",
    lastLocation: "Kathmandu, Nepal",
    adminNotes: "Platform Founder & Architect. Permanent unrestricted clearance.",
    whatsappVerified: true,
    verificationToken: "THX-VIP-ROOT-002",
  },
  {
    id: "vip-client-kth-01",
    phone: "9841399201",
    email: "ramesh.kth@gmail.com",
    name: "Ramesh Shrestha",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    tier: "6_MONTHS",
    tierName: "6 Months VIP Pass (180 Days)",
    vipTag: "VIP",
    status: "ACTIVE",
    grantedAt: "2026-08-15T10:00:00.000Z",
    expiresAt: "2027-02-15T10:00:00.000Z",
    isLifetime: false,
    totalOrders: 3,
    totalSpentNpr: 6999,
    deviceTelemetry: "MacBook Pro · macOS 15.3 · Safari",
    lastLocation: "Lalitpur, Nepal",
    adminNotes: "Agency lead. Paid via eSewa Ref #ESW-99201. Verified on WhatsApp.",
    whatsappVerified: true,
    verificationToken: "THX-VIP-6M-8821",
  },
  {
    id: "vip-client-pkr-02",
    phone: "9818442099",
    email: "anita.gurung@outlook.com",
    name: "Anita Gurung",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    tier: "1_MONTH",
    tierName: "1 Month VIP Pass (30 Days)",
    vipTag: "VIP",
    status: "ACTIVE",
    grantedAt: "2026-10-01T14:20:00.000Z",
    expiresAt: "2026-10-31T14:20:00.000Z",
    isLifetime: false,
    totalOrders: 1,
    totalSpentNpr: 3999,
    deviceTelemetry: "iPhone 16 Pro · iOS 18.2 · Safari",
    lastLocation: "Pokhara, Gandaki",
    adminNotes: "Full-stack developer. Requested Lovable unlimited builder scripts.",
    whatsappVerified: true,
    verificationToken: "THX-VIP-1M-4401",
  },
];

export async function getAllVipMembers(): Promise<VipMember[]> {
  // If database is live, merge registered profiles with phone numbers (guarded with fast timeout)
  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      if (db) {
        const queryPromise = db
          .select({
            id: schema.profiles.id,
            email: schema.profiles.email,
            fullName: schema.profiles.fullName,
            phone: schema.profiles.phone,
            role: schema.profiles.role,
            createdAt: schema.profiles.createdAt,
          })
          .from(schema.profiles)
          .limit(100);

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("DB profiles query timeout")), 400),
        );

        const liveProfiles = await Promise.race([queryPromise, timeoutPromise]);

        // Augment with live user profiles
        for (const p of liveProfiles) {
          const exists = MEMORY_VIP_MEMBERS.some(
            (m) => m.email.toLowerCase() === p.email.toLowerCase(),
          );
          if (!exists && p.phone) {
            MEMORY_VIP_MEMBERS.push({
              id: `vip-${p.id}`,
              phone: p.phone,
              email: p.email,
              name: p.fullName || p.email.split("@")[0],
              avatarUrl: null,
              tier: "CUSTOM",
              tierName: "Customer Registered",
              vipTag: "NORMAL",
              status: "PENDING_VERIFICATION",
              grantedAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
              expiresAt: null,
              isLifetime: false,
              totalOrders: 0,
              totalSpentNpr: 0,
              deviceTelemetry: "Web Storefront Session",
              lastLocation: "Nepal",
              adminNotes: "Auto-synced from registered customer profiles.",
              whatsappVerified: false,
              verificationToken: `THX-AUTO-${nanoid(6).toUpperCase()}`,
            });
          }
        }
      }
    } catch {
      // Non-fatal fallback to MEMORY_VIP_MEMBERS
    }
  }

  return [...MEMORY_VIP_MEMBERS].sort((a, b) => {
    // Sort Active and Lifetime first
    if (a.isLifetime && !b.isLifetime) return -1;
    if (!a.isLifetime && b.isLifetime) return 1;
    return new Date(b.grantedAt).getTime() - new Date(a.grantedAt).getTime();
  });
}

export async function searchVipMembers(query: string): Promise<VipMember[]> {
  const all = await getAllVipMembers();
  if (!query || !query.trim()) return all;
  const q = query.toLowerCase().trim();

  return all.filter(
    (m) =>
      m.phone.includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.tierName.toLowerCase().includes(q) ||
      m.verificationToken.toLowerCase().includes(q) ||
      m.adminNotes.toLowerCase().includes(q),
  );
}

export async function getVipMemberByEmail(email: string): Promise<VipMember | null> {
  const all = await getAllVipMembers();
  return (
    all.find(
      (m) =>
        m.email.toLowerCase() === email.toLowerCase() &&
        m.status === "ACTIVE",
    ) || null
  );
}

export async function getVipMemberRecordByEmail(email: string): Promise<VipMember | null> {
  const all = await getAllVipMembers();
  return (
    all.find(
      (m) => m.email.toLowerCase() === email.toLowerCase(),
    ) || null
  );
}

export async function registerCustomerLogin(data: {
  email: string;
  name?: string;
  avatarUrl?: string | null;
}): Promise<VipMember> {
  const email = data.email.trim().toLowerCase();
  const existing = await getVipMemberRecordByEmail(email);
  if (existing) {
    return existing;
  }

  const newMember: VipMember = {
    id: `vip-user-${nanoid(8)}`,
    phone: "",
    email,
    name: data.name?.trim() || email.split("@")[0],
    avatarUrl: data.avatarUrl || null,
    tier: "NORMAL",
    tierName: "Standard Customer",
    vipTag: "NORMAL",
    status: "NONE" as VipStatus,
    grantedAt: new Date().toISOString(),
    expiresAt: null,
    isLifetime: false,
    totalOrders: 0,
    totalSpentNpr: 0,
    deviceTelemetry: "Google Sign-In Session",
    lastLocation: "Nepal",
    adminNotes: "Customer registered via Google login. Review and grant VIP access if requested.",
    whatsappVerified: false,
    verificationToken: `THX-USR-${nanoid(6).toUpperCase()}`,
  };

  MEMORY_VIP_MEMBERS.push(newMember);
  return newMember;
}

export async function getVipMemberByPhone(phone: string): Promise<VipMember | null> {
  const cleaned = phone.replace(/\D/g, "");
  const all = await getAllVipMembers();
  return (
    all.find((m) => m.phone.replace(/\D/g, "").includes(cleaned)) || null
  );
}

export async function grantVipAccess(data: {
  phone: string;
  email: string;
  name: string;
  tier: VipTier;
  vipTag?: VipTag;
  status?: VipStatus;
  isLifetime?: boolean;
  expiresDays?: number;
  avatarUrl?: string | null;
  adminNotes?: string;
}): Promise<VipMember> {
  const targetEmail = data.email.trim().toLowerCase();
  const existingIdx = MEMORY_VIP_MEMBERS.findIndex(
    (m) => m.email.toLowerCase() === targetEmail,
  );

  const isLifetime = data.tier === "LIFETIME" || Boolean(data.isLifetime);
  const now = new Date();
  let expiresAt: string | null = null;

  if (!isLifetime) {
    const days =
      data.expiresDays ?? (data.tier === "6_MONTHS" ? 180 : data.tier === "PRO" ? 60 : 30);
    const expDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    expiresAt = expDate.toISOString();
  }

  const tierNames: Record<string, string> = {
    "1_MONTH": "1 Month VIP Pass (30 Days)",
    "6_MONTHS": "6 Months VIP Pass (180 Days)",
    "LIFETIME": "Permanent Lifetime VIP Pack",
    "PRO": "TRIHEX Pro Operator Tag",
    "STARTER": "Starter Verified Tag",
    "NORMAL": "Standard Storefront Customer",
    "CUSTOM": "Custom VIP Intelligence Clearance",
  };

  const token = `THX-VIP-${data.tier}-${Date.now().toString(36).toUpperCase()}`;
  const defaultTag: VipTag =
    data.vipTag ||
    (data.tier === "PRO"
      ? "PRO"
      : data.tier === "STARTER"
        ? "STARTER"
        : data.tier === "NORMAL"
          ? "NORMAL"
          : "VIP");

  const member: VipMember = {
    id: existingIdx >= 0 ? MEMORY_VIP_MEMBERS[existingIdx].id : `vip-${nanoid(8)}`,
    phone: data.phone.trim(),
    email: data.email.trim().toLowerCase(),
    name: data.name.trim() || data.email.split("@")[0],
    avatarUrl: data.avatarUrl || (existingIdx >= 0 ? MEMORY_VIP_MEMBERS[existingIdx].avatarUrl : null),
    tier: data.tier,
    tierName: tierNames[data.tier] || "VIP Access Pass",
    vipTag: defaultTag,
    status: data.status || "ACTIVE",
    grantedAt: now.toISOString(),
    expiresAt,
    isLifetime,
    totalOrders: existingIdx >= 0 ? MEMORY_VIP_MEMBERS[existingIdx].totalOrders : 1,
    totalSpentNpr: existingIdx >= 0 ? MEMORY_VIP_MEMBERS[existingIdx].totalSpentNpr : (data.tier === "LIFETIME" ? 7999 : data.tier === "6_MONTHS" ? 5999 : 3999),
    deviceTelemetry: "Admin Manual Clearance Gateway",
    lastLocation: "Nepal",
    adminNotes: data.adminNotes || "Access granted by administrator via Operations Hub.",
    whatsappVerified: true,
    verificationToken: token,
  };

  if (existingIdx >= 0) {
    MEMORY_VIP_MEMBERS[existingIdx] = member;
  } else {
    MEMORY_VIP_MEMBERS.unshift(member);
  }

  // Audit log to DB if available
  try {
    const db = getDb();
    if (db) {
      await db.insert(schema.auditLogs).values({
        action: "ADMIN_VIP_ACCESS_GRANTED",
        entityType: "VIP_MEMBER",
        entityId: member.id,
        actorRole: "SUPER_ADMIN",
        metadata: {
          phone: member.phone,
          email: member.email,
          tier: member.tier,
          vipTag: member.vipTag,
          isLifetime: member.isLifetime,
        },
      });
    }
  } catch (err) {
    console.warn("[VipMemberStore] Audit log note:", err);
  }

  return member;
}

export async function registerOrUpdateCustomerVip(data: {
  phone: string;
  name?: string;
  email?: string;
  tier?: VipTier;
  vipTag?: VipTag;
  status?: VipStatus;
  amountNpr?: number;
  adminNotes?: string;
  verificationToken?: string;
}): Promise<VipMember> {
  const cleanedPhone = data.phone.trim();
  const targetEmail = data.email?.trim().toLowerCase();
  let existingIdx = targetEmail
    ? MEMORY_VIP_MEMBERS.findIndex((m) => m.email.toLowerCase() === targetEmail)
    : MEMORY_VIP_MEMBERS.findIndex(
        (m) => m.phone.replace(/\D/g, "") === cleanedPhone.replace(/\D/g, ""),
      );

  // If matched a founder profile but this is a different email/phone, do not overwrite the founder
  if (
    existingIdx >= 0 &&
    (MEMORY_VIP_MEMBERS[existingIdx].id.startsWith("vip-founder") ||
      MEMORY_VIP_MEMBERS[existingIdx].email === "uneshbastola888@gmail.com") &&
    targetEmail !== "uneshbastola888@gmail.com"
  ) {
    existingIdx = -1;
  }

  const tier = data.tier || "1_MONTH";
  const defaultTag: VipTag =
    data.vipTag ||
    (tier === "PRO"
      ? "PRO"
      : tier === "STARTER"
        ? "STARTER"
        : tier === "NORMAL"
          ? "NORMAL"
          : "VIP");
  const status: VipStatus = data.status || "PENDING_VERIFICATION";
  const isLifetime = tier === "LIFETIME";

  const tierNames: Record<string, string> = {
    "1_MONTH": "1 Month VIP Pass (30 Days)",
    "6_MONTHS": "6 Months VIP Pass (180 Days)",
    "LIFETIME": "Permanent Lifetime VIP Pack",
    "PRO": "TRIHEX Pro Operator Tag",
    "STARTER": "Starter Verified Tag",
    "NORMAL": "Standard Storefront Customer",
    "CUSTOM": "Custom VIP Intelligence Clearance",
  };

  const now = new Date();
  let expiresAt: string | null = null;
  if (!isLifetime && status === "ACTIVE") {
    const days = tier === "6_MONTHS" ? 180 : tier === "PRO" ? 60 : 30;
    expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  const token =
    data.verificationToken ||
    `THX-VIP-${tier}-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`;

  if (existingIdx >= 0) {
    const prev = MEMORY_VIP_MEMBERS[existingIdx];
    const updated: VipMember = {
      ...prev,
      name: data.name?.trim() || prev.name,
      email: data.email?.trim().toLowerCase() || prev.email,
      phone: cleanedPhone || prev.phone,
      tier: data.tier || prev.tier,
      tierName: tierNames[data.tier || prev.tier] || prev.tierName,
      vipTag: defaultTag,
      status: data.status || (prev.status === "ACTIVE" ? "ACTIVE" : "PENDING_VERIFICATION"),
      totalOrders: prev.totalOrders + 1,
      totalSpentNpr: prev.totalSpentNpr + (data.amountNpr || 0),
      adminNotes: data.adminNotes ? `${prev.adminNotes} | ${data.adminNotes}` : prev.adminNotes,
    };
    MEMORY_VIP_MEMBERS[existingIdx] = updated;
    return updated;
  }

  const member: VipMember = {
    id: `vip-${nanoid(8)}`,
    phone: cleanedPhone,
    email: data.email?.trim().toLowerCase() || `${cleanedPhone}@customer.trihex.digital`,
    name: data.name?.trim() || `Customer ${cleanedPhone.slice(-4)}`,
    avatarUrl: null,
    tier,
    tierName: tierNames[tier] || "VIP Access Pass",
    vipTag: defaultTag,
    status,
    grantedAt: now.toISOString(),
    expiresAt,
    isLifetime,
    totalOrders: 1,
    totalSpentNpr: data.amountNpr || 0,
    deviceTelemetry: "Storefront Mobile Checkout",
    lastLocation: "Nepal",
    adminNotes: data.adminNotes || "Registered via Bank QR Checkout / Storefront Order.",
    whatsappVerified: false,
    verificationToken: token,
  };

  MEMORY_VIP_MEMBERS.unshift(member);
  return member;
}

export async function revokeVipAccess(id: string): Promise<boolean> {
  const idx = MEMORY_VIP_MEMBERS.findIndex((m) => m.id === id);
  if (idx >= 0) {
    MEMORY_VIP_MEMBERS[idx].status = "SUSPENDED";
    MEMORY_VIP_MEMBERS[idx].adminNotes += " [Access Revoked by Administrator]";
    return true;
  }
  return false;
}

export async function updateVipMember(
  id: string,
  updates: Partial<VipMember>,
): Promise<VipMember | null> {
  const idx = MEMORY_VIP_MEMBERS.findIndex((m) => m.id === id);
  if (idx >= 0) {
    MEMORY_VIP_MEMBERS[idx] = {
      ...MEMORY_VIP_MEMBERS[idx],
      ...updates,
    };
    return MEMORY_VIP_MEMBERS[idx];
  }
  return null;
}

export async function deleteVipMember(id: string): Promise<boolean> {
  const idx = MEMORY_VIP_MEMBERS.findIndex((m) => m.id === id);
  if (idx >= 0) {
    MEMORY_VIP_MEMBERS.splice(idx, 1);
    return true;
  }
  return false;
}

export async function toggleVipLock(
  id: string,
  lock: boolean,
  reason?: string
): Promise<VipMember | null> {
  const idx = MEMORY_VIP_MEMBERS.findIndex((m) => m.id === id);
  if (idx >= 0) {
    const member = MEMORY_VIP_MEMBERS[idx];
    const now = new Date().toISOString();
    const hash = `THX-AES256-${Date.now().toString(16).toUpperCase()}-${nanoid(6).toUpperCase()}`;

    MEMORY_VIP_MEMBERS[idx] = {
      ...member,
      isLocked: lock,
      lockedAt: lock ? now : null,
      lockReason: lock ? (reason || "Emergency Administrative Freeze") : null,
      status: lock ? "SUSPENDED" : "ACTIVE",
      cipherLockHash: lock ? hash : undefined,
      adminNotes: lock
        ? `${member.adminNotes} [🔒 CIPHER-LOCKED by Admin at ${now}: ${reason || "Security Freeze"}]`
        : `${member.adminNotes} [🔓 UNLOCKED by Admin at ${now}]`,
    };
    return MEMORY_VIP_MEMBERS[idx];
  }
  return null;
}

export async function allocateVipBonus(
  id: string,
  bonusDays: number,
  bonusPerk?: string
): Promise<VipMember | null> {
  const idx = MEMORY_VIP_MEMBERS.findIndex((m) => m.id === id);
  if (idx >= 0) {
    const member = MEMORY_VIP_MEMBERS[idx];
    const now = new Date();

    let newExpiresAt = member.expiresAt;
    if (!member.isLifetime && bonusDays > 0) {
      const baseTime = member.expiresAt ? new Date(member.expiresAt).getTime() : now.getTime();
      const extendedTime = Math.max(baseTime, now.getTime()) + bonusDays * 24 * 60 * 60 * 1000;
      newExpiresAt = new Date(extendedTime).toISOString();
    }

    const existingPerks = member.bonusPerks || [];
    const newPerks =
      bonusPerk && !existingPerks.includes(bonusPerk)
        ? [...existingPerks, bonusPerk]
        : existingPerks;

    MEMORY_VIP_MEMBERS[idx] = {
      ...member,
      status: "ACTIVE",
      expiresAt: newExpiresAt,
      bonusDays: (member.bonusDays || 0) + bonusDays,
      bonusPerks: newPerks,
      lastBonusGrantedAt: now.toISOString(),
      adminNotes: `${member.adminNotes} [🎁 VIP Bonus: +${bonusDays} days${bonusPerk ? ` | Perk: ${bonusPerk}` : ""}]`,
    };
    return MEMORY_VIP_MEMBERS[idx];
  }
  return null;
}

