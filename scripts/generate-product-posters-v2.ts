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

const PRODUCTS: ProductSpec[] = [
  {
    slug: "gemini-pro-18-months-link",
    name: "Google AI Pro",
    category: "PREMIUM AI EXPERIENCE ✦",
    subtitle: "ADVANCED AI FOR WORK, STUDY, RESEARCH & CREATIVITY",
    centralHeadline: "ONE POWERFUL AI EXPERIENCE",
    centralSubheadline: "Reason • Research • Create • Code • Organize",
    benefitChips: ["Advanced AI", "Research", "Creative Tools", "Productivity"],
    featureRibbon: "POWERFUL GOOGLE AI CAPABILITIES",
    features: [
      { title: "Gemini AI", desc: "AI assistance for everyday and complex tasks." },
      { title: "Advanced Reasoning", desc: "Work through challenging problems and ideas." },
      { title: "Deep Research", desc: "Explore topics and organize useful findings." },
      { title: "Long Documents", desc: "Analyze and work with larger amounts of context." },
      { title: "AI Coding", desc: "Generate, understand and improve code." },
      { title: "Writing Assistance", desc: "Draft, rewrite, summarize and refine content." },
      { title: "Image Creation", desc: "Transform ideas into creative visual concepts." },
      { title: "AI Video Tools", desc: "Explore next-generation video creation workflows." },
      { title: "Google Workspace AI", desc: "Improve productivity across your workflow." },
      { title: "NotebookLM", desc: "Study and understand source material more efficiently." },
      { title: "AI Studio", desc: "Experiment with powerful AI model capabilities." },
      { title: "Cloud Ecosystem", desc: "Keep your digital workflow connected." },
    ],
    workflow: ["IDEA", "RESEARCH", "CREATE", "COMPLETE"],
    perfectFor: ["Students", "Researchers", "Developers", "Creators", "Professionals", "Entrepreneurs"],
    bottomCta: "UNLOCK THE POWER OF GOOGLE AI",
    colors: { primary: "#1a73e8", secondary: "#9333ea", accent: "#06b6d4", pillBg: "#e8f0fe", pillBorder: "#bed6fb", glow: "rgba(26,115,232,0.12)" },
  },
  {
    slug: "elevenlabs-creator-shared",
    name: "ElevenLabs Creator",
    category: "ADVANCED AI VOICE TECHNOLOGY ✦",
    subtitle: "CREATE NATURAL, EXPRESSIVE AND PROFESSIONAL AI AUDIO",
    centralHeadline: "TURN TEXT INTO POWERFUL VOICE EXPERIENCES",
    benefitChips: ["Voice Generation", "Dubbing", "Narration", "Audio Production"],
    featureRibbon: "INDUSTRY-LEADING AI AUDIO SUITE",
    features: [
      { title: "Text to Speech", desc: "Turn written content into realistic spoken audio." },
      { title: "Natural AI Voices", desc: "Create expressive and human-like narration." },
      { title: "Voice Design", desc: "Develop voices suited to different creative styles." },
      { title: "Voice Cloning", desc: "Create consistent voice experiences when supported." },
      { title: "Multilingual Audio", desc: "Produce speech for audiences across languages." },
      { title: "AI Dubbing", desc: "Adapt spoken content for different audiences." },
      { title: "Long-Form Narration", desc: "Useful for videos, courses and storytelling." },
      { title: "Creator Workflow", desc: "Produce polished audio faster." },
      { title: "Projects", desc: "Organize larger narration and audio work." },
      { title: "Speech Controls", desc: "Fine-tune delivery, pacing and expression." },
      { title: "Audio Export", desc: "Prepare generated audio for creative workflows." },
      { title: "Professional Quality", desc: "Designed for modern content production." },
    ],
    workflow: ["SCRIPT", "VOICE", "POLISH", "PUBLISH"],
    perfectFor: ["YouTubers", "Video Editors", "Podcasters", "Teachers", "Marketers", "Creators"],
    bottomCta: "BRING YOUR CONTENT TO LIFE WITH AI VOICE",
    colors: { primary: "#0f172a", secondary: "#2563eb", accent: "#7c3aed", pillBg: "#eff6ff", pillBorder: "#bfdbfe", glow: "rgba(37,99,235,0.12)" },
  },
  {
    slug: "chatgpt-plus-1-month-fw",
    name: "ChatGPT Plus",
    category: "PREMIUM AI ASSISTANT ✦",
    subtitle: "THINK, CREATE, RESEARCH, ANALYZE & BUILD FASTER",
    centralHeadline: "YOUR EVERYDAY AI WORKSPACE",
    benefitChips: ["Reasoning", "Writing", "Research", "Coding", "Creativity"],
    featureRibbon: "ADVANCED INTELLIGENCE CAPABILITIES",
    features: [
      { title: "Advanced AI", desc: "Handle complex questions and everyday tasks." },
      { title: "Reasoning", desc: "Work through problems step by step." },
      { title: "Writing", desc: "Draft, rewrite and improve professional content." },
      { title: "Coding", desc: "Generate, explain, debug and improve code." },
      { title: "File Analysis", desc: "Work with documents and structured information." },
      { title: "Data Analysis", desc: "Explore information and identify useful insights." },
      { title: "Image Understanding", desc: "Discuss and analyze visual information." },
      { title: "Image Creation", desc: "Turn creative concepts into visuals." },
      { title: "Web Research", desc: "Explore current information when available." },
      { title: "Brainstorming", desc: "Develop ideas, strategies and alternatives." },
      { title: "Learning", desc: "Explain difficult concepts clearly." },
      { title: "Productivity", desc: "Accelerate repetitive knowledge work." },
    ],
    workflow: ["ASK", "REASON", "CREATE", "REFINE"],
    perfectFor: ["Students", "Developers", "Business Owners", "Researchers", "Creators", "Professionals"],
    bottomCta: "DO MORE WITH YOUR AI ASSISTANT",
    colors: { primary: "#10a37f", secondary: "#047857", accent: "#06b6d4", pillBg: "#ecfdf5", pillBorder: "#a7f3d0", glow: "rgba(16,163,127,0.12)" },
  },
  {
    slug: "manus-ai-pro-12m",
    name: "Manus AI Pro",
    category: "AUTONOMOUS AI AGENT ✦",
    subtitle: "FROM INSTRUCTION TO MULTI-STEP EXECUTION",
    centralHeadline: "AI THAT PLANS, RESEARCHES AND EXECUTES WORKFLOWS",
    benefitChips: ["Planning", "Research", "Automation", "Execution"],
    featureRibbon: "NEXT-GENERATION AGENTIC ENGINE",
    features: [
      { title: "Autonomous Tasks", desc: "Handle multi-step assignments with less manual work." },
      { title: "Task Planning", desc: "Break larger objectives into actionable steps." },
      { title: "Web Research", desc: "Collect and organize relevant online information." },
      { title: "Document Creation", desc: "Produce structured outputs from research." },
      { title: "Data Processing", desc: "Work with information across complex tasks." },
      { title: "Coding Assistance", desc: "Support technical and development workflows." },
      { title: "Browser Tasks", desc: "Interact with web-based workflows when available." },
      { title: "Workflow Execution", desc: "Move from planning toward completion." },
      { title: "Multi-Step Reasoning", desc: "Coordinate interconnected actions." },
      { title: "Structured Results", desc: "Deliver organized outputs instead of raw information." },
      { title: "Productivity", desc: "Reduce repetitive knowledge work." },
      { title: "Agentic Experience", desc: "Operate more like a digital task assistant." },
    ],
    workflow: ["GOAL", "PLAN", "EXECUTE", "DELIVER"],
    perfectFor: ["Founders", "Researchers", "Operators", "Developers", "Marketers", "Professionals"],
    bottomCta: "TURN COMPLEX REQUESTS INTO COMPLETED WORK",
    colors: { primary: "#1e293b", secondary: "#4f46e5", accent: "#7c3aed", pillBg: "#eef2ff", pillBorder: "#c7d2fe", glow: "rgba(79,70,229,0.12)" },
  },
  {
    slug: "gamma-pro-1-year",
    name: "Gamma Pro",
    category: "AI PRESENTATION & CONTENT DESIGN ✦",
    subtitle: "TURN IDEAS INTO BEAUTIFUL PRESENTATIONS AND DOCUMENTS",
    centralHeadline: "CREATE PROFESSIONAL CONTENT FASTER",
    benefitChips: ["Presentations", "Documents", "Web Pages", "AI Design"],
    featureRibbon: "INTELLIGENT PRESENTATION SUITE",
    features: [
      { title: "AI Presentations", desc: "Generate structured presentation concepts quickly." },
      { title: "Smart Layouts", desc: "Automatically organize content beautifully." },
      { title: "AI Writing", desc: "Develop and refine presentation copy." },
      { title: "Visual Storytelling", desc: "Turn information into engaging narratives." },
      { title: "Documents", desc: "Create modern visual documents." },
      { title: "Web Content", desc: "Publish information in engaging web-style formats." },
      { title: "Templates", desc: "Start quickly with polished designs." },
      { title: "Brand Consistency", desc: "Maintain a more unified visual appearance." },
      { title: "Media Support", desc: "Combine text, images and rich content." },
      { title: "Collaboration", desc: "Work together on shared content." },
      { title: "Easy Editing", desc: "Refine generated content without complex design tools." },
      { title: "Professional Output", desc: "Build clean content for business and education." },
    ],
    workflow: ["IDEA", "GENERATE", "DESIGN", "PRESENT"],
    perfectFor: ["Students", "Teachers", "Sales Teams", "Founders", "Marketers", "Professionals"],
    bottomCta: "TURN YOUR IDEAS INTO BEAUTIFUL STORIES",
    colors: { primary: "#9333ea", secondary: "#c026d3", accent: "#06b6d4", pillBg: "#faf5ff", pillBorder: "#e9d5ff", glow: "rgba(147,51,234,0.12)" },
  },
  {
    slug: "supergrok-3-months",
    name: "SuperGrok",
    category: "ADVANCED AI INTELLIGENCE ✦",
    subtitle: "RESEARCH, REASON AND EXPLORE INFORMATION FASTER",
    centralHeadline: "POWERFUL AI FOR CURIOUS MINDS",
    benefitChips: ["Reasoning", "Research", "Analysis", "Conversation"],
    featureRibbon: "REAL-TIME EXPLORATION & INSIGHTS",
    features: [
      { title: "Advanced AI Chat", desc: "Explore questions through natural conversation." },
      { title: "Deep Reasoning", desc: "Work through challenging problems." },
      { title: "Research", desc: "Explore information across complex topics." },
      { title: "Current Information", desc: "Work with timely information when supported." },
      { title: "Coding Help", desc: "Understand and develop technical solutions." },
      { title: "Data Interpretation", desc: "Explore structured information and trends." },
      { title: "Writing", desc: "Generate and improve written content." },
      { title: "Brainstorming", desc: "Discover ideas and alternative approaches." },
      { title: "Summarization", desc: "Condense complicated information." },
      { title: "Problem Solving", desc: "Use AI to investigate possible solutions." },
      { title: "Creative Exploration", desc: "Develop concepts, stories and strategies." },
      { title: "Productivity", desc: "Speed up everyday knowledge work." },
    ],
    workflow: ["QUESTION", "INVESTIGATE", "REASON", "ANSWER"],
    perfectFor: ["Researchers", "Developers", "Students", "Analysts", "Creators", "Entrepreneurs"],
    bottomCta: "EXPLORE MORE WITH ADVANCED AI",
    colors: { primary: "#0f172a", secondary: "#2563eb", accent: "#6366f1", pillBg: "#f1f5f9", pillBorder: "#cbd5e1", glow: "rgba(37,99,235,0.1)" },
  },
  {
    slug: "cursor-pro-12m",
    name: "Cursor Pro",
    category: "AI-POWERED CODE EDITOR ✦",
    subtitle: "BUILD SOFTWARE FASTER WITH AI INSIDE YOUR EDITOR",
    centralHeadline: "CODE • UNDERSTAND • DEBUG • SHIP",
    benefitChips: ["Code Generation", "Agentic Coding", "Multi-File Edits", "Context Awareness"],
    featureRibbon: "NEXT-GENERATION DEVELOPER EXPERIENCE",
    features: [
      { title: "AI Code Generation", desc: "Turn natural-language instructions into code." },
      { title: "Code Completion", desc: "Accelerate everyday development." },
      { title: "Agentic Coding", desc: "Delegate larger coding tasks to AI workflows." },
      { title: "Codebase Understanding", desc: "Ask questions about existing projects." },
      { title: "Multi-File Editing", desc: "Apply coordinated changes across project files." },
      { title: "Debugging", desc: "Find and resolve development issues faster." },
      { title: "Refactoring", desc: "Improve and restructure existing code." },
      { title: "Terminal Assistance", desc: "Support development workflows from one environment." },
      { title: "Context Awareness", desc: "Use project context for more relevant assistance." },
      { title: "Documentation", desc: "Generate explanations and developer documentation." },
      { title: "Code Review", desc: "Identify potential issues and improvements." },
      { title: "Developer Productivity", desc: "Reduce repetitive development work." },
    ],
    workflow: ["PROMPT", "CODE", "TEST", "SHIP"],
    perfectFor: ["Frontend Developers", "Backend Developers", "Full-Stack Developers", "Students", "Startups", "Software Teams"],
    bottomCta: "CODE AT THE SPEED OF AI",
    colors: { primary: "#1e293b", secondary: "#2563eb", accent: "#7c3aed", pillBg: "#eff6ff", pillBorder: "#bfdbfe", glow: "rgba(37,99,235,0.12)" },
  },
  {
    slug: "claude-code-api-access",
    name: "Claude Code API Access",
    category: "ADVANCED AI CODING ✦",
    subtitle: "POWERFUL AI ASSISTANCE FOR SERIOUS SOFTWARE DEVELOPMENT",
    centralHeadline: "UNDERSTAND CODEBASES • BUILD FEATURES • SOLVE PROBLEMS",
    benefitChips: ["Repository Reasoning", "Bug Investigation", "Refactoring", "Terminal Automation"],
    featureRibbon: "ENGINEER-GRADE AI CODING ENGINE",
    features: [
      { title: "Code Generation", desc: "Generate implementation ideas and code." },
      { title: "Repository Understanding", desc: "Reason across larger project structures." },
      { title: "Debugging", desc: "Investigate bugs and unexpected behavior." },
      { title: "Refactoring", desc: "Improve existing code architecture." },
      { title: "Terminal Workflows", desc: "Support command-line development tasks." },
      { title: "Code Explanation", desc: "Understand unfamiliar code more efficiently." },
      { title: "Feature Development", desc: "Assist with implementing larger requirements." },
      { title: "Testing", desc: "Develop and improve test coverage." },
      { title: "Documentation", desc: "Create useful technical documentation." },
      { title: "API Development", desc: "Support backend and integration work." },
      { title: "Architecture Reasoning", desc: "Explore software-design decisions." },
      { title: "Developer Automation", desc: "Reduce repetitive engineering work." },
    ],
    workflow: ["UNDERSTAND", "PLAN", "IMPLEMENT", "VERIFY"],
    perfectFor: ["Software Engineers", "API Developers", "Backend Teams", "Technical Founders", "DevOps", "Advanced Students"],
    bottomCta: "BUILD BETTER SOFTWARE WITH AI",
    colors: { primary: "#c2410c", secondary: "#b45309", accent: "#d97706", pillBg: "#fffbeb", pillBorder: "#fde68a", glow: "rgba(194,65,12,0.12)" },
  },
  {
    slug: "capcut-pro",
    name: "CapCut Pro",
    category: "PRO VIDEO EDITING ✦",
    subtitle: "CREATE POLISHED VIDEOS FOR SOCIAL MEDIA AND BUSINESS",
    centralHeadline: "EDIT • ENHANCE • CAPTION • PUBLISH",
    benefitChips: ["Auto Captions", "Timeline Editing", "AI Visual Effects", "4K Export"],
    featureRibbon: "COMPLETE SHORT & LONG-FORM VIDEO STUDIO",
    features: [
      { title: "Timeline Editing", desc: "Build polished multi-layer video projects." },
      { title: "Templates", desc: "Create content quickly from ready-made layouts." },
      { title: "Auto Captions", desc: "Generate subtitles more efficiently." },
      { title: "Effects", desc: "Add modern visual effects to videos." },
      { title: "Transitions", desc: "Create smoother scene changes." },
      { title: "Filters", desc: "Develop consistent visual styles." },
      { title: "Audio Editing", desc: "Improve music, voice and sound workflows." },
      { title: "Background Tools", desc: "Create cleaner compositions and edits." },
      { title: "Text & Titles", desc: "Add dynamic visual typography." },
      { title: "AI Tools", desc: "Speed up selected editing tasks." },
      { title: "Social Content", desc: "Create vertical and short-form content." },
      { title: "High-Quality Export", desc: "Prepare polished videos for publishing." },
    ],
    workflow: ["IMPORT", "EDIT", "ENHANCE", "EXPORT"],
    perfectFor: ["TikTok Creators", "YouTubers", "Businesses", "Reels Creators", "Video Editors", "Marketers"],
    bottomCta: "TURN RAW FOOTAGE INTO SCROLL-STOPPING CONTENT",
    colors: { primary: "#0ea5e9", secondary: "#2563eb", accent: "#7c3aed", pillBg: "#f0f9ff", pillBorder: "#bae6fd", glow: "rgba(14,165,233,0.12)" },
  },
  {
    slug: "kling-standard-680-750-credits",
    name: "Kling AI Standard",
    category: "AI VIDEO GENERATION ✦",
    subtitle: "TURN IDEAS AND IMAGES INTO CINEMATIC AI VIDEO",
    centralHeadline: "IMAGINE IT. GENERATE IT. BRING IT TO MOTION.",
    benefitChips: ["Text to Video", "Image Animation", "Cinematic Motion", "Prompt Control"],
    featureRibbon: "NEXT-GEN GENERATIVE MOTION SYSTEM",
    features: [
      { title: "Text to Video", desc: "Turn written ideas into generated video scenes." },
      { title: "Image to Video", desc: "Bring still images to life with motion." },
      { title: "Cinematic Motion", desc: "Create visually dynamic movement." },
      { title: "Prompt Control", desc: "Guide style, subject and action through prompts." },
      { title: "Creative Scenes", desc: "Generate imaginative video concepts." },
      { title: "Camera Movement", desc: "Explore dynamic cinematic compositions." },
      { title: "Character Motion", desc: "Animate subjects with natural-looking movement." },
      { title: "Visual Effects", desc: "Generate visually rich creative scenes." },
      { title: "Content Concepts", desc: "Prototype video ideas before full production." },
      { title: "Social Content", desc: "Create attention-grabbing short-form visuals." },
      { title: "Product Visuals", desc: "Develop creative commercial concepts." },
      { title: "Creator Workflow", desc: "Accelerate AI-assisted video production." },
    ],
    workflow: ["PROMPT", "GENERATE", "REFINE", "CREATE"],
    perfectFor: ["Creators", "Filmmakers", "Marketers", "Designers", "Agencies", "Businesses"],
    bottomCta: "TURN IMAGINATION INTO MOTION",
    colors: { primary: "#7c3aed", secondary: "#2563eb", accent: "#ec4899", pillBg: "#f5f3ff", pillBorder: "#ddd6fe", glow: "rgba(124,58,237,0.12)" },
  },
  {
    slug: "higgsfield-pro-12m",
    name: "Higgsfield Pro",
    category: "CINEMATIC AI VIDEO ✦",
    subtitle: "CREATE DYNAMIC AI VISUALS WITH CINEMATIC MOTION",
    centralHeadline: "AI VIDEO DESIGNED FOR VISUAL IMPACT",
    benefitChips: ["Camera Motion", "Character Animation", "Commercial Concepts", "Motion Effects"],
    featureRibbon: "ADVANCED CINEMATIC CAMERA SYSTEM",
    features: [
      { title: "Cinematic Camera Motion", desc: "Create expressive camera movement." },
      { title: "Image Animation", desc: "Bring still visual concepts to life." },
      { title: "Dynamic Scenes", desc: "Generate motion-rich creative content." },
      { title: "Creative Direction", desc: "Shape style and atmosphere through prompts." },
      { title: "Character Movement", desc: "Explore expressive subject animation." },
      { title: "Product Shots", desc: "Create visually striking commercial concepts." },
      { title: "Social Ads", desc: "Develop scroll-stopping short-form visuals." },
      { title: "Film Concepts", desc: "Prototype cinematic ideas quickly." },
      { title: "Visual Storytelling", desc: "Build scenes around narrative concepts." },
      { title: "Motion Effects", desc: "Create dramatic movement and transitions." },
      { title: "Creator Workflow", desc: "Accelerate concept-to-video production." },
      { title: "High-End Visual Style", desc: "Create content with a polished cinematic feeling." },
    ],
    workflow: ["IMAGE", "CAMERA MOTION", "SCENE", "VIDEO"],
    perfectFor: ["Filmmakers", "Creators", "Agencies", "Brands", "Designers", "Marketers"],
    bottomCta: "MAKE EVERY FRAME FEEL CINEMATIC",
    colors: { primary: "#ea580c", secondary: "#7c3aed", accent: "#2563eb", pillBg: "#fff7ed", pillBorder: "#fed7aa", glow: "rgba(234,88,12,0.12)" },
  },
  {
    slug: "canva-pro-1-year",
    name: "Canva Pro",
    category: "DESIGN & CREATIVE PLATFORM ✦",
    subtitle: "CREATE PROFESSIONAL CONTENT WITHOUT COMPLEX DESIGN SOFTWARE",
    centralHeadline: "DESIGN EVERYTHING IN ONE CREATIVE WORKSPACE",
    benefitChips: ["Premium Templates", "Brand Kit", "Background Remover", "Magic AI Tools"],
    featureRibbon: "ALL-IN-ONE GRAPHIC & MEDIA WORKSPACE",
    features: [
      { title: "Premium Templates", desc: "Create faster with professional layouts." },
      { title: "Social Media Design", desc: "Build posts, stories and promotional content." },
      { title: "Presentations", desc: "Create polished slides and pitch decks." },
      { title: "Video Editing", desc: "Produce engaging visual content." },
      { title: "Background Removal", desc: "Clean up product and portrait images." },
      { title: "Brand Tools", desc: "Maintain consistent visual identity." },
      { title: "AI Design Tools", desc: "Accelerate selected creative tasks with AI." },
      { title: "Image Editing", desc: "Enhance and transform visual assets." },
      { title: "Resize Tools", desc: "Adapt content for different platforms." },
      { title: "Content Library", desc: "Access a wide variety of creative resources." },
      { title: "Collaboration", desc: "Design together with teams." },
      { title: "Content Planning", desc: "Organize your creative workflow." },
    ],
    workflow: ["IDEA", "DESIGN", "RESIZE", "PUBLISH"],
    perfectFor: ["Businesses", "Students", "Creators", "Social Media Managers", "Teachers", "Marketers"],
    bottomCta: "DESIGN MORE. CREATE FASTER.",
    colors: { primary: "#06b6d4", secondary: "#8b5cf6", accent: "#ec4899", pillBg: "#ecfeff", pillBorder: "#a5f3fc", glow: "rgba(6,182,212,0.12)" },
  },
  {
    slug: "kling-ultra-26k-credits",
    name: "Kling AI Ultra",
    category: "ADVANCED AI FILMMAKING ✦",
    subtitle: "MORE CREATIVE POWER FOR HIGH-VOLUME AI VIDEO PRODUCTION",
    centralHeadline: "CREATE MORE AMBITIOUS AI VIDEO PROJECTS",
    benefitChips: ["High-Volume Creation", "26,000 Credits", "Advanced Prompting", "Ultra Cinematic"],
    featureRibbon: "STUDIO-GRADE GENERATIVE PRODUCTION",
    features: [
      { title: "Text to Video", desc: "Turn elaborate script concepts into high-definition scenes." },
      { title: "Image to Video", desc: "Breathe cinematic life and fluidity into static imagery." },
      { title: "Cinematic Motion", desc: "Render complex action and camera paths with precision." },
      { title: "Advanced Prompting", desc: "Fine-tune lighting, lens style, aspect and pacing." },
      { title: "Creative Camera Movement", desc: "Direct multi-angle motion and tracking shots." },
      { title: "Character Animation", desc: "Produce realistic human expressions and character motion." },
      { title: "Product Commercials", desc: "Generate luxury commercial visuals for brands." },
      { title: "Concept Films", desc: "Prototype movie trailers, scenes and visionary worlds." },
      { title: "Social Campaigns", desc: "Deliver high-impact visual spots across social feeds." },
      { title: "Visual Storytelling", desc: "Chain sequential narrative scenes seamlessly." },
      { title: "High-Volume Creation", desc: "Sufficient capacity for intensive client projects." },
      { title: "Professional AI Workflow", desc: "Designed for commercial agencies and visual studios." },
    ],
    workflow: ["CONCEPT", "GENERATE", "ITERATE", "PRODUCE"],
    perfectFor: ["Agencies", "Production Teams", "Advanced Creators", "Brands", "Filmmakers", "Marketing Teams"],
    bottomCta: "EXPAND YOUR AI VIDEO WORKFLOW",
    colors: { primary: "#4338ca", secondary: "#7c3aed", accent: "#f59e0b", pillBg: "#e0e7ff", pillBorder: "#c7d2fe", glow: "rgba(67,56,202,0.15)" },
  },
  {
    slug: "veo3-ultra-flow-credits",
    name: "Veo Ultra",
    category: "NEXT-GENERATION AI VIDEO ✦",
    subtitle: "TURN CREATIVE DIRECTION INTO CINEMATIC VIDEO",
    centralHeadline: "AI-POWERED VISUAL STORYTELLING",
    benefitChips: ["45K Credits", "Visual Storytelling", "Cinematic Framing", "Scene Synthesis"],
    featureRibbon: "NEXT-GENERATION HIGH-FIDELITY VIDEO",
    features: [
      { title: "Text to Video", desc: "Create video concepts from natural-language prompts." },
      { title: "Visual Storytelling", desc: "Build scenes around creative direction." },
      { title: "Cinematic Composition", desc: "Explore professional-looking visual framing." },
      { title: "Camera Motion", desc: "Generate dynamic camera movement." },
      { title: "Scene Creation", desc: "Develop imaginative environments." },
      { title: "Product Concepts", desc: "Create commercial video ideas." },
      { title: "Creative Advertising", desc: "Produce visually engaging campaign concepts." },
      { title: "Character Scenes", desc: "Develop motion-based visual narratives." },
      { title: "Prompt Direction", desc: "Control creative style through detailed instructions." },
      { title: "Rapid Prototyping", desc: "Explore video concepts before production." },
      { title: "Creator Workflow", desc: "Accelerate AI-assisted filmmaking." },
      { title: "High-End Visual Generation", desc: "Create polished cinematic visual experiences." },
    ],
    workflow: ["SCRIPT", "SCENE", "MOTION", "FILM"],
    perfectFor: ["Filmmakers", "Brands", "Agencies", "Creators", "Advertisers", "Creative Directors"],
    bottomCta: "BRING BIG IDEAS TO THE SCREEN",
    colors: { primary: "#2563eb", secondary: "#7c3aed", accent: "#06b6d4", pillBg: "#eff6ff", pillBorder: "#bfdbfe", glow: "rgba(37,99,235,0.12)" },
  },
  {
    slug: "lovable-pro-12m",
    name: "Lovable AI Pro",
    category: "AI APP BUILDER ✦",
    subtitle: "TURN YOUR IDEA INTO A WORKING WEB APPLICATION",
    centralHeadline: "DESCRIBE IT → BUILD IT → IMPROVE IT → LAUNCH",
    benefitChips: ["Prompt to App", "Full-Stack UI", "Database Integration", "Rapid Launch"],
    featureRibbon: "FULL-STACK AI SOFTWARE BUILDER",
    features: [
      { title: "Prompt to App", desc: "Turn natural-language requirements into an application." },
      { title: "Frontend Generation", desc: "Create modern web interfaces quickly." },
      { title: "UI Design", desc: "Generate attractive responsive layouts." },
      { title: "Component Editing", desc: "Improve parts of the application through instructions." },
      { title: "Backend Connections", desc: "Connect applications to supporting services." },
      { title: "Database Workflows", desc: "Build data-driven application experiences." },
      { title: "Authentication", desc: "Develop user-login flows when required." },
      { title: "Iterative Building", desc: "Improve applications through conversation." },
      { title: "Responsive Design", desc: "Create layouts for different screen sizes." },
      { title: "Prototype Fast", desc: "Test product ideas rapidly." },
      { title: "Deployment Workflow", desc: "Move projects toward a live environment." },
      { title: "Founder Productivity", desc: "Reduce the time between idea and prototype." },
    ],
    workflow: ["IDEA", "DESCRIBE", "BUILD", "LAUNCH"],
    perfectFor: ["Founders", "Developers", "Startups", "Designers", "Students", "Product Teams"],
    bottomCta: "TURN YOUR NEXT IDEA INTO SOFTWARE",
    colors: { primary: "#ec4899", secondary: "#8b5cf6", accent: "#3b82f6", pillBg: "#fdf2f8", pillBorder: "#fbcfe8", glow: "rgba(236,72,153,0.12)" },
  },
  {
    slug: "gumloop-pro-12m",
    name: "Gumloop Pro",
    category: "AI WORKFLOW AUTOMATION ✦",
    subtitle: "CONNECT AI, DATA AND BUSINESS TASKS INTO AUTOMATED FLOWS",
    centralHeadline: "BUILD SMART WORKFLOWS WITHOUT REPETITIVE MANUAL WORK",
    benefitChips: ["Visual Canvas", "AI Node Pipelines", "Web Scraping", "Conditional Logic"],
    featureRibbon: "MODERN NO-CODE AUTOMATION PLATFORM",
    features: [
      { title: "Visual Workflows", desc: "Build automation through connected nodes." },
      { title: "AI Integration", desc: "Add AI capabilities inside automated processes." },
      { title: "Web Data", desc: "Collect and process information from online sources." },
      { title: "Data Processing", desc: "Transform information automatically." },
      { title: "Conditional Logic", desc: "Create workflows that respond to different situations." },
      { title: "API Connections", desc: "Connect external tools and services." },
      { title: "Scheduled Tasks", desc: "Run recurring processes automatically." },
      { title: "Lead Workflows", desc: "Automate selected sales and marketing tasks." },
      { title: "Research Automation", desc: "Collect and summarize information faster." },
      { title: "Content Workflows", desc: "Automate repetitive creative processes." },
      { title: "Team Productivity", desc: "Reduce time spent on manual operations." },
      { title: "Reusable Automation", desc: "Build processes that can run repeatedly." },
    ],
    workflow: ["INPUT", "AI", "LOGIC", "ACTION"],
    perfectFor: ["Operations", "Marketers", "Founders", "Researchers", "Agencies", "Automation Builders"],
    bottomCta: "AUTOMATE THE WORK THAT SLOWS YOU DOWN",
    colors: { primary: "#84cc16", secondary: "#06b6d4", accent: "#6366f1", pillBg: "#f7fee7", pillBorder: "#d9f99d", glow: "rgba(132,204,22,0.12)" },
  },
  {
    slug: "supabase-pro-1-year",
    name: "Supabase Pro",
    category: "MODERN BACKEND PLATFORM ✦",
    subtitle: "BUILD AND SCALE APPLICATION BACKENDS FASTER",
    centralHeadline: "DATABASE • AUTH • STORAGE • REALTIME • FUNCTIONS",
    benefitChips: ["Postgres Database", "Auth & Row Security", "Vector & Edge", "Scalable Storage"],
    featureRibbon: "ENTERPRISE OPEN SOURCE BACKEND",
    features: [
      { title: "PostgreSQL Database", desc: "Build applications on a powerful relational database." },
      { title: "Authentication", desc: "Manage user sign-in and identity workflows." },
      { title: "Storage", desc: "Store and serve application files." },
      { title: "Realtime", desc: "Build experiences that react to data changes." },
      { title: "APIs", desc: "Work with automatically accessible backend data." },
      { title: "Edge Functions", desc: "Run custom server-side logic." },
      { title: "Database Management", desc: "Organize and manage application data." },
      { title: "Developer Dashboard", desc: "Control backend services from one workspace." },
      { title: "Security Controls", desc: "Configure access rules for application data." },
      { title: "Logs", desc: "Understand application and backend activity." },
      { title: "Integrations", desc: "Connect your application ecosystem." },
      { title: "Scalable Backend", desc: "Move from prototype toward production." },
    ],
    workflow: ["APP", "AUTH", "DATABASE", "SCALE"],
    perfectFor: ["Developers", "Startups", "SaaS Builders", "Mobile Apps", "Web Apps", "Technical Founders"],
    bottomCta: "BUILD YOUR BACKEND FASTER",
    colors: { primary: "#10b981", secondary: "#0f172a", accent: "#06b6d4", pillBg: "#ecfdf5", pillBorder: "#a7f3d0", glow: "rgba(16,185,129,0.12)" },
  },
  {
    slug: "notion-business-12m",
    name: "Notion Business",
    category: "CONNECTED WORKSPACE ✦",
    subtitle: "ORGANIZE KNOWLEDGE, PROJECTS AND TEAMWORK IN ONE PLACE",
    centralHeadline: "WRITE • PLAN • ORGANIZE • COLLABORATE",
    benefitChips: ["Team Wikis", "Relational Databases", "Roadmaps & Sprints", "AI Assistance"],
    featureRibbon: "UNIFIED TEAM COLLABORATION HUB",
    features: [
      { title: "Pages", desc: "Create flexible documents and team knowledge." },
      { title: "Databases", desc: "Structure information in powerful views." },
      { title: "Project Management", desc: "Track work from planning to completion." },
      { title: "Wikis", desc: "Create a central source of company knowledge." },
      { title: "Team Collaboration", desc: "Work together inside shared spaces." },
      { title: "Templates", desc: "Standardize recurring workflows." },
      { title: "Tasks", desc: "Manage responsibilities and progress." },
      { title: "Calendar Views", desc: "Organize work around timelines and dates." },
      { title: "Knowledge Search", desc: "Find important information more efficiently." },
      { title: "AI Assistance", desc: "Accelerate writing and information work where available." },
      { title: "Business Workspace", desc: "Organize teams and departments." },
      { title: "Documentation", desc: "Keep processes and knowledge accessible." },
    ],
    workflow: ["CAPTURE", "ORGANIZE", "COLLABORATE", "EXECUTE"],
    perfectFor: ["Startups", "Teams", "Students", "Businesses", "Project Managers", "Creators"],
    bottomCta: "BRING YOUR WORK INTO ONE CONNECTED SPACE",
    colors: { primary: "#0f172a", secondary: "#334155", accent: "#2563eb", pillBg: "#f8fafc", pillBorder: "#e2e8f0", glow: "rgba(15,23,42,0.08)" },
  },
  {
    slug: "runway-pro-12m",
    name: "Runway Pro",
    category: "GENERATIVE AI VIDEO ✦",
    subtitle: "CREATE, TRANSFORM AND EXPERIMENT WITH VIDEO USING AI",
    centralHeadline: "GENERATE • EDIT • TRANSFORM • CREATE",
    benefitChips: ["Generative Motion", "Motion Brush", "Camera Controls", "Stylistic Video"],
    featureRibbon: "NEXT-GEN CREATIVE VIDEO SUITE",
    features: [
      { title: "Text to Video", desc: "Create dynamic visual scenes from descriptive words." },
      { title: "Image to Video", desc: "Animate still assets with cinematic fluid motion." },
      { title: "Generative Video", desc: "Synthesize imaginative concept shots." },
      { title: "Motion Controls", desc: "Direct camera speed, zoom and angle transitions." },
      { title: "Video Transformation", desc: "Restyle footage with customized aesthetic modes." },
      { title: "Creative Effects", desc: "Composite atmospheric visual elements effortlessly." },
      { title: "Background Tools", desc: "Isolate subjects and cleanly replace backdrops." },
      { title: "Image Generation", desc: "Generate custom storyboards and concept art." },
      { title: "Concept Development", desc: "Explore creative direction rapidly with AI." },
      { title: "Advertising Visuals", desc: "Produce futuristic commercial scenes." },
      { title: "Film Previsualization", desc: "Map complex sequences before production begins." },
      { title: "Creator Workflow", desc: "Export high-resolution clips ready for grading." },
    ],
    workflow: ["IDEA", "GENERATE", "TRANSFORM", "PUBLISH"],
    perfectFor: ["Filmmakers", "Creators", "Agencies", "Designers", "Brands", "Advertisers"],
    bottomCta: "CREATE WHAT TRADITIONAL TOOLS CAN’T",
    colors: { primary: "#84cc16", secondary: "#0f172a", accent: "#06b6d4", pillBg: "#f7fee7", pillBorder: "#d9f99d", glow: "rgba(132,204,22,0.12)" },
  },
  {
    slug: "granola-business-12m",
    name: "Granola Business",
    category: "AI MEETING NOTES ✦",
    subtitle: "TURN CONVERSATIONS INTO USEFUL NOTES AND ACTION ITEMS",
    centralHeadline: "MEET → CAPTURE → ORGANIZE → ACT",
    benefitChips: ["Smart AI Notes", "Action Item Extraction", "Searchable Archive", "Zero Note Anxiety"],
    featureRibbon: "INTELLIGENT EXECUTIVE MEETING ASSISTANT",
    features: [
      { title: "Meeting Notes", desc: "Turn conversations into organized notes." },
      { title: "AI Summaries", desc: "Capture the important points quickly." },
      { title: "Action Items", desc: "Highlight what needs to happen next." },
      { title: "Follow-Ups", desc: "Make post-meeting work easier." },
      { title: "Searchable Knowledge", desc: "Find useful information from past meetings." },
      { title: "Structured Notes", desc: "Keep meeting information organized." },
      { title: "Context", desc: "Combine notes with relevant meeting information." },
      { title: "Team Knowledge", desc: "Make valuable conversations easier to reference." },
      { title: "Customer Meetings", desc: "Capture important sales and customer discussions." },
      { title: "Interviews", desc: "Organize research and interview insights." },
      { title: "Productivity", desc: "Spend less time manually writing notes." },
      { title: "Business Workflow", desc: "Turn conversations into useful outcomes." },
    ],
    workflow: ["MEET", "CAPTURE", "ORGANIZE", "ACT"],
    perfectFor: ["Founders", "Sales Teams", "Managers", "Consultants", "Researchers", "Remote Teams"],
    bottomCta: "FOCUS ON THE CONVERSATION — NOT THE NOTES",
    colors: { primary: "#1e3a8a", secondary: "#047857", accent: "#d97706", pillBg: "#fef3c7", pillBorder: "#fde68a", glow: "rgba(30,58,138,0.1)" },
  },
  {
    slug: "factory-12m",
    name: "Factory Droid AI",
    category: "AI SOFTWARE ENGINEERING ✦",
    subtitle: "AUTONOMOUS ENGINEERING SUPPORT FOR MODERN DEVELOPMENT TEAMS",
    centralHeadline: "PLAN • CODE • TEST • REVIEW",
    benefitChips: ["Autonomous Droids", "Codebase Reasoning", "PR Automation", "Refactoring Engine"],
    featureRibbon: "ENTERPRISE-GRADE CODING AGENTS",
    features: [
      { title: "Software Tasks", desc: "Assist with larger engineering assignments." },
      { title: "Codebase Understanding", desc: "Work across existing software projects." },
      { title: "Feature Development", desc: "Support implementation of new functionality." },
      { title: "Bug Investigation", desc: "Analyze and resolve software issues." },
      { title: "Refactoring", desc: "Improve architecture and maintainability." },
      { title: "Testing", desc: "Support software verification workflows." },
      { title: "Pull Request Workflows", desc: "Assist with code-change preparation." },
      { title: "Repository Tasks", desc: "Work with software-project structures." },
      { title: "Technical Planning", desc: "Break development objectives into steps." },
      { title: "Documentation", desc: "Generate useful technical explanations." },
      { title: "Engineering Automation", desc: "Reduce repetitive developer tasks." },
      { title: "Team Productivity", desc: "Help engineering teams move faster." },
    ],
    workflow: ["ISSUE", "PLAN", "IMPLEMENT", "VERIFY"],
    perfectFor: ["Engineering Teams", "Developers", "Startups", "Technical Leads", "SaaS Companies", "Advanced Builders"],
    bottomCta: "PUT AI TO WORK ON SOFTWARE ENGINEERING",
    colors: { primary: "#ea580c", secondary: "#0f172a", accent: "#2563eb", pillBg: "#fff7ed", pillBorder: "#fed7aa", glow: "rgba(234,88,12,0.12)" },
  },
  {
    slug: "mobbin-12m",
    name: "Mobbin Pro",
    category: "UI/UX DESIGN RESEARCH ✦",
    subtitle: "STUDY REAL PRODUCT PATTERNS AND DESIGN BETTER EXPERIENCES",
    centralHeadline: "DISCOVER • ANALYZE • INSPIRE • DESIGN",
    benefitChips: ["Mobile UI Patterns", "Web Flows", "Onboarding Reference", "Checkout Architecture"],
    featureRibbon: "WORLD'S LARGEST UI/UX DESIGN ARCHIVE",
    features: [
      { title: "UI Inspiration", desc: "Explore real interface patterns." },
      { title: "Mobile Screens", desc: "Study modern mobile experiences." },
      { title: "Web Interfaces", desc: "Explore desktop and web design patterns." },
      { title: "User Flows", desc: "Understand how complete experiences connect." },
      { title: "Design Patterns", desc: "Research common interface solutions." },
      { title: "Search", desc: "Find references for specific UI needs." },
      { title: "Product Research", desc: "Compare experiences across products." },
      { title: "Onboarding", desc: "Study effective onboarding patterns." },
      { title: "Checkout", desc: "Explore transaction and purchase flows." },
      { title: "Navigation", desc: "Analyze information architecture patterns." },
      { title: "Design References", desc: "Accelerate early design exploration." },
      { title: "Team Inspiration", desc: "Give design teams a stronger reference library." },
    ],
    workflow: ["RESEARCH", "COMPARE", "DESIGN", "IMPROVE"],
    perfectFor: ["UI Designers", "UX Designers", "Product Designers", "Developers", "Agencies", "Startups"],
    bottomCta: "DESIGN WITH BETTER REFERENCES",
    colors: { primary: "#7c3aed", secondary: "#ec4899", accent: "#06b6d4", pillBg: "#fdf2f8", pillBorder: "#fbcfe8", glow: "rgba(124,58,237,0.12)" },
  },
  {
    slug: "framer-pro-12m",
    name: "Framer Pro",
    category: "PROFESSIONAL WEB DESIGN ✦",
    subtitle: "DESIGN AND PUBLISH MODERN WEBSITES VISUALLY",
    centralHeadline: "DESIGN • ANIMATE • RESPONSIVE • PUBLISH",
    benefitChips: ["Interactive Canvas", "Fluid Animations", "Built-in CMS", "Zero-Code Deploy"],
    featureRibbon: "NEXT-GENERATION MODERN WEB DESIGN STUDIO",
    features: [
      { title: "Visual Website Design", desc: "Build websites through a modern design interface." },
      { title: "Responsive Layouts", desc: "Create experiences across different screen sizes." },
      { title: "Animations", desc: "Add polished motion and interactions." },
      { title: "Components", desc: "Create reusable design systems." },
      { title: "CMS", desc: "Manage structured website content." },
      { title: "Landing Pages", desc: "Build high-converting marketing pages." },
      { title: "Portfolio Sites", desc: "Create professional personal websites." },
      { title: "SEO Tools", desc: "Prepare pages for search visibility." },
      { title: "Custom Domains", desc: "Publish projects under your own domain." },
      { title: "Collaboration", desc: "Work together on website projects." },
      { title: "Templates", desc: "Start from professionally designed foundations." },
      { title: "Publishing", desc: "Move from design directly to the live web." },
    ],
    workflow: ["DESIGN", "RESPONSIVE", "ANIMATE", "PUBLISH"],
    perfectFor: ["Designers", "Startups", "Agencies", "Freelancers", "Creators", "Businesses"],
    bottomCta: "DESIGN BEAUTIFUL WEBSITES WITHOUT THE OLD WORKFLOW",
    colors: { primary: "#0055ff", secondary: "#7c3aed", accent: "#06b6d4", pillBg: "#eff6ff", pillBorder: "#bfdbfe", glow: "rgba(0,85,255,0.12)" },
  },
  {
    slug: "n8n-starter-1-year",
    name: "n8n Starter",
    category: "WORKFLOW AUTOMATION ✦",
    subtitle: "CONNECT YOUR APPS, DATA AND AI INTO POWERFUL AUTOMATIONS",
    centralHeadline: "TRIGGER → LOGIC → AI → ACTION",
    benefitChips: ["400+ Nodes", "Custom Webhooks", "AI Agent Pipelines", "Self-Host Flexibility"],
    featureRibbon: "ADVANCED AUTOMATION & AI PIPELINE SYSTEM",
    features: [
      { title: "Visual Workflows", desc: "Build automation with connected nodes." },
      { title: "App Integrations", desc: "Connect tools across your technology stack." },
      { title: "Webhooks", desc: "Trigger workflows from external events." },
      { title: "APIs", desc: "Connect services through custom API requests." },
      { title: "Conditional Logic", desc: "Create branching automation rules." },
      { title: "Data Transformation", desc: "Clean and reshape information automatically." },
      { title: "Scheduling", desc: "Run recurring workflows automatically." },
      { title: "AI Workflows", desc: "Add AI models to automated processes." },
      { title: "AI Agents", desc: "Build more intelligent workflow behaviors." },
      { title: "Database Connections", desc: "Move data between systems." },
      { title: "Business Automation", desc: "Reduce repetitive operational work." },
      { title: "Developer Flexibility", desc: "Customize workflows for advanced use cases." },
    ],
    workflow: ["EVENT", "PROCESS", "DECIDE", "AUTOMATE"],
    perfectFor: ["Developers", "Automation Agencies", "Businesses", "Operations Teams", "Marketers", "Founders"],
    bottomCta: "CONNECT EVERYTHING. AUTOMATE MORE.",
    colors: { primary: "#ea580c", secondary: "#c026d3", accent: "#06b6d4", pillBg: "#fff7ed", pillBorder: "#fed7aa", glow: "rgba(234,88,12,0.12)" },
  },
  {
    slug: "warp-build-1-year",
    name: "Warp Build",
    category: "MODERN DEVELOPER WORKFLOW ✦",
    subtitle: "MOVE FROM CODE TO COMPLETION WITH A FASTER ENGINEERING EXPERIENCE",
    centralHeadline: "BUILD • AUTOMATE • ACCELERATE • SHIP",
    benefitChips: ["Cloud Runners", "20x Faster Builds", "AI Command Completion", "Parallel Workflows"],
    featureRibbon: "ACCELERATED MODERN CI/CD & TERMINAL RUNTIME",
    features: [
      { title: "Developer Workflow", desc: "Streamline repetitive engineering tasks." },
      { title: "Build Automation", desc: "Accelerate parts of the software build process." },
      { title: "Command Workflows", desc: "Work efficiently with developer commands." },
      { title: "AI Assistance", desc: "Use intelligent support throughout development." },
      { title: "Project Execution", desc: "Move technical work toward completion faster." },
      { title: "Parallel Work", desc: "Coordinate multiple development tasks." },
      { title: "Debugging Support", desc: "Investigate problems more effectively." },
      { title: "Automation", desc: "Reduce repeated manual development actions." },
      { title: "Build Visibility", desc: "Understand development workflow progress." },
      { title: "Team Productivity", desc: "Help engineering teams work faster." },
      { title: "Modern Tooling", desc: "Use a developer experience designed around speed." },
      { title: "Shipping Workflow", desc: "Reduce friction between building and delivery." },
    ],
    workflow: ["CODE", "BUILD", "VERIFY", "SHIP"],
    perfectFor: ["Developers", "DevOps", "Engineering Teams", "Startups", "Technical Founders", "Software Companies"],
    bottomCta: "BUILD FASTER. SHIP WITH CONFIDENCE.",
    colors: { primary: "#06b6d4", secondary: "#7c3aed", accent: "#0f172a", pillBg: "#ecfeff", pillBorder: "#a5f3fc", glow: "rgba(6,182,212,0.12)" },
  },
  {
    slug: "railway-hobby-12m",
    name: "Railway Hobby",
    category: "CLOUD DEPLOYMENT PLATFORM ✦",
    subtitle: "DEPLOY APPLICATIONS AND SERVICES WITHOUT INFRASTRUCTURE COMPLEXITY",
    centralHeadline: "CODE → DEPLOY → CONNECT → RUN",
    benefitChips: ["Instant Git Deploys", "Managed DBs", "Custom Domains", "Zero DevOps Burden"],
    featureRibbon: "EFFORTLESS MODERN APP CLOUD HOSTING",
    features: [
      { title: "Application Deployment", desc: "Move projects from code to the cloud." },
      { title: "Git Integration", desc: "Deploy from modern source-control workflows." },
      { title: "Databases", desc: "Add database services to projects." },
      { title: "Environment Variables", desc: "Manage application configuration." },
      { title: "Domains", desc: "Connect projects to web domains." },
      { title: "Logs", desc: "Inspect application activity and issues." },
      { title: "Service Management", desc: "Run multiple connected services." },
      { title: "Templates", desc: "Launch common project setups faster." },
      { title: "Backend Hosting", desc: "Run APIs and application services." },
      { title: "Developer Experience", desc: "Reduce infrastructure setup work." },
      { title: "Project Dashboard", desc: "Manage deployments from one workspace." },
      { title: "Rapid Prototyping", desc: "Launch experiments and side projects quickly." },
    ],
    workflow: ["REPOSITORY", "DEPLOY", "DATABASE", "LIVE"],
    perfectFor: ["Developers", "Students", "Side Projects", "Startups", "APIs", "Web Apps"],
    bottomCta: "FROM CODE TO CLOUD — FASTER",
    colors: { primary: "#a855f7", secondary: "#2563eb", accent: "#ec4899", pillBg: "#faf5ff", pillBorder: "#e9d5ff", glow: "rgba(168,85,247,0.12)" },
  },
  {
    slug: "coursera-premium-1-year",
    name: "Coursera Premium",
    category: "ONLINE LEARNING ✦",
    subtitle: "BUILD JOB-RELEVANT SKILLS WITH FLEXIBLE ONLINE LEARNING",
    centralHeadline: "LEARN • PRACTICE • GROW • ACHIEVE",
    benefitChips: ["Professional Certificates", "Top University Content", "Applied Labs", "Career Transformation"],
    featureRibbon: "WORLD-CLASS ONLINE EDUCATION ACCESS",
    features: [
      { title: "Online Courses", desc: "Learn across a wide range of subjects." },
      { title: "Professional Skills", desc: "Develop knowledge relevant to modern careers." },
      { title: "Technology Learning", desc: "Study software, data, AI and technical topics." },
      { title: "Business Learning", desc: "Explore management and professional subjects." },
      { title: "Guided Learning", desc: "Follow structured course pathways." },
      { title: "Assessments", desc: "Check understanding through course activities." },
      { title: "Projects", desc: "Practice skills through applied learning." },
      { title: "Certificates", desc: "Earn completion credentials when included." },
      { title: "Flexible Schedule", desc: "Learn around work or study commitments." },
      { title: "Expert Instruction", desc: "Learn from recognized organizations and educators." },
      { title: "Career Development", desc: "Develop skills for professional growth." },
      { title: "Continuous Learning", desc: "Keep expanding your knowledge over time." },
    ],
    workflow: ["CHOOSE", "LEARN", "PRACTICE", "GROW"],
    perfectFor: ["Students", "Professionals", "Career Changers", "Developers", "Entrepreneurs", "Lifelong Learners"],
    bottomCta: "INVEST IN SKILLS THAT MOVE YOU FORWARD",
    colors: { primary: "#0056d2", secondary: "#1e3a8a", accent: "#0284c7", pillBg: "#eff6ff", pillBorder: "#bfdbfe", glow: "rgba(0,86,210,0.12)" },
  },
  {
    slug: "small-business-ai-setup-consultation",
    name: "TRIHEX Small Business AI Setup",
    category: "TRIHEX AI SERVICE ✦",
    subtitle: "TURN PRACTICAL AI TOOLS INTO A WORKING BUSINESS SYSTEM",
    centralHeadline: "AI DESIGNED AROUND YOUR BUSINESS WORKFLOW",
    benefitChips: ["Workflow Audit", "Custom Assistant Setup", "Customer Automation", "Staff Training"],
    featureRibbon: "TAILORED NEPAL BUSINESS IMPLEMENTATION",
    features: [
      { title: "Business Workflow Review", desc: "We identify where AI can save time." },
      { title: "AI Tool Selection", desc: "We match useful tools to practical needs." },
      { title: "AI Assistant Setup", desc: "Configure assistants for daily business work." },
      { title: "Customer Support", desc: "Explore AI-assisted customer workflows." },
      { title: "Content Assistance", desc: "Improve repetitive writing and marketing tasks." },
      { title: "Document Workflows", desc: "Speed up common document processes." },
      { title: "Team Productivity", desc: "Reduce repetitive knowledge work." },
      { title: "Prompt Setup", desc: "Create useful prompts for recurring tasks." },
      { title: "Workflow Guidance", desc: "Show your team how the system should operate." },
      { title: "Integration Planning", desc: "Identify opportunities to connect business tools." },
      { title: "Practical Training", desc: "Help users understand the new workflow." },
      { title: "Setup Support", desc: "Move from AI ideas toward actual usage." },
    ],
    workflow: ["AUDIT", "DESIGN", "SETUP", "USE"],
    perfectFor: ["Small Businesses", "Local Shops", "Service Companies", "Startups", "Solo Founders", "Growing Teams"],
    bottomCta: "MAKE AI USEFUL INSIDE YOUR BUSINESS",
    colors: { primary: "#2563eb", secondary: "#7c3aed", accent: "#06b6d4", pillBg: "#eff6ff", pillBorder: "#bfdbfe", glow: "rgba(37,99,235,0.14)" },
  },
  {
    slug: "custom-workflow-automation-discovery",
    name: "TRIHEX Workflow Automation Discovery",
    category: "TRIHEX AUTOMATION SERVICE ✦",
    subtitle: "DISCOVER WHERE AUTOMATION CAN SAVE YOUR BUSINESS TIME",
    centralHeadline: "FIND THE BOTTLENECKS. DESIGN THE BETTER WORKFLOW.",
    benefitChips: ["Process Mapping", "Bottleneck Audit", "AI Integration Plan", "Implementation Roadmap"],
    featureRibbon: "TRANSFORM MANUAL TASKS INTO AUTOMATED SYSTEMS",
    features: [
      { title: "Process Discovery", desc: "Understand how work currently moves through the business." },
      { title: "Bottleneck Identification", desc: "Find repetitive and inefficient steps." },
      { title: "Automation Opportunities", desc: "Identify tasks suitable for automation." },
      { title: "Tool Mapping", desc: "Understand which systems need to connect." },
      { title: "Data Flow Review", desc: "Map how information moves between tools." },
      { title: "AI Opportunities", desc: "Identify where AI can add useful intelligence." },
      { title: "Integration Planning", desc: "Plan connections between business applications." },
      { title: "Workflow Diagram", desc: "Create a clearer picture of the future process." },
      { title: "Priority Ranking", desc: "Focus first on high-value automation opportunities." },
      { title: "Manual Work Reduction", desc: "Target repetitive administrative effort." },
      { title: "Implementation Roadmap", desc: "Create logical next steps." },
      { title: "Business Efficiency", desc: "Design workflows around speed and consistency." },
    ],
    workflow: ["DISCOVER", "MAP", "AUTOMATE", "IMPROVE"],
    perfectFor: ["Businesses", "Operations Teams", "Agencies", "Ecommerce", "Service Companies", "Startups"],
    bottomCta: "DISCOVER WHAT YOUR BUSINESS SHOULD AUTOMATE NEXT",
    colors: { primary: "#7c3aed", secondary: "#06b6d4", accent: "#ea580c", pillBg: "#f5f3ff", pillBorder: "#ddd6fe", glow: "rgba(124,58,237,0.14)" },
  },
  {
    slug: "ai-prompt-starter-pack",
    name: "TRIHEX AI Prompt Starter Pack",
    category: "TRIHEX DIGITAL RESOURCE ✦",
    subtitle: "READY-TO-USE PROMPT STRUCTURES FOR BETTER AI RESULTS",
    centralHeadline: "LESS GUESSING. BETTER PROMPTS. STRONGER OUTPUTS.",
    benefitChips: ["Business Templates", "500+ System Prompts", "Coding Frameworks", "Marketing Blueprints"],
    featureRibbon: "CURATED REPEATABLE PROMPTING ARCHITECTURE",
    features: [
      { title: "Business Prompts", desc: "Structures for everyday business tasks." },
      { title: "Marketing Prompts", desc: "Develop ideas, campaigns and promotional content." },
      { title: "Writing Prompts", desc: "Draft and improve professional writing." },
      { title: "Coding Prompts", desc: "Ask AI for clearer technical assistance." },
      { title: "Research Prompts", desc: "Explore topics through better instructions." },
      { title: "Content Prompts", desc: "Develop posts, scripts and creative ideas." },
      { title: "Productivity Prompts", desc: "Speed up repetitive knowledge work." },
      { title: "Strategy Prompts", desc: "Explore plans, alternatives and decisions." },
      { title: "Prompt Frameworks", desc: "Use repeatable structures instead of random questions." },
      { title: "Role-Based Prompts", desc: "Give AI useful context and responsibilities." },
      { title: "Output Formatting", desc: "Request clearer structured responses." },
      { title: "Customization Guide", desc: "Adapt templates to your own workflow." },
    ],
    workflow: ["CHOOSE", "CUSTOMIZE", "PROMPT", "CREATE"],
    perfectFor: ["Students", "Businesses", "Creators", "Developers", "Marketers", "AI Beginners"],
    bottomCta: "STOP PROMPTING RANDOMLY. START PROMPTING WITH STRUCTURE.",
    colors: { primary: "#2563eb", secondary: "#7c3aed", accent: "#ec4899", pillBg: "#eff6ff", pillBorder: "#bfdbfe", glow: "rgba(37,99,235,0.14)" },
  },
  {
    slug: "udemy-16-developer-ai-agent-pack",
    name: "Udemy 16 Package AI Agent Pack",
    category: "DEVELOPER MASTERCLASS ✦",
    subtitle: "MASTER FULL-STACK AI AGENT DEVELOPMENT FROM SCRATCH",
    centralHeadline: "16 COURSES • 500+ PRODUCTION PROMPTS • LIFETIME ACCESS",
    benefitChips: ["16 Masterclasses", "LangChain & CrewAI", "Production Prompts", "Instant Cloud Drive"],
    featureRibbon: "COMPLETE FULL-STACK AI AGENT CURRICULUM",
    features: [
      { title: "16 Video Masterclasses", desc: "Comprehensive step-by-step developer video courses." },
      { title: "Autonomous Agents", desc: "Build LangChain, CrewAI and AutoGen agent swarms." },
      { title: "Full-Stack Development", desc: "Next.js, Python, FastAPI and modern frontend stacks." },
      { title: "500+ Production Prompts", desc: "Engineered prompt architectures for real projects." },
      { title: "System Prompts", desc: "Battle-tested system prompts for Claude, GPT and Cursor." },
      { title: "Cloud Drive Delivery", desc: "Instant high-speed lifetime cloud access link." },
      { title: "Code Repositories", desc: "Download complete source code and project starter kits." },
      { title: "API Integration", desc: "Connect OpenAI, Anthropic, Gemini and local LLMs." },
      { title: "RAG Pipelines", desc: "Build vector database retrieval systems with Supabase." },
      { title: "Workflow Automation", desc: "Automate complex multi-step developer operations." },
      { title: "Self-Paced Learning", desc: "Learn on your own schedule across desktop and mobile." },
      { title: "Developer Community", desc: "Stay ahead with modern AI software engineering tools." },
    ],
    workflow: ["LEARN", "BUILD", "DEPLOY", "AUTOMATE"],
    perfectFor: ["Developers", "Engineers", "Students", "Founders", "Tech Enthusiasts", "Builders"],
    bottomCta: "BECOME AN ELITE AI AGENT DEVELOPER",
    colors: { primary: "#a855f7", secondary: "#2563eb", accent: "#06b6d4", pillBg: "#faf5ff", pillBorder: "#e9d5ff", glow: "rgba(168,85,247,0.12)" },
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

/**
 * Generate 2:3 High-Res Infographic Poster (1600 x 2400)
 */
function buildInfographicSvg(p: ProductSpec): string {
  const W = 1600;
  const H = 2400;

  // Render 12 feature cards in a 2-column x 6-row grid
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
    const num = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`;

    featureCardsSvg += `
      <g transform="translate(${x}, ${y})">
        <rect width="${cardColW}" height="${cardH}" rx="22" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.8" filter="url(#cardShadow)" />
        <rect x="18" y="18" width="46" height="46" rx="14" fill="${p.colors.pillBg}" stroke="${p.colors.pillBorder}" stroke-width="1.5" />
        <text x="41" y="47" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="20" font-weight="900" fill="${p.colors.primary}" text-anchor="middle">${num}</text>
        <text x="80" y="47" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="25" font-weight="800" fill="#0f172a">${escapeXml(f.title)}</text>
        <text x="80" y="84" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="20" font-weight="500" fill="#475569">${escapeXml(f.desc)}</text>
      </g>
    `;
  });

  // Benefit chips
  let chipsSvg = "";
  const chipW = 310;
  const chipH = 58;
  const chipStartX = 140;
  p.benefitChips.slice(0, 4).forEach((chip, i) => {
    const x = chipStartX + i * (chipW + 35);
    chipsSvg += `
      <g transform="translate(${x}, 570)">
        <rect width="${chipW}" height="${chipH}" rx="29" fill="#ffffff" stroke="${p.colors.pillBorder}" stroke-width="2" />
        <circle cx="28" cy="29" r="6" fill="${p.colors.primary}" />
        <text x="48" y="37" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" fill="#1e293b">${escapeXml(chip)}</text>
      </g>
    `;
  });

  // Workflow steps
  let workflowSvg = "";
  const stepCount = p.workflow.length;
  const stepSpacing = 1360 / stepCount;
  p.workflow.forEach((step, i) => {
    const x = 120 + i * stepSpacing;
    const arrow = i < stepCount - 1 ? `<text x="${x + stepSpacing - 45}" y="36" font-family="'Segoe UI', system-ui, sans-serif" font-size="26" font-weight="800" fill="${p.colors.secondary}">→</text>` : "";
    workflowSvg += `
      <g transform="translate(${x}, 0)">
        <rect width="250" height="54" rx="27" fill="${p.colors.pillBg}" stroke="${p.colors.pillBorder}" stroke-width="1.5" />
        <text x="125" y="35" font-family="'Segoe UI', system-ui, sans-serif" font-size="20" font-weight="900" fill="${p.colors.primary}" text-anchor="middle">${escapeXml(step)}</text>
      </g>
      ${arrow}
    `;
  });

  // Audience chips
  let audienceSvg = "";
  const audW = 210;
  p.perfectFor.slice(0, 6).forEach((aud, i) => {
    const x = 110 + i * (audW + 20);
    audienceSvg += `
      <g transform="translate(${x}, 2085)">
        <rect width="${audW}" height="50" rx="25" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
        <text x="${audW / 2}" y="32" font-family="'Segoe UI', system-ui, sans-serif" font-size="19" font-weight="700" fill="#334155" text-anchor="middle">${escapeXml(aud)}</text>
      </g>
    `;
  });

  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="40%" stop-color="#f8fafc" />
        <stop offset="100%" stop-color="#edf2f7" />
      </linearGradient>

      <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${p.colors.primary}" />
        <stop offset="50%" stop-color="${p.colors.secondary}" />
        <stop offset="100%" stop-color="${p.colors.accent}" />
      </linearGradient>

      <linearGradient id="panelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#f8fafc" />
      </linearGradient>

      <linearGradient id="ctaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="50%" stop-color="${p.colors.primary}" />
        <stop offset="100%" stop-color="#0284c7" />
      </linearGradient>

      <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="115%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0f172a" flood-opacity="0.04" />
      </filter>

      <filter id="panelShadow" x="-5%" y="-5%" width="110%" height="115%">
        <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="${p.colors.primary}" flood-opacity="0.08" />
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#0f172a" flood-opacity="0.03" />
      </filter>
    </defs>

    <!-- Pearl-white background with subtle ambient color bloom -->
    <rect width="${W}" height="${H}" fill="url(#bgGrad)" />
    <circle cx="800" cy="400" r="600" fill="${p.colors.glow}" />
    <circle cx="200" cy="1400" r="400" fill="${p.colors.glow}" />

    <!-- Outer Frame Stroke -->
    <rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="44" fill="none" stroke="#e2e8f0" stroke-width="2.5" />

    <!-- 1. Top Category Pill -->
    <g transform="translate(800, 105)">
      <rect x="-240" y="-28" width="480" height="56" rx="28" fill="${p.colors.pillBg}" stroke="${p.colors.pillBorder}" stroke-width="2" />
      <text x="0" y="8" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="20" font-weight="900" letter-spacing="2" fill="${p.colors.primary}" text-anchor="middle">${escapeXml(p.category)}</text>
    </g>

    <!-- 2. Product Title & Brand Display -->
    <g transform="translate(800, 230)">
      <text x="0" y="0" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="78" font-weight="950" letter-spacing="-1.5" fill="#0f172a" text-anchor="middle">${escapeXml(p.name)}</text>
      <!-- Subtitle -->
      <text x="0" y="55" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="24" font-weight="800" letter-spacing="1.5" fill="${p.colors.primary}" text-anchor="middle">${escapeXml(p.subtitle)}</text>
    </g>

    <!-- 3. Central Benefit Panel (Replaces Pricing) -->
    <g transform="translate(100, 360)" filter="url(#panelShadow)">
      <rect width="1400" height="300" rx="34" fill="url(#panelGrad)" stroke="#e2e8f0" stroke-width="2" />
      
      <!-- Top banner strip in panel -->
      <rect x="2" y="2" width="1396" height="6" rx="3" fill="url(#brandGrad)" />

      <!-- Headline -->
      <text x="700" y="85" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="40" font-weight="950" letter-spacing="-0.5" fill="#0f172a" text-anchor="middle">${escapeXml(p.centralHeadline)}</text>
      
      <!-- Subheadline -->
      ${p.centralSubheadline ? `<text x="700" y="135" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="24" font-weight="700" fill="#64748b" text-anchor="middle">${escapeXml(p.centralSubheadline)}</text>` : ""}
    </g>

    <!-- Benefit Chips inside panel -->
    ${chipsSvg}

    <!-- 4. Feature Ribbon Header -->
    <g transform="translate(800, 725)">
      <rect x="-340" y="-28" width="680" height="56" rx="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
      <circle cx="-300" cy="0" r="8" fill="${p.colors.primary}" />
      <circle cx="300" cy="0" r="8" fill="${p.colors.accent}" />
      <text x="0" y="8" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" letter-spacing="2" fill="#0f172a" text-anchor="middle">${escapeXml(p.featureRibbon)}</text>
    </g>

    <!-- 5. 12 Feature Cards Grid -->
    ${featureCardsSvg}

    <!-- 6. Workflow Strip Header & Cards -->
    <g transform="translate(800, 1960)">
      <text x="0" y="0" font-family="'Segoe UI', system-ui, sans-serif" font-size="18" font-weight="900" letter-spacing="3" fill="#64748b" text-anchor="middle">STREAMLINED WORKFLOW</text>
      <g transform="translate(-700, 20)">
        ${workflowSvg}
      </g>
    </g>

    <!-- 7. Perfect For Section -->
    <g transform="translate(800, 2060)">
      <text x="0" y="0" font-family="'Segoe UI', system-ui, sans-serif" font-size="18" font-weight="900" letter-spacing="3" fill="#64748b" text-anchor="middle">PERFECT FOR</text>
    </g>
    ${audienceSvg}

    <!-- 8. Large Bottom CTA (Strictly No Pricing) -->
    <g transform="translate(100, 2185)">
      <rect width="1400" height="130" rx="32" fill="url(#ctaGrad)" />
      
      <!-- Text inside CTA button -->
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

/**
 * Generate 4:5 Catalogue Thumbnail (1200 x 1500)
 */
function buildThumbnailSvg(p: ProductSpec): string {
  const W = 1200;
  const H = 1500;

  // 3 prominent benefit cards
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
      
      <!-- 3 Quick benefit chips -->
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

    <!-- Bottom Brand & Action Strip (Strictly No Pricing) -->
    <g transform="translate(100, 1190)">
      <rect width="1000" height="180" rx="28" fill="#0f172a" />
      <text x="500" y="65" font-family="'Segoe UI', system-ui, sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">AVAILABLE AT TRIHEX DIGITAL</text>
      <text x="500" y="105" font-family="'Segoe UI', system-ui, sans-serif" font-size="18" font-weight="700" letter-spacing="2" fill="#38bdf8" text-anchor="middle">VERIFIED SUPPLY • FAST ACTIVATION • LOCAL WHATSAPP SUPPORT</text>
      <text x="500" y="142" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" font-weight="800" letter-spacing="3" fill="#94a3b8" text-anchor="middle">NEPAL'S PREFERRED DIGITAL PRODUCT MARKETPLACE</text>
    </g>
  </svg>
  `;
}

async function main() {
  const root = "c:/Users/unesh/OneDrive/all my cloud stroge/Desktop/APPS/AITRIHEX";
  const outputBase = path.join(root, "public/media/products");

  console.log(`Starting generation of 60 assets across ${PRODUCTS.length} products...`);

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const prodDir = path.join(outputBase, p.slug);
    if (!fs.existsSync(prodDir)) fs.mkdirSync(prodDir, { recursive: true });

    const infoPath = path.join(prodDir, `${p.slug}-infographic.webp`);
    const thumbPath = path.join(prodDir, `${p.slug}-thumbnail.webp`);

    // 1. Build Infographic (2:3, 1600x2400)
    const infoSvg = buildInfographicSvg(p);
    await sharp(Buffer.from(infoSvg))
      .resize(1600, 2400)
      .webp({ quality: 92, lossless: false, effort: 4 })
      .toFile(infoPath);

    // 2. Build Thumbnail (4:5, 1200x1500)
    const thumbSvg = buildThumbnailSvg(p);
    await sharp(Buffer.from(thumbSvg))
      .resize(1200, 1500)
      .webp({ quality: 90, lossless: false, effort: 4 })
      .toFile(thumbPath);

    console.log(`[${i + 1}/${PRODUCTS.length}] Generated ${p.slug} (Infographic + Thumbnail)`);
  }

  console.log("Successfully generated all 60+ product assets with zero pricing!");
}

main().catch(console.error);
