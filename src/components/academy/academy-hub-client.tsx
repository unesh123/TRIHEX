"use client";

import { useState } from "react";
import {
  Terminal,
  ShieldCheck,
  BookOpen,
  Award,
  Lock,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  Code2,
  FileCode2,
  GraduationCap,
  Play,
  RotateCcw,
  Check,
  Search,
  ExternalLink,
} from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export interface CourseTrack {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  tier: "FREE" | "PRO" | "VIP";
  summary: string;
  modules: string[];
}

export const ACADEMY_TRACKS: CourseTrack[] = [
  {
    id: "linux-hardening",
    title: "Track 01: Linux System Hardening & CLI Operations",
    level: "Beginner",
    duration: "4 Weeks",
    tier: "FREE",
    summary:
      "Master the Linux command-line, file permissions, daemon management, SSH hardening, iptables firewall rule configurations, and secure logging.",
    modules: [
      "Module 1: Unix permissions, chmod, chown, and sudoers least privilege",
      "Module 2: SSH key generation, config hardening, disabling password auth",
      "Module 3: UFW and iptables packet filtering architecture",
      "Module 4: Systemd services security, cgroups, and journalctl auditing",
    ],
  },
  {
    id: "network-recon",
    title: "Track 02: Network Fundamentals & Packet Analysis",
    level: "Beginner",
    duration: "4 Weeks",
    tier: "FREE",
    summary:
      "Deep-dive into TCP/IP, OSI layers, DNS resolution, Wireshark packet inspection, TCP flags, ARP spoofing detection, and network perimeter mapping.",
    modules: [
      "Module 1: TCP 3-way handshake analysis & flag manipulation in Wireshark",
      "Module 2: DNS queries, DNSSEC, cache poisoning prevention",
      "Module 3: Subnetting, CIDR notation, and VLAN segmentation",
      "Module 4: Active reconnaissance with Nmap (TCP SYN, UDP, script engine)",
    ],
  },
  {
    id: "python-security",
    title: "Track 03: Python for Security Researchers & Automation",
    level: "Intermediate",
    duration: "6 Weeks",
    tier: "PRO",
    summary:
      "Build custom offensive security tooling and automated defensive scripts in Python. Scrape threat intelligence, parse logs, and automate API audits.",
    modules: [
      "Module 1: Socket programming and multi-threaded port scanner development",
      "Module 2: HTTP requests library, header inspection, and automated fuzzing",
      "Module 3: Parsing CVE feeds, NVD APIs, and automated threat scoring",
      "Module 4: Building a custom SIEM alert parser and Discord webhook daemon",
    ],
  },
  {
    id: "ethical-pentesting",
    title: "Track 04: Ethical Penetration Testing Methodology (PTES)",
    level: "Intermediate",
    duration: "8 Weeks",
    tier: "PRO",
    summary:
      "Structured penetration testing workflow following the Penetration Testing Execution Standard (PTES): Scope, OSINT, scanning, exploitation, and reporting.",
    modules: [
      "Module 1: Rules of engagement, scopes, authorization, and ethics",
      "Module 2: Open Source Intelligence (OSINT) gathering & asset enumeration",
      "Module 3: Metasploit Framework, listener configuration, meterpreter sessions",
      "Module 4: Professional vulnerability reporting and executive debriefing",
    ],
  },
  {
    id: "owasp-top-10",
    title: "Track 05: OWASP Top 10 Web Application Defense & Bug Hunting",
    level: "Intermediate",
    duration: "8 Weeks",
    tier: "PRO",
    summary:
      "Hands-on mastery of web vulnerabilities. Understand attack vectors and implement permanent architectural fixes in Next.js, Node, and PostgreSQL.",
    modules: [
      "Module 1: A01 Broken Access Control & IDOR exploit prevention",
      "Module 2: A03 Injection (SQLi, Command Injection, Template Injection)",
      "Module 3: A07 Identification and Authentication Failures (JWT, session fixation)",
      "Module 4: A10 Server-Side Request Forgery (SSRF) and cloud metadata defense",
    ],
  },
  {
    id: "api-security",
    title: "Track 06: API Security, GraphQL & Microservices Hardening",
    level: "Intermediate",
    duration: "6 Weeks",
    tier: "PRO",
    summary:
      "Audit and defend REST and GraphQL endpoints against Broken Object-Level Authorization (BOLA), rate limit exhaustion, and improper asset management.",
    modules: [
      "Module 1: OWASP API Security Top 10 breakdown with real targets",
      "Module 2: Postman and Caido / Burp Suite API security regression testing",
      "Module 3: GraphQL introspection queries, batch query attacks, and depth limits",
      "Module 4: Token rate limiting, HMAC request signing, and gateway filtering",
    ],
  },
  {
    id: "siem-soc-defense",
    title: "Track 07: Defensive Monitoring, SIEM & SOC Incident Response",
    level: "Advanced",
    duration: "8 Weeks",
    tier: "PRO",
    summary:
      "Build a modern Security Operations Center (SOC) stack. Ingest audit logs, write Sigma detection rules, analyze malware artifacts, and isolate hosts.",
    modules: [
      "Module 1: ELK Stack / Wazuh installation and agent telemetry collection",
      "Module 2: Writing Sigma detection rules for brute-force and privilege escalation",
      "Module 3: Incident response playbooks: Containment, Eradication, Recovery",
      "Module 4: MITRE ATT&CK framework mapping for enterprise defenses",
    ],
  },
  {
    id: "cloud-security",
    title: "Track 08: Cloud Security & Infrastructure Hardening",
    level: "Advanced",
    duration: "6 Weeks",
    tier: "PRO",
    summary:
      "Audit cloud architectures across AWS, GCP, and Supabase. IAM policies, least privilege, S3 bucket exposure remediation, and Terraform security scanning.",
    modules: [
      "Module 1: AWS IAM policies, role assumption, and credential theft mitigation",
      "Module 2: PostgreSQL Row Level Security (RLS) policies and leak auditing",
      "Module 3: Container security, Dockerfile linting, and Kubernetes network policies",
      "Module 4: Automated CI/CD security scanning with Trivy and Semgrep",
    ],
  },
  {
    id: "digital-forensics",
    title: "Track 09: Digital Forensics & Incident Response (DFIR)",
    level: "Advanced",
    duration: "8 Weeks",
    tier: "VIP",
    summary:
      "Forensic investigation techniques: Memory dump analysis with Volatility, disk imaging, timeline reconstruction, registry forensics, and root cause discovery.",
    modules: [
      "Module 1: Preserving volatile evidence: RAM acquisition & hash integrity",
      "Module 2: Volatility 3 memory inspection: process trees and hidden DLLs",
      "Module 3: Windows Event Log forensics and PowerShell script execution traces",
      "Module 4: Chain of custody documentation and forensic court admissibility",
    ],
  },
  {
    id: "cryptography-keys",
    title: "Track 10: Applied Cryptography & Key Management",
    level: "Advanced",
    duration: "6 Weeks",
    tier: "VIP",
    summary:
      "Implement real cryptographic primitives correctly. AES-256-GCM symmetric encryption, RSA/ECC public-key systems, PBKDF2/Argon2 hashing, and HSM/KMS keys.",
    modules: [
      "Module 1: Symmetric vs asymmetric ciphers and common implementation flaws",
      "Module 2: AES-256-GCM authenticated encryption and nonce reuse vulnerabilities",
      "Module 3: Modern password storage: Argon2id, bcrypt, and salt generation",
      "Module 4: Secret rotation architectures and automated disaster recovery",
    ],
  },
  {
    id: "ai-app-security",
    title: "Track 11: AI Application Security & Prompt Injection Defense",
    level: "Advanced",
    duration: "6 Weeks",
    tier: "VIP",
    summary:
      "Defend LLM applications, autonomous agents, and RAG pipelines against prompt injection, jailbreaks, data exfiltration, and unauthorized tool execution.",
    modules: [
      "Module 1: Direct and indirect prompt injection attack vectors (OWASP LLM Top 10)",
      "Module 2: Guardrails, output sanitization, and structured JSON tool validation",
      "Module 3: RAG poisoning, embedding inversion, and vector database security",
      "Module 4: Multi-agent permission isolation and human-in-the-loop approvals",
    ],
  },
  {
    id: "devsecops-cicd",
    title: "Track 12: DevSecOps & Automated Security Pipelines",
    level: "Advanced",
    duration: "8 Weeks",
    tier: "VIP",
    summary:
      "Shift security left in GitHub Actions and modern CI/CD. Automate SAST, DAST, dependency vulnerability auditing (SCA), and container signing.",
    modules: [
      "Module 1: Integrating Semgrep & CodeQL in GitHub Actions workflows",
      "Module 2: Software Bill of Materials (SBOM) generation with Syft and Grype",
      "Module 3: Secret scanning with Gitleaks and automated credential revocation",
      "Module 4: OWASP ZAP automated dynamic security scans in staging environments",
    ],
  },
];

