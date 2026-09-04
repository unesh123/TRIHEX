/**
 * TRIHEX ELITE — Founder & AI Intelligence Membership
 * 
 * Truthful, executive-tier intelligence membership for engineering leads,
 * digital agency founders, and technology decision-makers in Nepal.
 * 
 * Strict Compliance:
 * - Status: DRAFT (Invitation / Private Review only)
 * - Zero wealth-guarantee or get-rich-quick claims.
 * - Genuine deliverables: Private research briefs, prompt repository access,
 *   priority concierge licensing desk, and verified vendor cloud perks.
 */

export interface EliteMembershipTier {
  id: string;
  name: string;
  slug: string;
  priceNprMinor: number;
  currency: string;
  billingPeriod: "ANNUAL" | "LIFETIME";
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  tagline: string;
  description: string;
  pillars: {
    title: string;
    description: string;
    features: string[];
  }[];
  deliverables: string[];
  faq: {
    question: string;
    answer: string;
  }[];
}

export const TRIHEX_ELITE_MEMBERSHIP: EliteMembershipTier = {
  id: "membership-trihex-elite",
  name: "TRIHEX ELITE — Founder & AI Intelligence Pass",
  slug: "elite",
  priceNprMinor: 1369900, // NPR 13,699 (exact spec)
  currency: "NPR",
  billingPeriod: "ANNUAL",
  status: "DRAFT",
  tagline: "Uncompromising engineering intelligence, executive research briefings, and VIP software fulfillment for Nepal's tech leaders.",
  description: 
    "TRIHEX ELITE is a curated annual membership designed strictly for digital agency executives, engineering directors, and high-velocity founders operating in Nepal. It combines deep intelligence reports, priority licensing support, and battle-tested generative AI toolkits.",
  pillars: [
    {
      title: "1. Lawful Intelligence & Civic Research",
      description: "Direct briefings and synthesized intelligence on Nepal's rapidly shifting regulatory, banking, and technology environment.",
      features: [
        "Quarterly Macro & NRB Forex Directive Briefings with financial impact analysis",
        "Cross-Border Digital Payment compliance guidance for SaaS businesses",
        "Real-time civic data snapshots (earthquake, infrastructure, telecommunications)",
        "Zero speculation: only verified primary sources and official circulars"
      ]
    },
    {
      title: "2. The Master Prompt & Architecture Vault",
      description: "Comprehensive, production-tested prompt templates and agentic loop architectures curated by senior engineers.",
      features: [
        "Unrestricted access to 100+ original typed prompt architectures",
        "Quarterly prompt suite updates spanning .NET 9, Laravel 11, Next.js 16, and Rust",
        "Autonomous agent function-calling templates and ReAct loops",
        "Direct JSON/YAML variable injection configurations"
      ]
    },
    {
      title: "3. Priority VIP Concierge & Fulfillment Desk",
      description: "Dedicated operator channel for custom enterprise software acquisition, seat management, and rapid renewals.",
      features: [
        "Dedicated VIP WhatsApp hotline with 1-hour business SLA response",
        "Custom enterprise invoice billing with official IRD VAT/PAN tax documentation",
        "Proactive license renewal protection to prevent service discontinuation",
        "Dedicated procurement agent for unlisted enterprise developer tools"
      ]
    },
    {
      title: "4. Verified Vendor Credits & Partner Perks",
      description: "Aggregated, constantly verified high-value cloud credits and software perks for engineering teams.",
      features: [
        "Pre-vetted applications for cloud infrastructure credits (DigitalOcean, AWS, Azure)",
        "Student & startup incubator discount navigation",
        "Zero dead links or deceptive vouchers: 100% corroborated partner perks"
      ]
    }
  ],
  deliverables: [
    "Annual TRIHEX ELITE Digital Credential & Member ID",
    "Private Research Telegram/Signal channel for real-time circular dispatches",
    "Quarterly 1-on-1 Software Portfolio & Licensing Optimization Review",
    "Immediate VIP bypass on order queues and customer support desks",
    "Full access to the TRIHEX Vault offline repository"
  ],
  faq: [
    {
      question: "Is this membership available to everyone?",
      answer: "No. TRIHEX ELITE is currently in DRAFT status and is limited to invitation-only reviews. We evaluate applicants to ensure mutual alignment and high professional conduct."
    },
    {
      question: "Does this program guarantee revenue or business success?",
      answer: "Strictly no. TRIHEX DIGITAL does not make financial or get-rich promises. ELITE is an intelligence, operational efficiency, and concierge licensing service. Your success depends entirely on your own engineering and business execution."
    },
    {
      question: "How is payment handled?",
      answer: "When invited, membership fees (NPR 13,699/year) are payable via official Nepal commercial bank transfer, eSewa, or Khalti. All transactions are documented with an official VAT/PAN tax invoice."
    },
    {
      question: "Can an enterprise team share one membership?",
      answer: "Each ELITE membership provides coverage for one primary account holder and up to 3 authorized team delegates for software procurement requests."
    }
  ]
};
