import sharp from "sharp";
import fs from "fs";
import path from "path";

interface FeatureCard {
  title: string;
  desc: string;
}

interface ProductSpec {
  slug: string;
  name: string;
  category: string;
  subtitle: string;
  centralHeadline: string;
  centralSubheadline?: string;
  benefitChips: string[];
  featureRibbon: string;
  features: FeatureCard[];
  workflow: string[];
  perfectFor: string[];
  bottomCta: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    pillBg: string;
    pillBorder: string;
    glow: string;
  };
}

const NEW_PRODUCTS: ProductSpec[] = [
  {
    slug: "adobe-cc-2-months",
    name: "Adobe Creative Cloud",
    category: "CREATIVE SUITE ✦",
    subtitle: "PHOTOSHOP, ILLUSTRATOR, PREMIERE & 20+ CREATIVE APPS",
    centralHeadline: "THE COMPLETE PRO CREATIVE WORKSPACE",
    benefitChips: ["Photoshop", "Illustrator", "Premiere Pro", "After Effects"],
    featureRibbon: "INDUSTRY-STANDARD CREATIVE SOFTWARE",
    features: [
      { title: "Photoshop", desc: "World-class image editing and composite design." },
      { title: "Illustrator", desc: "Precision vector graphics, logos and typography." },
      { title: "Premiere Pro", desc: "Professional cinematic video editing timeline." },
      { title: "After Effects", desc: "Visual effects, motion graphics and composite animation." },
      { title: "InDesign", desc: "Page layout and document design for publishing." },
      { title: "Lightroom", desc: "Professional photography processing and color grading." },
      { title: "Adobe Firefly", desc: "Generative AI tools integrated into Photoshop and Illustrator." },
      { title: "Cloud Storage", desc: "Sync assets seamlessly across desktop and mobile." },
      { title: "Adobe Fonts", desc: "Thousands of premium typographic font families included." },
      { title: "Creative Libraries", desc: "Organize color palettes, styles and shared graphics." },
      { title: "Acrobat Pro", desc: "Edit, sign, convert and review digital PDF documents." },
      { title: "Regular Updates", desc: "Access the latest features, tools and AI enhancements." },
    ],
    workflow: ["INSPIRE", "DESIGN", "REFINE", "EXPORT"],
    perfectFor: ["Graphic Designers", "Video Editors", "Photographers", "Agencies", "Marketing Teams", "Creators"],
    bottomCta: "CREATE EVERYTHING YOU IMAGINE",
    colors: { primary: "#e11d48", secondary: "#9333ea", accent: "#2563eb", pillBg: "#fff1f2", pillBorder: "#fecdd3", glow: "rgba(225,29,72,0.12)" },
  },
  {
    slug: "office365-100gb-lifetime",
    name: "Microsoft 365 100GB",
    category: "OFFICE SUITE ✦",
    subtitle: "WORD, EXCEL, POWERPOINT & 100GB ONEDRIVE CLOUD",
    centralHeadline: "ESSENTIAL WORK & PRODUCTIVITY POWERHOUSE",
    benefitChips: ["Word & Excel", "PowerPoint", "100GB OneDrive", "Multi-Device Sync"],
    featureRibbon: "TRUSTED PRODUCTIVITY PLATFORM",
    features: [
      { title: "Microsoft Word", desc: "Industry standard document authoring and editing." },
      { title: "Microsoft Excel", desc: "Advanced data analysis, spreadsheets and formulas." },
      { title: "PowerPoint", desc: "Compelling presentation decks with dynamic transitions." },
      { title: "OneDrive 100GB", desc: "Secure cloud storage with auto-backup and versioning." },
      { title: "Outlook", desc: "Organized email, calendar, scheduling and contacts." },
      { title: "Microsoft Teams", desc: "High-definition video meetings and group messaging." },
      { title: "Multi-Device", desc: "Access work across PC, Mac, iPad, iPhone and Android." },
      { title: "Real-Time Collab", desc: "Work simultaneously on documents with teammates." },
      { title: "Ransomware Protect", desc: "Enterprise-grade detection and file recovery security." },
      { title: "Offline Access", desc: "Work without internet; files automatically sync later." },
      { title: "OneNote", desc: "Digital notebook for ideas, notes and audio recordings." },
      { title: "Fast Activation", desc: "Quick verification and instant access to your suite." },
    ],
    workflow: ["DRAFT", "CALCULATE", "PRESENT", "SHARE"],
    perfectFor: ["Students", "Remote Workers", "Accountants", "Executives", "Freelancers", "Offices"],
    bottomCta: "THE PROVEN STANDARD IN WORK PRODUCTIVITY",
    colors: { primary: "#0284c7", secondary: "#1d4ed8", accent: "#0d9488", pillBg: "#f0f9ff", pillBorder: "#bae6fd", glow: "rgba(2,132,199,0.12)" },
  },
  {
    slug: "office365-1tb-lifetime",
    name: "Microsoft 365 1TB",
    category: "ENTERPRISE CLOUD ✦",
    subtitle: "FULL OFFICE SUITE WITH MASSIVE 1TB ONEDRIVE STORAGE",
    centralHeadline: "UNLIMITED STORAGE & COMPLETE OFFICE APPS",
    benefitChips: ["1TB Cloud Storage", "Full Desktop Apps", "Advanced Security", "5 Connected Devices"],
    featureRibbon: "EXPANDED POWERHOUSE OFFICE SUITE",
    features: [
      { title: "1,000 GB OneDrive", desc: "Massive secure cloud storage for documents and media." },
      { title: "Desktop Office Apps", desc: "Full-featured desktop Word, Excel, PowerPoint & Outlook." },
      { title: "5 Device Licenses", desc: "Install and use simultaneously on PC, Mac, tablets & phones." },
      { title: "Personal Vault", desc: "Protected digital storage area with two-factor verification." },
      { title: "Automatic Sync", desc: "Seamless continuous desktop folder backup to cloud." },
      { title: "Advanced Excel", desc: "Power Query, Pivot Tables and comprehensive data modeling." },
      { title: "PowerPoint Designer", desc: "AI-assisted slide layouts and graphic suggestions." },
      { title: "Teams Meetings", desc: "Connect with teams via group meetings and collaboration." },
      { title: "Auto Save", desc: "Zero loss of work with instant continuous cloud saving." },
      { title: "File Sharing", desc: "Share secure links with passwords and expiration dates." },
      { title: "Version History", desc: "Restore previous document versions up to 30 days back." },
      { title: "Priority Support", desc: "Helpful activation guidance from TRIHEX DIGITAL." },
    ],
    workflow: ["STORE", "COLLABORATE", "SECURE", "SCALE"],
    perfectFor: ["Power Users", "Professionals", "Business Owners", "Families", "Researchers", "Creators"],
    bottomCta: "STORE EVERYTHING. WORK ANYWHERE.",
    colors: { primary: "#2563eb", secondary: "#0284c7", accent: "#4f46e5", pillBg: "#eff6ff", pillBorder: "#bfdbfe", glow: "rgba(37,99,235,0.14)" },
  },
  {
    slug: "microsoft-365-family-10-months",
    name: "Microsoft 365 Family",
    category: "SHARED PRODUCTIVITY ✦",
    subtitle: "PREMIUM PRODUCTIVITY APPS & CLOUD STORAGE FOR YOUR TEAM",
    centralHeadline: "SHARED POWER • INDEPENDENT WORKSPACES",
    benefitChips: ["Word & Excel", "Cloud Storage", "Multi-Device", "Family Safety"],
    featureRibbon: "COLLABORATIVE PRODUCTIVITY PLATFORM",
    features: [
      { title: "Complete Office", desc: "Full access to Word, Excel, PowerPoint and OneNote." },
      { title: "Personal Storage", desc: "Generous cloud storage for documents, photos and files." },
      { title: "Multiple Devices", desc: "Use on Windows, Mac, iPad, iPhone and Android phones." },
      { title: "Real-Time Editing", desc: "Collaborate simultaneously on shared family/team projects." },
      { title: "Photo Backup", desc: "Automatic mobile camera roll backup with OneDrive." },
      { title: "Safety Features", desc: "Digital safety tools and location alerts for members." },
      { title: "Spam & Phishing Guard", desc: "Enterprise-grade protection inside Outlook email." },
      { title: "Microsoft Editor", desc: "Advanced grammar, spelling and style suggestions." },
      { title: "Clipchamp", desc: "Easy, video editor with premium filters and templates." },
      { title: "Version Recovery", desc: "Recover accidentally deleted files with version history." },
      { title: "Private Accounts", desc: "Each member gets completely private files and emails." },
      { title: "Local Activation", desc: "Verified delivery by TRIHEX with WhatsApp assistance." },
    ],
    workflow: ["INVITE", "CONNECT", "COLLABORATE", "PROTECT"],
    perfectFor: ["Families", "Small Teams", "Study Groups", "Collaborators", "Students", "Offices"],
    bottomCta: "EMPOWER YOUR ENTIRE HOUSEHOLD OR TEAM",
    colors: { primary: "#059669", secondary: "#2563eb", accent: "#d97706", pillBg: "#ecfdf5", pillBorder: "#a7f3d0", glow: "rgba(5,150,105,0.12)" },
  },
  {
    slug: "grammarly-pro-1-year",
    name: "Grammarly Premium",
    category: "AI WRITING ASSISTANT ✦",
    subtitle: "WRITE WITH CONFIDENCE, CLARITY AND ACCURACY EVERYWHERE",
    centralHeadline: "CLEAR, COMPELLING & ERROR-FREE WRITING",
    benefitChips: ["Tone Suggestions", "Vocabulary Polish", "Plagiarism Checker", "AI Rewrite Engine"],
    featureRibbon: "ADVANCED AI WRITING & EDITING COMPANION",
    features: [
      { title: "Grammar & Spelling", desc: "Eliminate embarrassing typos and grammatical errors." },
      { title: "Clarity Refinements", desc: "Untangle complex sentences into concise, punchy prose." },
      { title: "Tone Adjustment", desc: "Ensure your message strikes the exact right professional tone." },
      { title: "Vocabulary Enhancer", desc: "Choose precise, vivid words that elevate your writing." },
      { title: "Plagiarism Detection", desc: "Scan billions of web pages to ensure 100% original work." },
      { title: "Generative AI", desc: "Draft emails, outlines, brainstorms and replies in seconds." },
      { title: "Works Everywhere", desc: "Chrome extension, desktop app, Word, Google Docs & Outlook." },
      { title: "Formality Level", desc: "Adjust style dynamically between casual, neutral and formal." },
      { title: "Sentence Restructure", desc: "Transform passive sentences into active, energetic copy." },
      { title: "Fluency Detection", desc: "Ensures natural English phrasing for multilingual authors." },
      { title: "Citation Generator", desc: "Instantly create accurate APA, MLA and Chicago citations." },
      { title: "Private & Secure", desc: "High-grade encryption keeps your confidential writing safe." },
    ],
    workflow: ["WRITE", "SCAN", "POLISH", "PUBLISH"],
    perfectFor: ["Students", "Academic Researchers", "Marketers", "Job Seekers", "Professionals", "Writers"],
    bottomCta: "MAKE EVERY SENTENCE COUNT WITH GRAMMARLY",
    colors: { primary: "#059669", secondary: "#10b981", accent: "#0f766e", pillBg: "#ecfdf5", pillBorder: "#a7f3d0", glow: "rgba(16,185,129,0.14)" },
  },
  {
    slug: "youtube-premium-1-year",
    name: "YouTube Premium",
    category: "ENTERTAINMENT & LEARNING ✦",
    subtitle: "AD-FREE VIDEOS, BACKGROUND PLAY & YOUTUBE MUSIC INCLUDED",
    centralHeadline: "UNINTERRUPTED VIDEO & UNLIMITED MUSIC",
    benefitChips: ["100% Ad-Free", "Background Play", "Offline Downloads", "YouTube Music Pro"],
    featureRibbon: "PREMIUM STREAMING EXPERIENCE",
    features: [
      { title: "Zero Advertisements", desc: "Watch millions of videos without a single interruption." },
      { title: "Background Playback", desc: "Keep audio playing while using other apps or screen off." },
      { title: "Offline Downloads", desc: "Save favorite tutorials, podcasts and videos for travel." },
      { title: "YouTube Music", desc: "Full access to YouTube Music with ad-free audio streaming." },
      { title: "Enhanced 1080p", desc: "Crisper visuals with higher bitrate premium resolution." },
      { title: "Picture-in-Picture", desc: "Watch floating videos on iOS, Android and desktop." },
      { title: "Multi-Device", desc: "Smart TVs, laptops, tablets, smartphones and game consoles." },
      { title: "Smart Downloads", desc: "Automatically download recommended videos on Wi-Fi." },
      { title: "Audio Only Mode", desc: "Stream just the audio track to conserve mobile data." },
      { title: "Continue Watching", desc: "Pick up exactly where you left off across any screen." },
      { title: "Kids Separate App", desc: "Controlled ad-free offline entertainment for children." },
      { title: "Verified Activation", desc: "Direct invitation activation provided by TRIHEX." },
    ],
    workflow: ["SEARCH", "LISTEN", "DOWNLOAD", "ENJOY"],
    perfectFor: ["Students", "Podcast Listeners", "Music Lovers", "Commuters", "Gym Goers", "Visual Learners"],
    bottomCta: "EXPERIENCE YOUTUBE THE WAY IT WAS MEANT TO BE",
    colors: { primary: "#ef4444", secondary: "#b91c1c", accent: "#2563eb", pillBg: "#fef2f2", pillBorder: "#fecaca", glow: "rgba(239,68,68,0.14)" },
  },
  {
    slug: "figma-edu-2-years",
    name: "Figma Professional",
    category: "UI/UX DESIGN ✦",
    subtitle: "THE INDUSTRY LEADING COLLABORATIVE INTERFACE DESIGN TOOL",
    centralHeadline: "DESIGN • PROTOTYPE • DEV MODE • FIGJAM",
    benefitChips: ["Collaborative Canvas", "Interactive Prototypes", "Dev Mode Specs", "Design Systems"],
    featureRibbon: "INDUSTRY-STANDARD PRODUCT DESIGN PLATFORM",
    features: [
      { title: "Vector Design Canvas", desc: "Design responsive web and mobile interfaces effortlessly." },
      { title: "Interactive Prototypes", desc: "Simulate user experiences with animations and transitions." },
      { title: "Dev Mode", desc: "Inspect CSS, Swift, and Android code properties cleanly." },
      { title: "Design Systems", desc: "Build components, styles and variant tokens at scale." },
      { title: "FigJam Whiteboard", desc: "Brainstorm, map flows and conduct team retrospectives." },
      { title: "Auto Layout", desc: "Build flexbox-style components that resize automatically." },
      { title: "Unlimited Files", desc: "Create as many projects and drafts as your work demands." },
      { title: "Version History", desc: "Track changes, revert edits and inspect file timeline." },
      { title: "Community Plugins", desc: "Supercharge your workflow with thousands of extensions." },
      { title: "Shared Libraries", desc: "Publish and sync UI kits across your entire team." },
      { title: "Real-Time Cursors", desc: "Design together in real time with teammates simultaneously." },
      { title: "Clean Delivery", desc: "Official verification and fast setup from TRIHEX." },
    ],
    workflow: ["IDEATE", "DESIGN", "PROTOTYPE", "HANDOFF"],
    perfectFor: ["UI Designers", "Product Managers", "Frontend Engineers", "Agencies", "Students", "Founders"],
    bottomCta: "DESIGN EXPERIENCES USERS LOVE WITH FIGMA",
    colors: { primary: "#7c3aed", secondary: "#ec4899", accent: "#f59e0b", pillBg: "#f5f3ff", pillBorder: "#ddd6fe", glow: "rgba(124,58,237,0.12)" },
  },
  {
    slug: "claude-pro-1-month",
    name: "Claude Pro",
    category: "NEXT-GEN AI REASONING ✦",
    subtitle: "DEEP THINKING, CODE GENERATION & ARTIFACTS BY ANTHROPIC",
    centralHeadline: "THE INTELLIGENT AI COLLABORATOR",
    benefitChips: ["Claude 3.7 Sonnet", "Hybrid Reasoning", "Interactive Artifacts", "5x Usage Limits"],
    featureRibbon: "MOST CAPABLE AI REASONING MODEL",
    features: [
      { title: "Claude 3.7 Sonnet", desc: "State-of-the-art reasoning, coding and creative generation." },
      { title: "Hybrid Thinking", desc: "Switch seamlessly between instant answers and deep reasoning." },
      { title: "Interactive Artifacts", desc: "Render React components, SVGs, diagrams and web apps live." },
      { title: "Huge Context Window", desc: "Analyze entire codebases, books and technical manuals." },
      { title: "High-Tier Coding", desc: "Debug, architect and write production-quality programs." },
      { title: "5x More Usage", desc: "Substantially higher message limits than free tier access." },
      { title: "Priority Peak Access", desc: "Reliable availability even during high-traffic global times." },
      { title: "Complex Analysis", desc: "Synthesize dense research papers and data documents." },
      { title: "Natural Tone", desc: "Nuanced, thoughtful writing that avoids generic AI fluff." },
      { title: "Vision Capabilities", desc: "Transcribe handwritten notes, charts and UI screenshots." },
      { title: "Projects Workspace", desc: "Organize custom instructions, files and chat histories." },
      { title: "Verified Account", desc: "Reliable Nepal activation managed by TRIHEX DIGITAL." },
    ],
    workflow: ["PROMPT", "THINK", "BUILD", "DEPLOY"],
    perfectFor: ["Software Engineers", "Researchers", "Founders", "Writers", "Data Analysts", "Builders"],
    bottomCta: "THINK DEEPER AND BUILD FASTER WITH CLAUDE",
    colors: { primary: "#d97706", secondary: "#b45309", accent: "#2563eb", pillBg: "#fffbeb", pillBorder: "#fde68a", glow: "rgba(217,119,6,0.12)" },
  },
  {
    slug: "canva-edu-1-year",
    name: "Canva Enterprise & EDU",
    category: "CREATIVE EMPOWERMENT ✦",
    subtitle: "UNLOCK THOUSANDS OF TEMPLATES, FONTS & BRAND TOOLS",
    centralHeadline: "DESIGN ANYTHING • PUBLISH EVERYWHERE",
    benefitChips: ["Brand Kits", "Magic Studio AI", "Premium Stock", "1-Click Resize"],
    featureRibbon: "COMPLETE DESIGN SUITE FOR TEAMS & CREATORS",
    features: [
      { title: "Magic Studio AI", desc: "Generate images, expand photos and rewrite copy with AI." },
      { title: "100M+ Stock Media", desc: "Millions of premium stock photos, videos and audio tracks." },
      { title: "Brand Kits", desc: "Keep company fonts, colors and logos organized in one click." },
      { title: "Magic Switch", desc: "Instantly resize Instagram posts to posters, docs or slides." },
      { title: "Background Remover", desc: "Remove photo and video backgrounds with a single click." },
      { title: "Social Scheduling", desc: "Plan and schedule social media posts directly inside Canva." },
      { title: "Video Editor", desc: "Edit animations, audio transitions and video clips easily." },
      { title: "Cloud Storage", desc: "Store design assets, templates and exports securely." },
      { title: "Team Collaboration", desc: "Share folders, comments and real-time design edits." },
      { title: "Presentations", desc: "Create interactive slide presentations that stand out." },
      { title: "Print Ready", desc: "Export high-resolution CMYK PDFs for physical printing." },
      { title: "Instant Activation", desc: "Fast activation directly on your email from TRIHEX." },
    ],
    workflow: ["TEMPLATES", "CUSTOMIZE", "AI MAGIC", "SHARE"],
    perfectFor: ["Marketers", "Small Businesses", "Teachers", "Students", "Social Creators", "Freelancers"],
    bottomCta: "DESIGN LIKE A PROFESSIONAL IN MINUTES",
    colors: { primary: "#06b6d4", secondary: "#7c3aed", accent: "#ec4899", pillBg: "#ecfeff", pillBorder: "#a5f3fc", glow: "rgba(6,182,212,0.14)" },
  },
];

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildInfographicSvg(p: ProductSpec): string {
  const W = 1600;
  const H = 2400;

  const cardColW = 680;
  const cardH = 135;
  const col1X = 100;
  const col2X = 820;
  const startY = 1020;
  const cardGap = 20;

  let featureCardsSvg = "";
  p.features.slice(0, 12).forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? col1X : col2X;
    const y = startY + row * (cardH + cardGap);

    featureCardsSvg += `
      <g transform="translate(${x}, ${y})">
        <rect width="${cardColW}" height="${cardH}" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
        <rect x="24" y="24" width="87" height="87" rx="20" fill="${p.colors.pillBg}" stroke="${p.colors.pillBorder}" stroke-width="1.5" />
        <text x="67" y="76" font-family="'Segoe UI', system-ui, sans-serif" font-size="30" font-weight="900" fill="${p.colors.primary}" text-anchor="middle">0${i + 1}</text>
        <text x="135" y="60" font-family="'Segoe UI', system-ui, sans-serif" font-size="28" font-weight="800" fill="#0f172a">${escapeXml(f.title)}</text>
        <text x="135" y="96" font-family="'Segoe UI', system-ui, sans-serif" font-size="20" font-weight="500" fill="#475569">${escapeXml(f.desc)}</text>
      </g>
    `;
  });

  const chipsSvg = `
    <g transform="translate(140, 560)">
      ${p.benefitChips.slice(0, 4).map((chip, idx) => `
        <g transform="translate(${idx * 335}, 0)">
          <rect width="315" height="60" rx="30" fill="${p.colors.pillBg}" stroke="${p.colors.pillBorder}" stroke-width="1.8" />
          <text x="157" y="38" font-family="'Segoe UI', system-ui, sans-serif" font-size="22" font-weight="800" fill="${p.colors.primary}" text-anchor="middle">${escapeXml(chip)}</text>
        </g>
      `).join("")}
    </g>
  `;

  const workflowSvg = p.workflow.map((step, i) => `
    <g transform="translate(${i * 350 + 50}, 0)">
      <rect width="300" height="50" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
      <text x="150" y="32" font-family="'Segoe UI', system-ui, sans-serif" font-size="18" font-weight="800" fill="#0f172a" text-anchor="middle">${i + 1}. ${escapeXml(step)}</text>
    </g>
  `).join("");

  const audienceSvg = `
    <g transform="translate(100, 2100)">
      ${p.perfectFor.map((aud, i) => `
        <g transform="translate(${i * 235}, 0)">
          <rect width="215" height="46" rx="23" fill="${p.colors.pillBg}" stroke="${p.colors.pillBorder}" stroke-width="1.5" />
          <text x="107" y="29" font-family="'Segoe UI', system-ui, sans-serif" font-size="17" font-weight="800" fill="${p.colors.primary}" text-anchor="middle">${escapeXml(aud)}</text>
        </g>
      `).join("")}
    </g>
  `;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="60%" stop-color="#f8fafc" />
        <stop offset="100%" stop-color="#eff6ff" />
      </linearGradient>
      <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${p.colors.primary}" />
        <stop offset="100%" stop-color="${p.colors.secondary}" />
      </linearGradient>
      <linearGradient id="panelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#f1f5f9" />
      </linearGradient>
      <linearGradient id="ctaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
      <filter id="panelShadow" x="-5%" y="-5%" width="110%" height="115%">
        <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="${p.colors.primary}" flood-opacity="0.08" />
      </filter>
    </defs>

    <rect width="${W}" height="${H}" fill="url(#bgGrad)" />
    <circle cx="800" cy="400" r="500" fill="${p.colors.glow}" />

    <!-- Outer Frame -->
    <rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="48" fill="none" stroke="#e2e8f0" stroke-width="2.5" />

    <!-- 1. Category Pill -->
    <g transform="translate(800, 110)">
      <rect x="-240" y="-28" width="480" height="56" rx="28" fill="${p.colors.pillBg}" stroke="${p.colors.pillBorder}" stroke-width="2" />
      <text x="0" y="8" font-family="'Segoe UI', system-ui, sans-serif" font-size="20" font-weight="900" letter-spacing="3" fill="${p.colors.primary}" text-anchor="middle">${escapeXml(p.category)}</text>
    </g>

    <!-- 2. Product Title -->
    <g transform="translate(800, 230)">
      <text x="0" y="0" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="76" font-weight="950" letter-spacing="-1.5" fill="#0f172a" text-anchor="middle">${escapeXml(p.name)}</text>
      <text x="0" y="55" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="24" font-weight="800" letter-spacing="1" fill="${p.colors.primary}" text-anchor="middle">${escapeXml(p.subtitle)}</text>
    </g>

    <!-- 3. Central Value Panel -->
    <g transform="translate(100, 360)" filter="url(#panelShadow)">
      <rect width="1400" height="300" rx="34" fill="url(#panelGrad)" stroke="#e2e8f0" stroke-width="2" />
      <rect x="2" y="2" width="1396" height="6" rx="3" fill="url(#brandGrad)" />
      <text x="700" y="85" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="40" font-weight="950" letter-spacing="-0.5" fill="#0f172a" text-anchor="middle">${escapeXml(p.centralHeadline)}</text>
      ${p.centralSubheadline ? `<text x="700" y="135" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="24" font-weight="700" fill="#64748b" text-anchor="middle">${escapeXml(p.centralSubheadline)}</text>` : ""}
    </g>

    ${chipsSvg}

    <!-- 4. Feature Ribbon Header -->
    <g transform="translate(800, 725)">
      <rect x="-340" y="-28" width="680" height="56" rx="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
      <circle cx="-300" cy="0" r="8" fill="${p.colors.primary}" />
      <circle cx="300" cy="0" r="8" fill="${p.colors.accent}" />
      <text x="0" y="8" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" letter-spacing="2" fill="#0f172a" text-anchor="middle">${escapeXml(p.featureRibbon)}</text>
    </g>

    ${featureCardsSvg}

    <!-- 6. Workflow -->
    <g transform="translate(800, 1960)">
      <text x="0" y="0" font-family="'Segoe UI', system-ui, sans-serif" font-size="18" font-weight="900" letter-spacing="3" fill="#64748b" text-anchor="middle">STREAMLINED WORKFLOW</text>
      <g transform="translate(-700, 20)">
        ${workflowSvg}
      </g>
    </g>

    <!-- 7. Perfect For -->
    <g transform="translate(800, 2060)">
      <text x="0" y="0" font-family="'Segoe UI', system-ui, sans-serif" font-size="18" font-weight="900" letter-spacing="3" fill="#64748b" text-anchor="middle">PERFECT FOR</text>
    </g>
    ${audienceSvg}

    <!-- 8. Bottom CTA -->
    <g transform="translate(100, 2185)">
      <rect width="1400" height="130" rx="32" fill="url(#ctaGrad)" />
      <text x="700" y="55" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" letter-spacing="1" fill="#ffffff" text-anchor="middle">${escapeXml(p.bottomCta)}</text>
      <text x="700" y="98" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="22" font-weight="800" letter-spacing="4" fill="#38bdf8" text-anchor="middle">AVAILABLE AT TRIHEX DIGITAL</text>
    </g>

    <!-- 9. Footer Brand Mark -->
    <g transform="translate(800, 2355)">
      <text x="0" y="0" font-family="'Segoe UI', system-ui, sans-serif" font-size="15" font-weight="800" letter-spacing="3" fill="#94a3b8" text-anchor="middle">TRIHEX DIGITAL • NEPAL-FIRST VERIFIED AI &amp; CLOUD MARKETPLACE</text>
    </g>
  </svg>
  `;
}

function buildThumbnailSvg(p: ProductSpec): string {
  const W = 1200;
  const H = 1500;

  const topFeatures = p.features.slice(0, 3);
  let featureCardsSvg = "";
  topFeatures.forEach((f, i) => {
    const y = 690 + i * 140;
    featureCardsSvg += `
      <g transform="translate(100, ${y})">
        <rect width="1000" height="115" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
        <rect x="24" y="24" width="67" height="67" rx="18" fill="${p.colors.pillBg}" stroke="${p.colors.pillBorder}" stroke-width="1.5" />
        <text x="57" y="66" font-family="'Segoe UI', system-ui, sans-serif" font-size="26" font-weight="900" fill="${p.colors.primary}" text-anchor="middle">0${i + 1}</text>
        <text x="115" y="55" font-family="'Segoe UI', system-ui, sans-serif" font-size="28" font-weight="800" fill="#0f172a">${escapeXml(f.title)}</text>
        <text x="115" y="92" font-family="'Segoe UI', system-ui, sans-serif" font-size="21" font-weight="500" fill="#475569">${escapeXml(f.desc)}</text>
      </g>
    `;
  });

  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <defs>
      <linearGradient id="tBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="50%" stop-color="#f8fafc" />
        <stop offset="100%" stop-color="#eff6ff" />
      </linearGradient>
      <linearGradient id="tBrandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${p.colors.primary}" />
        <stop offset="100%" stop-color="${p.colors.accent}" />
      </linearGradient>
      <filter id="tShadow" x="-5%" y="-5%" width="110%" height="115%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="${p.colors.primary}" flood-opacity="0.08" />
      </filter>
    </defs>

    <rect width="${W}" height="${H}" fill="url(#tBgGrad)" />
    <circle cx="600" cy="300" r="400" fill="${p.colors.glow}" />

    <!-- Outer Card Frame -->
    <rect x="20" y="20" width="${W - 40}" height="${H - 40}" rx="36" fill="none" stroke="#e2e8f0" stroke-width="2" />

    <!-- Top Category Pill -->
    <g transform="translate(600, 110)">
      <rect x="-200" y="-24" width="400" height="48" rx="24" fill="${p.colors.pillBg}" stroke="${p.colors.pillBorder}" stroke-width="1.8" />
      <text x="0" y="7" font-family="'Segoe UI', system-ui, sans-serif" font-size="18" font-weight="900" letter-spacing="2" fill="${p.colors.primary}" text-anchor="middle">${escapeXml(p.category)}</text>
    </g>

    <!-- Product Title -->
    <g transform="translate(600, 240)">
      <text x="0" y="0" font-family="'Segoe UI', system-ui, sans-serif" font-size="64" font-weight="950" letter-spacing="-1" fill="#0f172a" text-anchor="middle">${escapeXml(p.name)}</text>
      <text x="0" y="48" font-family="'Segoe UI', system-ui, sans-serif" font-size="22" font-weight="800" letter-spacing="1" fill="${p.colors.primary}" text-anchor="middle">${escapeXml(p.subtitle)}</text>
    </g>

    <!-- Central Focus Card -->
    <g transform="translate(100, 360)" filter="url(#tShadow)">
      <rect width="1000" height="240" rx="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
      <rect x="2" y="2" width="996" height="5" rx="2.5" fill="url(#tBrandGrad)" />
      <text x="500" y="80" font-family="'Segoe UI', system-ui, sans-serif" font-size="34" font-weight="950" fill="#0f172a" text-anchor="middle">${escapeXml(p.centralHeadline)}</text>
      
      <g transform="translate(50, 125)">
        ${p.benefitChips.slice(0, 3).map((chip, idx) => `
          <g transform="translate(${idx * 310}, 0)">
            <rect width="280" height="50" rx="25" fill="${p.colors.pillBg}" stroke="${p.colors.pillBorder}" stroke-width="1.5" />
            <text x="140" y="32" font-family="'Segoe UI', system-ui, sans-serif" font-size="18" font-weight="800" fill="${p.colors.primary}" text-anchor="middle">${escapeXml(chip)}</text>
          </g>
        `).join("")}
      </g>
    </g>

    <!-- Key Feature Highlights -->
    <g transform="translate(600, 650)">
      <text x="0" y="0" font-family="'Segoe UI', system-ui, sans-serif" font-size="16" font-weight="900" letter-spacing="3" fill="#64748b" text-anchor="middle">CORE CAPABILITIES</text>
    </g>
    ${featureCardsSvg}

    <!-- Bottom Brand & Action Strip -->
    <g transform="translate(100, 1190)">
      <rect width="1000" height="180" rx="28" fill="#0f172a" />
      <text x="500" y="65" font-family="'Segoe UI', system-ui, sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">AVAILABLE AT TRIHEX DIGITAL</text>
      <text x="500" y="105" font-family="'Segoe UI', system-ui, sans-serif" font-size="18" font-weight="700" letter-spacing="2" fill="#38bdf8" text-anchor="middle">VERIFIED SUPPLY • FAST ACTIVATION • LOCAL WHATSAPP SUPPORT</text>
      <text x="500" y="142" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" font-weight="800" letter-spacing="3" fill="#94a3b8" text-anchor="middle">NEPAL'S PREFERRED DIGITAL PRODUCT MARKETPLACE</text>
    </g>
  </svg>
  `;
}

