import { renderPoster } from "./generate-all-luxury-posters";

async function main() {
  console.log("Generating all 22+ luxury feature infographic posters...");

  // 1. Framer Pro
  await renderPoster({
    destPath: "public/media/covers/design/framer-pro-12m.webp",
    slug: "framer-pro-12m",
    category: "DESIGN & WEB",
    badge: "12 MONTHS ACCESS",
    brandName: "Framer",
    productTitle: "FRAMER PRO",
    subtitle: "Professional Web Design & High-Speed Hosting",
    accentA: "#0055FF",
    accentB: "#8B5CF6",
    glowColor: "#0055FF",
    features: [
      "Design & Publish Responsive Websites in Minutes",
      "Unlimited CMS Collections & Dynamic High-Speed Pages",
      "Custom Domain Support with Ultra-Fast Global CDN",
      "Advanced Interactive Animations, Forms & SEO Tools",
    ],
    footerNote: "12 Months Full Access · Instant Team Workspace Activation · Full Guarantee",
    iconSymbol: `
      <rect x="15" y="10" width="50" height="25" fill="#0055FF" rx="4"/>
      <path d="M15 35 L40 60 L15 60 Z" fill="#8B5CF6"/>
      <rect x="40" y="35" width="25" height="25" fill="#0055FF" rx="4"/>
    `,
  });

  // 2. Lovable AI Pro
  await renderPoster({
    destPath: "public/media/covers/developer/lovable-pro-12m.webp",
    slug: "lovable-pro-12m",
    category: "DEVELOPER AI",
    badge: "12 MONTHS ACCESS",
    brandName: "Lovable",
    productTitle: "LOVABLE AI PRO",
    subtitle: "Autonomous Full-Stack Web App Software Builder",
    accentA: "#FF4F40",
    accentB: "#FF007A",
    glowColor: "#FF4F40",
    features: [
      "Build Production Web Apps from Plain English Prompts",
      "Native Supabase Database, Auth & Storage Integration",
      "Instant Real-Time Code Previews & Git Synchronization",
      "Export Clean, Maintainable React / Next.js / Tailwind Code",
    ],
    footerNote: "12 Months Membership · Instant Dedicated Setup · 100% Verified Access",
    iconSymbol: `
      <circle cx="40" cy="40" r="30" fill="url(#accentGrad)"/>
      <path d="M40 22 C32 14, 18 20, 24 34 L40 50 L56 34 C62 20, 48 14, 40 22 Z" fill="#ffffff"/>
    `,
  });

  // 3. Supabase Pro
  await renderPoster({
    destPath: "public/media/covers/developer/supabase-pro-1-year.webp",
    slug: "supabase-pro-1-year",
    category: "CLOUD BACKEND",
    badge: "1 YEAR PLAN",
    brandName: "Supabase",
    productTitle: "SUPABASE PRO",
    subtitle: "Enterprise PostgreSQL Database & Backend Platform",
    accentA: "#3ECF8E",
    accentB: "#10B981",
    glowColor: "#3ECF8E",
    features: [
      "Dedicated PostgreSQL Database with pgvector AI Embeddings",
      "Full Authentication Suite: Social Logins & Row Level Security",
      "Realtime Database WebSockets & Unlimited Edge Functions",
      "Daily Automated Backups, Point-in-Time Recovery & 100GB CDN",
    ],
    footerNote: "1 Year Full Pro Organization · Official Team Seat · Nepal Support",
    iconSymbol: `
      <path d="M44 10 L16 46 L38 46 L34 70 L62 34 L40 34 Z" fill="url(#accentGrad)"/>
    `,
  });

  // 4. Coursera Plus / Premium
  await renderPoster({
    destPath: "public/media/covers/coursera/coursera-premium-1-year.webp",
    slug: "coursera-premium-1-year",
    category: "GLOBAL EDUCATION",
    badge: "1 YEAR UNLIMITED",
    brandName: "Coursera",
    productTitle: "COURSERA PLUS",
    subtitle: "Unlimited Access to 7,000+ World-Class Courses",
    accentA: "#0056D2",
    accentB: "#38BDF8",
    glowColor: "#0056D2",
    features: [
      "Unlimited Access to 7,000+ Courses, Specializations & Degrees",
      "Official Verified Certificates from Google, IBM, Meta & Top Univs",
      "Unlimited Guided Projects, Hands-on Labs & Professional Certs",
      "1 Full Year Access on Your Own Email with Full Warranty",
    ],
    footerNote: "1 Year Dedicated Access · Official Verification · Full Replacement Warranty",
    iconSymbol: `
      <rect x="15" y="15" width="50" height="50" rx="14" fill="#0056D2"/>
      <path d="M28 40 L36 48 L52 30" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    `,
  });

  // 5. Gamma App Pro
  await renderPoster({
    destPath: "public/media/covers/gamma/gamma-ai-pro-1-month.webp",
    slug: "gamma-pro-1-year",
    category: "AI PRESENTATIONS",
    badge: "1 YEAR PLAN",
    brandName: "Gamma",
    productTitle: "GAMMA APP PRO",
    subtitle: "AI Presentation, Document & Webpage Generator",
    accentA: "#FF5B00",
    accentB: "#8B5CF6",
    glowColor: "#FF5B00",
    features: [
      "Unlimited AI Generation for Decks, Documents & Webpages",
      "Custom Branding, Color Palettes, Logos & Custom Fonts",
      "Export High-Resolution PDF & PowerPoint (PPTX) Decks",
      "Interactive AI Embeds, Forms & Advanced Viewer Analytics",
    ],
    footerNote: "1 Year Full Membership · Instant Setup · 100% Nepali Support",
    iconSymbol: `
      <polygon points="40,12 68,28 68,52 40,68 12,52 12,28" fill="url(#accentGrad)"/>
      <polygon points="40,24 56,33 56,47 40,56 24,47 24,33" fill="#0f172a"/>
    `,
  });

  // 6. Warp Build
  await renderPoster({
    destPath: "public/media/covers/developer/warp-build-1-year.webp",
    slug: "warp-build-1-year",
    category: "DEVOPS CLOUD",
    badge: "1 YEAR ACCESS",
    brandName: "Warp Build",
    productTitle: "WARP BUILD",
    subtitle: "Ultra-Fast 20x CI/CD Runners for Modern Teams",
    accentA: "#00D2FF",
    accentB: "#0088FF",
    glowColor: "#00D2FF",
    features: [
      "Up to 20x Faster CI/CD Builds & Test Execution Times",
      "High-Performance Linux x86 & Apple Silicon M3/M4 macOS Runners",
      "100% Drop-in Replacement for GitHub Actions & GitLab CI",
      "Massive Build Cache Acceleration & 50%+ Cost Reduction",
    ],
    footerNote: "1 Year High-Performance Plan · Immediate Runner Access · Full Warranty",
    iconSymbol: `
      <path d="M12 20 L40 40 L12 60 L24 40 Z" fill="#00D2FF"/>
      <path d="M35 20 L63 40 L35 60 L47 40 Z" fill="#0088FF"/>
    `,
  });

  // 7. Gumloop Pro
  await renderPoster({
    destPath: "public/media/covers/automation/gumloop-pro-12m.webp",
    slug: "gumloop-pro-12m",
    category: "AI AUTOMATION",
    badge: "12 MONTHS PRO",
    brandName: "Gumloop",
    productTitle: "GUMLOOP PRO",
    subtitle: "Autonomous AI Web Scraper & Workflow Builder",
    accentA: "#84CC16",
    accentB: "#10B981",
    glowColor: "#84CC16",
    features: [
      "Autonomous AI Web Scraper & Clean Structured Data Extractor",
      "Multi-Step Workflow Automations & AI Agent Chains",
      "No-Code Visual Drag-and-Drop Canvas with API Webhook Triggers",
      "Direct Export to Google Sheets, Notion, Airtable & PostgreSQL",
    ],
    footerNote: "12 Months Dedicated Plan · Enterprise Credits · Full Support",
    iconSymbol: `
      <circle cx="28" cy="40" r="16" fill="none" stroke="#84CC16" stroke-width="7"/>
      <circle cx="52" cy="40" r="16" fill="none" stroke="#10B981" stroke-width="7"/>
    `,
  });

  // 8. n8n Starter
  await renderPoster({
    destPath: "public/media/covers/automation/n8n-starter-1-year.webp",
    slug: "n8n-starter-1-year",
    category: "WORKFLOW AUTOMATION",
    badge: "1 YEAR PLAN",
    brandName: "n8n",
    productTitle: "n8n STARTER",
    subtitle: "Fair-Code Autonomous Workflow Automation Engine",
    accentA: "#EA4B71",
    accentB: "#FF6D5A",
    glowColor: "#EA4B71",
    features: [
      "500+ Native App Nodes for AI, Webhooks, CRM & Databases",
      "Native LangChain, OpenAI & Claude Agent Execution Nodes",
      "Complete Data Privacy & Autonomous Workflow Scheduling",
      "Enterprise Retry Engine, Error Handler & Full Execution Logs",
    ],
    footerNote: "1 Year Full Cloud Plan · Instant Setup · 100% Nepali Support",
    iconSymbol: `
      <circle cx="20" cy="40" r="10" fill="#EA4B71"/>
      <circle cx="60" cy="40" r="10" fill="#FF6D5A"/>
      <path d="M20 40 L60 40" stroke="#ffffff" stroke-width="5"/>
      <circle cx="40" cy="20" r="8" fill="#EA4B71"/>
    `,
  });

  // 9. Cursor Pro
  await renderPoster({
    destPath: "public/media/covers/cursor/cursor-pro-12m.webp",
    slug: "cursor-pro-12m",
    category: "DEVELOPER AI",
    badge: "PRO ACCESS",
    brandName: "Cursor",
    productTitle: "CURSOR PRO",
    subtitle: "The Premier AI-First Code Editor & Composer",
    accentA: "#A855F7",
    accentB: "#6366F1",
    glowColor: "#A855F7",
    features: [
      "AI-Powered Code Autocomplete & Multi-Line Prediction",
      "Deep Codebase Chat & Global Repository Semantic Search",
      "Claude 3.5 Sonnet & GPT-4o Frontier AI Model Access",
      "Composer: Multi-File Autonomous Code Generation & Refactor",
    ],
    footerNote: "1M & 12M Dedicated / Team Seat Options · Instant Activation · Verified",
    iconSymbol: `
      <polygon points="40,10 68,26 68,54 40,70 12,54 12,26" fill="url(#accentGrad)"/>
      <path d="M30 40 L50 40 M40 30 L40 50" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
    `,
  });

  // 10. Factory Droid AI
  await renderPoster({
    destPath: "public/media/covers/developer/factory-12m.webp",
    slug: "factory-12m",
    category: "AUTONOMOUS AI",
    badge: "12 MONTHS DROID",
    brandName: "Factory",
    productTitle: "FACTORY DROID AI",
    subtitle: "Autonomous Software Engineering Droids for Codebases",
    accentA: "#F59E0B",
    accentB: "#D97706",
    glowColor: "#F59E0B",
    features: [
      "Autonomous Software Engineering Droids for Repositories",
      "Automated Codebase Migrations & Security Patching",
      "Automatic Bug Resolution with Sandboxed Test Verification",
      "Auto-Generated High-Quality Pull Requests with Docs",
    ],
    footerNote: "12 Months Dedicated Enterprise Seat · 100% Nepali Support Layer",
    iconSymbol: `
      <rect x="18" y="20" width="44" height="40" rx="10" fill="url(#accentGrad)"/>
      <circle cx="30" cy="36" r="5" fill="#0f172a"/>
      <circle cx="50" cy="36" r="5" fill="#0f172a"/>
      <line x1="40" y1="10" x2="40" y2="20" stroke="#F59E0B" stroke-width="4"/>
    `,
  });

  // 11. Mobbin Pro 10x Seat
  await renderPoster({
    destPath: "public/media/covers/design/mobbin-12m.webp",
    slug: "mobbin-12m",
    category: "DESIGN & UX",
    badge: "12 MONTHS SEAT",
    brandName: "Mobbin",
    productTitle: "MOBBIN PRO",
    subtitle: "World's Largest Mobile & Web UI/UX Reference Library",
    accentA: "#0284C7",
    accentB: "#38BDF8",
    glowColor: "#0284C7",
    features: [
      "300,000+ Real Mobile & Web App UI/UX Flow References",
      "Complete Onboarding, Checkout & Feature User Journeys",
      "Filter by Design Patterns, UI Elements & Industry Leaders",
      "10x Seat Team Workspace Access for 12 Full Months",
    ],
    footerNote: "12 Months 10x Seat License · Instant Email Activation · Full Guarantee",
    iconSymbol: `
      <rect x="22" y="14" width="36" height="52" rx="8" fill="none" stroke="#38BDF8" stroke-width="5"/>
      <circle cx="40" cy="58" r="3" fill="#38BDF8"/>
    `,
  });

  // 12. Railway Hobby
  await renderPoster({
    destPath: "public/media/covers/developer/railway-hobby-12m.webp",
    slug: "railway-hobby-12m",
    category: "CLOUD HOSTING",
    badge: "12 MONTHS ACCESS",
    brandName: "Railway",
    productTitle: "RAILWAY HOBBY",
    subtitle: "Instant Git-Powered Cloud Infrastructure & Databases",
    accentA: "#D946EF",
    accentB: "#A855F7",
    glowColor: "#D946EF",
    features: [
      "Instant Zero-Config Deployments from GitHub Repositories",
      "One-Click PostgreSQL, Redis, MySQL & MongoDB Deployments",
      "Custom Domains, Automated SSL & High-Availability Scaling",
      "Private VPC Networking, Cron Triggers & Health Monitoring",
    ],
    footerNote: "12 Months Continuous Cloud Access · Instant Setup · Nepal Support",
    iconSymbol: `
      <path d="M15 50 L40 18 L65 50 Z" fill="none" stroke="url(#accentGrad)" stroke-width="6" stroke-linejoin="round"/>
      <line x1="26" y1="38" x2="54" y2="38" stroke="#ffffff" stroke-width="4"/>
    `,
  });

  // 13. Runway Pro
  await renderPoster({
    destPath: "public/media/covers/video/runway-pro-12m.webp",
    slug: "runway-pro-12m",
    category: "AI VIDEO CREATIVE",
    badge: "12 MONTHS PRO",
    brandName: "Runway",
    productTitle: "RUNWAY GEN-3 PRO",
    subtitle: "Cinematic High-Definition AI Video Generation",
    accentA: "#7C3AED",
    accentB: "#C084FC",
    glowColor: "#7C3AED",
    features: [
      "Gen-3 Alpha Hyper-Realistic Cinematic AI Video Generation",
      "Text-to-Video, Image-to-Video & Video-to-Video Generation",
      "Advanced Motion Brush, Camera Controls & Director Mode",
      "Unlimited Video Upscaling & High-Bitrate Export",
    ],
    footerNote: "12 Months Membership · Dedicated & Shared Seat Plans · Instant Delivery",
    iconSymbol: `
      <path d="M18 20 L62 40 L18 60 Z" fill="url(#accentGrad)"/>
      <circle cx="36" cy="40" r="8" fill="#ffffff"/>
    `,
  });

  // 14. Notion Business
  await renderPoster({
    destPath: "public/media/covers/productivity/notion-business-12m.webp",
    slug: "notion-business-12m",
    category: "TEAM PRODUCTIVITY",
    badge: "12 MONTHS BUSINESS",
    brandName: "Notion",
    productTitle: "NOTION BUSINESS",
    subtitle: "Connected Collaborative Workspace with Notion AI",
    accentA: "#E2E8F0",
    accentB: "#94A3B8",
    glowColor: "#64748B",
    features: [
      "Unlimited Team Workspaces, Docs, Wikis & Project Roadmaps",
      "Notion AI Integration for Automated Writing & Summarization",
      "Advanced Permissions, SAML SSO, Audit Logs & Team Analytics",
      "Unlimited File Uploads & Unlimited Version Page History",
    ],
    footerNote: "12 Months Access · Dedicated & Shared Team Seat Plans · Full Warranty",
    iconSymbol: `
      <rect x="18" y="16" width="44" height="48" rx="8" fill="#ffffff"/>
      <text x="40" y="52" text-anchor="middle" fill="#0f172a" font-family="-apple-system, sans-serif" font-size="34" font-weight="900">N</text>
    `,
  });

  // 15. Granola Business
  await renderPoster({
    destPath: "public/media/covers/productivity/granola-business-12m.webp",
    slug: "granola-business-12m",
    category: "AI PRODUCTIVITY",
    badge: "12 MONTHS ACCESS",
    brandName: "Granola",
    productTitle: "GRANOLA BUSINESS",
    subtitle: "AI Meeting Intelligence & Decision Tracking for Teams",
    accentA: "#F59E0B",
    accentB: "#FBBF24",
    glowColor: "#F59E0B",
    features: [
      "AI Meeting Notes Crafted Specifically for Leaders & Builders",
      "Customizable Meeting Templates & Key Decision Tracking",
      "Instant Shareable Recaps & Seamless Calendar Sync",
      "Local-First Architecture, Zero Training & Enterprise Encryption",
    ],
    footerNote: "12 Months Membership · Instant Email Setup · 100% Nepali Support",
    iconSymbol: `
      <circle cx="40" cy="40" r="28" fill="none" stroke="#F59E0B" stroke-width="6"/>
      <circle cx="40" cy="40" r="14" fill="#FBBF24"/>
    `,
  });

  // 16. Veo 3 Ultra Flow Credits
  await renderPoster({
    destPath: "public/media/covers/video/veo3-ultra-flow-credits.webp",
    slug: "veo3-ultra-flow-credits",
    category: "GOOGLE AI VIDEO",
    badge: "45,000 CREDITS",
    brandName: "Google DeepMind",
    productTitle: "VEO 3 ULTRA",
    subtitle: "45K Video Credits with Google Flow AI Extension",
    accentA: "#3B82F6",
    accentB: "#06B6D4",
    glowColor: "#3B82F6",
    features: [
      "45,000 High-Definition Video Generation Credits",
      "Google DeepMind Veo 3 Cinematic Ultra Model Access",
      "Seamless Flow AI Browser Extension Integration",
      "Fast Queue Priority & Ultra High-Bitrate Export",
    ],
    footerNote: "1 Month Active Credits · Instant Setup · Replacement Warranty",
    iconSymbol: `
      <polygon points="26,18 64,40 26,62" fill="url(#accentGrad)"/>
      <circle cx="58" cy="22" r="6" fill="#38BDF8"/>
    `,
  });

  // 17. SuperGrok 3 Months
  await renderPoster({
    destPath: "public/media/covers/grok/supergrok-3-months.webp",
    slug: "supergrok-3-months",
    category: "FRONTIER AI",
    badge: "3 MONTHS ACCESS",
    brandName: "xAI Grok",
    productTitle: "SUPERGROK",
    subtitle: "xAI Grok 2 Frontier Model with Real-Time X Data",
    accentA: "#38BDF8",
    accentB: "#94A3B8",
    glowColor: "#38BDF8",
    features: [
      "Grok 2 & Grok Vision Most Advanced Reasoning Models",
      "Real-Time Uncensored Search on X / Twitter Data Streams",
      "Flux.1 Ultra-Realistic AI Image Generation Included",
      "3 Months Dedicated Priority Queue & Unlimited Queries",
    ],
    footerNote: "3 Months Dedicated Account · Verified Access · TRIHEX Support",
    iconSymbol: `
      <path d="M18 20 L62 60 M62 20 L18 60" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
    `,
  });

  // 18. TRIHEX AI Prompt Starter Pack
  await renderPoster({
    destPath: "public/media/covers/trihex/trihex-ai-prompt-starter-pack.webp",
    slug: "ai-prompt-starter-pack",
    category: "TRIHEX ASSETS",
    badge: "LIFETIME ACCESS",
    brandName: "TRIHEX DIGITAL",
    productTitle: "AI PROMPT PACK",
    subtitle: "500+ Production-Tested Prompts for AI Builders",
    accentA: "#10B981",
    accentB: "#F59E0B",
    glowColor: "#10B981",
    features: [
      "500+ Production-Tested Prompts for ChatGPT, Claude & Gemini",
      "Tailored for Coding, Copywriting, Marketing & Systems",
      "Instant PDF & Notion Workspace Database Download",
      "Lifetime Updates Included with New Model Releases",
    ],
    footerNote: "Instant Digital Download · Lifetime Updates · 100% Owned Asset",
    iconSymbol: `
      <path d="M40 12 L50 30 L70 34 L54 48 L58 68 L40 58 L22 68 L26 48 L10 34 L30 30 Z" fill="url(#accentGrad)"/>
    `,
  });

  // 19. TRIHEX Small Business Setup
  await renderPoster({
    destPath: "public/media/covers/trihex/trihex-small-business-ai-setup.webp",
    slug: "small-business-ai-setup-consultation",
    category: "TRIHEX SERVICES",
    badge: "1-ON-1 SETUP",
    brandName: "TRIHEX DIGITAL",
    productTitle: "BUSINESS AI SETUP",
    subtitle: "Complete Guided AI Tooling & Workflow Configuration",
    accentA: "#6366F1",
    accentB: "#3B82F6",
    glowColor: "#6366F1",
    features: [
      "1-on-1 Personalized Consultation with an AI Systems Expert",
      "Custom Workflow & Tool Selection Tailored to Your Business",
      "WhatsApp & Customer Support Auto-Reply Configuration",
      "Recording & Step-by-Step Implementation Guide Provided",
    ],
    footerNote: "Scheduled 1-on-1 Session · Actionable Roadmap · Local Nepal Support",
    iconSymbol: `
      <rect x="16" y="24" width="48" height="38" rx="8" fill="none" stroke="url(#accentGrad)" stroke-width="5"/>
      <path d="M30 24 L30 16 L50 16 L50 24" stroke="url(#accentGrad)" stroke-width="5"/>
    `,
  });

  // 20. TRIHEX Workflow Automation Discovery
  await renderPoster({
    destPath: "public/media/covers/trihex/custom-workflow-automation-discovery.webp",
    slug: "custom-workflow-automation-discovery",
    category: "TRIHEX SERVICES",
    badge: "AUTOMATION AUDIT",
    brandName: "TRIHEX DIGITAL",
    productTitle: "WORKFLOW DISCOVERY",
    subtitle: "Full Process Automation Audit & Architecture Blueprint",
    accentA: "#06B6D4",
    accentB: "#0284C7",
    glowColor: "#06B6D4",
    features: [
      "In-Depth Process Audit of Manual Repetitive Tasks",
      "n8n / Make / Zapier Full Architecture Blueprint",
      "Cost-Benefit Analysis & Recommended Tool Stack",
      "Executive Summary & Ready-to-Build Workflow Scope",
    ],
    footerNote: "Professional Systems Consultation · Direct Deliverables · Nepal First",
    iconSymbol: `
      <circle cx="40" cy="40" r="26" fill="none" stroke="url(#accentGrad)" stroke-width="5" stroke-dasharray="8 4"/>
      <circle cx="40" cy="40" r="10" fill="#06B6D4"/>
    `,
  });

  console.log("All 20+ luxury feature infographic posters generated successfully!");
}

main().catch(console.error);
