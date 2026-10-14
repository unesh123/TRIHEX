"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Crown,
  Terminal,
  ShieldAlert,
  Zap,
  Lock,
  Layers,
  Sparkles,
  Wifi,
  Smartphone,
  Video,
  Flame,
  Globe2,
  Users2,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Search,
} from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export interface TrixVipItem {
  id: string;
  title: string;
  category: "AI & CREATIVE" | "CYBERSECURITY" | "AUTOMATION" | "VIP ACCESS";
  tag: string;
  description: string;
  highlights: string[];
  status: "ACTIVE" | "VERIFIED" | "HOT" | "EXCLUSIVE";
  badgeColor: string;
}

export const TRIX_VIP_VAULT_ITEMS: TrixVipItem[] = [
  {
    id: "lovable-unlimited",
    title: "Lovable Unlimited Full-Stack App Builder Method",
    category: "AI & CREATIVE",
    tag: "UNLIMITED WORKFLOW",
    description:
      "Exclusive engineering blueprint enabling unlimited generative coding runs with Lovable AI. Build, prototype, and ship full-stack web applications without monthly quota limits or throttling.",
    highlights: [
      "Zero monthly token lockouts",
      "Full React + Next.js + Supabase automation",
      "Direct code export & Git repository synchronization",
      "Custom system prompt injection templates",
    ],
    status: "HOT",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  },
  {
    id: "flux-v2",
    title: "Flux AI Unlimited V2.0 Architect Pipeline",
    category: "AI & CREATIVE",
    tag: "IMAGE SYNTHESIS",
    description:
      "Advanced workflow configuration for unlimited ultra-photorealistic image generation. Includes local ComfyUI graph templates, RunPod setup guides, and hyper-detailed visual aesthetics.",
    highlights: [
      "Unrestricted photo-realistic rendering",
      "Custom LoRA training & checkpoint stacking",
      "4K/8K resolution latent upscaling pipelines",
      "Commercial rights creative production workflows",
    ],
    status: "EXCLUSIVE",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
  {
    id: "70-chatgpt-blueprints",
    title: "70 Battle-Tested ChatGPT Systems & Growth Blueprints",
    category: "AUTOMATION",
    tag: "GROWTH AUTOMATION",
    description:
      "Curated library of 70 battle-tested monetization frameworks, inbound traffic funnels, automated B2B outbound scripts, and high-conversion client acquisition playbooks.",
    highlights: [
      "Faceless organic traffic funnels across TikTok & YouTube",
      "47 high-ticket objection rebuttal closing scripts",
      "Automated email marketing sequences & DM outreach templates",
      "Value-anchoring pricing formulas and proposal models",
    ],
    status: "VERIFIED",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "ethical-hacking-10hr",
    title: "10-Hour Complete Ethical Hacking & Penetration Testing Masterclass",
    category: "CYBERSECURITY",
    tag: "OFFENSIVE DEFENSE",
    description:
      "Zero-to-advanced offensive security curriculum designed for ethical hackers, security researchers, and systems defenders. Hands-on labs covering Kali Linux, recon, and exploitation.",
    highlights: [
      "Complete Kali Linux operational workflow & tool mastery",
      "Active & passive network reconnaissance with Nmap & Wireshark",
      "Vulnerability assessment & Metasploit exploitation framework",
      "Defensive counter-measures and automated audit reporting",
    ],
    status: "HOT",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/30",
  },
  {
    id: "web-pentesting-suite",
    title: "Real-World Web Application Security & Penetration Testing Suite",
    category: "CYBERSECURITY",
    tag: "WEB DEFENSE",
    description:
      "Exhaustive training on modern web application security testing. Deep-dive into OWASP Top 10 vulnerabilities, API exploitation, authentication flaws, and defensive coding.",
    highlights: [
      "A-to-Z SQL Injection, XSS, and CSRF attack vector diagnostics",
      "Broken Object-Level Authorization (BOLA) & API testing",
      "Burp Suite Professional interception & payload fuzzing",
      "Safe patch verification and defensive remediation guides",
    ],
    status: "VERIFIED",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  },
  {
    id: "windows-linux-security",
    title: "Windows & Linux Enterprise Infrastructure Security Playbooks",
    category: "CYBERSECURITY",
    tag: "INFRASTRUCTURE",
    description:
      "Production-grade infrastructure hardening playbooks. Master Active Directory defense, Linux kernel security settings, access control lists, and privilege escalation mitigation.",
    highlights: [
      "Active Directory auditing & Kerberoasting defense",
      "Linux server hardening, SSH key defense, & iptables rules",
      "Privilege escalation detection & endpoint protection",
      "Automated log monitoring & threat response pipelines",
    ],
    status: "VERIFIED",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  {
    id: "wifi-wireless-defense",
    title: "Wireless Defense & Wi-Fi Penetration Analysis Framework",
    category: "CYBERSECURITY",
    tag: "NETWORK SECURITY",
    description:
      "Comprehensive wireless network security auditing framework. Learn RF packet capture, WPA2/WPA3 handshake analysis, rogue AP detection, and perimeter defense.",
    highlights: [
      "WPA2 4-way handshake capture & dictionary analysis",
      "Evil twin & deauthentication detection techniques",
      "Enterprise 802.1X wireless defense configurations",
      "RF spectrum auditing and physical perimeter security",
    ],
    status: "EXCLUSIVE",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  {
    id: "termux-mobile-diagnostics",
    title: "Mobile Security & Termux Systems Engineering Diagnostics",
    category: "CYBERSECURITY",
    tag: "MOBILE & CLI",
    description:
      "Transform mobile hardware into an audited security and diagnostics terminal. Complete scripts for rootless network analysis, device telemetry, and automated scripts.",
    highlights: [
      "Termux 500+ package automated installation suite",
      "Android permissions sandbox auditing & ADB diagnostics",
      "Lightweight network packet capture and HTTP traffic inspection",
      "Automated system health & security hardening scripts",
    ],
    status: "ACTIVE",
    badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  },
  {
    id: "veo3-video-pipeline",
    title: "Veo 3 Ultra & Next-Gen Video AI Generation Pipelines",
    category: "AI & CREATIVE",
    tag: "VIDEO SYNTHESIS",
    description:
      "Production blueprints for Google Veo 3 and generative video models. Create cinematic b-roll, high-fidelity character animations, and photorealistic video sequences.",
    highlights: [
      "Cinematic camera angle & lighting prompt prompt engineering",
      "Multi-shot scene continuity & character consistency scripts",
      "Audio-to-video synchronization & 4K post-processing pipelines",
      "Fast commercial video turn-around workflow",
    ],
    status: "HOT",
    badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  },
  {
    id: "motion-hero-vfx",
    title: "Motion Hero: Premium Motion Design & Visual Effects Masterclass",
    category: "AI & CREATIVE",
    tag: "MOTION DESIGN",
    description:
      "Complete multi-part professional motion graphics curriculum. Learn After Effects scripting, 3D typography, kinetic layouts, and commercial-grade brand animation.",
    highlights: [
      "Complete Part 000 & Part 001 project files and source assets",
      "Advanced kinetic typography & eases mastery",
      "3D camera tracking & visual effects integration",
      "High-converting video advertisement templates",
    ],
    status: "EXCLUSIVE",
    badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/30",
  },
  {
    id: "residential-proxies-routing",
    title: "High-Speed Global Residential Proxy Infrastructure & Node Routing",
    category: "AUTOMATION",
    tag: "NETWORK RESILIENCE",
    description:
      "Enterprise proxy configurations for resilient data retrieval, automated scraping, latency optimization, and distributed multi-region request routing.",
    highlights: [
      "152x Clean residential proxy node routing setup",
      "Automatic IP rotation & rate-limit avoidance pipelines",
      "Fingerprint spoofing & anti-bot bypass architectures",
      "Zero-latency multi-threading scraping scripts",
    ],
    status: "ACTIVE",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  },
  {
    id: "vip-chatrooms-mastermind",
    title: "VIP Mastermind Community & Encrypted Private Chat Rooms",
    category: "VIP ACCESS",
    tag: "PRIVATE COMMUNITY",
    description:
      "Direct entry into the closed TRIHEX VIP Mastermind community. Network with top builders, receive live software drops, and get priority 1-on-1 operational support.",
    highlights: [
      "Private closed mastermind chat rooms & developer discussions",
      "Weekly zero-day software releases & alpha dispatches",
      "Direct priority WhatsApp line to TRIHEX Lead Engineers",
      "Early beta testing for all upcoming AI products & toolkits",
    ],
    status: "HOT",
    badgeColor: "bg-amber-400/10 text-amber-300 border-amber-400/40",
  },
];

export function TrixVipVaultShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  const filteredItems = TRIX_VIP_VAULT_ITEMS.filter((item) => {
    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;
    const matchesSearch =
      search.trim() === "" ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.tag.toLowerCase().includes(search.toLowerCase()) ||
      item.highlights.some((h) => h.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categories = ["ALL", "AI & CREATIVE", "CYBERSECURITY", "AUTOMATION", "VIP ACCESS"];

  const waUrl = buildWhatsAppUrl(
    "Hello TRIHEX Operations,\n\nI want to apply for the VIP Private Intelligence Vault pass (Launched by Trix). Please verify my account and send invitation details.\n\nThank you."
  );

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-10 text-slate-100 shadow-2xl">
      {/* Cybernetic ambient backdrop */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[45rem] rounded-full bg-gradient-to-tr from-amber-500/15 via-blue-600/15 to-purple-600/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-8">
        {/* Header Ribbon & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
              <Crown className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>LAUNCHED BY TRIX · VIP PRIVATE VAULT</span>
            </div>
            <h2 className="font-[family-name:var(--font-sora)] text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              TRIHEX VIP Intelligence &amp; Masterclass Vault
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Curated directly by Trix for verified VIP members. Includes unrestricted full-stack AI builders, offensive/defensive cybersecurity masterclasses, 70 automation blueprints, and private mastermind chatrooms.
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
            <span className="text-[11px] font-mono text-slate-400">
              STATUS: <strong className="text-emerald-400">ONLINE &amp; VERIFIED</strong>
            </span>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-600/20 transition-all active:scale-[0.98]"
            >
              <span>Unlock VIP Access</span>
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                    : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search VIP vault resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          </div>
        </div>

        {/* The VIP Bold List */}
        <div className="space-y-3.5">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              className="group relative rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5 transition-all duration-200 hover:border-amber-500/40 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-amber-950/20"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Left block: Title, Badge, Description */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      #{String(idx + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase ${item.badgeColor}`}
                    >
                      {item.tag}
                    </span>
                    <span className="rounded-md border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-300">
                      {item.category}
                    </span>
                    {item.status === "HOT" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400">
                        <Flame className="h-3 w-3" /> HOT
                      </span>
                    )}
                  </div>

                  <h3 className="font-[family-name:var(--font-sora)] text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                    {item.description}
                  </p>

                  {/* Highlights Grid */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                    {item.highlights.map((h, hIdx) => (
                      <div key={hIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="text-slate-300">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right block: Action Button & VIP Verification */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    INCLUDED IN VIP
                  </span>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-all duration-150 active:scale-[0.98]"
                  >
                    <Lock className="h-3 w-3" />
                    <span>Claim via Desk</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Disclaimer & VIP Invitation Link */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-amber-400 shrink-0">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Want Instant Access to the Complete VIP Vault?
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Join the TRIHEX ELITE Founder Membership for annual VIP access, private chatrooms, and 1-on-1 mentorship.
              </p>
            </div>
          </div>
          <Link
            href="/elite"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-slate-100 transition shadow-md"
          >
            <span>View TRIHEX ELITE Membership</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
