import { Prompt, extractPromptVariables } from "./types";

export const TRIHEX_ORIGINAL_PROMPTS: Prompt[] = [
  {
    "id": "prompt-csharp-clean-arch",
    "slug": "csharp-dotnet9-clean-architecture",
    "title": "C# / .NET 9 Clean Architecture & CQRS Domain Generator",
    "description": "Generates production-grade .NET 9 CQRS handlers, Domain-Driven Design aggregates, MediatR commands, FluentValidation, and EF Core entity mappings.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 420,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "Cursor",
      "GPT-4o",
      "DeepSeek-R1"
    ],
    "tags": [
      "csharp",
      "dotnet",
      "clean-architecture",
      "cqrs",
      "mediatr",
      "efcore"
    ],
    "content": "You are an elite Principal Software Architect specializing in C# and .NET 9.\nGenerate a complete, enterprise-grade vertical slice for the domain entity: ${entityName}.\n\nArchitecture Constraints:\n1. Follow Clean Architecture / CQRS with MediatR:\n   - Command: Create${entityName}Command with record immutable payload.\n   - CommandHandler: Handle method with cancellation token, repository integration, and domain event dispatch.\n   - Validator: FluentValidation AbstractValidator with boundary constraints for ${keyValidationRules}.\n   - Entity Aggregate: Rich Domain Model with private setters, factory methods, and domain event collection.\n   - Repository Interface: I${entityName}Repository with async Read/Write contracts.\n2. Target Framework: .NET 9 with C# 13 features (primary constructors, collection expressions).\n3. Concurrency: Optimistic concurrency control via RowVersion byte[] property.\n\nEntity Specifications:\nEntity: ${entityName}\nKey Attributes: ${attributesList}\nBusiness Invariants: ${businessRules}",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-csharp-clean-arch",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-csharp-blazor-wasm",
    "slug": "csharp-blazor-wasm-signalr-realtime",
    "title": "C# Blazor WASM with SignalR Real-Time Hub",
    "description": "Builds a reactive Blazor WebAssembly component wired to an ASP.NET Core SignalR hub with automatic reconnection and stateful observables.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 310,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "Cursor",
      "GPT-4o"
    ],
    "tags": [
      "csharp",
      "blazor",
      "wasm",
      "signalr",
      "realtime",
      "dotnet"
    ],
    "content": "You are a Senior .NET Blazor Specialist.\nBuild a real-time reactive Blazor WebAssembly component and backend SignalR hub for: ${featureName}.\n\nRequirements:\n1. Backend: ASP.NET Core SignalR Hub with group authorization and strongly-typed I${featureName}Client interface.\n2. Client: Blazor component connecting via HubConnectionBuilder with WithAutomaticReconnect policy.\n3. State: Handle Connected, Reconnecting, and Closed states gracefully in UI with a status indicator badge.\n4. Payload: Deliver structured real-time updates for ${dataPayloadSchema}.\n5. Lifecycle: Ensure IAsyncDisposable cleanup on client unmount.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-csharp-blazor-wasm",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-csharp-efcore-tuner",
    "slug": "csharp-efcore-query-performance-tuner",
    "title": "Entity Framework Core 9 Query Optimizer & Profiler",
    "description": "Refactors EF Core LINQ queries to eliminate N+1 queries, split Cartesian queries, and leverage compiled queries with AsNoTracking.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 285,
    "modelCompatibility": [
      "Cursor",
      "Claude 3.7 Sonnet",
      "DeepSeek-R1"
    ],
    "tags": [
      "csharp",
      "efcore",
      "performance",
      "sql",
      "linq",
      "database"
    ],
    "content": "You are a Database Performance Engineer for .NET and SQL Server.\nRefactor and optimize the following slow EF Core query for entity: ${targetEntity}.\n\nProblematic Query:\n${slowLinqQuery}\n\nTarget Database Engine: ${databaseEngine}\nExpected Volume: ${rowsCount} rows\n\nOptimization Directives:\n1. Identify and eliminate any N+1 SELECT loops or Cartesian explosion.\n2. Use AsNoTrackingWithIdentityResolution for read operations.\n3. Replace inefficient Includes with projected Select DTOs or AsSplitQuery.\n4. Output the estimated generated SQL and recommended index definitions.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-csharp-efcore-tuner",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-laravel11-api-service",
    "slug": "laravel-11-action-pattern-api",
    "title": "Laravel 11 Production Action-Pattern REST API",
    "description": "Scaffolds enterprise Laravel 11 microservices using single-action classes, Form Requests with authorization, API Resources, and Pest PHP tests.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 380,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "Cursor",
      "GPT-4o"
    ],
    "tags": [
      "laravel",
      "php",
      "rest-api",
      "pest",
      "action-pattern"
    ],
    "content": "You are an expert Laravel 11 Architect. Build a production-grade REST API slice for the resource: ${resourceName}.\n\nCode Generation Requirements:\n1. Controller: Invokable controller delegating to a dedicated Action class: ${actionName}Action.\n2. Form Request: Validates input with strict rules: ${validationRules}.\n3. Action Class: Handles business logic inside DB::transaction, fires domain events, and dispatches queued jobs.\n4. API Resource: Transforms output cleanly with snake_case keys and conditional relations.\n5. Pest PHP Test: Feature test covering validation failure, successful execution, and event assertion.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-laravel11-api-service",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-laravel11-pest-suite",
    "slug": "laravel-11-pest-testing-suite",
    "title": "Laravel 11 Comprehensive Pest PHP Test Generator",
    "description": "Generates thorough Pest PHP unit and feature tests covering authentication, authorization gates, database seeding, and HTTP status codes.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 245,
    "modelCompatibility": [
      "Cursor",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "laravel",
      "pest",
      "testing",
      "tdd",
      "php"
    ],
    "content": "You are a Test-Driven Development (TDD) practitioner in Laravel 11.\nGenerate a comprehensive Pest PHP test suite for: ${endpointOrService}.\n\nScenario Specs:\nFeature: ${featureDescription}\nAuth Requirement: ${authRequirement}\nTest Cases to generate:\n1. Happy path: returns 200/201 with correct JSON structure.\n2. Unauthenticated user: returns 401.\n3. Unauthorized permission: returns 403.\n4. Validation errors: returns 422 with specific field error assertions.\n5. Database assertions: assertDatabaseHas and Event::assertDispatched.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-laravel11-pest-suite",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-laravel11-inertia-vue",
    "slug": "laravel-11-inertia-vue3-ssr-setup",
    "title": "Laravel 11 + Inertia.js + Vue 3 SSR Full-Stack Slice",
    "description": "Generates a reactive full-stack page using Laravel 11 controller, Inertia response, Vue 3 Composition API with script setup, and Tailwind styling.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 290,
    "modelCompatibility": [
      "Cursor",
      "Claude 3.7 Sonnet",
      "GPT-4o"
    ],
    "tags": [
      "laravel",
      "inertia",
      "vue3",
      "typescript",
      "fullstack"
    ],
    "content": "You are a Senior Full-Stack Developer specializing in Laravel 11 and Inertia.js with Vue 3.\nBuild a complete page slice for: ${pageTitle}.\n\nComponents required:\n1. Laravel Controller method returning Inertia::render with typed props.\n2. Vue 3 component using <script setup lang=\"ts\"> with defineProps and useForm.\n3. Optimistic form submission handling validation errors and flash messages.\n4. Responsive Tailwind CSS layout supporting dark mode.\n5. SEO meta tags configured via Inertia Head component.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-laravel11-inertia-vue",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-nextjs16-server-actions",
    "slug": "nextjs-16-server-actions-streaming",
    "title": "Next.js 16 App Router Server Actions & Suspense",
    "description": "Generates Next.js 16 Server Actions with Zod validation, revalidateTag cache purging, useActionState hooks, and streaming Suspense skeletons.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 510,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "Cursor",
      "GPT-4o"
    ],
    "tags": [
      "nextjs",
      "react",
      "server-actions",
      "suspense",
      "typescript"
    ],
    "content": "You are a Principal Frontend Architect specializing in Next.js 16 (App Router) and React 19.\nBuild an end-to-end form and data display for: ${featureName}.\n\nConstraints:\n1. Server Action: 'use server' action validating input with Zod schema for ${schemaFields}.\n2. Auth Gate: Validate user session using headers() and throw safe actionable errors.\n3. Cache Purging: revalidatePath or revalidateTag on successful mutations.\n4. Client Component: 'use client' using React 19 useActionState and useOptimistic for immediate UI feedback.\n5. Suspense: Skeleton loading placeholder for asynchronous data boundaries.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-nextjs16-server-actions",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-nextjs16-turbopack-monorepo",
    "slug": "nextjs-16-turbopack-monorepo-architect",
    "title": "Next.js 16 Turbopack Monorepo Clean Architecture",
    "description": "Configures package boundaries, tsconfig path aliases, server-only isolation guards, and shared UI component libraries in a Next.js monorepo.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 340,
    "modelCompatibility": [
      "Cursor",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "nextjs",
      "turbopack",
      "monorepo",
      "architecture",
      "typescript"
    ],
    "content": "You are a Build Engineer and Monorepo Architect.\nDesign a modular workspace architecture for: ${projectName}.\n\nModules:\n- web: Next.js 16 App Router application.\n- ui: Shared React component library with Tailwind tokens.\n- db: Database schemas, Drizzle/Prisma models, and migrations.\n- core: Pure business domain logic and validation without browser dependencies.\n\nProvide the tsconfig.json paths, package.json dependencies, and isolation barrier preventing server secrets from leaking into client bundles.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-nextjs16-turbopack-monorepo",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-react19-state-machine",
    "slug": "react-19-action-state-optimistic-machine",
    "title": "React 19 useActionState & useOptimistic State Machine",
    "description": "Constructs state machines using React 19 hooks with instant optimistic updates, automatic rollback on error, and accessible ARIA attributes.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 395,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "Cursor",
      "GPT-4o"
    ],
    "tags": [
      "react19",
      "hooks",
      "optimistic",
      "state-machine",
      "typescript"
    ],
    "content": "You are a React 19 Specialist.\nImplement an optimistic state update flow for: ${userActionName}.\n\nRequirements:\n1. Use useActionState to manage pending status, errors, and server response.\n2. Use useOptimistic to update the list immediately upon submit: ${itemType}.\n3. Roll back smoothly if the action throws a network or validation error.\n4. Render aria-busy and aria-live polite regions for screen readers.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-react19-state-machine",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-go-clean-microservice",
    "slug": "go-123-clean-architecture-microservice",
    "title": "Go 1.23 Clean Architecture Microservice",
    "description": "Generates production Go 1.23 microservices with idiomatic interfaces, context propagation, structured slog logging, and Chi router handlers.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 460,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "Cursor",
      "DeepSeek-R1"
    ],
    "tags": [
      "go",
      "golang",
      "microservices",
      "clean-architecture",
      "rest"
    ],
    "content": "You are a Principal Backend Engineer in Go 1.23.\nImplement a clean architecture package for service: ${serviceName}.\n\nLayers:\n1. Domain: Entity structs, custom error types, and repository interface.\n2. UseCase: Business logic functions accepting context.Context with timeout.\n3. Repository: Database implementation using pgxpool with prepared statements.\n4. HTTP Handler: Chi router handlers with JSON decoding and slog structured logging.\n5. Unit Test: Table-driven test using testify/mock.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-go-clean-microservice",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-go-worker-pool",
    "slug": "go-concurrency-worker-pool-rate-limiter",
    "title": "Go High-Throughput Worker Pool with Token Bucket",
    "description": "Builds a memory-efficient Go concurrency pipeline with buffered channels, worker goroutines, graceful shutdown, and token-bucket rate limiting.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 375,
    "modelCompatibility": [
      "Cursor",
      "DeepSeek-R1",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "go",
      "concurrency",
      "channels",
      "worker-pool",
      "rate-limiting"
    ],
    "content": "You are a Systems Engineer in Go.\nBuild a concurrent worker pool processing jobs of type: ${jobType}.\n\nSpecifications:\n1. Worker Pool: Configurable ${workerCount} worker goroutines reading from a buffered job channel.\n2. Rate Limiting: Rate limit job processing to ${maxRps} requests per second using golang.org/x/time/rate.\n3. Context Cancellation: Support graceful shutdown upon SIGINT/SIGTERM with sync.WaitGroup.\n4. Error Aggregation: Capture failed jobs and send to a dead-letter channel for retry.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-go-worker-pool",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-python-fastapi-async",
    "slug": "python-fastapi-async-pydantic-v2",
    "title": "Python FastAPI Async Microservice with Pydantic v2",
    "description": "Builds asynchronous FastAPI endpoints with Pydantic v2 schema validation, dependency injection, SQLAlchemy 2.0 async sessions, and Alembic.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 415,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "Cursor",
      "GPT-4o"
    ],
    "tags": [
      "python",
      "fastapi",
      "async",
      "pydantic",
      "sqlalchemy"
    ],
    "content": "You are a Senior Python Backend Architect.\nBuild a high-throughput async FastAPI microservice for: ${resourceName}.\n\nComponents:\n1. Pydantic v2 Models: Base, Create, Update, and Response models with field constraints for ${fields}.\n2. Database: SQLAlchemy 2.0 async engine with async_sessionmaker and declarative models.\n3. Router: Async route handlers with Depends() injection for database sessions and JWT authentication.\n4. Error Handling: Global HTTPException handlers returning standardized RFC 7807 problem details.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-python-fastapi-async",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-python-polars-etl",
    "slug": "python-polars-duckdb-streaming-etl",
    "title": "Python Polars & DuckDB High-Performance ETL Pipeline",
    "description": "Constructs blazing-fast columnar ETL pipelines handling multi-gigabyte datasets with streaming chunks, lazy frames, and zero RAM crashes.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 330,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "DeepSeek-R1"
    ],
    "tags": [
      "python",
      "polars",
      "duckdb",
      "etl",
      "data-engineering"
    ],
    "content": "You are a Principal Data Engineer.\nBuild an optimized ETL pipeline in Polars and DuckDB for dataset: ${datasetName}.\n\nWorkflow:\n1. Ingestion: Scan multi-file Parquet or CSV sources using polars.scan_csv with schema inference.\n2. Transformation: LazyFrame transformations (filter, groupby, join, window functions) for: ${transformLogic}.\n3. Aggregation: Compute metrics using DuckDB SQL engine against Polars arrow memory.\n4. Export: Stream result to compressed Parquet with Snappy compression without loading full dataset into RAM.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-python-polars-etl",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-postgres-explain-tuner",
    "slug": "postgres-explain-analyze-query-tuner",
    "title": "PostgreSQL Query & Index Tuning Specialist",
    "description": "Diagnoses slow PostgreSQL queries by analyzing EXPLAIN (ANALYZE, BUFFERS) output, designing partial/composite indexes, and preventing seq scans.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 480,
    "modelCompatibility": [
      "DeepSeek-R1",
      "Claude 3.7 Sonnet",
      "Cursor"
    ],
    "tags": [
      "postgres",
      "sql",
      "explain-analyze",
      "indexing",
      "performance"
    ],
    "content": "You are a PostgreSQL Database Administrator (DBA).\nAnalyze the slow query and execution plan below for table: ${tableName}.\n\nQuery:\n${sqlQuery}\n\nEXPLAIN (ANALYZE, BUFFERS) Output:\n${explainOutput}\n\nDeliverables:\n1. Root Cause: Identify why sequential scans, nested loops, or excessive buffer reads are occurring.\n2. Index Design: Recommend exact CREATE INDEX CONCURRENTLY statements (including partial, composite, or GIN/B-tree).\n3. Query Rewrite: Provide refactored SQL eliminating subqueries or unnecessary joins.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-postgres-explain-tuner",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-docker-multistage-optimizer",
    "slug": "docker-multistage-production-container",
    "title": "Docker Multi-Stage Production Container Hardener",
    "description": "Constructs hardened, rootless, minimal multi-stage Dockerfiles for Node.js, Go, Python, or .NET with CVE scanning and sub-50MB footprints.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 360,
    "modelCompatibility": [
      "Cursor",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "docker",
      "devops",
      "containers",
      "security",
      "optimization"
    ],
    "content": "You are a Container Security & DevOps Specialist.\nCreate a production-grade multi-stage Dockerfile for a ${runtimeLanguage} application.\n\nRequirements:\n1. Multi-Stage Build: Builder stage with build dependencies; minimal runtime stage (distroless or alpine).\n2. Security: Run strictly as non-root user (USER appuser).\n3. Caching: Optimize layer caching so dependency install layers are not invalidated by source code edits.\n4. Healthcheck: Built-in HEALTHCHECK instruction polling ${healthEndpoint}.\n5. Size: Output target footprint under 50MB.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-docker-multistage-optimizer",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-k8s-helm-hardening",
    "slug": "kubernetes-helm-chart-production-hardening",
    "title": "Kubernetes Helm Chart & Resource Quota Hardener",
    "description": "Generates production Kubernetes manifests with HPA autoscaling, PDB disruption budgets, securityContext hardening, and network policies.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 295,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "Cursor"
    ],
    "tags": [
      "kubernetes",
      "helm",
      "devops",
      "sre",
      "cloud-native"
    ],
    "content": "You are a Kubernetes SRE Architect.\nProduce a hardened Helm chart and resource specifications for deployment: ${appName}.\n\nInclude:\n1. Deployment: securityContext (readOnlyRootFilesystem, drop ALL capabilities, runAsNonRoot).\n2. Resource Quotas: requests and limits for CPU/Memory tailored for ${trafficLoad}.\n3. HorizontalPodAutoscaler: Scale based on CPU and custom HTTP request metrics.\n4. PodDisruptionBudget: Ensure minimum 1 available replica during node upgrades.\n5. NetworkPolicy: Restrict ingress strictly to reverse-proxy ingress controller.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-k8s-helm-hardening",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-socratic-debugger",
    "slug": "socratic-autonomous-code-debugger",
    "title": "Autonomous Root-Cause Debugger & Socratic Fixer",
    "description": "Deeply analyzes stack traces, race conditions, memory leaks, and silent logic bugs, explaining the exact failure mechanism before surgical fixes.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 540,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "Cursor",
      "DeepSeek-R1",
      "GPT-4o"
    ],
    "tags": [
      "debugging",
      "troubleshooting",
      "stacktrace",
      "root-cause",
      "reliability"
    ],
    "content": "You are a Principal Software Reliability Engineer (SRE).\nAnalyze and diagnose the following bug in ${programmingLanguage}:\n\nBug Report / Error Stack:\n${errorMessageOrStack}\n\nRelevant Code Snippet:\n${codeSnippet}\n\nExpected Behavior:\n${expectedBehavior}\n\nDiagnostic Protocol:\n1. Root Cause Analysis: Explain precisely WHY this fails at runtime.\n2. Minimal Surgical Fix: Provide the exact diff or replacement lines required. Do not rewrite unrelated code.\n3. Edge-Case Audit: Highlight 2 other ways this exact pattern could fail under heavy production load.\n4. Unit Test: Provide a regression test that reproduces the bug before the fix and passes after.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-socratic-debugger",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-rust-zero-copy-parser",
    "slug": "rust-zero-copy-binary-parser-nom",
    "title": "Rust Zero-Copy Binary & Protocol Parser",
    "description": "Constructs ultra-fast, memory-safe binary wire protocol parsers in Rust using nom or zerocopy without heap allocations.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 315,
    "modelCompatibility": [
      "Cursor",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "rust",
      "nom",
      "binary",
      "parser",
      "performance"
    ],
    "content": "You are a Systems Programmer in Rust.\nWrite a zero-copy parser for binary protocol: ${protocolName}.\n\nRequirements:\n1. Memory Safety: Zero heap allocations during parsing; borrow slices directly with lifetime 'a.\n2. Tooling: Use the nom parser combinator crate or zerocopy byte-casting.\n3. Error Handling: Return detailed custom enum Error with byte offset.\n4. Frame Specification: ${frameHeaderAndPayloadSpec}.\n5. Unit Tests: Test valid payloads, truncated buffers, and corrupted checksums.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-rust-zero-copy-parser",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-ts-branded-types",
    "slug": "typescript-strict-branded-types-gymnast",
    "title": "TypeScript Strict Domain Types & Nominal Branding",
    "description": "Eliminates primitive obsession by implementing nominal branded types, type predicates, discriminated unions, and mapped types in TypeScript.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 380,
    "modelCompatibility": [
      "Cursor",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "typescript",
      "type-system",
      "branded-types",
      "clean-code"
    ],
    "content": "You are a TypeScript Type-Level Engineer.\nDesign a bulletproof domain type system for entity: ${domainEntity}.\n\nSpecifications:\n1. Branded Types: Create nominal types for identifiers (e.g. UserId, OrderId, MonetaryAmount) so primitives cannot be accidentally swapped.\n2. Smart Constructors: Factory validation functions with type predicates (asserts x is T).\n3. Discriminated Unions: Model all possible states of ${stateFlow} without impossible combinations.\n4. Utility Types: Provide mapped types to make only specific nested fields mutable or readonly.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-ts-branded-types",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-graphql-subgraph",
    "slug": "graphql-apollo-federation-subgraph",
    "title": "GraphQL Apollo Federation v2 Subgraph Builder",
    "description": "Generates Apollo Federation v2 subgraph schemas with @key directives, entity resolvers, field shares, and dataloader batching.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 270,
    "modelCompatibility": [
      "Cursor",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "graphql",
      "apollo-federation",
      "subgraph",
      "api",
      "microservices"
    ],
    "content": "You are a Distributed API Architect.\nBuild an Apollo Federation v2 subgraph for service: ${subgraphName}.\n\nSchema Specs:\n1. Federation 2: @link directive importing @key, @shareable, @external.\n2. Entities: Extend core entity ${federatedEntity} with @key(fields: \"id\").\n3. Resolvers: Implement __resolveReference and DataLoader to eliminate N+1 queries when resolving references.\n4. Mutations: Standard payload pattern with UserError list.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-graphql-subgraph",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-rtk-query-cache",
    "slug": "redux-toolkit-rtk-query-cache-architect",
    "title": "Redux Toolkit & RTK Query Cache Optimizer",
    "description": "Constructs scalable RTK Query API slice definitions with automated tag invalidation, optimistic updates, and normalized client cache.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 290,
    "modelCompatibility": [
      "Cursor",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "react",
      "redux",
      "rtk-query",
      "caching",
      "state-management"
    ],
    "content": "You are a Senior Frontend State Specialist.\nBuild an RTK Query API slice for: ${apiResource}.\n\nInclude:\n1. Base Query: fetchBaseQuery with JWT token injection and re-auth logic.\n2. Endpoints: getItems, getItemById, createItem, updateItem, deleteItem.\n3. Tag Invalidation: Granular tag system (providesTags / invalidatesTags) with IDs to avoid global refetches.\n4. Optimistic Updates: onQueryStarted implementation for instant UI updates on mutations.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-rtk-query-cache",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-tailwind-v4-tokens",
    "slug": "tailwind-css-v4-theme-tokens-migrator",
    "title": "Tailwind CSS v4 CSS-First Design Token System",
    "description": "Architects modern Tailwind CSS v4 stylesheets using CSS @theme directives, fluid typography, and OKLCH color spaces.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 320,
    "modelCompatibility": [
      "Cursor",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "tailwind",
      "css",
      "design-tokens",
      "frontend",
      "styling"
    ],
    "content": "You are a CSS Architecture Specialist.\nConfigure a design token system using Tailwind CSS v4 for: ${brandName}.\n\nDirectives:\n1. CSS-First Theme: Use @theme block in CSS instead of legacy tailwind.config.js.\n2. Color Space: Define brand palettes in OKLCH for perceptually uniform lightness and chroma.\n3. Typography: Implement clamp() fluid typography scales from mobile (375px) to desktop (1440px).\n4. Dark Mode: Seamless dark mode switching using CSS custom properties.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-tailwind-v4-tokens",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-playwright-e2e",
    "slug": "playwright-e2e-visual-regression-suite",
    "title": "Playwright E2E & Visual Regression Test Suite",
    "description": "Generates resilient Playwright automated test suites using Page Object Models, accessibility checks (axe-core), and visual snapshot diffing.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 365,
    "modelCompatibility": [
      "Cursor",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "playwright",
      "testing",
      "e2e",
      "visual-regression",
      "automation"
    ],
    "content": "You are a Senior QA Automation Architect.\nCreate a Playwright end-to-end and visual regression test for flow: ${userFlowName}.\n\nSpecifications:\n1. Page Object Model: Encapsulate locators and user actions in a dedicated POM class.\n2. Locators: Use resilient user-facing locators (getByRole, getByLabel, getByText).\n3. Visual Regression: toHaveScreenshot assertions masking dynamic timestamps or avatars.\n4. Accessibility: Integrate @axe-core/playwright to assert zero WCAG 2.1 AA violations.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-playwright-e2e",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-vitest-mutation",
    "slug": "vitest-mocking-mutation-test-generator",
    "title": "Vitest Advanced Mocking & Mutation Test Suite",
    "description": "Creates comprehensive Vitest unit tests with vi.mock factory functions, timer mocks, and high-coverage boundary condition assertions.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 310,
    "modelCompatibility": [
      "Cursor",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "vitest",
      "unit-testing",
      "mocking",
      "typescript"
    ],
    "content": "You are a Software Quality Specialist.\nWrite a bulletproof Vitest unit test suite for: ${modulePath}.\n\nInclude:\n1. Dependency Mocking: Use vi.mock to isolate network, database, or third-party SDK calls.\n2. Timers: Use vi.useFakeTimers() for debounce, throttle, or scheduled interval testing.\n3. Boundary Testing: Test null, undefined, empty array, negative values, and maximum integer overflows.\n4. Concurrency: Test async race conditions and promise rejections.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-vitest-mutation",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-redis-distributed-lock",
    "slug": "redis-distributed-lock-token-bucket",
    "title": "Redis Distributed Lock & Token Bucket Rate Limiter",
    "description": "Implements production Redlock distributed mutual exclusion and sliding-window rate limiters with Lua scripts to prevent race conditions.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 430,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "Cursor",
      "DeepSeek-R1"
    ],
    "tags": [
      "redis",
      "distributed-systems",
      "locking",
      "rate-limiting",
      "lua"
    ],
    "content": "You are a Distributed Systems Architect.\nImplement a Redis-backed distributed lock and sliding-window rate limiter in ${programmingLanguage}.\n\nRequirements:\n1. Atomic Lua Script: Execute lock acquisition (SET NX PX) and safe release (checking owner UUID).\n2. Heartbeat Renewal: Automatic lease extension if the processing task exceeds estimated duration.\n3. Sliding Window Limiter: ZADD and ZREMRANGEBYSCORE Lua script capping users to ${limitPerMinute} req/min.\n4. Fallback: Graceful degradation if Redis cluster undergoes failover.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-redis-distributed-lock",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-kafka-event-sourcing",
    "slug": "kafka-event-sourcing-dead-letter-consumer",
    "title": "Kafka Event Sourcing Consumer with Dead-Letter Queues",
    "description": "Constructs idempotent Kafka message consumers with manual offset commits, exponential backoff retries, and dead-letter queue routing.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 345,
    "modelCompatibility": [
      "Cursor",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "kafka",
      "event-driven",
      "messaging",
      "queues",
      "microservices"
    ],
    "content": "You are an Event-Driven Architecture Specialist.\nBuild a production Kafka consumer for topic: ${topicName}.\n\nSpecifications:\n1. Consumer Group: Group rebalance handling and manual offset commit after successful DB processing.\n2. Idempotency: Dedup events using message key and persistent processed_event_ids table.\n3. Retry Strategy: 3 immediate retries, followed by exponential backoff topic routing.\n4. Dead Letter Queue: Route persistent poison pills to ${topicName}-dlq with error metadata header.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-kafka-event-sourcing",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-terraform-opentofu",
    "slug": "terraform-opentofu-aws-production-stack",
    "title": "Terraform / OpenTofu Production Cloud Architecture",
    "description": "Generates production Infrastructure as Code with remote S3 state locking, VPC subnets across 3 AZs, security groups, and least-privilege IAM.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 390,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "Cursor"
    ],
    "tags": [
      "terraform",
      "opentofu",
      "aws",
      "iac",
      "devops"
    ],
    "content": "You are a Cloud Infrastructure Architect.\nWrite modular Terraform / OpenTofu HCL code for infrastructure stack: ${stackName}.\n\nResources to provision:\n1. VPC: Multi-AZ (3 availability zones) with public, private, and database subnets and NAT gateways.\n2. Security Groups: Strict ingress/egress rules (zero 0.0.0.0/0 on SSH/database ports).\n3. IAM Roles: Least-privilege IAM roles and policies for ECS/EKS workloads.\n4. State Backend: S3 backend with DynamoDB state locking and server-side encryption.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-terraform-opentofu",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-github-actions-cicd",
    "slug": "github-actions-zero-downtime-deployment",
    "title": "GitHub Actions CI/CD Pipeline with Blue-Green Deploy",
    "description": "Builds a production GitHub Actions workflow with caching, linting, matrix testing, Docker image signing (Cosign), and zero-downtime deploy.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 410,
    "modelCompatibility": [
      "Cursor",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "github-actions",
      "cicd",
      "devops",
      "automation",
      "docker"
    ],
    "content": "You are a DevOps Automation Engineer.\nCreate a production GitHub Actions CI/CD workflow for repository: ${repoName}.\n\nPipeline Stages:\n1. Lint & Format: Run Biome/ESLint and Prettier checks.\n2. Test: Run unit and integration tests with dependency caching.\n3. Build & Scan: Build container image and scan for CVEs with Trivy.\n4. Deploy: Blue-Green deployment to production environment with automated rollback on healthcheck failure.\n5. Notification: Send status alerts to Slack/Discord webhook.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-github-actions-cicd",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-payment-webhook-verifier",
    "slug": "payment-webhook-crypto-signature-verifier",
    "title": "Payment Gateway Webhook HMAC-SHA256 Verifier",
    "description": "Implements timing-safe HMAC-SHA256 cryptographic verification for payment webhooks (Stripe, eSewa, Khalti, Fonepay) with replay protection.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 440,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "Cursor"
    ],
    "tags": [
      "payments",
      "webhooks",
      "security",
      "hmac",
      "crypto"
    ],
    "content": "You are a Fintech Security Engineer.\nImplement a timing-safe webhook listener for gateway: ${gatewayName}.\n\nSecurity Requirements:\n1. Signature Verification: Verify HMAC-SHA256 signature using crypto.timingSafeEqual.\n2. Replay Protection: Reject requests with timestamps older than 300 seconds.\n3. Idempotency: Store processed event ID in database inside a transaction before updating order status.\n4. Raw Body: Ensure raw request stream buffer is preserved prior to JSON parsing.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-payment-webhook-verifier",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-sast-security-remediator",
    "slug": "sast-dast-security-vulnerability-remediator",
    "title": "SAST / DAST Vulnerability Remediation Specialist",
    "description": "Fixes OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, SSRF, IDOR) with secure code refactoring and defense-in-depth sanitization.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 385,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "DeepSeek-R1",
      "Cursor"
    ],
    "tags": [
      "security",
      "owasp",
      "vulnerability",
      "appsec",
      "remediation"
    ],
    "content": "You are an Application Security (AppSec) Engineer.\nAnalyze the following vulnerability report and provide secure code remediation:\n\nVulnerability Type: ${vulnerabilityType}\nVulnerable Code Snippet:\n${vulnerableCode}\n\nRemediation Protocol:\n1. Vulnerability Mechanics: Explain how an attacker exploits this pattern.\n2. Remediated Code: Provide hardened replacement utilizing parameterized queries, safe serialization, or strict boundary validation.\n3. Defense-in-Depth: Recommend additional WAF, CSP, or middleware checks.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-sast-security-remediator",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-reverse-engineering-js",
    "slug": "reverse-engineering-obfuscated-js-wasm",
    "title": "JavaScript & WebAssembly Deobfuscation Specialist",
    "description": "Deobfuscates complex, packed JavaScript and analyzes WebAssembly text format (WAT) to uncover hidden APIs, encryptions, and data flows.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 350,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "DeepSeek-R1"
    ],
    "tags": [
      "reverse-engineering",
      "javascript",
      "wasm",
      "deobfuscation",
      "security"
    ],
    "content": "You are a Malware Analyst and Reverse Engineer.\nDeobfuscate and analyze the following obfuscated JavaScript code:\n\nObfuscated Code:\n${obfuscatedSnippet}\n\nAnalysis Tasks:\n1. Beautify and rename mangled variables to readable semantic names.\n2. Resolve string array rotations and XOR/Base64 decryption routines.\n3. Identify the true payload, network calls, and sensitive data extraction logic.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-reverse-engineering-js",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-websocket-canvas",
    "slug": "websocket-realtime-collaborative-canvas",
    "title": "WebSocket Collaborative Canvas & CRDT Engine",
    "description": "Builds a real-time multiplayer drawing or document canvas using WebSockets and Conflict-Free Replicated Data Types (CRDTs).",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 310,
    "modelCompatibility": [
      "Cursor",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "websockets",
      "canvas",
      "crdt",
      "realtime",
      "collaboration"
    ],
    "content": "You are a Real-Time Systems Specialist.\nImplement a multiplayer collaborative canvas engine for: ${canvasType}.\n\nRequirements:\n1. Protocol: WebSocket binary message framing for minimal overhead.\n2. Conflict Resolution: Implement Last-Write-Wins or Yjs CRDT synchronization.\n3. User Awareness: Real-time cursor coordinates and presence indicators for ${maxUsers} concurrent users.\n4. Canvas: HTML5 Canvas or WebGL rendering loop with requestAnimationFrame.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-websocket-canvas",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-webrtc-audio-streaming",
    "slug": "webrtc-peer-to-peer-audio-streaming",
    "title": "WebRTC Low-Latency P2P Audio Streaming Protocol",
    "description": "Constructs peer-to-peer WebRTC audio streaming pipelines with ICE candidate negotiation, STUN/TURN fallbacks, and Opus audio codecs.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 275,
    "modelCompatibility": [
      "Cursor",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "webrtc",
      "audio",
      "streaming",
      "peer-to-peer",
      "voip"
    ],
    "content": "You are a VoIP and WebRTC Engineer.\nImplement a peer-to-peer voice channel in JavaScript/TypeScript for: ${useCase}.\n\nSpecifications:\n1. Signaling: Signaling exchange protocol (SDP offer/answer) over WebSocket.\n2. ICE Gathering: RTCPeerConnection with STUN/TURN server configuration.\n3. Media Stream: Capture microphone audio using getUserMedia with noise suppression and echo cancellation.\n4. Connection State: Handle disconnected, failed, and reconnecting network transitions.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-webrtc-audio-streaming",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-opentelemetry-tracing",
    "slug": "opentelemetry-distributed-tracing-jaeger",
    "title": "OpenTelemetry Distributed Tracing & Metric Instrumenter",
    "description": "Instruments microservices with OpenTelemetry SDK, context propagation across HTTP boundaries, custom span attributes, and Jaeger exporters.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 325,
    "modelCompatibility": [
      "Cursor",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "opentelemetry",
      "observability",
      "tracing",
      "sre",
      "monitoring"
    ],
    "content": "You are an Observability & SRE Engineer.\nConfigure OpenTelemetry tracing for a ${serviceType} microservice in ${language}.\n\nTasks:\n1. Tracer Provider: Initialize TracerProvider with BatchSpanProcessor and OTLP gRPC/HTTP exporter.\n2. Context Propagation: Propagate W3C TraceContext (traceparent) across outgoing HTTP calls.\n3. Custom Spans: Wrap critical business transactions with custom spans and semantic attributes for ${spanAttributes}.\n4. Error Recording: Record exception details and set span status to StatusCode.ERROR on failure.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-opentelemetry-tracing",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-micro-frontend-federation",
    "slug": "micro-frontend-module-federation-webpack",
    "title": "Micro-Frontend Module Federation & Shared State",
    "description": "Architects scalable micro-frontend architectures using Module Federation, versioned shared dependencies, and isolated CSS scoping.",
    "category": "CODING",
    "type": "CODE",
    "author": "TRIHEX Engineering",
    "votes": 285,
    "modelCompatibility": [
      "Cursor",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "micro-frontends",
      "module-federation",
      "webpack",
      "react",
      "architecture"
    ],
    "content": "You are an Enterprise Frontend Architect.\nDesign a Module Federation micro-frontend architecture for host app: ${hostAppName}.\n\nSpecifications:\n1. Module Federation Plugin: Expose remote component ${remoteComponent} and consume in Host container.\n2. Shared Dependencies: Share react, react-dom with singleton: true and requiredVersion constraints.\n3. Error Boundaries: Wrap federated remotes with fallback UI so remote downtime does not break host page.\n4. State Sharing: Establish shared event bus or lightweight global state.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-micro-frontend-federation",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-midjourney-product-photography",
    "slug": "midjourney-v7-commercial-product-photography",
    "title": "Midjourney v7 Commercial Studio Product Photography",
    "description": "Generates photorealistic commercial studio product photography with precise lighting, depth of field, reflective surfaces, and clean backdrops.",
    "category": "IMAGE_VIDEO",
    "type": "IMAGE",
    "author": "TRIHEX Creative Studio",
    "votes": 490,
    "modelCompatibility": [
      "Midjourney v6",
      "Midjourney v7",
      "Flux.1 Pro"
    ],
    "tags": [
      "midjourney",
      "photography",
      "commercial",
      "e-commerce",
      "lighting"
    ],
    "content": "Commercial product photography of ${productName}, positioned elegantly on a ${podiumSurfaceMaterial} podium.\nStudio lighting with a softbox key light at 45 degrees, subtle rim lighting emphasizing the sleek contours, and minimal caustic reflections.\nBackground: ${backdropStyle} in smooth matte gradient, ultra-high resolution 8K, shot on Hasselblad H6D-100c with 100mm f/2.8 macro lens, photorealistic textures, clean composition, crisp focus, commercial award-winning advertising quality --ar 1:1 --v 6.1 --style raw --q 2",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-midjourney-product-photography",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-midjourney-tech-infographic",
    "slug": "midjourney-isometric-tech-architecture-infographic",
    "title": "Midjourney Isometric Cloud Architecture Infographic",
    "description": "Produces crisp, futuristic 3D isometric cutaway diagrams of datacenters, software pipelines, and microservices with glowing neon pathways.",
    "category": "IMAGE_VIDEO",
    "type": "IMAGE",
    "author": "TRIHEX Creative Studio",
    "votes": 380,
    "modelCompatibility": [
      "Midjourney v6",
      "Flux.1 Pro"
    ],
    "tags": [
      "midjourney",
      "isometric",
      "infographic",
      "cloud",
      "architecture"
    ],
    "content": "Detailed 3D isometric cutaway diagram of ${infrastructureSystemName}.\nFeaturing miniature floating server racks, glowing fiber-optic data highways in cyan and violet, glass data cubes, and holographic metrics displays.\nAesthetic: Futuristic clean cyberpunk architecture, soft ambient occlusion, matte metallic surfaces, crisp edges, tech keynote illustration style, rendered in Cinema 4D and Octane Render, clean dark background --ar 16:9 --v 6.1",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-midjourney-tech-infographic",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-flux-character-consistency",
    "slug": "flux-lora-character-consistency-studio",
    "title": "Flux.1 Character Consistency & Studio Portraiture",
    "description": "Directs photorealistic portrait generations maintaining facial feature consistency across varied poses, expressions, and lighting setups.",
    "category": "IMAGE_VIDEO",
    "type": "IMAGE",
    "author": "TRIHEX Creative Studio",
    "votes": 430,
    "modelCompatibility": [
      "Flux.1 Dev",
      "Flux.1 Pro",
      "Stable Diffusion XL"
    ],
    "tags": [
      "flux",
      "portrait",
      "character-design",
      "photorealism",
      "lighting"
    ],
    "content": "High-fashion editorial portrait of ${characterDescription}, wearing ${wardrobeStyle}.\nFacial expression: ${facialExpression}, with genuine skin pores, micro-textures, and natural subsurface scattering.\nLighting: Rembrandt lighting setup, soft catchlights in the eyes, dramatic shadow roll-off.\nCamera: Canon EOS R5 with 85mm f/1.2 lens, shallow depth of field, creamy bokeh, cinematic film color grade, Kodak Portra 400 tone, photorealistic, no airbrushing.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-flux-character-consistency",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-sora-kling-cinematic-video",
    "slug": "sora-kling-4k-cinematic-video-prompt",
    "title": "Sora & Kling Cinematic 4K Video Sequence Directing",
    "description": "Structures professional cinematic video generation prompts detailing camera movement, focal length, volumetric lighting, and physical dynamics.",
    "category": "IMAGE_VIDEO",
    "type": "VIDEO",
    "author": "TRIHEX Creative Studio",
    "votes": 460,
    "modelCompatibility": [
      "Sora",
      "Kling 1.5",
      "Runway Gen-3 Alpha"
    ],
    "tags": [
      "video",
      "sora",
      "kling",
      "cinematography",
      "ai-video"
    ],
    "content": "Cinematic drone establishing shot tracking forward at high speed over ${sceneLocation}.\nCamera Movement: Slow push-in dolly forward with a gradual 15-degree clockwise tilt, maintaining dynamic focal tracking on ${subjectAction}.\nAtmosphere: Volumetric fog pierced by golden hour sunlight beams, realistic wind turbulence rippling through ${environmentalElements}.\nMotion Physics: Photorealistic fluid motion, natural cloth physics, 24fps motion blur, 35mm anamorphic lens flare, photorealistic color grade, high temporal consistency.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-sora-kling-cinematic-video",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-runway-camera-directing",
    "slug": "runway-gen3-camera-movement-parallax",
    "title": "Runway Gen-3 Camera Movement & Parallax Director",
    "description": "Crafts precise prompt syntax for Runway Gen-3 Alpha incorporating pan, zoom, orbit, and dramatic foreground-background parallax shifts.",
    "category": "IMAGE_VIDEO",
    "type": "VIDEO",
    "author": "TRIHEX Creative Studio",
    "votes": 350,
    "modelCompatibility": [
      "Runway Gen-3 Alpha",
      "Luma Dream Machine"
    ],
    "tags": [
      "runway",
      "camera-movement",
      "cinematography",
      "video-editing"
    ],
    "content": "Camera Motion: [Camera: Orbit Left] [Speed: Smooth Slow] [Focus: Sharp Rack Focus].\nThe camera smoothly orbits around ${subjectName} while the background of ${backgroundSetting} shifts with pronounced optical parallax.\nVisual Details: Ultra-crisp photorealistic rendering, accurate reflections on wet asphalt, volumetric dusk lighting, 4K resolution, cinematic masterpiece.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-runway-camera-directing",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-elevenlabs-voice-persona",
    "slug": "elevenlabs-custom-voice-actor-persona",
    "title": "ElevenLabs Voice Actor Persona & Cadence Sculptor",
    "description": "Designs lifelike ElevenLabs voice descriptions, stability/similarity sliders, pacing cues, and emotional tonality for natural voice cloning.",
    "category": "IMAGE_VIDEO",
    "type": "TEXT",
    "author": "TRIHEX Creative Studio",
    "votes": 395,
    "modelCompatibility": [
      "ElevenLabs Multilingual v2",
      "ElevenLabs Flash"
    ],
    "tags": [
      "elevenlabs",
      "voice-synthesis",
      "audio",
      "podcasting",
      "narration"
    ],
    "content": "You are an Audio Production Director specializing in ElevenLabs generative voice tuning.\nDesign a complete voice persona profile for: ${personaName}.\n\nProfile Elements:\n1. Acoustic Profile: Tone (e.g. resonant baritone, warm contralto), age range, vocal fry, and subtle breathiness.\n2. Regional Accent: Specific regional dialect inflection: ${accentRegion}.\n3. Sliders: Recommended Stability, Similarity, Style Exaggeration, and Speaker Boost values for ElevenLabs Studio.\n4. SSML Script: 60-second test script formatted with [pause], [emphasis], and emotional cadence tags.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-elevenlabs-voice-persona",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-sdxl-inpainting",
    "slug": "stable-diffusion-xl-inpainting-compositing",
    "title": "SDXL Inpainting & Background Compositing Director",
    "description": "Generates high-precision mask descriptions and fill prompts for SDXL inpainting, ensuring seamless edge blending and matching lighting vectors.",
    "category": "IMAGE_VIDEO",
    "type": "IMAGE",
    "author": "TRIHEX Creative Studio",
    "votes": 290,
    "modelCompatibility": [
      "Stable Diffusion XL",
      "Fooocus",
      "ComfyUI"
    ],
    "tags": [
      "sdxl",
      "inpainting",
      "compositing",
      "image-editing"
    ],
    "content": "Inpainting prompt for masked region: Replace ${maskedTarget} with ${newElementDescription}.\nLighting Match: Ensure shadow angles match the primary light source arriving from ${lightDirection} at ${colorTemperature}K.\nTexture Integration: Seamless border blending with surrounding ${adjacentTextureMaterial}, preserving natural grain and lens distortion. Denoising strength: 0.65, steps: 35.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-sdxl-inpainting",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-ugc-video-scripts",
    "slug": "tiktok-reels-ugc-video-ad-script",
    "title": "Viral TikTok & Reels UGC Video Ad Scriptwriter",
    "description": "Writes high-converting 30-second UGC video ad scripts with viral 3-second hooks, relatable problem agitation, product reveal, and clear CTA.",
    "category": "IMAGE_VIDEO",
    "type": "VIDEO",
    "author": "TRIHEX Creative Studio",
    "votes": 470,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "GPT-4o"
    ],
    "tags": [
      "ugc",
      "tiktok",
      "reels",
      "video-scripts",
      "marketing",
      "ecommerce"
    ],
    "content": "You are a Direct-Response Creative Director specializing in TikTok & Instagram Reels UGC video ads.\nWrite a high-converting 30-second video ad script for product: ${productName}.\n\nScript Structure:\n1. 0-3s (Visual & Verbal Hook): 3 alternative pattern-interrupt hooks addressing ${painPoint}.\n2. 3-12s (Agitation): Relatable handheld selfie-style explanation of why traditional solutions failed.\n3. 12-22s (Solution Reveal): Natural unboxing or screen demonstration showing ${keyFeature}.\n4. 22-30s (Irresistible Offer & CTA): Limited-time incentive with on-screen text instructions to click link in bio.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-ugc-video-scripts",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-spline-3d-director",
    "slug": "spline-3d-interactive-web-animation",
    "title": "Spline 3D Interactive Web Animation Directing",
    "description": "Directs interactive 3D web animations with mouse-hover hover states, physics buoyancy, materials, and WebGL performance optimization.",
    "category": "IMAGE_VIDEO",
    "type": "TEXT",
    "author": "TRIHEX Creative Studio",
    "votes": 260,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "GPT-4o"
    ],
    "tags": [
      "spline",
      "3d",
      "webgl",
      "animation",
      "interactive"
    ],
    "content": "Design an interactive 3D scene in Spline for: ${webSectionName}.\n\nScene Architecture:\n1. Hero Mesh: 3D geometry of ${objectGeometry} with glassmorphic or holographic material properties.\n2. Lighting: Key directional light with colored rim spotlights in ${accentColors}.\n3. Interactions: Mouse look parallax event, scroll-triggered rotational timeline, and spring physics click reaction.\n4. Optimization: Low-polygon mesh count and reduced texture compression targeting 60fps on mobile browsers.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-spline-3d-director",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-vector-iconography",
    "slug": "vector-iconography-brand-identity-system",
    "title": "Minimalist Vector Iconography & Brand System",
    "description": "Creates cohesive, scalable vector icon set descriptions with uniform stroke weights, 24px bounding boxes, and modern dual-tone fills.",
    "category": "IMAGE_VIDEO",
    "type": "IMAGE",
    "author": "TRIHEX Creative Studio",
    "votes": 310,
    "modelCompatibility": [
      "Midjourney v6",
      "Flux.1 Pro"
    ],
    "tags": [
      "vector",
      "icons",
      "brand-identity",
      "design-system",
      "svg"
    ],
    "content": "A cohesive set of 6 modern vector icons for ${featureDomain}.\nDesigned on a strict 24x24 pixel grid with uniform 2px stroke width, rounded caps and corners.\nDual-tone style: ${primaryBrandColor} strokes with subtle 15% opacity tint fills.\nWhite background, isolated, crisp SVG geometry, modern tech UI design system standard --v 6.1 --style raw",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-vector-iconography",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-album-artwork",
    "slug": "spotify-album-cover-typography-artwork",
    "title": "Spotify Album Artwork & Typographic Layout",
    "description": "Generates evocative musical album cover art tailored to specific music genres with complementary typography and atmospheric textures.",
    "category": "IMAGE_VIDEO",
    "type": "IMAGE",
    "author": "TRIHEX Creative Studio",
    "votes": 280,
    "modelCompatibility": [
      "Midjourney v6",
      "Flux.1 Pro"
    ],
    "tags": [
      "album-art",
      "music",
      "typography",
      "graphic-design"
    ],
    "content": "Album cover artwork for music genre: ${musicGenre}, album titled \"${albumTitle}\".\nVisual Theme: ${visualThemeDescription}.\nArt Direction: Analog film grain, halftone print textures, minimalist Swiss typography layout, evocative color palette in ${colorPalette}. High-res 3000x3000px square format --ar 1:1 --v 6.1",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-album-artwork",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-unreal-engine-archviz",
    "slug": "unreal-engine-5-archviz-photorealism",
    "title": "Unreal Engine 5 Architectural ArchViz Visualization",
    "description": "Produces photorealistic architectural interior/exterior renderings with Lumen global illumination, Nanite geometry, and luxury materials.",
    "category": "IMAGE_VIDEO",
    "type": "IMAGE",
    "author": "TRIHEX Creative Studio",
    "votes": 340,
    "modelCompatibility": [
      "Midjourney v6",
      "Flux.1 Pro"
    ],
    "tags": [
      "archviz",
      "unreal-engine",
      "architecture",
      "interior-design",
      "lumen"
    ],
    "content": "Photorealistic architectural rendering of ${architecturalSpaceType}.\nDesigned in modern brutalist/minimalist aesthetic with poured concrete, fluted white oak timber, and floor-to-ceiling glass.\nLumen global illumination simulation: Sunlight pouring through sheer curtains, soft diffuse bounce light, realistic material roughness.\nShot on Arri Alexa with 24mm tilt-shift architectural lens, clean lines, luxury magazine editorial standard --ar 16:9 --v 6.1",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-unreal-engine-archviz",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-ecommerce-hero-banner",
    "slug": "ecommerce-hero-banner-compositing",
    "title": "E-Commerce Hero Promotional Banner Compositing",
    "description": "Composes high-impact commercial header banners with balanced copy space, floating product assets, and dynamic lighting gradients.",
    "category": "IMAGE_VIDEO",
    "type": "IMAGE",
    "author": "TRIHEX Creative Studio",
    "votes": 320,
    "modelCompatibility": [
      "Midjourney v6",
      "Flux.1 Pro"
    ],
    "tags": [
      "ecommerce",
      "banner",
      "advertising",
      "compositing",
      "web-design"
    ],
    "content": "Wide panoramic e-commerce hero web banner for ${productCategory}.\nFeaturing ${heroProductDescription} suspended in dynamic zero-gravity with subtle geometric accent rings.\nAmple negative space on the ${copyPlacementSide} side for headline and call-to-action buttons.\nModern clean tech gradient background in ${brandGradients}, commercial advertising standard, sharp focus --ar 21:9 --v 6.1",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-ecommerce-hero-banner",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-cyberpunk-game-tiles",
    "slug": "cyberpunk-isometric-game-tile-map",
    "title": "Cyberpunk Isometric Game Tile Map Generator",
    "description": "Generates modular isometric 2D game tile assets including neon rooftops, cybernetic alleyways, and holographic vending machines.",
    "category": "IMAGE_VIDEO",
    "type": "IMAGE",
    "author": "TRIHEX Creative Studio",
    "votes": 275,
    "modelCompatibility": [
      "Midjourney v6",
      "Flux.1 Pro"
    ],
    "tags": [
      "game-design",
      "isometric",
      "cyberpunk",
      "tilemap",
      "gamedev"
    ],
    "content": "Modular 2.5D isometric game tile map of a cyberpunk ${districtType}.\nFeaturing rain-slicked concrete, neon Japanese signage in magenta and cyan, steam vents, and futuristic conduits.\nSeamless tileable boundaries, crisp pixel-perfect line art, clean game asset aesthetic on neutral background --ar 1:1 --v 6.1",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-cyberpunk-game-tiles",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-food-photography",
    "slug": "commercial-food-beverage-photography",
    "title": "Commercial Food & Beverage Studio Photography",
    "description": "Directs mouth-watering culinary photography with specular liquid highlights, rising steam, macro food textures, and rustic surfaces.",
    "category": "IMAGE_VIDEO",
    "type": "IMAGE",
    "author": "TRIHEX Creative Studio",
    "votes": 360,
    "modelCompatibility": [
      "Midjourney v6",
      "Flux.1 Pro"
    ],
    "tags": [
      "food-photography",
      "culinary",
      "commercial",
      "macro",
      "lighting"
    ],
    "content": "Gourmet culinary photography of ${dishName}.\nPresented on a rustic ${platterMaterial} board with fresh garnish and scattered sea salt crystals.\nLighting: Backlit with soft golden rim light capturing delicate rising steam and glistening glaze textures.\nMacro focus with Sony A7R V and 90mm f/2.8 lens, shallow depth of field, vibrant appetizing colors, Michelin guide standard --ar 4:3 --v 6.1",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-food-photography",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-drone-flyover",
    "slug": "cinematic-drone-flyover-nature-script",
    "title": "Cinematic 8K Drone Flyover Landscape Script",
    "description": "Structures breathtaking aerial nature cinematography prompts covering Himalayan peaks, river valleys, and sweeping coastal ridges.",
    "category": "IMAGE_VIDEO",
    "type": "VIDEO",
    "author": "TRIHEX Creative Studio",
    "votes": 390,
    "modelCompatibility": [
      "Sora",
      "Kling 1.5",
      "Runway Gen-3 Alpha"
    ],
    "tags": [
      "drone",
      "aerial",
      "cinematography",
      "nature",
      "nepal"
    ],
    "content": "Ultra-wide cinematic aerial drone shot gliding through ${geographicLocation}.\nCamera Movement: Fast forward skimming 50 meters above ${foregroundTerrain}, sweeping forward as morning cloud inversions unveil towering sunlit snow peaks.\nLighting: Dawn alpine glow with warm golden rays piercing through sub-zero glacial mist.\nHyper-realistic motion dynamics, 8K resolution, IMAX documentary scale, smooth stabilization.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-drone-flyover",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-keynote-presentation-visuals",
    "slug": "apple-style-tech-keynote-presentation-visuals",
    "title": "Apple-Style Keynote Presentation Slide Visuals",
    "description": "Designs ultra-minimalist, high-impact presentation slide backgrounds and product feature cards in the signature modern tech keynote aesthetic.",
    "category": "IMAGE_VIDEO",
    "type": "IMAGE",
    "author": "TRIHEX Creative Studio",
    "votes": 310,
    "modelCompatibility": [
      "Midjourney v6",
      "Flux.1 Pro"
    ],
    "tags": [
      "presentation",
      "keynote",
      "minimalist",
      "tech",
      "slides"
    ],
    "content": "Ultra-minimalist technology keynote slide visual illustrating concept: \"${techConcept}\".\nFeaturing a single pristine abstract glass sphere refracting soft multi-color laser light into a dark slate void.\nAesthetic: Jony Ive industrial design minimalism, clean typography space, subtle ambient glow, high-end Silicon Valley product announcement standard --ar 16:9 --v 6.1",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-keynote-presentation-visuals",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-uiux-glassmorphic-mockup",
    "slug": "uiux-glassmorphism-dashboard-mockup",
    "title": "Glassmorphic Web & Mobile UI Dashboard Mockup",
    "description": "Produces sophisticated frosted-glass UI mockups with glowing accent graphs, micro-interactions, and high-contrast typography.",
    "category": "IMAGE_VIDEO",
    "type": "IMAGE",
    "author": "TRIHEX Creative Studio",
    "votes": 370,
    "modelCompatibility": [
      "Midjourney v6",
      "Flux.1 Pro"
    ],
    "tags": [
      "uiux",
      "glassmorphism",
      "dashboard",
      "figma",
      "web-design"
    ],
    "content": "Futuristic analytics dashboard user interface for ${industryType}.\nRendered in frosted glassmorphism cards with subtle 1px border highlights, neon gradient area charts, and clean metric counters.\nFloating in slight perspective over a dark deep-blue spatial background, crisp Figma UI showcase presentation --ar 16:10 --v 6.1",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-uiux-glassmorphic-mockup",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-botanical-line-art",
    "slug": "minimalist-botanical-line-art-illustration",
    "title": "Minimalist Botanical Continuous Line Art",
    "description": "Generates graceful continuous one-line botanical illustrations with organic earth-tone watercolor washes on textured cotton paper.",
    "category": "IMAGE_VIDEO",
    "type": "IMAGE",
    "author": "TRIHEX Creative Studio",
    "votes": 240,
    "modelCompatibility": [
      "Midjourney v6",
      "Flux.1 Pro"
    ],
    "tags": [
      "botanical",
      "line-art",
      "illustration",
      "minimalist",
      "watercolor"
    ],
    "content": "Minimalist continuous line art illustration of ${plantName}.\nSingle unbroken black ink stroke with soft organic watercolor wash in ${earthToneColor}.\nOff-white handmade cotton paper texture, deckled edges, Scandinavian gallery print aesthetic, clean and elegant --ar 3:4 --v 6.1",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-botanical-line-art",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-anime-action-scene",
    "slug": "shonen-anime-dynamic-action-frame",
    "title": "Shonen Anime Dynamic Sakuga Action Frame",
    "description": "Directs high-octane anime animation keyframes with dynamic Dutch angles, lightning effects, motion smears, and Studio MAPPA art style.",
    "category": "IMAGE_VIDEO",
    "type": "IMAGE",
    "author": "TRIHEX Creative Studio",
    "votes": 345,
    "modelCompatibility": [
      "Midjourney v6",
      "Niji v6"
    ],
    "tags": [
      "anime",
      "sakuga",
      "action",
      "animation",
      "manga"
    ],
    "content": "Dynamic sakuga animation frame of ${characterType} unleashing ${specialMoveName}.\nExtreme low-angle dynamic perspective, intense impact frames, crackling electric aura, motion blur streaks.\nArt Style: Modern Studio MAPPA / Ufotable anime production, cinematic lighting, sharp ink linework, vibrant high-contrast cel shading --ar 16:9 --niji 6",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-anime-action-scene",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-vaporwave-retro-synth",
    "slug": "vaporwave-retro-80s-synthwave-poster",
    "title": "80s Retro Synthwave & Vaporwave Poster",
    "description": "Creates nostalgic 1980s synthwave posters featuring glowing wireframe grids, neon magenta sunsets, palm silhouettes, and sports cars.",
    "category": "IMAGE_VIDEO",
    "type": "IMAGE",
    "author": "TRIHEX Creative Studio",
    "votes": 290,
    "modelCompatibility": [
      "Midjourney v6",
      "Flux.1 Pro"
    ],
    "tags": [
      "synthwave",
      "vaporwave",
      "retro",
      "80s",
      "neon"
    ],
    "content": "Retro 1980s synthwave poster featuring ${vehicleOrSubject} speeding toward a glowing neon wireframe horizon.\nMassive striped magenta sun sinking into a digital sea, purple palm tree silhouettes, CRT scanline overlay, chrome typography.\nHigh-voltage 80s nostalgia, Outrun aesthetic, vibrant neon palette --ar 2:3 --v 6.1",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-vaporwave-retro-synth",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-fashion-editorial-cover",
    "slug": "editorial-fashion-magazine-cover",
    "title": "High-Fashion Editorial Magazine Cover",
    "description": "Generates avant-garde fashion photography featuring high-contrast haute couture styling, bold editorial makeup, and studio strobe lighting.",
    "category": "IMAGE_VIDEO",
    "type": "IMAGE",
    "author": "TRIHEX Creative Studio",
    "votes": 315,
    "modelCompatibility": [
      "Midjourney v6",
      "Flux.1 Pro"
    ],
    "tags": [
      "fashion",
      "editorial",
      "magazine",
      "portrait",
      "couture"
    ],
    "content": "Editorial fashion cover portrait of a model styled in avant-garde ${designerStyle} collection.\nFeaturing architectural silhouette in ${garmentFabric}, striking graphic eye makeup, and slicked sculptural hair.\nLighting: Sharp studio strobe with a silver beauty dish, pure white background, high contrast, Vogue magazine standard --ar 3:4 --v 6.1",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-fashion-editorial-cover",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-medical-cellular-3d",
    "slug": "scientific-medical-cellular-3d-visualization",
    "title": "Scientific Medical 3D Cellular & Molecular Visuals",
    "description": "Produces scientifically accurate 3D visualizations of cellular receptors, lipid nanoparticles, and DNA double helixes in scanning electron style.",
    "category": "IMAGE_VIDEO",
    "type": "IMAGE",
    "author": "TRIHEX Creative Studio",
    "votes": 280,
    "modelCompatibility": [
      "Midjourney v6",
      "Flux.1 Pro"
    ],
    "tags": [
      "medical",
      "scientific",
      "cellular",
      "biology",
      "3d-render"
    ],
    "content": "Scientific 3D medical visualization of ${biologicalStructure}.\nShowing detailed protein receptors, lipid membrane bilayer, and molecular binding interactions.\nLighting: Scanning electron microscopy style with false-color fluorescent highlighting in emerald green and electric indigo.\nPhotorealistic depth of field, micro-scale focus, scientific journal cover quality --ar 16:9 --v 6.1",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-medical-cellular-3d",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-scifi-vehicle-concept",
    "slug": "futuristic-scifi-vehicle-concept-art",
    "title": "Futuristic Sci-Fi Exploration Vehicle Concept Art",
    "description": "Designs industrial science-fiction rovers, spaceships, and planetary exploration vehicles with authentic mechanical functional details.",
    "category": "IMAGE_VIDEO",
    "type": "IMAGE",
    "author": "TRIHEX Creative Studio",
    "votes": 310,
    "modelCompatibility": [
      "Midjourney v6",
      "Flux.1 Pro"
    ],
    "tags": [
      "scifi",
      "concept-art",
      "vehicle",
      "industrial-design",
      "spaceships"
    ],
    "content": "Industrial concept art of a rugged planetary exploration rover designed for ${planetEnvironment}.\nFeaturing heavy-duty omnidirectional tread wheels, modular scientific sensor turrets, and weathered composite armor plating.\nDust storm swirling across martian terrain, hard sunlight casting sharp mechanical shadows, Syd Mead concept design aesthetic --ar 16:9 --v 6.1",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-scifi-vehicle-concept",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-lowpoly-game-assets",
    "slug": "low-poly-mobile-game-isometric-assets",
    "title": "Stylized Low-Poly Mobile Game Isometric Assets",
    "description": "Produces charming stylized low-poly 3D game models with clean flat-shaded pastel palettes, perfect for Unity or Godot mobile games.",
    "category": "IMAGE_VIDEO",
    "type": "IMAGE",
    "author": "TRIHEX Creative Studio",
    "votes": 265,
    "modelCompatibility": [
      "Midjourney v6",
      "Flux.1 Pro"
    ],
    "tags": [
      "low-poly",
      "gamedev",
      "mobile-game",
      "assets",
      "isometric"
    ],
    "content": "Stylized low-poly 3D game asset of a ${buildingOrProp}.\nFlat shaded polygons, pastel color palette in ${colorTheme}, soft ambient occlusion, cute isometric perspective.\nRendered in Blender Cycles, isolated on a clean solid background, mobile game ready --ar 1:1 --v 6.1",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-lowpoly-game-assets",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-phd-literature-review",
    "slug": "phd-academic-literature-review-matrix",
    "title": "PhD Academic Literature Review & Synthesis Matrix",
    "description": "Synthesizes scientific literature into theoretical taxonomy matrices, identified research gaps, and APA 7th structured citations.",
    "category": "STUDY_RESEARCH",
    "type": "TEXT",
    "author": "TRIHEX Research Lab",
    "votes": 490,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "DeepSeek-R1",
      "GPT-4o"
    ],
    "tags": [
      "academic",
      "literature-review",
      "phd",
      "research",
      "synthesis"
    ],
    "content": "You are a Senior Academic Researcher and Peer Reviewer.\nSynthesize the current academic literature regarding: ${researchTopic}.\n\nProduce:\n1. Conceptual Taxonomy: Key theoretical paradigms and seminal papers.\n2. Comparative Analysis Matrix (Table):\n   - Authors & Year\n   - Core Theoretical Construct\n   - Methodology (Empirical, Qualitative, Meta-analysis, Sample size)\n   - Primary Findings & Limitations\n3. Critical Gaps Analysis: Identify 3 unaddressed questions or conflicting results in the field.\n4. Proposed Future Research Agenda: 2 high-impact hypothesis questions suitable for empirical investigation.\n\nField of Study: ${discipline}\nSpecific Focus: ${researchTopic}\nKey Authors or Papers to Include: ${keyAuthors}",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-phd-literature-review",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-statistical-auditor",
    "slug": "empirical-statistical-hypothesis-test-auditor",
    "title": "Empirical Statistical Hypothesis Test & p-Value Auditor",
    "description": "Audits empirical research methodology, checking for p-hacking, statistical power violations, multicollinearity, and regression model misspecification.",
    "category": "STUDY_RESEARCH",
    "type": "TEXT",
    "author": "TRIHEX Research Lab",
    "votes": 380,
    "modelCompatibility": [
      "DeepSeek-R1",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "statistics",
      "data-analysis",
      "econometrics",
      "p-value",
      "audit"
    ],
    "content": "You are an Econometrician and Statistical Reviewer.\nAudit the following statistical methodology and regression results:\n\nStudy Hypothesis: ${hypothesis}\nSample Size: ${sampleSize}\nModel Specification: ${regressionEquation}\nReported Coefficients & p-Values:\n${statisticalOutput}\n\nAudit Checklist:\n1. Power & Sample Validity: Check if sample size is adequate for proposed effect sizes.\n2. Endogeneity & Confounders: Identify omitted variable bias or reverse causality risks.\n3. Diagnostic Tests: Check multicollinearity (VIF), heteroskedasticity (Breusch-Pagan), and autocorrelation (Durbin-Watson).\n4. Recommendation: Suggest robust standard errors or instrumental variables (IV) where appropriate.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-statistical-auditor",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-prisma-meta-analysis",
    "slug": "systematic-meta-analysis-prisma-protocol",
    "title": "Systematic Review & Meta-Analysis PRISMA Protocol",
    "description": "Formulates a complete PRISMA 2020 compliant protocol including PICO framework, inclusion/exclusion criteria, and risk of bias assessment.",
    "category": "STUDY_RESEARCH",
    "type": "TEXT",
    "author": "TRIHEX Research Lab",
    "votes": 340,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "DeepSeek-R1"
    ],
    "tags": [
      "prisma",
      "meta-analysis",
      "systematic-review",
      "medicine",
      "research"
    ],
    "content": "You are a Clinical Epidemiologist and Meta-Analysis Specialist.\nFormulate a PRISMA 2020 systematic review protocol for topic: ${researchQuestion}.\n\nDeliverables:\n1. PICO Framework: Population, Intervention, Comparator, and Outcomes definition.\n2. Search Strategy: Comprehensive Boolean search strings for PubMed, Scopus, and Cochrane Library.\n3. Eligibility Criteria: Strict inclusion and exclusion parameters.\n4. Risk of Bias Tool: Select and outline evaluation steps using Cochrane RoB 2 or ROBINS-I.\n5. Synthesis Plan: Fixed vs Random-effects model selection criteria and I² heterogeneity thresholds.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-prisma-meta-analysis",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-thematic-coding",
    "slug": "qualitative-thematic-coding-grounded-theory",
    "title": "Qualitative Thematic Coding & Grounded Theory Analyst",
    "description": "Analyzes interview transcripts and field notes using inductive open, axial, and selective coding to construct a grounded theoretical model.",
    "category": "STUDY_RESEARCH",
    "type": "TEXT",
    "author": "TRIHEX Research Lab",
    "votes": 310,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "GPT-4o"
    ],
    "tags": [
      "qualitative",
      "grounded-theory",
      "thematic-analysis",
      "interviews"
    ],
    "content": "You are a Qualitative Research Methodologist.\nConduct an inductive thematic analysis on the interview excerpt below regarding: ${phenomenon}.\n\nTranscript Text:\n${transcriptData}\n\nCoding Protocol:\n1. Open Coding: Extract 5 core initial codes with illustrative verbatim quotes.\n2. Axial Coding: Cluster open codes into 2 higher-level theoretical categories.\n3. Selective Coding: Articulate the overarching core narrative connecting all categories.\n4. Reflexivity & Validity: Note potential researcher confirmation biases to guard against.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-thematic-coding",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-forensic-audit",
    "slug": "financial-statement-forensic-audit-benford",
    "title": "Financial Statement Forensic Audit & Fraud Detector",
    "description": "Analyzes balance sheets, cash flows, and income statements for earnings manipulation, aggressive revenue recognition, and Beneish M-Score flags.",
    "category": "STUDY_RESEARCH",
    "type": "TEXT",
    "author": "TRIHEX Research Lab",
    "votes": 420,
    "modelCompatibility": [
      "DeepSeek-R1",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "finance",
      "forensic-audit",
      "accounting",
      "fraud-detection",
      "investing"
    ],
    "content": "You are a Senior Forensic Auditor and Chartered Financial Analyst (CFA).\nAnalyze the financial reports for: ${companyName}.\n\nFinancial Data:\n${financialStatementsSummary}\n\nForensic Checklist:\n1. Quality of Earnings: Compare Operating Cash Flow against Reported Net Income (Cash-to-Income Divergence).\n2. Working Capital Red Flags: Days Sales Outstanding (DSO) and Inventory Turnover abnormalities.\n3. Beneish M-Score Assessment: Estimate risk of earnings manipulation based on gross margin and asset quality metrics.\n4. Off-Balance Sheet Liabilities: Identify undisclosed operating leases or contingent liabilities.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-forensic-audit",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-dcf-valuation",
    "slug": "discounted-cash-flow-valuation-sensitivity",
    "title": "Discounted Cash Flow (DCF) Valuation & Sensitivity Model",
    "description": "Constructs rigorous DCF financial models calculating WACC, unlevered free cash flows, terminal value, and two-variable sensitivity matrices.",
    "category": "STUDY_RESEARCH",
    "type": "TEXT",
    "author": "TRIHEX Research Lab",
    "votes": 390,
    "modelCompatibility": [
      "DeepSeek-R1",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "valuation",
      "dcf",
      "finance",
      "investing",
      "wacc"
    ],
    "content": "You are an Investment Banking Valuation Associate.\nBuild a Discounted Cash Flow (DCF) model for: ${businessName}.\n\nFinancial Inputs:\nCurrent Revenue: ${currentRevenue}\nExpected 5-Year CAGR: ${growthRate}\nEBITDA Margin: ${ebitdaMargin}\nCapEx & Working Capital Rate: ${capexPercent}\nTax Rate: ${taxRate}\n\nDeliverables:\n1. Unlevered Free Cash Flow (UFCF) projections for Years 1 through 5.\n2. WACC Calculation: Cost of Equity (CAPM) and after-tax Cost of Debt.\n3. Terminal Value: Calculate via Perpetual Growth method and Exit Multiple method.\n4. Sensitivity Matrix: Enterprise Value across variations in WACC (+/- 1%) and Terminal Growth Rate (+/- 0.5%).",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-dcf-valuation",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-gdpr-compliance-audit",
    "slug": "regulatory-compliance-cross-border-data-audit",
    "title": "GDPR & Cross-Border Data Privacy Compliance Audit",
    "description": "Audits data collection architectures against GDPR, CCPA, and Nepal Privacy Act provisions, checking consent, DPIAs, and transfer mechanisms.",
    "category": "STUDY_RESEARCH",
    "type": "TEXT",
    "author": "TRIHEX Research Lab",
    "votes": 315,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "GPT-4o"
    ],
    "tags": [
      "compliance",
      "gdpr",
      "privacy",
      "legal",
      "data-governance"
    ],
    "content": "You are a Certified Information Privacy Professional (CIPP/E) and Data Protection Officer.\nAudit the following technical data flow for compliance with GDPR and relevant regional privacy acts:\n\nSystem Architecture:\n${dataFlowArchitecture}\n\nTypes of Personal Data Processed:\n${personalDataTypes}\n\nAudit Deliverables:\n1. Lawful Basis for Processing: Review consent vs legitimate interest justifications.\n2. Cross-Border Transfer Assessment: Review compliance with Standard Contractual Clauses (SCCs).\n3. Data Minimization & Retention: Identify excessive data storage patterns.\n4. Actionable Remediation Plan: 4 concrete steps to achieve compliance prior to regulator review.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-gdpr-compliance-audit",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-patent-prior-art",
    "slug": "patent-claim-prior-art-novelty-matrix",
    "title": "Patent Claim Prior Art & Novelty Matrix Examiner",
    "description": "Evaluates patent claims against prior art databases, constructing element-by-element anticipation and obviousness charts under 35 U.S.C. 102/103.",
    "category": "STUDY_RESEARCH",
    "type": "TEXT",
    "author": "TRIHEX Research Lab",
    "votes": 295,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "DeepSeek-R1"
    ],
    "tags": [
      "patents",
      "intellectual-property",
      "prior-art",
      "legal",
      "technology"
    ],
    "content": "You are a Registered Patent Attorney and Technical Examiner.\nConduct a novelty and obviousness evaluation for proposed invention: ${inventionTitle}.\n\nIndependent Claim:\n${patentClaimText}\n\nIdentified Prior Art Documents:\n${priorArtReferences}\n\nEvaluation Chart:\n1. Element-by-Element Claim Chart: Map each clause of the independent claim against elements found in Reference A and Reference B.\n2. Anticipation Analysis (35 U.S.C. 102): Determine if any single prior art reference discloses every element.\n3. Obviousness Analysis (35 U.S.C. 103): Assess if combining references would be obvious to a Person Having Ordinary Skill in the Art (PHOSITA).\n4. Claim Amendment Recommendation: Narrow the claim scope to establish clear patentable distinction.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-patent-prior-art",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-clinical-trial-protocol",
    "slug": "clinical-trial-protocol-inclusion-criteria",
    "title": "Clinical Trial Protocol & Inclusion Criteria Validator",
    "description": "Designs phase I-III clinical trial protocols with clear primary/secondary endpoints, randomized double-blind designs, and safety oversight.",
    "category": "STUDY_RESEARCH",
    "type": "TEXT",
    "author": "TRIHEX Research Lab",
    "votes": 275,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "DeepSeek-R1"
    ],
    "tags": [
      "medicine",
      "clinical-trials",
      "pharma",
      "biotech",
      "fda"
    ],
    "content": "You are a Clinical Development Medical Director.\nDesign a Phase ${trialPhase} clinical trial protocol for drug candidate: ${drugCandidate}.\n\nIndication: ${diseaseCondition}\nProposed Mechanism of Action: ${mechanismOfAction}\n\nProtocol Sections:\n1. Primary & Secondary Endpoints: Measurable clinical efficacy criteria.\n2. Patient Population: Detailed Inclusion and Exclusion criteria.\n3. Dosing & Administration: Treatment arms, placebo controls, and dose escalation design.\n4. Safety Monitoring: Adverse event reporting protocols and Data Safety Monitoring Board (DSMB) stopping rules.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-clinical-trial-protocol",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-geopolitical-risk",
    "slug": "geopolitical-risk-supply-chain-disruption",
    "title": "Geopolitical Risk & Critical Supply Chain Disruption Matrix",
    "description": "Models supply chain vulnerabilities across regional conflicts, trade tariffs, semiconductor chokepoints, and maritime corridor disruptions.",
    "category": "STUDY_RESEARCH",
    "type": "TEXT",
    "author": "TRIHEX Research Lab",
    "votes": 350,
    "modelCompatibility": [
      "DeepSeek-R1",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "geopolitics",
      "supply-chain",
      "risk-management",
      "logistics",
      "strategy"
    ],
    "content": "You are a Strategic Risk Intelligence Analyst.\nAssess geopolitical and supply chain vulnerabilities for industry sector: ${industrySector}.\n\nRegional Focus: ${geographicRegions}\nKey Dependencies: ${criticalInputsOrMaterials}\n\nAnalysis Framework:\n1. Chokepoint Identification: Physical and regulatory chokepoints (maritime straits, export restrictions, single-source suppliers).\n2. Threat Scenarios: 3 plausible geopolitical stress scenarios (trade embargo, regional conflict, critical infrastructure cyberattack).\n3. Impact Quantification: Operational downtime and margin degradation estimates.\n4. Mitigation Playbook: Dual-sourcing, nearshoring, and strategic inventory reserve strategies.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-geopolitical-risk",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-econometric-forecasting",
    "slug": "econometric-arima-garch-time-series-forecasting",
    "title": "Econometric Time-Series ARIMA & GARCH Forecaster",
    "description": "Guides empirical time-series forecasting, checking stationarity (ADF test), modeling ARIMA trends, and capturing volatility clustering via GARCH.",
    "category": "STUDY_RESEARCH",
    "type": "TEXT",
    "author": "TRIHEX Research Lab",
    "votes": 310,
    "modelCompatibility": [
      "DeepSeek-R1",
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "econometrics",
      "time-series",
      "forecasting",
      "arima",
      "garch"
    ],
    "content": "You are a Quantitative Financial Economist.\nFormulate a time-series forecasting specification for economic indicator: ${indicatorName}.\n\nTime Series Characteristics:\nFrequency: ${frequency}\nSample Period: ${samplePeriod}\n\nProtocol:\n1. Stationarity & Unit Root: Outline Augmented Dickey-Fuller (ADF) and KPSS testing protocols.\n2. Mean Equation: Select ARIMA(p,d,q) order using AIC/BIC minimization.\n3. Volatility Equation: If ARCH effects are present (Engle's ARCH test), specify GARCH(1,1) or EGARCH model.\n4. In-Sample Diagnostic Checks: Ljung-Box Q-test for residual autocorrelation and Jarque-Bera normality test.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-econometric-forecasting",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-environmental-impact",
    "slug": "environmental-impact-assessment-eia-report",
    "title": "Environmental Impact Assessment (EIA) Specialist",
    "description": "Structures EIA baseline reports evaluating watershed hydrology, carbon emissions, biodiversity loss, and community mitigation measures.",
    "category": "STUDY_RESEARCH",
    "type": "TEXT",
    "author": "TRIHEX Research Lab",
    "votes": 260,
    "modelCompatibility": [
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "eia",
      "environment",
      "sustainability",
      "infrastructure",
      "compliance"
    ],
    "content": "You are an Environmental Impact Assessment (EIA) Consultant.\nDevelop an environmental screening and mitigation matrix for project: ${projectName}.\n\nProject Location: ${projectLocation}\nProject Scope: ${projectScope}\n\nReport Sections:\n1. Baseline Environmental Conditions: Flora, fauna, watershed hydrology, and air quality baseline.\n2. Anticipated Impacts: Construction and operational phase environmental impacts.\n3. Environmental Management Plan (EMP): Concrete mitigation measures and green buffer allocations.\n4. Stakeholder & Public Consultation: Community engagement and grievance redressal mechanisms.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-environmental-impact",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-behavioral-nudge",
    "slug": "consumer-psychology-behavioral-nudge-designer",
    "title": "Behavioral Economics Choice Architecture & Nudge Designer",
    "description": "Applies behavioral economics principles (heuristics, framing, default effects, loss aversion) to increase user conversions ethically.",
    "category": "STUDY_RESEARCH",
    "type": "TEXT",
    "author": "TRIHEX Research Lab",
    "votes": 365,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "GPT-4o"
    ],
    "tags": [
      "behavioral-economics",
      "psychology",
      "ux",
      "conversion",
      "nudging"
    ],
    "content": "You are a Behavioral Scientist and Choice Architecture Consultant.\nDesign an ethical behavioral nudge strategy for user decision: ${targetDecision}.\n\nCurrent User Dropoff Point:\n${currentFlowDescription}\n\nBehavioral Interventions:\n1. Cognitive Friction Audit: Identify mental overhead or ambiguous choices in the current flow.\n2. Framing & Default Architecture: Restructure choices leveraging status quo bias and loss aversion ethically.\n3. Social Proof & Social Norms: Craft truthful peer benchmark notifications.\n4. Pre-Commitment Devices: Implement micro-commitments to reduce subsequent abandonment.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-behavioral-nudge",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-vc-investment-memo",
    "slug": "venture-capital-investment-memo-moat-analyzer",
    "title": "Venture Capital Investment Memo & Moat Analyzer",
    "description": "Synthesizes startup investment memos covering team defensibility, TAM expansion, unit economics, 7 Powers moats, and risk factors.",
    "category": "STUDY_RESEARCH",
    "type": "TEXT",
    "author": "TRIHEX Research Lab",
    "votes": 410,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "DeepSeek-R1"
    ],
    "tags": [
      "venture-capital",
      "startups",
      "investing",
      "memos",
      "due-diligence"
    ],
    "content": "You are a Partner at a Tier-1 Venture Capital Firm.\nDraft a rigorous Series A Investment Memo for startup: ${startupName}.\n\nCompany Information:\nSector: ${sector}\nTraction: ${tractionMetrics}\nAsking Valuation & Round Size: ${roundDetails}\n\nMemo Sections:\n1. Executive Summary & Investment Thesis: The non-consensus insight that makes this outlier potential.\n2. Market Size & Dynamics: Bottom-up TAM, SAM, and SOM calculations.\n3. Product & Technology Defensibility: Analysis under Hamilton Helmer's 7 Powers (Network Effects, Scale Economies, Switching Costs, etc.).\n4. Unit Economics: CAC, LTV, Payback period, and Net Revenue Retention (NRR).\n5. Key Risks & Mitigants: The top 3 failure modes and how leadership plans to navigate them.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-vc-investment-memo",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-survey-likert-scale",
    "slug": "cross-sectional-survey-likert-scale-balancer",
    "title": "Survey Design & Likert Scale Balancer Specialist",
    "description": "Designs psychometrically sound survey instruments, balancing positive/negative items, avoiding leading questions, and ensuring construct validity.",
    "category": "STUDY_RESEARCH",
    "type": "TEXT",
    "author": "TRIHEX Research Lab",
    "votes": 270,
    "modelCompatibility": [
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "survey-design",
      "psychometrics",
      "research-methods",
      "statistics"
    ],
    "content": "You are a Psychometrician and Survey Design Methodologist.\nCreate a validated questionnaire measuring construct: ${constructToMeasure}.\n\nTarget Audience: ${targetAudience}\n\nDesign Directives:\n1. Construct Operationalization: Define the theoretical sub-dimensions of the construct.\n2. Item Battery: 10 Likert-scale questions (5-point: Strongly Disagree to Strongly Agree).\n3. Reverse-Coded Items: Include 3 balanced reverse-scored items to prevent acquiescence bias.\n4. Bias Elimination: Review each question to ensure zero double-barreled phrasing, jargon, or leading tone.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-survey-likert-scale",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-archival-corroboration",
    "slug": "historical-archival-source-corroboration",
    "title": "Historical Archival Source Corroboration & Hermeneutics",
    "description": "Applies historical critical methodology to cross-examine primary sources, identify author biases, and verify timeline authenticity.",
    "category": "STUDY_RESEARCH",
    "type": "TEXT",
    "author": "TRIHEX Research Lab",
    "votes": 250,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "DeepSeek-R1"
    ],
    "tags": [
      "history",
      "hermeneutics",
      "archival",
      "critical-analysis"
    ],
    "content": "You are a Historical Research Scholar.\nEvaluate and cross-corroborate the following historical primary source document regarding: ${historicalEvent}.\n\nDocument Excerpt:\n${sourceText}\n\nAuthor & Provenance: ${authorContext}\n\nCritical Method:\n1. External Criticism: Evaluate physical provenance, dating consistency, and linguistic authenticity.\n2. Internal Criticism: Identify author's ideological biases, intended audience, and self-serving omissions.\n3. Corroboration: Compare claims against established independent secondary records.\n4. Synthesis: Articulate the verified historical facts versus unsubstantiated assertions.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-archival-corroboration",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-legal-contract-redline",
    "slug": "legal-contract-dispute-clause-redlining",
    "title": "B2B Legal Contract Risk Review & Redlining Advisor",
    "description": "Audits master service agreements (MSAs) and vendor contracts, redlining uncapped liabilities, indemnity clauses, and unfavorable IP terms.",
    "category": "STUDY_RESEARCH",
    "type": "TEXT",
    "author": "TRIHEX Research Lab",
    "votes": 430,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "DeepSeek-R1"
    ],
    "tags": [
      "legal",
      "contracts",
      "redlining",
      "risk-management",
      "b2b"
    ],
    "content": "You are a Commercial Corporate Attorney.\nReview and redline the following agreement clauses on behalf of ${representedParty}:\n\nContract Clause Text:\n${clauseText}\n\nAudit Checklist:\n1. Limitation of Liability: Ensure liabilities are capped to fees paid within the prior 12 months.\n2. Indemnification: Remove unilateral broad indemnities; restrict to third-party IP infringement.\n3. Intellectual Property Rights: Ensure custom deliverables assign work-product cleanly without transferring core pre-existing IP.\n4. Redlined Revision: Provide exact contractual redline text with bracketed additions and strikethrough omissions.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-legal-contract-redline",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-grant-proposal",
    "slug": "academic-grant-proposal-nsf-horizon-builder",
    "title": "Academic Research Grant Proposal Structurer (NSF / EU)",
    "description": "Structures competitive academic grant proposals emphasizing broader impacts, scientific methodology, data management plans, and milestones.",
    "category": "STUDY_RESEARCH",
    "type": "TEXT",
    "author": "TRIHEX Research Lab",
    "votes": 320,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "DeepSeek-R1"
    ],
    "tags": [
      "grant-writing",
      "funding",
      "academic",
      "nsf",
      "research"
    ],
    "content": "You are a Principal Investigator and Research Grant Reviewer.\nDraft an executive research grant proposal for funding body: ${fundingAgency}.\n\nProject Title: ${projectTitle}\nLead Institution: ${institutionName}\nTotal Funding Requested: ${budgetRequested}\n\nProposal Structure:\n1. Project Summary: Intellectual Merit and Broader Impacts summary.\n2. Specific Aims: 3 concrete, testable research aims with clear hypotheses.\n3. Research Strategy: Detailed experimental methodology, preliminary data integration, and potential pitfalls with alternative strategies.\n4. Timeline & Milestones: Quarterly work packages across the grant lifecycle.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-grant-proposal",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-boolean-search-builder",
    "slug": "systematic-literature-search-boolean-builder",
    "title": "Systematic Literature Search Boolean Query Architect",
    "description": "Constructs complex, exhaustive Boolean search queries using MeSH terms, truncation wildcards, and field tags for systematic database queries.",
    "category": "STUDY_RESEARCH",
    "type": "TEXT",
    "author": "TRIHEX Research Lab",
    "votes": 305,
    "modelCompatibility": [
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "boolean-search",
      "literature-review",
      "pubmed",
      "scopus",
      "research"
    ],
    "content": "You are a Medical Research Information Specialist and Medical Librarian.\nBuild comprehensive Boolean search strings across multiple academic databases for: ${researchQuestion}.\n\nKeywords and Synonyms:\n${conceptTerms}\n\nOutputs:\n1. PubMed Query: Formatted with Medical Subject Headings [MeSH] and title/abstract [tiab] field tags.\n2. Scopus Query: Formatted with TITLE-ABS-KEY syntax.\n3. Web of Science Query: Formatted with TS=(Topic) syntax.\n4. Precision vs Recall Optimization: Include wildcard asterisks (*) for inflections and quotation marks for exact phrases.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-boolean-search-builder",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-peer-review-rebuttal",
    "slug": "academic-peer-review-critique-rebuttal",
    "title": "Academic Peer Review Rebuttal Letter & Point-by-Point Responder",
    "description": "Formulates respectful, scientifically rigorous point-by-point rebuttal letters to journal reviewers, defending findings while addressing critique.",
    "category": "STUDY_RESEARCH",
    "type": "TEXT",
    "author": "TRIHEX Research Lab",
    "votes": 335,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "DeepSeek-R1"
    ],
    "tags": [
      "peer-review",
      "academic-publishing",
      "rebuttal",
      "research"
    ],
    "content": "You are an Academic Journal Editor and Senior Researcher.\nDraft a polite, comprehensive point-by-point response to reviewer comments on paper: \"${paperTitle}\".\n\nReviewer 1 Major Comments:\n${reviewerComments}\n\nAuthors' New Revisions / Additional Experiments:\n${authorRevisions}\n\nFormatting:\n- Address each comment sequentially with \"Reviewer Comment:\", followed by \"Author Response:\", followed by \"Changes in Manuscript [Page X, Lines Y-Z]:\".\n- Maintain a collaborative, grateful tone while providing robust empirical defense of core findings.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-peer-review-rebuttal",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-cold-b2b-outreach",
    "slug": "cold-b2b-email-outreach-high-conversion",
    "title": "High-Converting Cold B2B Email Outreach Specialist",
    "description": "Drafts hyper-personalized cold outreach emails with strong trigger events, zero sales fluff, clear value propositions, and low-friction CTAs.",
    "category": "MARKETING_SALES",
    "type": "TEXT",
    "author": "TRIHEX Growth",
    "votes": 495,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "GPT-4o"
    ],
    "tags": [
      "cold-email",
      "sales",
      "outreach",
      "b2b",
      "lead-generation"
    ],
    "content": "You are a B2B Sales Development Representative (SDR) with top 1% response rates.\nWrite a 3-email cold sequence targeting: ${targetPersonaTitle} at ${industryType} companies.\n\nProduct / Value Offer: ${productValueProp}\nObserved Trigger Event (e.g., recent hiring, funding, tech stack migration): ${triggerEvent}\n\nEmail Constraints:\n1. Word Count: Under 90 words per email.\n2. Personalization: Opening sentence directly references their trigger event.\n3. Tone: Peer-to-peer consultative tone (zero marketing jargon like \"synergy\" or \"revolutionary\").\n4. Call-to-Action: Low friction interest-based CTA (\"Worth exploring for 5 minutes?\" rather than \"Book a 30-min demo\").",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-cold-b2b-outreach",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-saas-landing-page-copy",
    "slug": "high-converting-saas-landing-page-pas",
    "title": "High-Converting SaaS Landing Page Copywriter (PAS)",
    "description": "Writes full landing page copy using Problem-Agitate-Solve framework, featuring compelling hero kickers, benefit sections, and trust builders.",
    "category": "MARKETING_SALES",
    "type": "TEXT",
    "author": "TRIHEX Growth",
    "votes": 520,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "GPT-4o"
    ],
    "tags": [
      "copywriting",
      "landing-page",
      "saas",
      "conversion",
      "pas-framework"
    ],
    "content": "You are a Direct-Response Copywriting Director.\nWrite complete landing page copy for SaaS product: ${productName}.\n\nTarget Audience: ${targetAudience}\nCore Problem: ${coreProblem}\nUnique Value Proposition: ${valueProposition}\n\nSections to Deliver:\n1. Hero Header: Pill kicker, clear 10-word headline, sub-headline, primary & secondary CTA, and trust strip.\n2. Problem / Agitation: Highlight the hidden financial and operational costs of the status quo.\n3. Solution Walkthrough: 3 feature-benefit pairs explaining how the software solves the pain points.\n4. Social Proof & Testimonial Prompts: Realistic customer quotes using the STAR framework.\n5. Risk Reversal: Guarantee section eliminating purchase anxiety.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-saas-landing-page-copy",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-product-hunt-playbook",
    "slug": "product-hunt-launch-day-playbook",
    "title": "Product Hunt Launch Day Playbook & Announcement",
    "description": "Crafts complete Product Hunt launch assets: compelling Maker comment, tagline, first-comment storytelling, and social media announcements.",
    "category": "MARKETING_SALES",
    "type": "TEXT",
    "author": "TRIHEX Growth",
    "votes": 380,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "GPT-4o"
    ],
    "tags": [
      "product-hunt",
      "startup-launch",
      "growth",
      "marketing"
    ],
    "content": "You are a Tech Startup Launch Strategist.\nWrite complete launch materials for Product Hunt launch of: ${productName}.\n\nProduct Description: ${productPitch}\nFounders' Backstory: ${founderStory}\n\nDeliverables:\n1. Tagline: Under 60 characters, crystal-clear value without buzzwords.\n2. Maker First Comment: Authentic founding narrative, why you built it, key features, and special community promo.\n3. Twitter / X Launch Thread: 5-tweet viral launch announcement thread with GIF placeholders.\n4. LinkedIn Launch Post: Professional milestone framing inviting developer feedback.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-product-hunt-playbook",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-seo-topic-cluster",
    "slug": "programmatic-seo-topic-cluster-architecture",
    "title": "Programmatic SEO Topic Cluster & Content Silo Architect",
    "description": "Designs exhaustive search engine topic clusters with pillar pages, supporting cluster articles, internal linking anchors, and search intent.",
    "category": "MARKETING_SALES",
    "type": "TEXT",
    "author": "TRIHEX Growth",
    "votes": 430,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "GPT-4o"
    ],
    "tags": [
      "seo",
      "topic-clusters",
      "content-strategy",
      "search-engine",
      "organic-growth"
    ],
    "content": "You are an Enterprise SEO Director.\nArchitect an authoritative topic cluster for core topic: ${coreTopic}.\n\nTarget Geography / Market: ${targetMarket}\n\nArchitecture Map:\n1. Pillar Page: Title, URL slug, and comprehensive outline covering high-volume informational search intent.\n2. Supporting Cluster Articles: 8 long-tail articles addressing specific transactional, commercial, and investigative queries.\n3. Internal Linking Architecture: Exact internal anchor text linking cluster articles back to the pillar page.\n4. Featured Snippet Optimization: Exact definition paragraph (45-55 words) formatted for Google Position Zero.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-seo-topic-cluster",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-customer-empathy-interview",
    "slug": "customer-persona-empathy-interview-script",
    "title": "Customer Persona & Pain Point Empathy Interview Script",
    "description": "Constructs The Mom Test compliant customer discovery interview scripts that uncover real willingness-to-pay without leading the witness.",
    "category": "MARKETING_SALES",
    "type": "TEXT",
    "author": "TRIHEX Growth",
    "votes": 310,
    "modelCompatibility": [
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "customer-discovery",
      "the-mom-test",
      "product-management",
      "interviews"
    ],
    "content": "You are a Product Discovery Coach following Rob Fitzpatrick's 'The Mom Test'.\nDesign a 20-minute customer interview guide for concept: ${productConcept}.\n\nTarget Respondent: ${targetPersona}\n\nGuidelines:\n1. No pitching: Zero questions asking \"Would you buy a product that does X?\".\n2. Past Behavior Focus: Questions investigating how they currently solve the problem and what they paid last time.\n3. Workflow Questions: Walk through the last time ${problemScenario} happened.\n4. Budget & Authority: How budgets for software tools are approved in their organization.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-customer-empathy-interview",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-omnichannel-retargeting",
    "slug": "omnichannel-retargeting-ad-sequence",
    "title": "Omnichannel Retargeting Ad Sequence (Meta + Google)",
    "description": "Designs a multi-touch retargeting ad matrix for bounced visitors, segmented by days elapsed since site visit (Days 1-3, 4-7, 8-14).",
    "category": "MARKETING_SALES",
    "type": "TEXT",
    "author": "TRIHEX Growth",
    "votes": 370,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "GPT-4o"
    ],
    "tags": [
      "paid-ads",
      "retargeting",
      "facebook-ads",
      "google-ads",
      "ecommerce"
    ],
    "content": "You are a Paid Acquisition & Performance Marketing Lead.\nBuild an omnichannel retargeting ad sequence for abandoned cart users on: ${productStore}.\n\nSequence Cadence:\n1. Days 1-3 (Friendly Reminder & Help): Address common checkout friction (shipping, payment gateways). Ad copy + visual creative brief.\n2. Days 4-7 (Social Proof & Objections): Overcome skepticism with reviews, media mentions, and guarantees.\n3. Days 8-14 (Urgency & Incentive): Limited-time coupon or expiring bonus to trigger final decision.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-omnichannel-retargeting",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-vsl-high-ticket",
    "slug": "video-sales-letter-12-minute-script",
    "title": "High-Ticket 12-Minute Video Sales Letter (VSL) Script",
    "description": "Drafts compelling 12-minute VSL scripts following proven direct-response structures (The Big Idea, Origin Story, The Mechanism, The Offer).",
    "category": "MARKETING_SALES",
    "type": "VIDEO",
    "author": "TRIHEX Growth",
    "votes": 410,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "GPT-4o"
    ],
    "tags": [
      "vsl",
      "sales-letter",
      "high-ticket",
      "copywriting",
      "video"
    ],
    "content": "You are an A-List Direct-Response Copywriter.\nWrite a 12-minute Video Sales Letter (VSL) script for high-ticket service: ${serviceName}.\n\nPrice Point: ${pricePoint}\nTarget Prospect: ${targetProspect}\n\nVSL Blueprint:\n1. The Pattern Interrupt (0-1 min): Disrupt conventional industry wisdom.\n2. The Origin Story & Epiphany (1-4 min): Relatable struggle leading to discovery of the unique mechanism.\n3. The Mechanism Explained (4-8 min): Why this mechanism works where traditional methods fail.\n4. The Stack & Offer (8-12 min): Value stacking, bonuses, risk reversal guarantee, and direct closing CTA.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-vsl-high-ticket",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-influencer-outreach-brief",
    "slug": "influencer-sponsorship-outreach-deliverable-brief",
    "title": "Influencer Sponsorship Outreach & Campaign Brief",
    "description": "Produces personalized influencer outreach DMs and detailed creator deliverable briefs with creative freedom guidelines and tracking links.",
    "category": "MARKETING_SALES",
    "type": "TEXT",
    "author": "TRIHEX Growth",
    "votes": 295,
    "modelCompatibility": [
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "influencer-marketing",
      "creator-economy",
      "outreach",
      "sponsorship"
    ],
    "content": "You are an Influencer Marketing Campaign Director.\nCreate an outreach message and creator campaign brief for product: ${brandProduct}.\n\nTarget Creators: Tech / AI creators on YouTube and Instagram with ${followerRange} followers.\n\nDeliverables:\n1. Outreach DM / Email: Non-spammy collaboration proposal highlighting why their audience loves this tool.\n2. Deliverable Brief: Talking points (do's and don'ts), mandatory promo code insertion, and visual product demonstration requirements.\n3. FTC / Regulatory Compliance: Clear guidelines on #ad and paid partnership disclaimers.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-influencer-outreach-brief",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-churn-reduction-email",
    "slug": "customer-retention-churn-reduction-sequence",
    "title": "SaaS Retention & Churn Reduction Email Sequence",
    "description": "Constructs behavioral trigger emails targeting disengaged subscribers before cancellation, offering targeted assistance and usage tutorials.",
    "category": "MARKETING_SALES",
    "type": "TEXT",
    "author": "TRIHEX Growth",
    "votes": 350,
    "modelCompatibility": [
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "retention",
      "churn",
      "saas",
      "email-marketing",
      "customer-success"
    ],
    "content": "You are a Customer Success & Retention Strategist.\nBuild a 3-part re-engagement email sequence triggered when an active SaaS user's activity drops by 70% over 14 days.\n\nSaaS Product: ${saasProduct}\nCore Unused Feature: ${underutilizedFeature}\n\nEmail Series:\n1. Email 1: Gentle check-in asking if they encountered technical friction, linking to a 2-minute quickstart video.\n2. Email 2: Highlighting how another customer in their industry unlocked ROI using the unused feature.\n3. Email 3: Direct invitation to book a 1-on-1 complimentary optimization call with a product specialist.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-churn-reduction-email",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-abandoned-cart-recovery",
    "slug": "ecommerce-abandoned-cart-recovery-series",
    "title": "E-Commerce Abandoned Cart Recovery Series (3-Stage)",
    "description": "Writes a high-converting 3-part abandoned cart recovery sequence recovering 15%+ of lost revenue with dynamic product tokens and trust anchors.",
    "category": "MARKETING_SALES",
    "type": "TEXT",
    "author": "TRIHEX Growth",
    "votes": 460,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "GPT-4o"
    ],
    "tags": [
      "ecommerce",
      "abandoned-cart",
      "email-marketing",
      "conversion"
    ],
    "content": "You are an E-Commerce Lifecycle Marketing Specialist.\nWrite a 3-stage abandoned cart email recovery workflow for: ${storeName}.\n\nAudience: Shoppers who added products to cart, entered email, but did not complete payment.\n\nCadence:\n1. Hour 1 (Service Mindset): \"Did something go wrong with checkout? We saved your cart for you.\"\n2. Hour 24 (Social Proof & Urgency): Verified customer reviews of the exact items in their cart, reminding them stock is reserved temporarily.\n3. Hour 48 (Final Opportunity): Time-sensitive incentive or direct WhatsApp support line to resolve local payment issues.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-abandoned-cart-recovery",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-webinar-pitch-script",
    "slug": "high-engagement-webinar-presentation-pitch",
    "title": "High-Engagement Live Webinar Presentation & Pitch Script",
    "description": "Structures 45-minute educational webinars designed to build audience trust before transitioning seamlessly into a commercial software offer.",
    "category": "MARKETING_SALES",
    "type": "TEXT",
    "author": "TRIHEX Growth",
    "votes": 340,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "GPT-4o"
    ],
    "tags": [
      "webinar",
      "sales-presentation",
      "public-speaking",
      "conversion"
    ],
    "content": "You are a Live Presentation & Webinar Conversion Architect.\nWrite an outline and transition script for a 45-minute live masterclass titled: \"${webinarTitle}\".\n\nTarget Attendee: ${attendeePersona}\nCore Skill Taught: ${coreSkill}\nPaid Product Pitch: ${productOffer}\n\nTimings:\n1. 0-5 min: The Hook, Housekeeping, and Big Promise.\n2. 5-15 min: The Core Epiphany (why traditional approaches fail in 2026).\n3. 15-35 min: Actionable Step-by-Step Training (delivering genuine standalone value).\n4. 35-45 min: The Transition: \"How to implement this faster with ${productOffer}\" + Q&A.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-webinar-pitch-script",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-viral-referral-loop",
    "slug": "referral-loop-viral-growth-mechanics",
    "title": "Viral Referral Loop & Product Incentive Architect",
    "description": "Designs two-sided viral referral mechanisms (Dropbox/Robinhood style) that incentivize users to invite colleagues for mutual rewards.",
    "category": "MARKETING_SALES",
    "type": "TEXT",
    "author": "TRIHEX Growth",
    "votes": 380,
    "modelCompatibility": [
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "growth-hacking",
      "viral-loops",
      "referrals",
      "product-growth"
    ],
    "content": "You are a Growth Product Manager.\nDesign a two-sided viral referral engine for application: ${appName}.\n\nSpecifications:\n1. The Mutual Incentive: Define reward for Referrer and Referee (e.g. storage, license extension, private features).\n2. Frictionless Invite Flow: Friction-free WhatsApp, email, and copy-link share triggers in the UI.\n3. Anti-Fraud Rules: Guardrails against self-referrals (IP fingerprinting, device checks, minimum activity requirements).\n4. Gamification Milestones: Tiered rewards at 3, 5, and 10 successful referrals.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-viral-referral-loop",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-press-release-tech",
    "slug": "press-release-tech-disruption-distribution",
    "title": "AP-Style Tech Disruption Press Release Drafter",
    "description": "Writes standard Associated Press (AP) formatted press releases announcing startup funding, major product launches, or technical breakthroughs.",
    "category": "MARKETING_SALES",
    "type": "TEXT",
    "author": "TRIHEX Growth",
    "votes": 290,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "GPT-4o"
    ],
    "tags": [
      "pr",
      "press-release",
      "media",
      "journalism",
      "announcements"
    ],
    "content": "You are a Technology PR Director.\nDraft an AP-style press release announcing: ${announcementHeadline}.\n\nCompany: ${companyName}\nLocation & Date: ${cityDateline}\nKey Innovation: ${innovationDetails}\n\nFormat:\n1. FOR IMMEDIATE RELEASE banner with media contact details.\n2. Dateline & Strong Lead Paragraph summarizing Who, What, When, Where, and Why.\n3. Quotes from Founder/CEO highlighting the industry paradigm shift.\n4. Supporting Industry Context & Market Problem.\n5. Standard Company Boilerplate and Media Assets Link.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-press-release-tech",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-competitor-battlecard",
    "slug": "sales-sdr-competitor-battlecard-objections",
    "title": "Sales SDR Competitor Battlecard & Objections Playbook",
    "description": "Constructs tactical sales battlecards arming SDRs with quick trap questions, feature landmines, and crisp objection handlers against competitors.",
    "category": "MARKETING_SALES",
    "type": "TEXT",
    "author": "TRIHEX Growth",
    "votes": 425,
    "modelCompatibility": [
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "sales",
      "battlecard",
      "competitors",
      "objections",
      "sdr"
    ],
    "content": "You are a VP of Sales Enablement.\nBuild a tactical competitor battlecard positioning ${ourProduct} against rival: ${competitorProduct}.\n\nBattlecard Sections:\n1. Quick Pitch: 30-second explanation of why buyers switch from them to us.\n2. Where We Win: 3 technical and pricing advantages where our solution clearly dominates.\n3. Where They Win & How to Pivot: Acknowledge their strengths honestly, then redirect to our unique core capability.\n4. Landmine Questions: 2 strategic questions the prospect can ask the competitor during a demo that expose their architectural flaws.\n5. Top 3 Objections & Exact Word-for-Word Responses.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-competitor-battlecard",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-lead-magnet-workbook",
    "slug": "lead-magnet-actionable-audit-workbook",
    "title": "Actionable Lead Magnet & Audit Checklist Generator",
    "description": "Creates high-perceived-value digital lead magnets (audits, scorecards, checklists) that capture qualified B2B email leads rapidly.",
    "category": "MARKETING_SALES",
    "type": "TEXT",
    "author": "TRIHEX Growth",
    "votes": 350,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "GPT-4o"
    ],
    "tags": [
      "lead-magnet",
      "lead-generation",
      "content-marketing",
      "b2b"
    ],
    "content": "You are a B2B Lead Generation Consultant.\nCreate an actionable diagnostic scorecard / lead magnet for topic: ${auditTopic}.\n\nTarget Prospect: ${targetProspect}\n\nWorkbook Structure:\n1. Title: Catchy, specific promise (e.g. \"The 10-Point ${auditTopic} Audit\").\n2. Self-Assessment Matrix: 10 yes/no diagnostic criteria scored from 1-10.\n3. Score Interpretation: Categorize respondents into Beginner (0-4), Intermediate (5-7), and Advanced (8-10).\n4. Recommended Next Steps: How our service/tool bridges the gap identified in their score.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-lead-magnet-workbook",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-newsletter-welcome-series",
    "slug": "newsletter-welcome-series-trust-cadence",
    "title": "Newsletter Welcome Series & Authority Cadence",
    "description": "Writes a 4-email welcome sequence for new newsletter subscribers establishing authority, setting expectations, and generating early engagement.",
    "category": "MARKETING_SALES",
    "type": "TEXT",
    "author": "TRIHEX Growth",
    "votes": 365,
    "modelCompatibility": [
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "newsletter",
      "email-marketing",
      "onboarding",
      "audience-building"
    ],
    "content": "You are an Authority Newsletter Strategist (like Morning Brew or TLDR).\nWrite a 4-email onboarding welcome sequence for new subscribers to: ${newsletterName}.\n\nTheme & Focus: ${newsletterFocus}\n\nEmail Cadence:\n1. Email 1 (Instant Value Delivery): Welcome them, deliver promised lead magnet, and ask them to reply with their #1 current challenge.\n2. Email 2 (Origin Story & Philosophy): Why you created this resource and the core contrarian philosophy that guides your work.\n3. Email 3 (Best-Of Roundup): Curated links to your 3 most popular historical deep-dives.\n4. Email 4 (Soft Commercial Introduction): Introduce your flagship product/service naturally as the next logical step.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-newsletter-welcome-series",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-affiliate-recruitment",
    "slug": "affiliate-partner-recruitment-commission-policy",
    "title": "Affiliate Partner Recruitment & Commission Policy",
    "description": "Creates compelling affiliate recruitment landing copy, commission tier structures (recurring vs one-time), and promotional asset kits.",
    "category": "MARKETING_SALES",
    "type": "TEXT",
    "author": "TRIHEX Growth",
    "votes": 310,
    "modelCompatibility": [
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "affiliate",
      "partnerships",
      "growth",
      "commissions"
    ],
    "content": "You are an Affiliate Program Manager.\nDesign an affiliate recruitment page and program policy for product: ${productName}.\n\nTarget Affiliates: Content creators, tech bloggers, and agency owners in ${niche}.\n\nPlan Details:\n1. Commission Structure: Recommended commission rate (e.g. 25% recurring for 12 months) and payout thresholds.\n2. Partner Benefits: Dedicated affiliate dashboard, 60-day cookie window, and custom discount codes.\n3. Promotional Assets Provided: Ready-to-use email swipe files, banner ad creatives, and feature walkthrough videos.\n4. Program Terms: Strict prohibitions against PPC bidding on brand trademarks.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-affiliate-recruitment",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-pricing-decoy-calculator",
    "slug": "pricing-tier-decoy-effect-optimizer",
    "title": "Pricing Tier Architecture & Decoy Effect Optimizer",
    "description": "Structures high-converting 3-tier SaaS or digital product pricing pages leveraging the decoy effect, annual prepay incentives, and clear feature fences.",
    "category": "MARKETING_SALES",
    "type": "TEXT",
    "author": "TRIHEX Growth",
    "votes": 430,
    "modelCompatibility": [
      "Claude 3.7 Sonnet"
    ],
    "tags": [
      "pricing",
      "saas",
      "monetization",
      "decoy-effect",
      "conversion"
    ],
    "content": "You are a SaaS Monetization & Pricing Strategist.\nDesign an optimized 3-tier pricing structure for software: ${productName}.\n\nTarget Customer Profile: ${customerProfile}\n\nTiers to Construct:\n1. Starter Tier (The Anchor): Modest feature set designed for individual freelancers.\n2. Pro Tier (The Target - Highlighted \"Most Popular\"): Complete feature set capturing 70%+ of signups, leveraging the decoy effect.\n3. Enterprise Tier (The Ceiling): Unlimited usage, custom SLAs, and dedicated account manager.\n4. Annual Discount: 2 months free incentive framing to maximize upfront cash flow.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-pricing-decoy-calculator",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-case-study-star",
    "slug": "customer-case-study-star-methodology",
    "title": "Customer Case Study Storyteller (STAR Methodology)",
    "description": "Writes engaging customer success stories following Situation-Task-Action-Result structure with quantifiable ROI metrics and pull quotes.",
    "category": "MARKETING_SALES",
    "type": "TEXT",
    "author": "TRIHEX Growth",
    "votes": 390,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "GPT-4o"
    ],
    "tags": [
      "case-study",
      "social-proof",
      "content-marketing",
      "b2b-sales"
    ],
    "content": "You are a B2B Case Study Storyteller.\nWrite an engaging customer success case study for: ${clientName}.\n\nProduct Used: ${productUsed}\nKey Metric Achieved: ${metricAchieved} (e.g. 4.2x ROI, 15 hours saved per week)\n\nStory Arc (STAR Framework):\n1. The Situation: Client's operational headaches, growing pains, and legacy tooling limitations.\n2. The Task: The ambitious milestone or deadline they needed to hit.\n3. The Action: How they integrated ${productUsed} into their daily workflow.\n4. The Result: Measurable financial and productivity outcomes, complete with executive pull quotes.",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-case-study-star",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  },
  {
    "id": "prompt-brand-tone-voice-playbook",
    "slug": "brand-tone-of-voice-style-guide-playbook",
    "title": "Brand Tone of Voice & Copywriting Style Playbook",
    "description": "Establishes a comprehensive brand tone-of-voice guide with 'We are X, but not Y' guardrails, vocabulary dos/don'ts, and multi-channel examples.",
    "category": "MARKETING_SALES",
    "type": "TEXT",
    "author": "TRIHEX Growth",
    "votes": 335,
    "modelCompatibility": [
      "Claude 3.7 Sonnet",
      "GPT-4o"
    ],
    "tags": [
      "branding",
      "tone-of-voice",
      "copywriting",
      "style-guide"
    ],
    "content": "You are a Chief Brand Officer.\nCreate a comprehensive Brand Tone of Voice playbook for company: ${companyName}.\n\nIndustry: ${industry}\nTarget Audience: ${targetAudience}\n\nPlaybook Sections:\n1. Core Personality Traits: 4 brand pillars (e.g. \"Authoritative, yet Accessible\", \"Rigorous, but never Boring\").\n2. The 'This, Not That' Matrix: Clear examples contrasting on-brand vs off-brand phrasing.\n3. Vocabulary Blacklist: Words and clichés strictly forbidden in customer-facing communication.\n4. Multi-Channel Application: How the voice adapts across Customer Support (empathetic), Marketing (energetic), and Technical Documentation (precise).",
    "license": "TRIHEX-PROPRIETARY-FREE",
    "isOriginalTrihex": true,
    "status": "PUBLISHED",
    "contentHash": "trihex-v1-prompt-brand-tone-voice-playbook",
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-09-05T00:00:00Z",
    "variables": []
  }
];

for (const p of TRIHEX_ORIGINAL_PROMPTS) {
  p.variables = extractPromptVariables(p.content);
}
