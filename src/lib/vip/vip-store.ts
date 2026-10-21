/**
 * TRIHEX VIP Vault & Balls Store
 * Manages elite VIP roster, private chat rooms, methods, and cloud tools.
 * Styled in "Launched by Trix · Trix TV Exclusive" format with bold list highlights.
 */

export interface VipVaultItem {
  id: string;
  number: string;
  title: string;
  category: "VIP ACCESS & CHATS" | "CYBERSECURITY & DEFENSE" | "AI & CREATIVE" | "AUTOMATION & SYSTEMS";
  tag: string;
  summary: string;
  boldItems: string[];
  status: "EXCLUSIVE" | "VERIFIED" | "HOT" | "ACTIVE" | "MAINTENANCE";
  badgeColor?: string;
  isWorking?: boolean;
  addedAt?: string;
  updatedAt?: string;
}

export const INITIAL_VIP_ROSTER: VipVaultItem[] = [
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
    isWorking: true,
  },
  {
    id: "lovable-unlimited-method",
    number: "02",
    title: "Lovable Unlimited Full-Stack App Builder Method",
    category: "AI & CREATIVE",
    tag: "UNLIMITED METHOD",
    summary:
      "Exclusive engineering blueprint enabling unlimited generative coding runs with Lovable AI. Build, prototype, and ship full-stack web applications without monthly quota limits or throttling.",
    boldItems: [
      "Zero Monthly Token Lockouts: Run continuous multi-screen app generation cycles without stoppage",
      "Full Next.js + Supabase Automation: Direct code scaffolding, schema auto-migration, and auth setup",
      "Git Sync & Clean Codebase Export: Push clean commits directly to GitHub without vendor lock-in",
      "High-Level System Prompts: Production-grade custom instructions preventing LLM regressions",
    ],
    status: "HOT",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    isWorking: true,
  },
  {
    id: "flux-v2-pipeline",
    number: "03",
    title: "Flux AI Unlimited V2.0 Architect Pipeline",
    category: "AI & CREATIVE",
    tag: "IMAGE SYNTHESIS",
    summary:
      "Advanced workflow configuration for unlimited ultra-photorealistic image generation. Includes local ComfyUI graph templates, RunPod setup guides, and hyper-detailed visual aesthetics.",
    boldItems: [
      "Unrestricted Photo-Realistic Rendering: 4K/8K resolution latent upscaling with zero watermark",
      "Custom LoRA Stacking Templates: Fine-tuned cinematic lighting and Nepal-adapted aesthetics",
      "RunPod Serverless Cloud Deployment: On-demand GPU clusters costing under $0.20/hour",
      "Commercial Rights Asset Generation: Full licensing blueprints for advertising and client work",
    ],
    status: "EXCLUSIVE",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    isWorking: true,
  },
  {
    id: "ethical-hacking-10hr-bootcamp",
    number: "04",
    title: "10-Hour Complete Ethical Hacking & Penetration Testing Masterclass",
    category: "CYBERSECURITY & DEFENSE",
    tag: "CYBERSECURITY",
    summary:
      "Zero-to-advanced offensive security curriculum designed for ethical hackers, security researchers, and systems defenders. Hands-on labs covering Kali Linux, recon, and exploitation.",
    boldItems: [
      "Complete Kali Linux Operational Mastery: Terminal workflows, bash automation, and pivoting",
      "Active & Passive Network Recon: Master Nmap NSE scripts, Wireshark packet dissection, and Masscan",
      "Vulnerability Exploitation Frameworks: Metasploit, searchsploit, and custom CVE weaponization",
      "Defensive Counter-Measures: Hardening firewalls, intrusion detection, and audit documentation",
    ],
    status: "HOT",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/30",
    isWorking: true,
  },
  {
    id: "owasp-web-pentesting-suite",
    number: "05",
    title: "Real-World Web Application Security & Penetration Testing Suite",
    category: "CYBERSECURITY & DEFENSE",
    tag: "WEB DEFENSE",
    summary:
      "Exhaustive training on modern web application security testing. Deep-dive into OWASP Top 10 vulnerabilities, API exploitation, authentication flaws, and defensive coding.",
    boldItems: [
      "OWASP Top 10 Deep Dive: SQL Injection, stored XSS, CSRF bypasses, and SSTI exploitation",
      "Broken Object-Level Authorization (BOLA): API security audits and JWT signature tampering tests",
      "Burp Suite Professional Playbooks: HTTP request fuzzing, intruder attacks, and repeater workflows",
      "Safe Patch Verification: Defensive code remediation guides for Next.js, Node.js, and Python",
    ],
    status: "VERIFIED",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    isWorking: true,
  },
  {
    id: "infrastructure-hardening-playbooks",
    number: "06",
    title: "Windows & Linux Enterprise Infrastructure Security Playbooks",
    category: "CYBERSECURITY & DEFENSE",
    tag: "INFRASTRUCTURE",
    summary:
      "Production-grade infrastructure hardening playbooks. Master Active Directory defense, Linux kernel security settings, access control lists, and privilege escalation mitigation.",
    boldItems: [
      "Active Directory Defense: Kerberoasting mitigation, bloodhound graph analysis, and GPO audits",
      "Linux Server Hardening: SSH key-only auth, fail2ban rules, UFW firewalls, and CIS benchmark scans",
      "Privilege Escalation Diagnostics: Automated LinPEAS and WinPEAS exploitation remediation",
      "Threat Hunting & SIEM Telemetry: Auditd configuration, Wazuh integration, and log parsing",
    ],
    status: "VERIFIED",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    isWorking: true,
  },
  {
    id: "wifi-wireless-defense",
    number: "07",
    title: "Wireless Defense & Wi-Fi Penetration Analysis Framework",
    category: "CYBERSECURITY & DEFENSE",
    tag: "NETWORK DEFENSE",
    summary:
      "Field-tested methodologies for assessing Wi-Fi network security. Packet capture, WPA2/WPA3 handshake analysis, rogue access point defense, and deauthentication mitigation.",
    boldItems: [
      "WPA2/WPA3 Handshake Capture: Aircrack-ng suite, hashcat GPU cracking, and PMKID analysis",
      "Evil Twin & Rogue AP Detection: Detecting spoofed SSIDs, captive portals, and DNS poisoning",
      "Enterprise 802.1X Auditing: Certificate validation, RADIUS inspection, and MITM defense",
      "Wireless Perimeter Hardening: Channel optimization, transmission power isolation, and WIPS",
    ],
    status: "VERIFIED",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    isWorking: true,
  },
  {
    id: "cloud-security-architecture",
    number: "08",
    title: "Cloud Infrastructure Security & AWS/Azure Hardening Architecture",
    category: "CYBERSECURITY & DEFENSE",
    tag: "CLOUD SECURITY",
    summary:
      "Comprehensive cloud security architecture blueprints. Eliminate IAM misconfigurations, open S3 buckets, permissive security groups, and unencrypted data volumes across multi-cloud setups.",
    boldItems: [
      "IAM Least-Privilege Policies: Zero-trust role definitions and credential rotation automations",
      "S3 & Storage Bucket Quarantine: Preventing public data exposure and enforcing bucket policies",
      "CloudTrail & VPC Flow Log Analysis: Detecting lateral movement, brute force, and data exfiltration",
      "Terraform Security Scanners: Checkov, tfsec, and trivy pipelines for secure IaC deployments",
    ],
    status: "EXCLUSIVE",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    isWorking: true,
  },
  {
    id: "cryptography-key-management",
    number: "09",
    title: "Advanced Cryptography & Defensive Key Management Protocols",
    category: "CYBERSECURITY & DEFENSE",
    tag: "CRYPTOGRAPHY",
    summary:
      "Practical cryptographic implementation guide for engineers. Symmetric and asymmetric encryption, digital signatures, post-quantum awareness, and secure key lifecycle management.",
    boldItems: [
      "AES-256-GCM & ChaCha20-Poly1305: Authenticated encryption with associated data (AEAD) in Node/Go",
      "RSA & ECDSA Implementation: Key generation, CSR generation, and mutual TLS (mTLS) architectures",
      "Hardware Security Modules (HSM): AWS KMS, HashiCorp Vault, and envelope encryption pipelines",
      "Key Rotation & Zeroization: Automated key retirement and cryptographic zero-fill destruction",
    ],
    status: "VERIFIED",
    badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    isWorking: true,
  },
  {
    id: "residential-proxy-gateway",
    number: "10",
    title: "152x High-Anonymity Residential Proxy Gateway & Rotating IPs",
    category: "AUTOMATION & SYSTEMS",
    tag: "NETWORK ACCESS",
    summary:
      "Curated pool of clean, high-reputation rotating residential and mobile proxy configurations. Ideal for web scraping, geo-unblocking, multi-account management, and automated testing.",
    boldItems: [
      "152 Dedicated Endpoint Nodes: Clean IP pools covering USA, UK, Singapore, India, and Germany",
      "Sticky Session & Rotating Ports: Custom rotation intervals from 1 minute to 60 minutes",
      "Zero CAPTCHA & Zero Cloudflare Challenge: Residential ASN provenance bypassing bot blockers",
      "Integration Snippets: Python Requests, Playwright, Puppeteer, and cURL ready configurations",
    ],
    status: "EXCLUSIVE",
    badgeColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    isWorking: true,
  },
  {
    id: "300-automation-blueprints",
    number: "11",
    title: "300+ Pre-Configured Automation Blueprints (n8n + Make + Python)",
    category: "AUTOMATION & SYSTEMS",
    tag: "WORKFLOW AUTOMATION",
    summary:
      "Massive library of production-ready automation templates. Connect LLMs to databases, automate customer onboarding, sync inventory across platforms, and orchestrate serverless tasks.",
    boldItems: [
      "Ready-to-Import JSON Templates: Plug directly into self-hosted n8n, Make.com, or Zapier",
      "AI Autonomous Agent Workflows: Auto-triage customer tickets, draft replies, and post updates",
      "Social Media & Content Syndication: Multi-platform cross-posting with automated thumbnail rendering",
      "Webhook-to-Database Pipelines: Instant PostgreSQL, Supabase, and Airtable record synchronizers",
    ],
    status: "HOT",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    isWorking: true,
  },
  {
    id: "70-growth-blueprints",
    number: "12",
    title: "70 Battle-Tested ChatGPT Systems & Growth Blueprints",
    category: "AUTOMATION & SYSTEMS",
    tag: "GROWTH AUTOMATION",
    summary:
      "Curated library of 70 battle-tested monetization frameworks, inbound traffic funnels, automated B2B outbound scripts, and high-conversion client acquisition playbooks.",
    boldItems: [
      "Faceless Organic Traffic Funnels: Systems generating 100k+ organic views on TikTok & YouTube Shorts",
      "47 High-Ticket Objection Rebuttals: Battle-tested scripts for closing digital marketing & AI deals",
      "Automated Cold Email Sequences: 65%+ open rate copy templates with spintax personalization",
      "Value-Anchored Pricing Models: Proposals and retainer pitch decks that close NPR 50k - 200k clients",
    ],
    status: "VERIFIED",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    isWorking: true,
  },
  {
    id: "vip-concierge-support",
    number: "13",
    title: "24/7 Dedicated Concierge & Private VIP Hotline",
    category: "VIP ACCESS & CHATS",
    tag: "WHITE-GLOVE SUPPORT",
    summary:
      "Direct personal support channel for VIP members. Get priority order fulfillment, custom tooling requests, personalized account setup assistance, and expedited warranty replacements.",
    boldItems: [
      "Under 15-Minute Response Time: Direct WhatsApp & Private Hotline lines with senior support leads",
      "Custom Software Sourcing: If a tool isn't listed, our team sources and authenticates it for you",
      "Personalized Setup Sessions: 1-on-1 remote assistance for configuring tools, API keys, and VPNs",
      "Lifetime Replacement Warranty: Instant zero-question replacement on all verified VIP subscriptions",
    ],
    status: "EXCLUSIVE",
    badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    isWorking: true,
  },
  {
    id: "uncapped-api-proxy-cluster",
    number: "14",
    title: "Secret Uncapped API Proxy Cluster (Claude 3.7 + GPT-4o High-Tier)",
    category: "VIP ACCESS & CHATS",
    tag: "API INFRASTRUCTURE",
    summary:
      "Exclusive routing endpoint proxying requests to Claude 3.7 Sonnet, GPT-4o, and o3-mini without individual rate limits or credit card restrictions. Low-latency edge failover across 4 continents.",
    boldItems: [
      "Universal OpenAI-Compatible Endpoint: Drop into Cursor, Continue.dev, or custom Python code",
      "Uncapped Token Throughput: High RPM/TPM limits suitable for production agent runs and indexing",
      "Automatic Model Fallback: Seamless failover from Claude 3.7 to GPT-4o if upstream latency spikes",
      "Zero Data Retention Mode: Direct encrypted passthrough with zero logging of sensitive prompts",
    ],
    status: "EXCLUSIVE",
    badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    isWorking: true,
  },
];