// Duration variants that map directly to their canonical parent
const VARIANT_MAP: Record<string, string> = {
  "cursor-pro-1-month": "cursor-pro-12m",
  "capcut-pro-30-days": "capcut-pro",
  "capcut-pro-7-days": "capcut-pro",
  "capcut-pro-6-months": "capcut-pro",
  "notion-business-3-months": "notion-business-12m",
  "elevenlabs-1-month": "elevenlabs-creator-shared",
  "grok-super-3-months": "supergrok-3-months",
  "grok-super-10-months": "supergrok-3-months",
  "gemini-pro-cdk-12-months": "gemini-pro-18-months-link",
  "gemini-ai-pro-5tb-12m-mail-a": "gemini-pro-18-months-link",
};

async function main() {
  const outputBase = path.join(process.cwd(), "public", "media", "products");

  // 1. Generate new products
  console.log(`Generating ${NEW_PRODUCTS.length} new brand product assets...`);
  for (const p of NEW_PRODUCTS) {
    const prodDir = path.join(outputBase, p.slug);
    if (!fs.existsSync(prodDir)) fs.mkdirSync(prodDir, { recursive: true });

    const infoPath = path.join(prodDir, `${p.slug}-infographic.webp`);
    const thumbPath = path.join(prodDir, `${p.slug}-thumbnail.webp`);

    const infoSvg = buildInfographicSvg(p);
    await sharp(Buffer.from(infoSvg))
      .resize(1600, 2400)
      .webp({ quality: 92, lossless: false, effort: 4 })
      .toFile(infoPath);

    const thumbSvg = buildThumbnailSvg(p);
    await sharp(Buffer.from(thumbSvg))
      .resize(1200, 1500)
      .webp({ quality: 90, lossless: false, effort: 4 })
      .toFile(thumbPath);

    console.log(`✓ Generated ${p.slug}`);
  }

  // 2. Link duration variants
  console.log("Generating / copying duration variants...");
  for (const [varSlug, parentSlug] of Object.entries(VARIANT_MAP)) {
    const parentDir = path.join(outputBase, parentSlug);
    const varDir = path.join(outputBase, varSlug);
    if (!fs.existsSync(varDir)) fs.mkdirSync(varDir, { recursive: true });

    const parentThumb = path.join(parentDir, `${parentSlug}-thumbnail.webp`);
    const parentInfo = path.join(parentDir, `${parentSlug}-infographic.webp`);

    const varThumb = path.join(varDir, `${varSlug}-thumbnail.webp`);
    const varInfo = path.join(varDir, `${varSlug}-infographic.webp`);

    if (fs.existsSync(parentThumb)) {
      fs.copyFileSync(parentThumb, varThumb);
    }
    if (fs.existsSync(parentInfo)) {
      fs.copyFileSync(parentInfo, varInfo);
    }
    console.log(`✓ Copied ${parentSlug} -> ${varSlug}`);
  }

  console.log("All missing catalogue products now have physical assets!");
}

main().catch(console.error);
