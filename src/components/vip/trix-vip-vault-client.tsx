"use client";

import { useState } from "react";
import {
  Crown,
  Terminal,
  ShieldAlert,
  Zap,
  Lock,
  Sparkles,
  Users2,
  CheckCircle2,
  ArrowRight,
  Flame,
  Globe2,
  MessageSquare,
  ShieldCheck,
  Search,
  ExternalLink,
  Code2,
  Video,
  Database,
  Radio,
  Cpu,
  Check,
  Copy,
} from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { VipVaultItem } from "@/lib/vip/vip-store";

export type { VipVaultItem };

export const VIP_ROSTER: VipVaultItem[] = [
  {
    id: "vip-chatrooms-mastermind",
    number: "01",
    title: "VIP Mastermind Community & Encrypted Private Chat Rooms",
    category: "VIP ACCESS & CHATS",
    tag: "PRIVATE COMMUNITY",
    summary:
      "Exclusive access to TRIHEX high-level developer, founder, and security researcher private chat rooms and Discord. Private channels for real-time intelligence, zero-day alerts, and collaborative builds.",
    boldItems: [
      "Encrypted Private Dispatch Channels: Daily operational intel, AI model leaks & methods",
      "Private Discord Alpha Guild: Live screen-shares, code reviews, and architectural masterminds",
      "Direct Founder Hotline: Direct access to Trix for rapid escalation and priority troubleshooting",
      "Special Community Access: Network with elite developers and digital entrepreneurs across Nepal",
    ],
    status: "EXCLUSIVE",
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  {
    id: "lovable-unlimited",
    number: "02",
    title: "Lovable Unlimited Full-Stack App Builder Method",
    category: "AI & CREATIVE",
    tag: "UNLIMITED ENGINE",
    summary:
      "The complete engineering method enabling unlimited generative coding runs with Lovable AI. Build, prototype, and deploy full-stack applications with zero token lockouts or monthly quota freezes.",
    boldItems: [
      "Zero monthly token quota limits: Unlimited continuous application generation",
      "Full Next.js + React + Supabase architectural automation pipeline",
      "One-click Git repository synchronization & clean production export",
      "Autonomous full-stack scaffolding: Auth, Database schemas, and UI styling",
      "Authenticated method execution: No warranty, unthrottled unlimited runs",
    ],
    status: "HOT",
    badgeColor: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  },
  {
    id: "ethical-hacking-10hr",
    number: "03",
    title: "10-Hour Complete Ethical Hacking & Penetration Testing Masterclass",
    category: "CYBERSECURITY & DEFENSE",
    tag: "OFFENSIVE DEFENSE",
    summary:
      "Complete zero-to-advanced offensive security curriculum designed for ethical hackers, security analysts, and system defenders. Real-world penetration testing against isolated educational lab environments.",
    boldItems: [
      "Kali Linux 2026 Operational Workflow: Custom terminal tooling, aliases, and automation",
      "Active & Passive Network Reconnaissance: Nmap script engine, Wireshark packet capture",
      "Exploitation Frameworks: Metasploit, payload generation, and vulnerability verification",
      "Defensive Counter-Measures: Hardening rules, firewall configurations, and audit reports",
    ],
    status: "HOT",
    badgeColor: "bg-red-500/10 text-red-300 border-red-500/30",
  },
  {
    id: "web-pentesting-suite",
    number: "04",
    title: "Real-World Web Application Security & Penetration Testing Suite",
    category: "CYBERSECURITY & DEFENSE",
    tag: "WEB DEFENSE",
    summary:
      "Exhaustive training on modern web application security testing. Deep-dive into OWASP Top 10 vulnerabilities, API exploitation, authentication flaws, and defensive coding.",
    boldItems: [
      "OWASP Top 10 Diagnostics: SQL Injection, Cross-Site Scripting (XSS), and CSRF vectors",
      "API Security & Broken Object-Level Authorization (BOLA/BFLA) mitigation",
      "Burp Suite Professional: Interception, custom repeater macros, and fuzzing payloads",
      "Patch verification & production-safe defensive remediation blueprints",
    ],
    status: "VERIFIED",
    badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
  },
  {
    id: "flux-v2",
    number: "05",
    title: "Flux AI Unlimited V2.0 Architect Pipeline",
    category: "AI & CREATIVE",
    tag: "IMAGE SYNTHESIS",
    summary:
      "Advanced workflow configuration for unlimited ultra-photorealistic image generation. Includes local ComfyUI graph templates, RunPod setup guides, and hyper-detailed visual aesthetics.",
    boldItems: [
      "Unrestricted photo-realistic rendering: Zero generation throttling or credits",
      "ComfyUI Modular Workflow Graphs: Multi-LoRA stacking and custom checkpoint weights",
      "4K/8K resolution latent upscaling pipelines for studio-grade asset output",
      "Commercial rights production workflows for advertising, UI, and concept art",
    ],
    status: "EXCLUSIVE",
    badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/30",
  },
  {
    id: "windows-linux-security",
    number: "06",
    title: "Windows & Linux Enterprise Infrastructure Security Playbooks",
    category: "CYBERSECURITY & DEFENSE",
    tag: "INFRASTRUCTURE",
    summary:
      "Production-grade infrastructure hardening playbooks. Master Active Directory defense, Linux kernel security settings, access control lists, and privilege escalation mitigation.",
    boldItems: [
      "Active Directory auditing & Kerberoasting defense methodologies",
      "Linux server hardening, SSH key rotation policies & iptables defensive rules",
      "Privilege escalation detection & endpoint protection telemetry",
      "Automated log monitoring & threat response pipelines",
    ],
    status: "VERIFIED",
    badgeColor: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  },
  {
    id: "wifi-wireless-defense",
    number: "07",
    title: "Wireless Defense & Wi-Fi Penetration Analysis Framework",
    category: "CYBERSECURITY & DEFENSE",
    tag: "NETWORK SECURITY",
    summary:
      "Comprehensive wireless network security auditing framework. Learn RF packet capture, WPA2/WPA3 handshake analysis, rogue AP detection, and perimeter defense.",
    boldItems: [
      "WPA2 4-way handshake capture & dictionary analysis in isolated lab environments",
      "Evil twin & deauthentication detection techniques for enterprise networks",
      "Enterprise 802.1X wireless defense configurations and RADIUS hardening",
      "RF spectrum auditing and physical perimeter security monitoring",
    ],
    status: "EXCLUSIVE",
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  {
    id: "termux-mobile-diagnostics",
    number: "08",
    title: "Mobile Security & Termux Systems Engineering Diagnostics",
    category: "CYBERSECURITY & DEFENSE",
    tag: "MOBILE & CLI",
    summary:
      "Transform mobile hardware into an audited security and diagnostics terminal. Complete scripts for rootless network analysis, device telemetry, and automated scripts.",
    boldItems: [
      "Termux 500+ package automated installation suite & script orchestrator",
      "Android permissions sandbox auditing & ADB diagnostics workflow",
      "Lightweight network packet capture and HTTP traffic inspection on device",
      "Automated system health & security hardening scripts",
    ],
    status: "ACTIVE",
    badgeColor: "bg-teal-500/10 text-teal-300 border-teal-500/30",
  },
  {
    id: "veo3-video-pipeline",
    number: "09",
    title: "Veo 3 Ultra & Next-Gen Video AI Generation Pipelines",
    category: "AI & CREATIVE",
    tag: "VIDEO SYNTHESIS",
    summary:
      "Production blueprints for Google Veo 3 and generative video models. Create cinematic b-roll, high-fidelity character animations, and photorealistic video sequences.",
    boldItems: [
      "Cinematic camera angle & lighting prompt engineering frameworks",
      "Multi-shot scene continuity & character consistency scripts",
      "Audio-to-video synchronization & 4K post-processing pipelines",
      "Commercial video turnaround workflow for agency scale",
    ],
    status: "HOT",
    badgeColor: "bg-violet-500/10 text-violet-300 border-violet-500/30",
  },
  {
    id: "motion-hero-vfx",
    number: "10",
    title: "Motion Hero: Premium Motion Design & Visual Effects Masterclass",
    category: "AI & CREATIVE",
    tag: "MOTION DESIGN",
    summary:
      "Complete multi-part professional motion graphics curriculum. Learn After Effects scripting, 3D typography, kinetic layouts, and commercial-grade brand animation.",
    boldItems: [
      "Complete Part 000 & Part 001 project files and source assets included",
      "Advanced kinetic typography & curve eases mastery",
      "3D camera tracking & visual effects integration into live video",
      "High-converting video advertisement templates and transitions",
    ],
    status: "EXCLUSIVE",
    badgeColor: "bg-pink-500/10 text-pink-300 border-pink-500/30",
  },
  {
    id: "residential-proxies-routing",
    number: "11",
    title: "High-Speed Global Residential Proxy Infrastructure & Node Routing",
    category: "AUTOMATION & SYSTEMS",
    tag: "NETWORK RESILIENCE",
    summary:
      "Enterprise proxy configurations for resilient data retrieval, automated scraping, latency optimization, and distributed multi-region request routing.",
    boldItems: [
      "152x Clean residential proxy node routing setup and rotation",
      "Automatic IP rotation & rate-limit avoidance pipelines",
      "Fingerprint spoofing & anti-bot bypass architectures for research",
      "Zero-latency multi-threading scraping scripts with backoff retry logic",
    ],
    status: "ACTIVE",
    badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
  },
  {
    id: "dark-web-threat-intel",
    number: "12",
    title: "Dark Web Defensive Architecture & Threat Intelligence Briefings",
    category: "CYBERSECURITY & DEFENSE",
    tag: "THREAT INTEL",
    summary:
      "Defensive monitoring methodologies to detect leaked corporate credentials, exposed API keys, and illicit market intelligence before breaches impact production.",
    boldItems: [
      "Tor routing architecture & defensive isolation environments",
      "Automated credential breach alerting and leak monitoring pipelines",
      "OSINT asset correlation and enterprise perimeter exposure mapping",
      "Proactive remediation playbooks for compromised infrastructure",
    ],
    status: "EXCLUSIVE",
    badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  {
    id: "70-chatgpt-blueprints",
    number: "13",
    title: "70 Battle-Tested ChatGPT Systems & Inbound Growth Blueprints",
    category: "AUTOMATION & SYSTEMS",
    tag: "GROWTH AUTOMATION",
    summary:
      "Curated library of 70 battle-tested monetization frameworks, inbound traffic funnels, automated B2B outbound scripts, and high-conversion client acquisition playbooks.",
    boldItems: [
      "Faceless organic traffic funnels across TikTok, YouTube, and Instagram",
      "47 high-ticket objection rebuttal closing scripts for sales calls",
      "Automated email marketing sequences & DM outreach templates",
      "Value-anchoring pricing formulas and proposal models for agencies",
    ],
    status: "VERIFIED",
    badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  {
    id: "vip-methods-catalog",
    number: "14",
    title: "VIP Diamond Methods Catalog & Private Cloud Drops",
    category: "VIP ACCESS & CHATS",
    tag: "CONTINUOUS DROPS",
    summary:
      "Continuously refreshed private catalog of zero-cost developer tiers, verified API keys, bypass techniques, and cloud credit vouchers updated weekly by Trix.",
    boldItems: [
      "Weekly curated drop: Newly verified cloud credits and student bypasses",
      "Custom system prompt injection templates for major LLMs",
      "Early beta access to new TRIHEX internal automation utilities",
      "Private voting on upcoming courses and community research topics",
    ],
    status: "EXCLUSIVE",
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
];

const CATEGORIES = [
  "ALL",
  "VIP ACCESS & CHATS",
  "CYBERSECURITY & DEFENSE",
  "AI & CREATIVE",
  "AUTOMATION & SYSTEMS",
] as const;

export function TrixVipVaultClient({ initialItems }: { initialItems?: VipVaultItem[] } = {}) {
  const itemsList = initialItems || VIP_ROSTER;
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = itemsList.filter((item) => {
    if (activeCategory !== "ALL" && item.category !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchBold = item.boldItems.some((b) => b.toLowerCase().includes(q));
      const matchTag = item.tag.toLowerCase().includes(q);
      if (!matchTitle && !matchSummary && !matchBold && !matchTag) return false;
    }
    return true;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                activeCategory === cat
                  ? "bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search VIP Vault items..."
            className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Showing count */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <span className="font-bold text-amber-400">{filteredItems.length}</span> verified VIP items
        </span>
        <span className="font-mono text-slate-500">FORMAT: BOLD LIST ROSTER</span>
      </div>

      {/* THE VIP BOLD LIST ROSTER (As requested: "write the text in a Trix TV style, okay. It should be like 'Launched by Trix', and I will provide them all this in VIP bold list. List these two also perfectly, all of these, okay. Not like a product, but like a list. It should be a whole list of what's in the VIP vault: high-level, advanced VIP chat rooms and special community access") */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const itemWaUrl = buildWhatsAppUrl(
            `Hello Trix. I am interested in accessing "${item.title}" from the TRIHEX VIP Vault. Please verify my VIP clearance.`
          );

          return (
            <div
              key={item.id}
              className="group relative rounded-2xl border border-white/10 bg-slate-900/40 p-5 sm:p-6 transition hover:border-amber-500/40 hover:bg-slate-900/70 backdrop-blur-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Header info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-amber-400/80">
                      [{item.number}]
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${item.badgeColor}`}
                    >
                      <Crown className="h-3 w-3" />
                      {item.tag}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-300 transition">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
                    {item.summary}
                  </p>
                </div>

                {/* Quick Action Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(item.id, `${item.title}\n${item.boldItems.join('\n')}`)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 transition"
                    title="Copy details"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <a
                    href={itemWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition"
                  >
                    <span>Request Entry</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* THE BOLD LIST (Explicit format required) */}
              <div className="mt-5 rounded-xl border border-white/5 bg-black/40 p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 mb-3 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>VIP Vault Inclusions:</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-200">
                  {item.boldItems.map((point, idx) => {
                    const colonIdx = point.indexOf(":");
                    if (colonIdx !== -1) {
                      const boldPart = point.slice(0, colonIdx);
                      const rest = point.slice(colonIdx);
                      return (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>
                            <strong className="font-bold text-white text-[13px]">{boldPart}</strong>
                            <span className="text-slate-300">{rest}</span>
                          </span>
                        </li>
                      );
                    }
                    return (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <span className="font-medium text-slate-200">{point}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