// In-memory store for VIP Vault items
let vipRoster: VipVaultItem[] = [...INITIAL_VIP_ROSTER];

export function getAllVipVaultItems(): VipVaultItem[] {
  return [...vipRoster];
}

export function getVipVaultItem(id: string): VipVaultItem | undefined {
  return vipRoster.find((i) => i.id === id);
}

export function addVipVaultItem(
  item: Omit<VipVaultItem, "number"> & { number?: string }
): VipVaultItem {
  const number =
    item.number ||
    String(vipRoster.length + 1).padStart(2, "0");
  const newItem: VipVaultItem = {
    ...item,
    number,
    isWorking: item.isWorking ?? true,
    addedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  vipRoster.unshift(newItem);
  return newItem;
}

export function updateVipVaultItem(
  id: string,
  updates: Partial<VipVaultItem>
): VipVaultItem | null {
  const index = vipRoster.findIndex((i) => i.id === id);
  if (index === -1) return null;

  vipRoster[index] = {
    ...vipRoster[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return vipRoster[index];
}

export function deleteVipVaultItem(id: string): boolean {
  const initialLength = vipRoster.length;
  vipRoster = vipRoster.filter((i) => i.id !== id);
  return vipRoster.length < initialLength;
}

export function toggleVipItemWorking(id: string, isWorking?: boolean): VipVaultItem | null {
  const item = vipRoster.find((i) => i.id === id);
  if (!item) return null;
  const newStatus = isWorking !== undefined ? isWorking : !item.isWorking;
  item.isWorking = newStatus;
  item.updatedAt = new Date().toISOString();
  return item;
}

export function toggleVipItemStatus(
  id: string,
  status: VipVaultItem["status"]
): VipVaultItem | null {
  const item = vipRoster.find((i) => i.id === id);
  if (!item) return null;
  item.status = status;
  item.updatedAt = new Date().toISOString();
  return item;
}