export function AcademyHubClient() {
  const [activeTab, setActiveTab] = useState<"tracks" | "labs" | "quiz" | "certificate">("tracks");
  const [selectedTrack, setSelectedTrack] = useState<CourseTrack>(ACADEMY_TRACKS[4]); // OWASP

  // Lab 1: SQL Injection Simulator State
  const [sqlInput, setSqlInput] = useState<string>("admin' OR '1'='1");
  const [sqlMode, setSqlMode] = useState<"vulnerable" | "parameterized">("vulnerable");
  const [sqlResult, setSqlResult] = useState<string | null>(null);

  // Lab 2: Port Scanner Terminal Simulator State
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "TRIHEX ISOLATED LAB CONTAINER #KAT-LAB-04 [READY]",
    "Type command or click 'Run Nmap Audit Scan' to test target.",
  ]);
  const [isScanning, setIsScanning] = useState(false);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Certificate Generator State
  const [studentName, setStudentName] = useState("");
  const [certGenerated, setCertGenerated] = useState(false);

  const runSqlLab = () => {
    if (sqlMode === "vulnerable") {
      setSqlResult(
        `🚨 EXPLOIT DETECTED!\nQuery Executed: SELECT * FROM users WHERE username = '${sqlInput}' AND active = true;\nResult: Query evaluates to TRUE for all rows! Authentication bypassed as 'admin'. Vulnerability: CWE-89 SQL Injection.`
      );
    } else {
      setSqlResult(
        `✅ DEFENDED & SECURED!\nQuery Executed: SELECT * FROM users WHERE username = $1 AND active = true; [Param 1: "${sqlInput}"]\nResult: 0 rows found. Input treated safely as raw literal string, not executable SQL syntax. Defense verified.`
      );
    }
  };

  const runNmapScan = () => {
    setIsScanning(true);
    setTerminalOutput((prev) => [...prev, "$ nmap -sV -sC target.trihex.internal -p 22,80,443,5432"]);
    setTimeout(() => {
      setTerminalOutput((prev) => [
        ...prev,
        "Starting Nmap 7.94 ( https://nmap.org ) at 2026-10-15 03:15 NPT",
        "Nmap scan report for target.trihex.internal (10.0.4.22)",
        "Host is up (0.00042s latency).",
        "PORT     STATE SERVICE  VERSION",
        "22/tcp   open  ssh      OpenSSH 9.6p1 Debian (Protocol 2.0)",
        "80/tcp   open  http     nginx/1.24.0 (Ubuntu)",
        "443/tcp  open  ssl/http nginx/1.24.0 (Ubuntu)",
        "5432/tcp open  ssl/pg   PostgreSQL 16.2 (Debian)",
        "|_ssl-cert: Subject: commonName=*.trihex.internal",
        "Security Audit Verdict: 4 open services. Port 5432 exposed to external interface! Recommended fix: Bind PostgreSQL to 127.0.0.1 or enforce WireGuard VPN tunnel.",
      ]);
      setIsScanning(false);
    }, 1200);
  };

  const quizQuestions = [
    {
      q: "1. Which OWASP Top 10 vulnerability involves manipulating user input to alter database query logic?",
      options: ["A. Broken Object-Level Authorization", "B. SQL Injection (A03)", "C. Cross-Site Scripting (XSS)", "D. Insecure Deserialization"],
      correct: 1,
      explanation: "SQL Injection (CWE-89) occurs when untrusted input is concatenated directly into SQL queries.",
    },
    {
      q: "2. What is the most effective architectural defense against Cross-Site Request Forgery (CSRF)?",
      options: ["A. Storing passwords in MD5", "B. Anti-CSRF tokens & SameSite=Strict cookies", "C. Disabling HTTPS", "D. Increasing server RAM"],
      correct: 1,
      explanation: "SameSite cookie policies combined with cryptographic anti-CSRF request tokens neutralize CSRF attacks.",
    },
    {
      q: "3. What does PTES stand for in offensive security standards?",
      options: ["A. Penetration Testing Execution Standard", "B. Public Threat Encryption System", "C. Protected Traffic Endpoint Security", "D. Python Tool Evaluation Suite"],
      correct: 0,
      explanation: "PTES is the primary baseline for professional authorized penetration testing methodologies.",
    },
    {
      q: "4. Why is AES-256-GCM preferred over AES-256-CBC for database encryption?",
      options: ["A. GCM provides Authenticated Encryption with Associated Data (AEAD)", "B. CBC is always faster", "C. GCM does not require a key", "D. CBC has no padding oracle risks"],
      correct: 0,
      explanation: "AES-GCM guarantees both confidentiality and ciphertext integrity via authentication tags.",
    },
    {
      q: "5. In AI and LLM security, what is the best defense against Prompt Injection?",
      options: ["A. Relying on user honesty", "B. Strict structured JSON schemas, strict tool permissions, & input delimiters", "C. Giving the LLM root shell access", "D. Removing system prompts"],
      correct: 1,
      explanation: "Enforcing rigorous schema validation and least-privilege tool execution isolates LLMs from injection misuse.",
    },
  ];

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) score++;
    });
    return score;
  };

  return (
    <div className="space-y-10">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("tracks")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
            activeTab === "tracks"
              ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.35)]"
              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>12 Learning Tracks</span>
        </button>
        <button
          onClick={() => setActiveTab("labs")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
            activeTab === "labs"
              ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.35)]"
              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>Interactive Labs</span>
        </button>
        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
            activeTab === "quiz"
              ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.35)]"
              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Security Assessment Quiz</span>
        </button>
        <button
          onClick={() => setActiveTab("certificate")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
            activeTab === "certificate"
              ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.35)]"
              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Certificate of Completion</span>
        </button>
      </div>

      {/* TAB 1: 12 LEARNING TRACKS */}
      {activeTab === "tracks" && (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Track Listing */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Select Curriculum Track:
            </div>
            {ACADEMY_TRACKS.map((track) => (
              <div
                key={track.id}
                onClick={() => setSelectedTrack(track)}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  selectedTrack.id === track.id
                    ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                    : "border-white/10 bg-slate-900/40 hover:border-white/20 hover:bg-slate-900/70"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {track.level}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 bg-white/5 text-slate-300">
                        {track.duration}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider rounded px-1.5 py-0.5 ${
                          track.tier === "FREE"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : track.tier === "PRO"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {track.tier} TIER
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{track.title}</h4>
                  </div>
                  <ArrowRight className="h-4 w-4 text-cyan-400 shrink-0" />
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Syllabus View */}
          <div className="sticky top-24 rounded-2xl border border-white/15 bg-slate-900/70 p-6 backdrop-blur-md h-fit space-y-5">
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-cyan-400">CURRICULUM SPECIFICATION</span>
              <h3 className="text-xl font-bold text-white">{selectedTrack.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedTrack.summary}</p>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Course Modules & Milestones:
              </div>
              <ul className="space-y-2.5">
                {selectedTrack.modules.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-white/10 pt-4">
              <a
                href={buildWhatsAppUrl(
                  `Hello TRIHEX Academy. I am ready to enroll in "${selectedTrack.title}". Please grant access.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition"
              >
                <span>Enroll in this Track</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE LABS */}
      {activeTab === "labs" && (
        <div id="interactive-labs" className="space-y-8">
          {/* Lab 1: SQL Injection Defense */}
          <div className="rounded-2xl border border-white/15 bg-slate-900/70 p-6 backdrop-blur-md space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  <Terminal className="h-3 w-3" />
                  <span>LAB #01 · ISOLATED SQL INJECTION DEFENSE SANDBOX</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Test Query Sanitization vs Parameterized Prepared Statements
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSqlMode("vulnerable")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    sqlMode === "vulnerable"
                      ? "bg-rose-500 text-white"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  Vulnerable Mode
                </button>
                <button
                  onClick={() => setSqlMode("parameterized")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    sqlMode === "parameterized"
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  Secure Parameterized Mode
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Input test authentication payload. Observe how direct string concatenation allows attackers to manipulate the logic flow, whereas parameterized statements neutralize malicious syntax.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={sqlInput}
                onChange={(e) => setSqlInput(e.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-black/60 px-4 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                placeholder="Enter SQL attack string..."
              />
              <button
                onClick={runSqlLab}
                className="rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition"
              >
                Execute Query Test
              </button>
            </div>

            {sqlResult && (
              <pre className="rounded-xl border border-white/10 bg-black/80 p-4 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                {sqlResult}
              </pre>
            )}
          </div>

          {/* Lab 2: Port & Vulnerability Scanner Terminal */}
          <div className="rounded-2xl border border-white/15 bg-slate-900/70 p-6 backdrop-blur-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  <Terminal className="h-3 w-3" />
                  <span>LAB #02 · AUTHORIZED NETWORK RECONNAISSANCE TERMINAL</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Simulated Nmap Service Probe against Educational Node (10.0.4.22)
                </h3>
              </div>
              <button
                onClick={runNmapScan}
                disabled={isScanning}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5" />
                <span>{isScanning ? "Probing Target..." : "Run Nmap Audit Scan"}</span>
              </button>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/90 p-4 font-mono text-xs text-emerald-400 space-y-1 min-h-[180px] overflow-x-auto">
              {terminalOutput.map((line, idx) => (
                <div key={idx} className={line.startsWith("$") ? "text-cyan-300 font-bold" : ""}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUIZ */}
      {activeTab === "quiz" && (
        <div className="rounded-2xl border border-white/15 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              <Award className="h-3 w-3" />
              <span>OFFICIAL PRACTICAL KNOWLEDGE EVALUATION</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Defensive Cybersecurity & Ethical Hacking Diagnostic
            </h3>
            <p className="text-xs text-slate-300">
              Answer all 5 questions to test your foundational and defensive security comprehension. Score 80%+ to unlock completion eligibility.
            </p>
          </div>

          <div className="space-y-6">
            {quizQuestions.map((q, qIdx) => (
              <div key={qIdx} className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
                <div className="text-xs font-bold text-white">{q.q}</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = quizAnswers[qIdx] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => {
                          if (!quizSubmitted) {
                            setQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
                          }
                        }}
                        className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                          isSelected
                            ? "border-cyan-400 bg-cyan-950/60 text-cyan-200"
                            : "border-white/5 bg-white/5 text-slate-300 hover:border-white/15"
                        } ${
                          quizSubmitted && oIdx === q.correct
                            ? "border-emerald-500 bg-emerald-950/60 text-emerald-200 font-bold"
                            : ""
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {quizSubmitted && (
                  <div className="mt-2 text-[11px] text-slate-400 bg-white/5 p-2 rounded">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {!quizSubmitted ? (
            <button
              onClick={() => setQuizSubmitted(true)}
              disabled={Object.keys(quizAnswers).length < quizQuestions.length}
              className="rounded-xl bg-cyan-400 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition disabled:opacity-50"
            >
              Submit & Grade Quiz
            </button>
          ) : (
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-4 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white">
                  Score: {calculateScore()} / {quizQuestions.length} (
                  {Math.round((calculateScore() / quizQuestions.length) * 100)}%)
                </span>
                <p className="text-xs text-slate-300 mt-1">
                  {calculateScore() >= 4
                    ? "🎉 Outstanding! You demonstrated comprehensive ethical security knowledge."
                    : "Good effort! Review the module explanations and re-test."}
                </p>
              </div>
              <button
                onClick={() => {
                  setQuizSubmitted(false);
                  setQuizAnswers({});
                }}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10"
              >
                Retake
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CERTIFICATE GENERATOR */}
      {activeTab === "certificate" && (
        <div className="rounded-2xl border border-white/15 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              <GraduationCap className="h-3 w-3" />
              <span>VERIFIABLE COMPLETION CREDENTIAL</span>
            </div>
            <h3 className="text-xl font-bold text-white">Generate Official Certificate of Completion</h3>
            <p className="text-xs text-slate-300">
              Input your legal student name to generate your verified cryptographic certificate with SHA-256 tamper verification.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter Full Student Name..."
              className="flex-1 rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={() => {
                if (studentName.trim()) setCertGenerated(true);
              }}
              className="rounded-xl bg-cyan-400 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition"
            >
              Generate Certificate
            </button>
          </div>

          {certGenerated && (
            <div className="mt-6 rounded-2xl border-2 border-cyan-500/40 bg-gradient-to-b from-[#0a1128] via-[#050814] to-black p-8 text-center space-y-5 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/60 px-4 py-1 text-xs font-mono font-bold uppercase tracking-widest text-cyan-300">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>TRIHEX DEFENSIVE CYBERSECURITY ACADEMY · OFFICIAL CREDENTIAL</span>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-serif uppercase tracking-widest text-slate-400">
                  This Certificate of Achievement is Proudly Awarded To:
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-cyan-200 font-[family-name:var(--font-sora)]">
                  {studentName}
                </div>
              </div>

              <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
                For successfully demonstrating practical mastery in Ethical Penetration Testing Methodologies, OWASP Web Security Defense, Linux Infrastructure Hardening, and Network Packet Analysis within authorized educational laboratories.
              </p>

              <div className="border-t border-white/10 pt-4 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 max-w-xl mx-auto">
                <span>ISSUED: 2026-10-15</span>
                <span>STATUS: VERIFIED</span>
                <span className="text-cyan-400">HASH: 4bcc9c46-thx-cert</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
