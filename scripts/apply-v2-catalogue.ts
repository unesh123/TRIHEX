import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { normalizeEnvAliases } from "../src/lib/env/normalize-aliases";
normalizeEnvAliases();

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, notInArray } from "drizzle-orm";
import * as schema from "../src/db/schema";

interface VariantDef {
  sku: string;
  name: string;
  priceNpr: number;
  compareAtNpr?: number;
  costNpr?: number;
  stockQty?: number | null;
  durationValue: number;
  durationUnit: "days" | "months" | "years" | "lifetime";
  purchasable?: boolean;
}

interface ProductDef {
  slug: string;
  name: string;
  brandSlug: string;
  brandName: string;
  categorySlug: string;
  categoryName: string;
  shortDescription: string;
  featured?: boolean;
  coverPath: string;
  features: string[];
  variants: VariantDef[];
}

const CATALOGUE_V2: ProductDef[] = [
  {
    slug: "claude-code-api-access",
    name: "Claude Code API Access — Unlimited Coding",
    brandSlug: "claude",
    brandName: "Anthropic Claude",
    categorySlug: "developer-tools",
    categoryName: "Developer Tools",
    shortDescription: "Full Claude Code API access with real-time usage tracking, Opus & Sonnet model access, high response speed, and large context window.",
    featured: true,
    coverPath: "/media/covers/claude/claude-code-api-access.webp",
    features: [
      "Full API Access for Claude Code CLI & Extensions",
      "Claude Opus 4.8 Thinking, Opus 4.7 & Sonnet 4.5",
      "Live API Key Usage Checker & Real-Time Token Analytics",
      "Optimized Fast Response Speed for Big Projects",
      "24/7 High-Availability Infrastructure",
      "Full Replacement Warranty for the Selected Duration",
    ],
    variants: [
      {
        sku: "CLD-10M-1D",
        name: "10M Token Package (1 Day Access)",
        priceNpr: 1299,
        compareAtNpr: 6999,
        costNpr: 300,
        stockQty: 20,
        durationValue: 1,
        durationUnit: "days",
        purchasable: true,
      },
      {
        sku: "CLD-50M-1D",
        name: "50M Token Package (1 Day Access - Best Value)",
        priceNpr: 2699,
        compareAtNpr: 34999,
        costNpr: 550,
        stockQty: 6,
        durationValue: 1,
        durationUnit: "days",
        purchasable: true,
      },
      {
        sku: "CLD-100M-1D",
        name: "100M Token Package (1 Day Access)",
        priceNpr: 4699,
        compareAtNpr: 69999,
        costNpr: 800,
        stockQty: 10,
        durationValue: 1,
        durationUnit: "days",
        purchasable: true,
      },
      {
        sku: "CLD-100M-3D",
        name: "100M Token Package (3 Days Access)",
        priceNpr: 5999,
        compareAtNpr: 79999,
        costNpr: 990,
        stockQty: 3,
        durationValue: 3,
        durationUnit: "days",
        purchasable: true,
      },
      {
        sku: "CLD-100M-7D",
        name: "100M Token Package (7 Days Access)",
        priceNpr: 7499,
        compareAtNpr: 99999,
        costNpr: 1250,
        stockQty: 9,
        durationValue: 7,
        durationUnit: "days",
        purchasable: true,
      },
    ],
  },
  {
    slug: "gemini-pro-18-months-link",
    name: "Google Gemini AI Pro — 18 Months",
    brandSlug: "gemini",
    brandName: "Google Gemini",
    categorySlug: "ai-tools",
    categoryName: "AI Assistants",
    shortDescription: "Google Gemini AI Pro 18-month plan with 5 TB cloud storage, Gemini 3 Pro access, and Veo video generator.",
    featured: true,
    coverPath: "/media/covers/gemini/gemini-pro-18-month-upgrade.webp",
    features: [
      "Access to Gemini 3 Pro most advanced AI model",
      "5 TB Cloud Storage for Google Drive, Photos & Gmail",
      "AI Video Generator (Veo integration)",
      "Advanced Deep Research & NotebookLM tools",
      "Gemini in Google Workspace Apps (Docs, Sheets, Gmail)",
      "Early access to Google AI cutting-edge features",
    ],
    variants: [
      {
        sku: "GEM-18M-NOWAR",
        name: "18 Months (No Warranty)",
        priceNpr: 399,
        compareAtNpr: 4999,
        costNpr: 160,
        stockQty: 696,
        durationValue: 18,
        durationUnit: "months",
        purchasable: true,
      },
      {
        sku: "GEM-18M-6MWAR",
        name: "18 Months (6 Months Warranty)",
        priceNpr: 1299,
        compareAtNpr: 6999,
        costNpr: 350,
        stockQty: 200,
        durationValue: 18,
        durationUnit: "months",
        purchasable: true,
      },
      {
        sku: "GEM-18M-1YWAR",
        name: "18 Months (1 Year+ Warranty)",
        priceNpr: 2699,
        compareAtNpr: 9999,
        costNpr: 600,
        stockQty: 100,
        durationValue: 18,
        durationUnit: "months",
        purchasable: true,
      },
    ],
  },
  {
    slug: "capcut-pro",
    name: "CapCut Pro — Full Warranty",
    brandSlug: "capcut",
    brandName: "CapCut",
    categorySlug: "video-editing",
    categoryName: "Video & Editing",
    shortDescription: "CapCut Pro premium video editing membership with 4K 60FPS export, watermark removal, and all pro visual effects.",
    featured: true,
    coverPath: "/media/covers/capcut/capcut-pro-6-months.webp",
    features: [
      "Remove All Watermarks & Branding completely",
      "Unlimited Access to All Pro Video Assets & Filters",
      "4K / 60 FPS Ultra-HD High Bitrate Video Export",
      "Advanced Speed Ramp, Curve & Motion Blur Tools",
      "Smart AI Auto-Captions & Subtitle Translation",
    ],
    variants: [
      {
        sku: "CAP-7D-FW",
        name: "7 Days Full Warranty",
        priceNpr: 299,
        compareAtNpr: 799,
        costNpr: 70,
        stockQty: 112,
        durationValue: 7,
        durationUnit: "days",
        purchasable: true,
      },
      {
        sku: "CAP-1M-FW",
        name: "1 Month Full Warranty",
        priceNpr: 799,
        compareAtNpr: 1899,
        costNpr: 360,
        stockQty: 107,
        durationValue: 1,
        durationUnit: "months",
        purchasable: true,
      },
      {
        sku: "CAP-3M-FW",
        name: "3 Months Team Full Warranty",
        priceNpr: 2399,
        compareAtNpr: 4999,
        costNpr: 1090,
        stockQty: 4,
        durationValue: 3,
        durationUnit: "months",
        purchasable: true,
      },
      {
        sku: "CAP-6M-FW",
        name: "6 Months Full Warranty",
        priceNpr: 3699,
        compareAtNpr: 7999,
        costNpr: 1700,
        stockQty: 46,
        durationValue: 6,
        durationUnit: "months",
        purchasable: true,
      },
    ],
  },
  {
    slug: "elevenlabs-creator-shared",
    name: "ElevenLabs Creator — Shared Plan",
    brandSlug: "elevenlabs",
    brandName: "ElevenLabs",
    categorySlug: "ai-tools",
    categoryName: "AI Assistants",
    shortDescription: "Ultra-realistic AI voice cloning and text-to-speech audio generation with commercial licensing on a shared creator setup.",
    featured: true,
    coverPath: "/media/covers/elevenlabs/elevenlabs-creator-shared.webp",
    features: [
      "Ultra-Realistic AI Voice Cloning & Synthesis",
      "Access to 100,000+ Premium Verified Voices",
      "Commercial Rights for Monetized YouTube & Media",
      "Multi-Language Audio & Dubbing Studio",
      "High-Priority Audio Generation Queue",
    ],
    variants: [
      {
        sku: "ELV-2M-SHARED",
        name: "2 Months Creator Shared",
        priceNpr: 2699,
        compareAtNpr: 5999,
        costNpr: 800,
        stockQty: 20,
        durationValue: 2,
        durationUnit: "months",
        purchasable: true,
      },
      {
        sku: "ELV-3M-SHARED",
        name: "3 Months Creator Shared",
        priceNpr: 3699,
        compareAtNpr: 7999,
        costNpr: 1100,
        stockQty: 20,
        durationValue: 3,
        durationUnit: "months",
        purchasable: true,
      },
      {
        sku: "ELV-6M-SHARED",
        name: "6 Months Creator Shared",
        priceNpr: 5999,
        compareAtNpr: 12999,
        costNpr: 2000,
        stockQty: 20,
        durationValue: 6,
        durationUnit: "months",
        purchasable: true,
      },
      {
        sku: "ELV-9M-SHARED",
        name: "9 Months Creator Shared",
        priceNpr: 7999,
        compareAtNpr: 16999,
        costNpr: 2800,
        stockQty: 20,
        durationValue: 9,
        durationUnit: "months",
        purchasable: true,
      },
      {
        sku: "ELV-12M-FULL",
        name: "12 Months Full Creator Plan",
        priceNpr: 9999,
        compareAtNpr: 24999,
        costNpr: 4000,
        stockQty: 20,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
    ],
  },
  {
    slug: "cursor-pro-12m",
    name: "Cursor Pro — AI Code Editor",
    brandSlug: "cursor",
    brandName: "Cursor",
    categorySlug: "developer-tools",
    categoryName: "Developer Tools",
    shortDescription: "The premier AI-first code editor. Multi-file edits, codebase chat, bug fixing, and Claude 3.5 Sonnet integration.",
    featured: true,
    coverPath: "/media/covers/cursor/cursor-pro-12m.webp",
    features: [
      "AI-Powered Code Autocomplete & Prediction",
      "Advanced Codebase Chat & Global Context Search",
      "Seamless Claude 3.5 Sonnet & GPT-4o Integration",
      "Instant Bug Detection, Linting & Refactoring",
    ],
    variants: [
      {
        sku: "CUR-1M",
        name: "1 Month Pro Access",
        priceNpr: 1999,
        compareAtNpr: 4499,
        costNpr: 800,
        stockQty: 30,
        durationValue: 1,
        durationUnit: "months",
        purchasable: true,
      },
      {
        sku: "CUR-12M",
        name: "12 Months Pro Access",
        priceNpr: 15999,
        compareAtNpr: 34999,
        costNpr: 9600,
        stockQty: 12,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
      {
        sku: "CUR-12M-SHARED",
        name: "12 Months Team Seat Invite (Shared)",
        priceNpr: 7999,
        compareAtNpr: 19999,
        costNpr: 4800,
        stockQty: 15,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
    ],
  },
  {
    slug: "gamma-pro-1-year",
    name: "Gamma App Pro — 1 Year",
    brandSlug: "gamma",
    brandName: "Gamma",
    categorySlug: "ai-tools",
    categoryName: "AI Assistants",
    shortDescription: "AI presentation and webpage generator. Create beautiful decks, docs, and interactive sites in seconds.",
    featured: false,
    coverPath: "/media/covers/gamma/gamma-ai-pro-1-month.webp",
    features: [
      "Unlimited AI Generation for Decks & Pages",
      "Custom Branding, Color Palettes & Fonts",
      "Advanced Card Templates & Interactive Embeds",
      "Export to High-Resolution PDF & PowerPoint",
    ],
    variants: [
      {
        sku: "GAM-1Y",
        name: "1 Year Dedicated Membership",
        priceNpr: 6999,
        compareAtNpr: 14999,
        costNpr: 3200,
        stockQty: 17,
        durationValue: 1,
        durationUnit: "years",
        purchasable: true,
      },
      {
        sku: "GAM-1Y-SHARED",
        name: "1 Year Workspace Shared Seat",
        priceNpr: 2999,
        compareAtNpr: 7999,
        costNpr: 1600,
        stockQty: 25,
        durationValue: 1,
        durationUnit: "years",
        purchasable: true,
      },
    ],
  },
  {
    slug: "lovable-pro-12m",
    name: "Lovable AI Pro — 12 Months",
    brandSlug: "lovable",
    brandName: "Lovable",
    categorySlug: "developer-tools",
    categoryName: "Developer Tools",
    shortDescription: "Full-stack software builder powered by AI. Build, edit, and ship web applications from plain English prompts.",
    featured: false,
    coverPath: "/media/covers/developer/lovable-pro-12m.webp",
    features: [
      "Build Web Apps from Natural Language Prompts",
      "Native Supabase Database & Auth Integration",
      "Instant Code Modification & Previews",
      "Export Production-Ready React / Next.js Code",
    ],
    variants: [
      {
        sku: "LOV-12M",
        name: "12 Months Dedicated Access",
        priceNpr: 6999,
        compareAtNpr: 15999,
        costNpr: 4480,
        stockQty: 39,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
      {
        sku: "LOV-12M-SHARED",
        name: "12 Months Workspace Shared Seat",
        priceNpr: 2899,
        compareAtNpr: 7999,
        costNpr: 2000,
        stockQty: 20,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
    ],
  },
  {
    slug: "gumloop-pro-12m",
    name: "Gumloop Pro — 12 Months",
    brandSlug: "gumloop",
    brandName: "Gumloop",
    categorySlug: "automation",
    categoryName: "Automation",
    shortDescription: "No-code AI workflow automation and web scraper. Automate lead gen, data extraction, and document processing at scale.",
    featured: false,
    coverPath: "/media/covers/automation/gumloop-pro-12m.webp",
    features: [
      "Autonomous AI Web Data Extraction & Scraping",
      "Custom Python Scripts & API Integrations",
      "Batch Processing for Thousands of Rows",
      "Visual Pipeline & Agent Flow Builder",
    ],
    variants: [
      {
        sku: "GUM-12M",
        name: "12 Months Access",
        priceNpr: 4499,
        compareAtNpr: 9999,
        costNpr: 1040,
        stockQty: 26,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
      {
        sku: "GUM-12M-SHARED",
        name: "12 Months Shared Flow Seat",
        priceNpr: 1999,
        compareAtNpr: 4999,
        costNpr: 500,
        stockQty: 30,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
    ],
  },
  {
    slug: "supabase-pro-1-year",
    name: "Supabase Pro — 1 Year",
    brandSlug: "supabase",
    brandName: "Supabase",
    categorySlug: "developer-tools",
    categoryName: "Developer Tools",
    shortDescription: "Complete backend platform with Postgres, Authentication, Edge Functions, Realtime subscriptions, and storage.",
    featured: false,
    coverPath: "/media/covers/developer/supabase-pro-1-year.webp",
    features: [
      "Dedicated PostgreSQL Database & 100 GB Storage",
      "100,000 Monthly Active Users Included",
      "Automated Daily Backups with 7-Day Point-in-Time",
      "Edge Functions & Realtime Subscriptions",
    ],
    variants: [
      {
        sku: "SUPA-1Y",
        name: "1 Year Dedicated Plan",
        priceNpr: 6999,
        compareAtNpr: 14999,
        costNpr: 3680,
        stockQty: 59,
        durationValue: 1,
        durationUnit: "years",
        purchasable: true,
      },
      {
        sku: "SUPA-1Y-SHARED",
        name: "1 Year Shared Org Member",
        priceNpr: 2999,
        compareAtNpr: 7999,
        costNpr: 1800,
        stockQty: 40,
        durationValue: 1,
        durationUnit: "years",
        purchasable: true,
      },
    ],
  },
  {
    slug: "notion-business-12m",
    name: "Notion Business — 12 Months",
    brandSlug: "notion",
    brandName: "Notion",
    categorySlug: "productivity",
    categoryName: "Productivity",
    shortDescription: "All-in-one workspace for team wiki, document collaboration, task management, and databases with private teamspaces.",
    featured: false,
    coverPath: "/media/covers/productivity/notion-business-12m.webp",
    features: [
      "Unlimited Blocks & Collaborative Pages",
      "Advanced Team Permissions & Workspaces",
      "SAML SSO & Private Teamspaces",
      "90-Day Page Version History & Audit Logs",
    ],
    variants: [
      {
        sku: "NOT-12M",
        name: "12 Months Dedicated Workspace",
        priceNpr: 5499,
        compareAtNpr: 12999,
        costNpr: 2080,
        stockQty: 18,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
      {
        sku: "NOT-12M-SHARED",
        name: "12 Months Team Seat Invite",
        priceNpr: 1999,
        compareAtNpr: 4999,
        costNpr: 1000,
        stockQty: 50,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
    ],
  },
  {
    slug: "runway-pro-12m",
    name: "Runway Pro — 12 Months",
    brandSlug: "runway",
    brandName: "Runway",
    categorySlug: "video-editing",
    categoryName: "Video & Editing",
    shortDescription: "Hollywood-grade Gen-3 Alpha AI video generation platform with motion brush, camera control, and 4K upscaling.",
    featured: false,
    coverPath: "/media/covers/video/runway-pro-12m.webp",
    features: [
      "Gen-3 Alpha Cinematic Video Generation",
      "Text to Video, Image to Video & Motion Brush",
      "4K Upscaling & Professional Removal Tools",
      "Commercial License for All Generated Media",
    ],
    variants: [
      {
        sku: "RUN-12M",
        name: "12 Months Access",
        priceNpr: 7999,
        compareAtNpr: 16999,
        costNpr: 3680,
        stockQty: 51,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
      {
        sku: "RUN-12M-SHARED",
        name: "12 Months Shared Workspace Seat",
        priceNpr: 3499,
        compareAtNpr: 8999,
        costNpr: 1800,
        stockQty: 30,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
    ],
  },
  {
    slug: "granola-business-12m",
    name: "Granola Business — 12 Months",
    brandSlug: "granola",
    brandName: "Granola",
    categorySlug: "productivity",
    categoryName: "Productivity",
    shortDescription: "AI meeting notepad designed for macOS. Transcribes, summarizes, and extracts key action items from any video call.",
    featured: false,
    coverPath: "/media/covers/productivity/granola-business-12m.webp",
    features: [
      "Intelligent Mac AI Meeting Transcription",
      "Automated Action Items & Executive Summaries",
      "Seamless Notion, Slack & Email Export",
      "Custom Templates & Private Team Sharing",
    ],
    variants: [
      {
        sku: "GRAN-12M",
        name: "12 Months Dedicated License",
        priceNpr: 6999,
        compareAtNpr: 14999,
        costNpr: 800,
        stockQty: 108,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
      {
        sku: "GRAN-12M-SHARED",
        name: "12 Months Shared Seat",
        priceNpr: 2499,
        compareAtNpr: 5999,
        costNpr: 400,
        stockQty: 50,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
    ],
  },
  {
    slug: "mobbin-12m",
    name: "Mobbin Pro 10x Seat — 12 Months",
    brandSlug: "mobbin",
    brandName: "Mobbin",
    categorySlug: "design",
    categoryName: "Design & Creative",
    shortDescription: "The world's largest mobile and web UI design library with over 300,000 screens, user flows, and Figma integration.",
    featured: false,
    coverPath: "/media/covers/design/mobbin-12m.webp",
    features: [
      "300,000+ Real Mobile & Web App Screens",
      "Complete User Journey Flows & UX Patterns",
      "Filter by Platform, Pattern & Component",
      "10x Seat Shared Access Tier",
    ],
    variants: [
      {
        sku: "MOB-12M-10X",
        name: "12 Months 10x Team License",
        priceNpr: 6999,
        compareAtNpr: 15999,
        costNpr: 1440,
        stockQty: 33,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
      {
        sku: "MOB-12M-1SEAT",
        name: "12 Months Single Shared Seat",
        priceNpr: 2199,
        compareAtNpr: 5999,
        costNpr: 500,
        stockQty: 40,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
    ],
  },
  {
    slug: "railway-hobby-12m",
    name: "Railway Hobby — 12 Months",
    brandSlug: "railway",
    brandName: "Railway",
    categorySlug: "developer-tools",
    categoryName: "Developer Tools",
    shortDescription: "Zero-configuration cloud infrastructure platform. Deploy databases, web servers, and backends with continuous git deploys.",
    featured: false,
    coverPath: "/media/covers/developer/railway-hobby-12m.webp",
    features: [
      "Instant Deployments from GitHub Repositories",
      "PostgreSQL, Redis & MySQL One-Click Setup",
      "Custom Domains with Automatic SSL",
      "Generous Monthly Compute & Network Usage",
    ],
    variants: [
      {
        sku: "RAIL-12M",
        name: "12 Months Dedicated Plan",
        priceNpr: 6299,
        compareAtNpr: 13999,
        costNpr: 1920,
        stockQty: 65,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
      {
        sku: "RAIL-12M-SHARED",
        name: "12 Months Shared Project Workspace",
        priceNpr: 2499,
        compareAtNpr: 5999,
        costNpr: 900,
        stockQty: 50,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
    ],
  },
  {
    slug: "framer-pro-12m",
    name: "Framer Pro — 12 Months",
    brandSlug: "framer",
    brandName: "Framer",
    categorySlug: "design",
    categoryName: "Design & Creative",
    shortDescription: "Interactive website builder for creators and designers. Design on canvas, publish live sites with top-tier performance.",
    featured: false,
    coverPath: "/media/covers/design/framer-pro-12m.webp",
    features: [
      "Design & Publish Fast, Responsive Websites",
      "Unlimited Custom Domains & Webpages",
      "30 CMS Collections for Dynamic Content",
      "Advanced Interactive Scroll & Motion Animations",
    ],
    variants: [
      {
        sku: "FRA-12M",
        name: "12 Months Dedicated Access",
        priceNpr: 6999,
        compareAtNpr: 15999,
        costNpr: 2400,
        stockQty: 40,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
      {
        sku: "FRA-12M-SHARED",
        name: "12 Months Shared Workspace Seat",
        priceNpr: 2499,
        compareAtNpr: 6999,
        costNpr: 1000,
        stockQty: 30,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
    ],
  },
  {
    slug: "factory-12m",
    name: "Factory Droid AI — 12 Months",
    brandSlug: "factory",
    brandName: "Factory AI",
    categorySlug: "developer-tools",
    categoryName: "Developer Tools",
    shortDescription: "Autonomous software engineering droids that integrate with your codebase to review PRs, build features, and write tests.",
    featured: false,
    coverPath: "/media/covers/developer/factory-12m.webp",
    features: [
      "Autonomous AI Software Engineering Droids",
      "Automated Code Auditing & PR Generation",
      "Repo-Wide Architectural Understanding",
      "Continuous Feature Development & Test Writing",
    ],
    variants: [
      {
        sku: "FAC-12M",
        name: "12 Months Access",
        priceNpr: 7999,
        compareAtNpr: 16999,
        costNpr: 2400,
        stockQty: 38,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
    ],
  },
  {
    slug: "chatgpt-plus-1-month-fw",
    name: "ChatGPT Plus — 1 Month Full Warranty",
    brandSlug: "openai",
    brandName: "OpenAI",
    categorySlug: "ai-tools",
    categoryName: "AI Assistants",
    shortDescription: "Full warranty ChatGPT Plus access with GPT-4o, image generation via DALL-E, advanced data analysis, and priority speed.",
    featured: true,
    coverPath: "/media/covers/chatgpt/chatgpt-plus-1-month-fw.webp",
    features: [
      "Access to GPT-4o and GPT-4 Models",
      "Faster Response Times During Peak Hours",
      "Priority Access to New Frontier Features",
      "Full 1-Month Replacement Warranty Included",
    ],
    variants: [
      {
        sku: "GPT-1M-FW",
        name: "1 Month Full Warranty",
        priceNpr: 1050,
        compareAtNpr: 3499,
        costNpr: 450,
        stockQty: 15,
        durationValue: 1,
        durationUnit: "months",
        purchasable: true,
      },
      {
        sku: "GPT-1M-BIZ-SLOT",
        name: "ChatGPT Business Workspace Seat (1M)",
        priceNpr: 1899,
        compareAtNpr: 4999,
        costNpr: 800,
        stockQty: 50,
        durationValue: 1,
        durationUnit: "months",
        purchasable: true,
      },
    ],
  },
  {
    slug: "canva-pro-1-year",
    name: "Canva Pro — 1 Year Unlimited",
    brandSlug: "canva",
    brandName: "Canva",
    categorySlug: "design",
    categoryName: "Design & Creative",
    shortDescription: "Complete Canva Pro subscription with unlimited brand kits, background remover, magic studio AI tools, and stock assets.",
    featured: true,
    coverPath: "/media/covers/canva/canva-pro-1-year.webp",
    features: [
      "Millions of Premium Stock Photos, Videos & Elements",
      "Content Planner & Social Media Scheduling",
      "Unlimited Brand Kits for Consistent Design",
      "Magic Studio AI Content & Image Generator",
    ],
    variants: [
      {
        sku: "CAN-1Y-DED",
        name: "1 Year Dedicated Access",
        priceNpr: 1195,
        compareAtNpr: 4999,
        costNpr: 450,
        stockQty: 25,
        durationValue: 1,
        durationUnit: "years",
        purchasable: true,
      },
      {
        sku: "CAN-1Y-TEAM",
        name: "1 Year Team Seat Invite",
        priceNpr: 699,
        compareAtNpr: 2499,
        costNpr: 250,
        stockQty: 50,
        durationValue: 1,
        durationUnit: "years",
        purchasable: true,
      },
    ],
  },
  {
    slug: "coursera-premium-1-year",
    name: "Coursera Premium — 1 Year",
    brandSlug: "coursera",
    brandName: "Coursera",
    categorySlug: "learning",
    categoryName: "Learning",
    shortDescription: "Unlimited access to 7,000+ courses and professional certificates from Google, IBM, Stanford, and world-class universities.",
    featured: false,
    coverPath: "/media/covers/coursera/coursera-premium-1-year.webp",
    features: [
      "Unlimited Course Certificates & Credentials",
      "Access to 7,000+ Accredited Courses",
      "Specializations & Professional Certificates",
      "Learn from Top-Tier Global Universities",
    ],
    variants: [
      {
        sku: "COU-1Y",
        name: "1 Year Membership",
        priceNpr: 2799,
        compareAtNpr: 8999,
        costNpr: 650,
        stockQty: 14,
        durationValue: 1,
        durationUnit: "years",
        purchasable: true,
      },
    ],
  },
  {
    slug: "kling-standard-680-750-credits",
    name: "Kling AI Standard — 750 Credits",
    brandSlug: "kling",
    brandName: "Kling AI",
    categorySlug: "video-editing",
    categoryName: "Video & Editing",
    shortDescription: "Next-gen AI video generator with high-resolution generation credits, multiple aspect ratios, and realistic physics.",
    featured: true,
    coverPath: "/media/covers/kling/kling-standard-680-750-credits.webp",
    features: [
      "680–750 Generation Credits Included",
      "Cinematic AI Video Generation from Text/Image",
      "Multiple Style Support (Realistic, 3D, Anime)",
      "Fast Cloud Rendering Queue",
    ],
    variants: [
      {
        sku: "KLING-750",
        name: "680–750 Credits Plan",
        priceNpr: 1399,
        compareAtNpr: 3999,
        costNpr: 600,
        stockQty: 10,
        durationValue: 1,
        durationUnit: "months",
        purchasable: true,
      },
    ],
  },
  {
    slug: "kling-ultra-26k-credits",
    name: "Kling AI Ultra — 26,000 Credits",
    brandSlug: "kling",
    brandName: "Kling AI",
    categorySlug: "video-editing",
    categoryName: "Video & Editing",
    shortDescription: "High-capacity AI video generation powerhouse. 26,000 credits for agencies, high-volume creators, and studios.",
    featured: true,
    coverPath: "/media/covers/kling/kling-ultra-26k-credits.webp",
    features: [
      "26,000 Generation Credits for Serious Creators",
      "Cinematic Ultra HD Video Outputs",
      "Priority GPU Processing Queue",
      "Commercial Use Ready with Full Monetization",
    ],
    variants: [
      {
        sku: "KLING-26K",
        name: "26K Credits Plan",
        priceNpr: 13999,
        compareAtNpr: 28000,
        costNpr: 7500,
        stockQty: 6,
        durationValue: 1,
        durationUnit: "months",
        purchasable: true,
      },
    ],
  },
  {
    slug: "supergrok-3-months",
    name: "SuperGrok — 3 Months",
    brandSlug: "grok",
    brandName: "xAI Grok",
    categorySlug: "ai-tools",
    categoryName: "AI Assistants",
    shortDescription: "Real-time AI intelligence powered by xAI. Real-time news analysis, Grok 2 vision, coding capabilities, and developer CLI.",
    featured: false,
    coverPath: "/media/covers/grok/supergrok-3-months.webp",
    features: [
      "Access to Grok Highest SOTA AI Models",
      "Built-in Grok CLI for Developer Workflows",
      "Real-Time Web & News Knowledge",
      "Image & Document Understanding",
    ],
    variants: [
      {
        sku: "GROK-3M",
        name: "3-Month Package",
        priceNpr: 7499,
        compareAtNpr: 15999,
        costNpr: 1600,
        stockQty: 8,
        durationValue: 3,
        durationUnit: "months",
        purchasable: true,
      },
    ],
  },
  {
    slug: "higgsfield-pro-12m",
    name: "Higgsfield Pro — 12 Months",
    brandSlug: "higgsfield",
    brandName: "Higgsfield AI",
    categorySlug: "video-editing",
    categoryName: "Video & Editing",
    shortDescription: "Cinematic AI video generation engine with full dynamic motion control, camera direction, and uncompressed exports.",
    featured: true,
    coverPath: "/media/covers/video/higgsfield-pro-12m.webp",
    features: [
      "Cinematic Camera Movement & Dynamic Motion Physics",
      "Ultra High-Resolution Video Rendering",
      "Unrestricted Creative AI Video Generation",
      "Exclusive SOTA Video Foundation Models",
      "Fast Cloud Processing Priority Queue",
    ],
    variants: [
      {
        sku: "HIGGS-12M",
        name: "12 Months Membership",
        priceNpr: 17999,
        compareAtNpr: 35000,
        costNpr: 12000,
        stockQty: 1,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
    ],
  },
  {
    slug: "manus-ai-pro-12m",
    name: "Manus AI Pro — 12 Months",
    brandSlug: "manus",
    brandName: "Manus AI",
    categorySlug: "ai-tools",
    categoryName: "AI Assistants",
    shortDescription: "Next-generation autonomous general AI agent capable of multi-step task execution, complex code generation, and deep research.",
    featured: true,
    coverPath: "/media/covers/ai/manus-ai-pro-12m.webp",
    features: [
      "Fully Autonomous Multi-Step Execution Loop",
      "Deep Web Scraping, Synthesis & Reporting",
      "Autonomous Code Writing, Testing & Debugging",
      "Multi-Tool Workflow & API Orchestration",
      "Uncapped Reasoning with Top-Tier Frontier Models",
    ],
    variants: [
      {
        sku: "MANUS-12M",
        name: "12 Months Membership",
        priceNpr: 9679,
        compareAtNpr: 22000,
        costNpr: 5920,
        stockQty: 6,
        durationValue: 12,
        durationUnit: "months",
        purchasable: true,
      },
    ],
  },
  {
    slug: "warp-build-1-year",
    name: "Warp Build — 1 Year",
    brandSlug: "warp",
    brandName: "Warp Build",
    categorySlug: "developer-tools",
    categoryName: "Developer Tools",
    shortDescription: "Blazing fast cloud CI/CD runners for GitHub Actions. Cut build and test times by up to 20x.",
    featured: false,
    coverPath: "/media/covers/developer/warp-build-1-year.webp",
    features: [
      "Up to 20x Faster Build & Test Execution",
      "Linux & macOS Cloud Native Runners",
      "100% Drop-in Replacement for GitHub Actions",
      "High Parallel Build Concurrency",
      "Full Year Commercial SLA & High Reliability",
    ],
    variants: [
      {
        sku: "WARP-1Y",
        name: "1 Year Access",
        priceNpr: 3699,
        compareAtNpr: 8999,
        costNpr: 1760,
        stockQty: 1,
        durationValue: 1,
        durationUnit: "years",
        purchasable: true,
      },
    ],
  },
  {
    slug: "n8n-starter-1-year",
    name: "n8n Starter — 1 Year",
    brandSlug: "n8n",
    brandName: "n8n",
    categorySlug: "automation",
    categoryName: "Automation",
    shortDescription: "Fair-code workflow automation platform. Connect 500+ apps, build AI agent flows, and automate repetitive business tasks.",
    featured: false,
    coverPath: "/media/covers/automation/n8n-starter-1-year.webp",
    features: [
      "500+ Built-In Integrations & Webhooks",
      "Autonomous AI Agent Workflows",
      "Visual Drag-and-Drop Node Builder",
      "Custom JavaScript & Python Execution",
      "Cloud Hosted & High Availability Infrastructure",
    ],
    variants: [
      {
        sku: "N8N-1Y",
        name: "1 Year Plan",
        priceNpr: 4699,
        compareAtNpr: 11999,
        costNpr: 2400,
        stockQty: 4,
        durationValue: 1,
        durationUnit: "years",
        purchasable: true,
      },
    ],
  },
  {
    slug: "veo3-ultra-flow-credits",
    name: "Veo 3 Ultra — 45K Video Credits (1M)",
    brandSlug: "veo",
    brandName: "Google Veo",
    categorySlug: "video-editing",
    categoryName: "Video & Editing",
    shortDescription: "Google Ultra 45k credits extension for AI video generation via Flow creator suite. 25-day full replacement warranty.",
    featured: true,
    coverPath: "/media/covers/video/veo3-ultra-flow-credits.webp",
    features: [
      "45,000 Generation Credits for Video AI",
      "Google AI Flow Extension Support",
      "Cinematic Text-to-Video & Image-to-Video",
      "High-Resolution Visual Rendering",
      "25-Day Full Replacement Warranty Included",
    ],
    variants: [
      {
        sku: "VEO-45K-1M",
        name: "1 Month (45K Credits)",
        priceNpr: 2999,
        compareAtNpr: 6999,
        costNpr: 800,
        stockQty: 999,
        durationValue: 1,
        durationUnit: "months",
        purchasable: true,
      },
    ],
  },
  {
    slug: "ai-prompt-starter-pack",
    name: "TRIHEX AI Prompt Starter Pack",
    brandSlug: "trihex",
    brandName: "TRIHEX DIGITAL",
    categorySlug: "digital-assets",
    categoryName: "Digital Assets",
    shortDescription: "Curated collection of 1,000+ battle-tested prompts for ChatGPT, Claude, Gemini, and Midjourney with instant digital download.",
    featured: true,
    coverPath: "/media/covers/trihex/trihex-ai-prompt-starter-pack.webp",
    features: [
      "1,000+ High-Quality Battle-Tested Prompts",
      "Categories: Coding, Writing, Marketing & Strategy",
      "Instant Digital Download After Checkout",
      "Lifetime Updates & Best Practice Guide Included",
    ],
    variants: [
      {
        sku: "THX-PROMPTS",
        name: "Instant Digital Download",
        priceNpr: 299,
        compareAtNpr: 1999,
        costNpr: 0,
        stockQty: 999,
        durationValue: 1,
        durationUnit: "lifetime",
        purchasable: true,
      },
    ],
  },
  {
    slug: "small-business-ai-setup-consultation",
    name: "TRIHEX Small Business AI Setup",
    brandSlug: "trihex",
    brandName: "TRIHEX DIGITAL",
    categorySlug: "services",
    categoryName: "Services",
    shortDescription: "60-minute 1-on-1 private consultation to integrate AI into your local business, marketing, sales, and support operations.",
    featured: true,
    coverPath: "/media/covers/trihex/trihex-small-business-ai-setup.webp",
    features: [
      "60-Minute Focused 1-on-1 Strategy Session",
      "Custom AI Tool Selection for Your Specific Business",
      "Practical Implementation Roadmap & Guidance",
      "Post-Session Support & Resource Bundle",
    ],
    variants: [
      {
        sku: "THX-CONSULT",
        name: "60-Min Consultation",
        priceNpr: 1499,
        compareAtNpr: 4999,
        costNpr: 0,
        stockQty: 10,
        durationValue: 60,
        durationUnit: "days",
        purchasable: true,
      },
    ],
  },
  {
    slug: "custom-workflow-automation-discovery",
    name: "TRIHEX Workflow Automation Discovery",
    brandSlug: "trihex",
    brandName: "TRIHEX DIGITAL",
    categorySlug: "services",
    categoryName: "Services",
    shortDescription: "60-minute discovery session to map manual business bottlenecks and design automated pipelines with n8n, Make, and AI APIs.",
    featured: true,
    coverPath: "/media/covers/trihex/custom-workflow-automation-discovery.webp",
    features: [
      "Process Bottleneck Discovery & Mapping",
      "Tailored Automation Architecture & Toolset",
      "Time & Cost Savings ROI Assessment",
      "Actionable Step-by-Step Delivery Blueprint",
    ],
    variants: [
      {
        sku: "THX-AUTOMATE",
        name: "60-Min Discovery Session",
        priceNpr: 1999,
        compareAtNpr: 6999,
        costNpr: 0,
        stockQty: 10,
        durationValue: 60,
        durationUnit: "days",
        purchasable: true,
      },
    ],
  },
];

async function main() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("DATABASE_URL required");

  console.log("Connecting to PostgreSQL database...");
  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client, { schema });

  const targetSlugs = CATALOGUE_V2.map((p) => p.slug);

  // 1. Archive any legacy products not in our new curated catalogue
  console.log(`Archiving all legacy products not in target list (${targetSlugs.length} active)...`);
  await db
    .update(schema.products)
    .set({
      productStatus: "ARCHIVED",
      complianceStatus: "REJECTED",
      blockedReason: "Replaced by V2 catalogue overhaul",
    })
    .where(notInArray(schema.products.slug, targetSlugs));
  console.log("Archived non-target products.");

  // Also inactivate their variants
  await client`
    update product_variants
    set active = false, purchasable = false
    where product_id in (
      select id from products where product_status = 'ARCHIVED'
    )
  `;

  // 2. Ensure brands exist
  const brandIds = new Map<string, string>();
  for (const p of CATALOGUE_V2) {
    if (!brandIds.has(p.brandSlug)) {
      const existing = await db
        .select()
        .from(schema.brands)
        .where(eq(schema.brands.slug, p.brandSlug))
        .limit(1);

      if (existing[0]) {
        brandIds.set(p.brandSlug, existing[0].id);
      } else {
        const [inserted] = await db
          .insert(schema.brands)
          .values({
            name: p.brandName,
            slug: p.brandSlug,
            isOwnBrand: p.brandSlug === "trihex",
          })
          .returning();
        brandIds.set(p.brandSlug, inserted.id);
      }
    }
  }

  // 3. Ensure categories exist
  const categoryIds = new Map<string, string>();
  for (const p of CATALOGUE_V2) {
    if (!categoryIds.has(p.categorySlug)) {
      const existing = await db
        .select()
        .from(schema.categories)
        .where(eq(schema.categories.slug, p.categorySlug))
        .limit(1);

      if (existing[0]) {
        categoryIds.set(p.categorySlug, existing[0].id);
      } else {
        const [inserted] = await db
          .insert(schema.categories)
          .values({
            name: p.categoryName,
            slug: p.categorySlug,
          })
          .returning();
        categoryIds.set(p.categorySlug, inserted.id);
      }
    }
  }

  // 4. Upsert each product and its variants
  for (const p of CATALOGUE_V2) {
    const brandId = brandIds.get(p.brandSlug)!;
    const categoryId = categoryIds.get(p.categorySlug)!;
    const featuresJson = JSON.stringify(p.features);

    const existingProduct = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.slug, p.slug))
      .limit(1);

    let productId: string;
    const featuresText = p.features.join("\n");

    if (existingProduct[0]) {
      productId = existingProduct[0].id;
      await db
        .update(schema.products)
        .set({
          name: p.name,
          brandId,
          categoryId,
          shortDescription: p.shortDescription,
          longDescription: featuresText,
          productStatus: "PUBLIC",
          complianceStatus: "APPROVED",
          needsDataVerification: false,
          blockedReason: null,
          featured: p.featured ?? false,
        })
        .where(eq(schema.products.id, productId));
      console.log(`Updated product: ${p.slug}`);
    } else {
      const prodType =
        p.categorySlug === "services"
          ? "CONSULTATION"
          : p.categorySlug === "digital-assets"
            ? "OWNED_ASSET"
            : p.slug.includes("api")
              ? "API_SERVICE"
              : "DIGITAL_LICENSE";

      const fulfillType =
        p.categorySlug === "services"
          ? "CONSULTATION"
          : p.categorySlug === "digital-assets"
            ? "DOWNLOADABLE_OWNED_ASSET"
            : p.slug.includes("api")
              ? "API_POWERED_ACCESS"
              : "MANUAL_CUSTOMER_EMAIL_ACTIVATION";

      const [inserted] = await db
        .insert(schema.products)
        .values({
          slug: p.slug,
          name: p.name,
          brandId,
          categoryId,
          shortDescription: p.shortDescription,
          longDescription: featuresText,
          productType: prodType as any,
          fulfillmentType: fulfillType as any,
          productStatus: "PUBLIC",
          complianceStatus: "APPROVED",
          needsDataVerification: false,
          featured: p.featured ?? false,
        })
        .returning();
      productId = inserted.id;
      console.log(`Inserted new product: ${p.slug}`);
    }

    // Set product media to point to high-res cover
    await client`
      delete from product_media where product_id = ${productId}
    `;
    await client`
      insert into product_media (product_id, url, alt_text, is_primary, sort_order)
      values (${productId}, ${p.coverPath}, ${p.name}, true, 0)
    `;

    // Deactivate obsolete variants for this product
    await db
      .update(schema.productVariants)
      .set({ active: false })
      .where(
        eq(schema.productVariants.productId, productId)
      );

    // Manage variants
    for (let i = 0; i < p.variants.length; i++) {
      const v = p.variants[i];
      const existingVar = await db
        .select()
        .from(schema.productVariants)
        .where(eq(schema.productVariants.sku, v.sku))
        .limit(1);

      const priceMinor = v.priceNpr * 100;
      const compareAtMinor = v.compareAtNpr ? v.compareAtNpr * 100 : null;
      const costMinor = v.costNpr != null ? v.costNpr * 100 : null;
      const dUnit =
        v.durationUnit === "days"
          ? "DAY"
          : v.durationUnit === "months"
            ? "MONTH"
            : v.durationUnit === "years"
              ? "YEAR"
              : "ONE_TIME";

      if (existingVar[0]) {
        await db
          .update(schema.productVariants)
          .set({
            productId,
            variantName: v.name,
            manualSellingPriceNprMinor: priceMinor,
            compareAtPriceNprMinor: compareAtMinor,
            supplierCostMinor: costMinor ?? 0,
            seedVisibleQuantity: v.stockQty ?? null,
            durationValue: v.durationValue,
            durationUnit: dUnit as any,
            purchasable: v.purchasable ?? true,
            active: true,
          })
          .where(eq(schema.productVariants.id, existingVar[0].id));
      } else {
        await db.insert(schema.productVariants).values({
          productId,
          sku: v.sku,
          variantName: v.name,
          manualSellingPriceNprMinor: priceMinor,
          compareAtPriceNprMinor: compareAtMinor,
          supplierCostMinor: costMinor ?? 0,
          seedVisibleQuantity: v.stockQty ?? null,
          durationValue: v.durationValue,
          durationUnit: dUnit as any,
          purchasable: v.purchasable ?? true,
          active: true,
        });
      }
    }
  }

  console.log("Successfully synchronized all V2 products and variants to Postgres!");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
