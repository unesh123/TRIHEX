import { ResourceItem, ResourceFilterOptions } from "./types";

export const INITIAL_RESOURCES: ResourceItem[] = [
  {
    id: "res-cisa-kev-catalog",
    title: "CISA Known Exploited Vulnerabilities (KEV) Catalog 2026",
    slug: "cisa-known-exploited-vulnerabilities-catalog",
    category: "SECURITY_ADVISORY",
    rightsTag: "PUBLIC_DOMAIN",
    licenseName: "US Government Work (17 U.S.C. § 105)",
    summary: "Official authoritative catalog of confirmed vulnerabilities weaponized in the wild by threat actors, with mandatory patching deadlines for infrastructure defenders.",
    format: "CSV",
    fileSizeBytes: 1850000,
    officialUrl: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
    downloadUrl: "https://www.cisa.gov/sites/default/files/csv/known_exploited_vulnerabilities.csv",
    verifiedBy: "CISA / US Cybersecurity & Infrastructure Security Agency",
    lastAuditedAt: "2026-09-01T00:00:00Z",
    tags: ["security", "cve", "cisa", "vulnerability", "infosec"],
    isPinned: true,
  },
  {
    id: "res-owasp-top-10-api",
    title: "OWASP Top 10 API Security Risks & Developer Cheat Sheet",
    slug: "owasp-top-10-api-security-cheat-sheet",
    category: "SECURITY_ADVISORY",
    rightsTag: "OPEN_LICENSE",
    licenseName: "Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0)",
    summary: "Actionable defense guidelines against Broken Object Level Authorization (BOLA), Broken Authentication, SSRF, and Unrestricted Resource Consumption in modern REST & GraphQL APIs.",
    format: "PDF",
    fileSizeBytes: 2400000,
    officialUrl: "https://owasp.org/www-project-api-security/",
    verifiedBy: "OWASP Foundation",
    lastAuditedAt: "2026-08-15T00:00:00Z",
    tags: ["owasp", "api-security", "bola", "cheat-sheet", "appsec"],
    isPinned: true,
  },
  {
    id: "res-nextjs16-performance-cheatsheet",
    title: "TRIHEX Next.js 16 & React 19 Production Architecture Cheat Sheet",
    slug: "nextjs-16-react-19-production-architecture-cheatsheet",
    category: "DEVELOPER_CHEAT_SHEET",
    rightsTag: "TRIHEX_ORIGINAL",
    licenseName: "TRIHEX Open License",
    summary: "Comprehensive reference card for Server Components, Turbopack boundary isolation, Server Actions, streaming Suspense, and edge revalidation patterns.",
    format: "MARKDOWN",
    officialUrl: "https://trihexdigital.shop/resources/nextjs-16-react-19-production-architecture-cheatsheet",
    verifiedBy: "TRIHEX Engineering Lab",
    lastAuditedAt: "2026-09-04T00:00:00Z",
    tags: ["nextjs", "react19", "turbopack", "cheat-sheet", "architecture"],
    isPinned: true,
  },
  {
    id: "res-nepal-nso-district-census",
    title: "National Statistics Office Nepal 77-District Demographic & Economic Dataset",
    slug: "nepal-nso-77-district-demographic-economic-dataset",
    category: "PUBLIC_DATASET",
    rightsTag: "PUBLIC_DOMAIN",
    licenseName: "Government of Nepal Open Data License",
    summary: "Standardized machine-readable census and economic registry encompassing population density, enterprise registration, literacy rates, and telecom access across all 77 districts.",
    format: "CSV",
    fileSizeBytes: 4200000,
    officialUrl: "https://cbs.gov.np",
    verifiedBy: "National Statistics Office (NSO), Nepal",
    lastAuditedAt: "2026-08-20T00:00:00Z",
    tags: ["nepal", "nso", "census", "open-data", "demographics"],
    isPinned: true,
  },
  {
    id: "res-linux-cli-sysadmin-sheet",
    title: "Linux Kernel & SRE High-Performance Troubleshooting Cheat Sheet",
    slug: "linux-kernel-sre-troubleshooting-cheatsheet",
    category: "DEVELOPER_CHEAT_SHEET",
    rightsTag: "OPEN_LICENSE",
    licenseName: "MIT License",
    summary: "Essential reference sheet for Brendan Gregg's USE method, eBPF tracing commands, perf profiling, memory fragmentation diagnosis, and network socket tuning.",
    format: "PDF",
    fileSizeBytes: 1200000,
    officialUrl: "https://brendangregg.com",
    verifiedBy: "TRIHEX Systems Engineering",
    lastAuditedAt: "2026-07-10T00:00:00Z",
    tags: ["linux", "sre", "ebpf", "performance", "sysadmin"],
  },
  {
    id: "res-usgs-himalayan-fault-database",
    title: "USGS & Lamont-Doherty Himalayan Seismotectonic Fault Registry",
    slug: "usgs-himalayan-seismotectonic-fault-registry",
    category: "CIVIC_RECORD",
    rightsTag: "PUBLIC_DOMAIN",
    licenseName: "USGS Open Science Data",
    summary: "Geospatial vector mapping of the Main Frontal Thrust (MFT), Main Boundary Thrust (MBT), and Main Central Thrust (MCT) across the central Himalayan arc.",
    format: "GEOJSON",
    fileSizeBytes: 3100000,
    officialUrl: "https://earthquake.usgs.gov",
    verifiedBy: "United States Geological Survey (USGS)",
    lastAuditedAt: "2026-08-25T00:00:00Z",
    tags: ["geology", "seismic", "usgs", "nepal", "earthquake", "geojson"],
  },
  {
    id: "res-docker-hardened-benchmarks",
    title: "CIS Docker & Kubernetes Security Benchmark Specification",
    slug: "cis-docker-kubernetes-security-benchmark",
    category: "SECURITY_ADVISORY",
    rightsTag: "OPEN_LICENSE",
    licenseName: "Center for Internet Security (CIS) Community License",
    summary: "Prescriptive technical configuration checklists for hardening Linux host daemons, container runtimes, Kubernetes API servers, and etcd clusters.",
    format: "PDF",
    fileSizeBytes: 5600000,
    officialUrl: "https://www.cisecurity.org/benchmark/docker",
    verifiedBy: "Center for Internet Security",
    lastAuditedAt: "2026-08-12T00:00:00Z",
    tags: ["security", "docker", "kubernetes", "cis-benchmarks", "devops"],
  },
  {
    id: "res-nrb-unified-directives-2026",
    title: "Nepal Rastra Bank Unified Directives for Payment Service Providers (PSP/PSO)",
    slug: "nrb-unified-directives-payment-service-providers",
    category: "CIVIC_RECORD",
    rightsTag: "PUBLIC_DOMAIN",
    licenseName: "Official Legal Notice (Nepal Gazette)",
    summary: "Official regulatory circulars governing merchant QR standards, digital wallet transaction ceilings, dispute resolution timeframes, and capital requirements in Nepal.",
    format: "PDF",
    fileSizeBytes: 3800000,
    officialUrl: "https://www.nrb.org.np",
    verifiedBy: "Nepal Rastra Bank Payment Systems Dept",
    lastAuditedAt: "2026-08-28T00:00:00Z",
    tags: ["nrb", "fintech", "banking", "nepal", "regulations"],
  },
  {
    id: "res-postgresql-17-internals-card",
    title: "PostgreSQL 17 Internals & Query Tuning Reference Card",
    slug: "postgresql-17-internals-query-tuning-card",
    category: "DEVELOPER_CHEAT_SHEET",
    rightsTag: "OPEN_LICENSE",
    licenseName: "PostgreSQL License (Open Source)",
    summary: "Visual guide to WAL archiving, autovacuum cost thresholds, shared_buffers sizing, B-Tree index deduplication, and EXPLAIN ANALYZE interpretation.",
    format: "MARKDOWN",
    officialUrl: "https://www.postgresql.org/docs/",
    verifiedBy: "PostgreSQL Global Development Group",
    lastAuditedAt: "2026-08-01T00:00:00Z",
    tags: ["postgres", "database", "sql", "performance", "dba"],
  },
  {
    id: "res-git-advanced-workflows",
    slug: "git-rebase-bisect-worktree-advanced-cheatsheet",
    title: "Git Advanced Workflows: Interactive Rebase, Bisect & Worktrees",
    category: "DEVELOPER_CHEAT_SHEET",
    rightsTag: "TRIHEX_ORIGINAL",
    licenseName: "TRIHEX Open License",
    summary: "Production manual for recovering orphaned commits with git reflog, automated bug hunting with git bisect run, and multi-branch isolation using git worktree.",
    format: "MARKDOWN",
    officialUrl: "https://trihexdigital.shop/resources/git-rebase-bisect-worktree-advanced-cheatsheet",
    verifiedBy: "TRIHEX Engineering Lab",
    lastAuditedAt: "2026-09-02T00:00:00Z",
    tags: ["git", "devtools", "version-control", "workflow", "terminal"],
  },
  {
    id: "res-world-bank-nepal-economic",
    title: "World Bank Nepal Development Update Databank 2026",
    slug: "world-bank-nepal-development-update-databank",
    category: "PUBLIC_DATASET",
    rightsTag: "PUBLIC_DOMAIN",
    licenseName: "World Bank Open Data (CC BY 4.0)",
    summary: "Time-series indicators tracking Nepal's GDP growth, external debt sustainability, inflation indices, service sector exports, and foreign exchange reserves.",
    format: "CSV",
    fileSizeBytes: 2100000,
    officialUrl: "https://data.worldbank.org/country/nepal",
    verifiedBy: "World Bank Macroeconomics & Fiscal Management Group",
    lastAuditedAt: "2026-08-18T00:00:00Z",
    tags: ["world-bank", "nepal", "economy", "macroeconomics", "data"],
  },
  {
    id: "res-security-headers-evaluator",
    slug: "http-security-headers-csp-evaluator-tool",
    title: "Production HTTP Security Headers & Strict CSP Generator",
    category: "OPEN_TOOL",
    rightsTag: "TRIHEX_ORIGINAL",
    licenseName: "MIT License",
    summary: "Interactive configuration generator producing compliant Content-Security-Policy (CSP), HSTS, Permissions-Policy, and Cross-Origin-Opener-Policy headers.",
    format: "WEB_TOOL",
    officialUrl: "https://trihexdigital.shop/resources/http-security-headers-csp-evaluator-tool",
    verifiedBy: "TRIHEX Security Operations",
    lastAuditedAt: "2026-09-03T00:00:00Z",
    tags: ["security", "http-headers", "csp", "web-security", "hsts"],
  },
];

let resourcesStore: ResourceItem[] = [...INITIAL_RESOURCES];

export function getAllResources(options?: ResourceFilterOptions): ResourceItem[] {
  let list = [...resourcesStore];

  if (options?.category && options.category !== "ALL") {
    list = list.filter((r) => r.category === options.category);
  }

  if (options?.rightsTag && options.rightsTag !== "ALL") {
    list = list.filter((r) => r.rightsTag === options.rightsTag);
  }

  if (options?.query && options.query.trim()) {
    const q = options.query.toLowerCase();
    list = list.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.licenseName.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return list.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return Number(b.isPinned) - Number(a.isPinned);
    return a.title.localeCompare(b.title);
  });
}

export function getResourceBySlug(slug: string): ResourceItem | undefined {
  return resourcesStore.find((r) => r.slug === slug);
}
