import { Prompt, extractPromptVariables } from "./types";

export const TRIHEX_ORIGINAL_PROMPTS: Prompt[] = [
  {
    id: "prompt-csharp-clean-arch",
    slug: "csharp-dotnet9-clean-architecture",
    title: "C# / .NET 9 Clean Architecture & CQRS Domain Generator",
    description: "Generates production-grade .NET 9 CQRS handlers, Domain-Driven Design aggregates, MediatR commands, FluentValidation, and EF Core entity mappings with zero boilerplate.",
    category: "CODING",
    type: "CODE",
    author: "TRIHEX Engineering",
    license: "TRIHEX-PROPRIETARY-FREE",
    votes: 342,
    isOriginalTrihex: true,
    modelCompatibility: ["Claude 3.7 Sonnet", "Cursor", "GPT-4o", "DeepSeek-R1"],
    tags: ["csharp", "dotnet", "clean-architecture", "cqrs", "mediatr", "efcore"],
    status: "PUBLISHED",
    contentHash: "csharp-clean-arch-v1",
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-09-04T00:00:00Z",
    content: `You are an elite Principal Software Architect specializing in C# and .NET 9.
Generate a complete, enterprise-grade vertical slice for the domain entity: \${entityName}.

Architecture Constraints:
1. Follow Clean Architecture / CQRS with MediatR:
   - Command: Create\${entityName}Command with record immutable payload.
   - CommandHandler: Handle method with cancellation token, repository integration, and business domain events.
   - Validator: FluentValidation AbstractValidator with strict boundary constraints for \${keyValidationRules}.
   - Entity Aggregate: Rich Domain Model with private setters, factory methods, and domain event dispatching.
   - Repository Interface: I\${entityName}Repository with async Read/Write contracts.
   - DTO Response: Record with projection mapping.
2. Target Framework: .NET 9 with C# 13 features (primary constructors, collection expressions, pattern matching).
3. Error Handling: Return Result<T> pattern instead of throwing raw business exceptions.
4. Concurrency: Implement optimistic concurrency control via a RowVersion byte[] property.

Entity Specifications:
Entity: \${entityName}
Key Attributes: \${attributesList}
Business Invariants: \${businessRules}`,
    variables: [],
  },
  {
    id: "prompt-laravel11-api-service",
    slug: "laravel-11-action-pattern-api",
    title: "Laravel 11 Production Action-Pattern REST API",
    description: "Scaffolds enterprise Laravel 11 microservices using single-action classes, Form Requests with authorization, API Resources, Pest PHP tests, and database transactions.",
    category: "CODING",
    type: "CODE",
    author: "TRIHEX Engineering",
    license: "TRIHEX-PROPRIETARY-FREE",
    votes: 289,
    isOriginalTrihex: true,
    modelCompatibility: ["Claude 3.7 Sonnet", "Cursor", "GPT-4o"],
    tags: ["laravel", "php", "rest-api", "pest", "action-pattern"],
    status: "PUBLISHED",
    contentHash: "laravel-action-v1",
    createdAt: "2026-03-02T00:00:00Z",
    updatedAt: "2026-09-04T00:00:00Z",
    content: `You are an expert Laravel 11 Architect. Build a production-grade, test-driven REST API slice for the resource: \${resourceName}.

File Structure to Generate:
1. Action Class: App\\Actions\\\${resourceName}\\Create\${resourceName}Action with DB::transaction, idempotency check, and event dispatch.
2. Form Request: App\\Http\\Requests\\\${resourceName}Request with strict rules and Gate authorization: \${authPolicy}.
3. API Resource: App\\Http\\Resources\\\${resourceName}Resource with camelCase transformation and conditional relationship loading.
4. Controller: Single-responsibility Invokable Controller calling the Action.
5. Pest Test: Feature test covering 201 Created, 422 Unprocessable, and 403 Forbidden scenarios.

Resource Specifics:
Resource: \${resourceName}
Fields: \${fieldDefinitions}
Required Validations: \${validationRules}`,
    variables: [],
  },
  {
    id: "prompt-nextjs-app-router-architect",
    slug: "nextjs-16-app-router-rsc-system",
    title: "Next.js 16 App Router & RSC Data Pipeline",
    description: "Builds bulletproof Next.js App Router architectures utilizing React Server Components, Server Actions with Zod validation, optimistic UI updates, and streaming Suspense boundaries.",
    category: "CODING",
    type: "CODE",
    author: "TRIHEX Engineering",
    license: "TRIHEX-PROPRIETARY-FREE",
    votes: 412,
    isOriginalTrihex: true,
    modelCompatibility: ["Claude 3.7 Sonnet", "Cursor", "GPT-4o", "DeepSeek-R1"],
    tags: ["nextjs", "react", "typescript", "rsc", "server-actions"],
    status: "PUBLISHED",
    contentHash: "nextjs-rsc-v1",
    createdAt: "2026-02-28T00:00:00Z",
    updatedAt: "2026-09-04T00:00:00Z",
    content: `You are a Principal Frontend Architect specializing in modern Next.js App Router (React 19 Server Components).
Build an end-to-end data pipeline for: \${featureName}.

Requirements:
1. Server Component: Async server component fetching data directly with proper caching headers and Suspense fallback.
2. Server Action: 'use server' mutation with Zod schema validation, revalidatePath, and structured return format: { success: boolean; data?: any; error?: string }.
3. Client Component: 'use client' form utilizing React 19 useActionState and useOptimistic for zero-latency user feedback.
4. Error Boundary: error.tsx boundary with reset button and Sentry-compatible logger.
5. Security: Never leak database credentials or internal stack traces to the client.

Feature: \${featureName}
Data Schema: \${dataFields}
Target Path: \${routePath}`,
    variables: [],
  },
  {
    id: "prompt-midjourney-ecommerce-ad",
    slug: "midjourney-v6-ecommerce-infographic-ad",
    title: "Midjourney v6.1 Master E-commerce Infographic Poster",
    description: "Generates hyper-detailed, commercial-grade 2:3 vertical product infographics with floating feature glassmorphism cards, studio lighting, and zero garbled pseudo-text.",
    category: "IMAGE_VIDEO",
    type: "IMAGE",
    author: "TRIHEX Creative Lab",
    license: "TRIHEX-PROPRIETARY-FREE",
    votes: 520,
    isOriginalTrihex: true,
    modelCompatibility: ["Midjourney v6.1", "Flux Pro", "DALL-E 3"],
    tags: ["midjourney", "image-generation", "ecommerce", "infographic", "commercial"],
    status: "PUBLISHED",
    contentHash: "midjourney-ad-v1",
    createdAt: "2026-03-03T00:00:00Z",
    updatedAt: "2026-09-04T00:00:00Z",
    content: `Create a commercial product infographic poster for: \${productName}.

Prompt:
Ultra-high resolution commercial advertisement poster for \${productName}, 2:3 aspect ratio vertical portrait. Central hero showcase of \${productVisualDescription} floating seamlessly against an ultra-clean deep slate backdrop with subtle cyan and electric-blue volumetric rim lighting. Surrounding the product are sleek floating glassmorphism UI cards displaying subtle geometric technical icons and badge accents. Master commercial studio product photography, Profoto octabox diffused lighting, 8k resolution, photorealistic metallic and matte textures, crisp specular highlights, zero messy typography or garbled gibberish text, octane render finish, Behance award-winning layout --ar 2:3 --stylize 250 --v 6.1

Negative Prompt:
blurry, noisy, artifacts, misspelled letters, random gibberish text, watermark, bad anatomy, deformed elements, low-poly, oversaturated neon yellow`,
    variables: [],
  },
  {
    id: "prompt-ugc-tiktok-ecommerce-script",
    slug: "ugc-tiktok-viral-hook-script-generator",
    title: "Viral UGC TikTok / Reels Ad Script (3-Hook Testing Matrix)",
    description: "Generates high-converting short-form video scripts (9:16) with 3 psychological scroll-stopping hooks, visual staging cues, on-screen text overlays, and an irresistible call-to-action.",
    category: "IMAGE_VIDEO",
    type: "VIDEO",
    author: "TRIHEX Growth Lab",
    license: "TRIHEX-PROPRIETARY-FREE",
    votes: 380,
    isOriginalTrihex: true,
    modelCompatibility: ["Claude 3.7 Sonnet", "GPT-4o"],
    tags: ["ugc", "tiktok", "reels", "video-script", "ecommerce", "cro"],
    status: "PUBLISHED",
    contentHash: "ugc-tiktok-v1",
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-09-04T00:00:00Z",
    content: `You are an elite Direct-Response Video Strategist generating viral TikTok/Reels UGC ads for: \${productName}.
Target Customer: \${targetAudience}
Main Pain Point: \${painPoint}
Unique Value Proposition: \${uniqueSellingPoint}

Structure your response with:
1. Three Distinct 3-Second Hooks:
   - Hook A (Pattern Interrupt): Visual stunt or contrarian statement.
   - Hook B (Direct Agitation): Calling out the exact daily frustration.
   - Hook C (Secret / Loophole): "Why nobody is talking about..."
2. Full 30-Second Production Script (Staging, Speech, On-Screen Text Overlay):
   - [0:00 - 0:03] Selected Hook execution with micro-zoom.
   - [0:03 - 0:12] Problem agitation + personal proof.
   - [0:12 - 0:22] Solution showcase (screen recording or tactile demonstration).
   - [0:22 - 0:30] Urgency CTA: Specific link instruction + risk reversal (e.g. 100% money-back or instant access).
3. Creator Directing Notes (lighting, pace, vocal inflection).`,
    variables: [],
  },
  {
    id: "prompt-b2b-cold-email-matrix",
    slug: "b2b-high-ticket-cold-email-matrix",
    title: "B2B High-Ticket Cold Email 4-Touch Sequence",
    description: "Crafts sub-80-word, high-relevance B2B sales emails that bypass spam filters, highlight real business leverage, and achieve 35%+ reply rates.",
    category: "MARKETING_SALES",
    type: "TEXT",
    author: "TRIHEX Sales Lab",
    license: "TRIHEX-PROPRIETARY-FREE",
    votes: 295,
    isOriginalTrihex: true,
    modelCompatibility: ["Claude 3.7 Sonnet", "GPT-4o"],
    tags: ["cold-email", "b2b", "sales", "outbound", "lead-generation"],
    status: "PUBLISHED",
    contentHash: "b2b-email-v1",
    createdAt: "2026-02-25T00:00:00Z",
    updatedAt: "2026-09-04T00:00:00Z",
    content: `You are a high-ticket B2B Outbound Sales Specialist. Write a 4-step cold outreach sequence targeting \${prospectRole} at \${companyType}.

Context:
Our Solution: \${ourSolution}
Specific Quantifiable Outcome: \${quantifiableResult}
Case Study Reference: \${caseStudyReference}

Strict Rules:
- Maximum 75 words per email.
- Zero buzzwords ("synergy", "game-changer", "hope this email finds you well").
- Low-friction interest CTA (e.g. "Open to seeing a 2-minute Loom?" rather than "Book a 30-minute call").
- Write 4 touches: Initial Hook, Value-add Resource, Short Case Study, and Graceful 9-word Breakup email.`,
    variables: [],
  },
  {
    id: "prompt-phd-literature-synthesis",
    slug: "phd-literature-review-citation-matrix",
    title: "PhD Academic Literature Review & Conceptual Synthesis Matrix",
    description: "Synthesizes scientific papers into a rigorous theoretical framework with comparative methodology matrices, identified research gaps, and APA 7th citations.",
    category: "STUDY_RESEARCH",
    type: "TEXT",
    author: "TRIHEX Research Lab",
    license: "TRIHEX-PROPRIETARY-FREE",
    votes: 360,
    isOriginalTrihex: true,
    modelCompatibility: ["Claude 3.7 Sonnet", "DeepSeek-R1", "GPT-4o"],
    tags: ["academic", "literature-review", "phd", "research", "synthesis"],
    status: "PUBLISHED",
    contentHash: "phd-lit-v1",
    createdAt: "2026-02-27T00:00:00Z",
    updatedAt: "2026-09-04T00:00:00Z",
    content: `You are a Senior Academic Researcher and Peer Reviewer.
Synthesize the current academic literature regarding: \${researchTopic}.

Produce:
1. Conceptual Taxonomy: Key theoretical paradigms and seminal papers.
2. Comparative Analysis Matrix (Table):
   - Authors & Year
   - Core Theoretical Construct
   - Methodology (Empirical, Qualitative, Meta-analysis, Sample size)
   - Primary Findings
   - Methodological Limitations
3. Critical Gaps Analysis: Identify 3 unaddressed questions or conflicting results in the field.
4. Proposed Future Research Agenda: 2 high-impact hypothesis questions suitable for empirical investigation.

Field of Study: \${discipline}
Specific Focus: \${researchTopic}
Key Authors or Papers to Include: \${keyAuthors}`,
    variables: [],
  },
  {
    id: "prompt-socratic-code-debugger",
    slug: "socratic-autonomous-code-debugger",
    title: "Autonomous Root-Cause Debugger & Socratic Fixer",
    description: "Deeply analyzes stack traces, race conditions, memory leaks, and silent logic bugs. Explains the exact failure mechanism before delivering minimal surgical fixes.",
    category: "CODING",
    type: "CODE",
    author: "TRIHEX Engineering",
    license: "TRIHEX-PROPRIETARY-FREE",
    votes: 490,
    isOriginalTrihex: true,
    modelCompatibility: ["Claude 3.7 Sonnet", "Cursor", "DeepSeek-R1", "GPT-4o"],
    tags: ["debugging", "troubleshooting", "stacktrace", "root-cause", "performance"],
    status: "PUBLISHED",
    contentHash: "socratic-debug-v1",
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-09-04T00:00:00Z",
    content: `You are a Principal Software Reliability Engineer (SRE).
Analyze and diagnose the following bug in \${programmingLanguage}:

Bug Report / Error Stack:
\${errorMessageOrStack}

Relevant Code Snippet:
\${codeSnippet}

Expected Behavior:
\${expectedBehavior}

Diagnostic Protocol:
1. Root Cause Analysis: Explain precisely WHY this fails at runtime (memory allocation, async race, off-by-one, type coercion, or unhandled promise).
2. Minimal Surgical Fix: Provide the exact diff or replacement lines required. Do not rewrite unrelated code.
3. Edge-Case Audit: Highlight 2 other ways this exact pattern could fail under heavy production load.
4. Unit Test: Provide a regression test (using \${testFramework}) that reproduces the bug before the fix and passes after.`,
    variables: [],
  },
];

// Populate variables dynamically for all original prompts
for (const p of TRIHEX_ORIGINAL_PROMPTS) {
  p.variables = extractPromptVariables(p.content);
}
