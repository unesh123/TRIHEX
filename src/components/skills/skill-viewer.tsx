"use client";

import { useState, useMemo } from "react";
import { 
  FileCode, 
  FileText, 
  Copy, 
  Check, 
  ShieldCheck, 
  ShieldAlert,
  FolderTree, 
  Terminal, 
  Cpu,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Hash
} from "lucide-react";
import { AgentSkill } from "@/lib/skills/types";
import { scanAgentSkill, SkillSecurityScanResult } from "@/lib/skills/security-scanner";

interface SkillViewerProps {
  skill: AgentSkill;
}

export function SkillViewer({ skill }: SkillViewerProps) {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [showFindings, setShowFindings] = useState(false);

  const activeFile = skill.files[activeFileIndex] || skill.files[0];

  const scanResult: SkillSecurityScanResult = useMemo(() => {
    return scanAgentSkill(skill);
  }, [skill]);

  const handleCopy = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(scanResult.sha256Checksum);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Security & Sandboxing Banner */}
      <div className={`rounded-2xl border p-4 text-xs transition-all ${
        scanResult.riskLevel === "LOW"
          ? "bg-emerald-950/30 border-emerald-500/20 text-emerald-300"
          : scanResult.riskLevel === "MEDIUM"
          ? "bg-amber-950/30 border-amber-500/30 text-amber-300"
          : "bg-rose-950/30 border-rose-500/40 text-rose-300"
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            {scanResult.riskLevel === "LOW" ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
            )}
            <div>
              <div className="font-semibold flex items-center gap-2">
                <span>
                  {scanResult.riskLevel === "LOW"
                    ? "Inert Code Verified (Safe for Agent Execution)"
                    : "External code — review before execution"}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold ${
                  scanResult.riskLevel === "LOW"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : scanResult.riskLevel === "MEDIUM"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}>
                  Risk: {scanResult.riskLevel}
                </span>
              </div>
              <p className="text-[11px] opacity-80 mt-0.5">
                Static analysis scanned {scanResult.scannedFilesCount} files ({scanResult.scannedBytes} bytes). Sandboxed for agent environments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {scanResult.findings.length > 0 && (
              <button
                type="button"
                onClick={() => setShowFindings(!showFindings)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-medium transition-all"
              >
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>{scanResult.findings.length} findings</span>
                {showFindings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyHash}
              title="Copy SHA-256 Integrity Checksum"
              className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-1 rounded bg-black/40 border border-white/10 hover:border-white/20 text-slate-300 transition-all"
            >
              <Hash className="w-3 h-3 opacity-60" />
              <span>{scanResult.sha256Checksum.slice(0, 8)}...</span>
              {copiedHash ? (
                <Check className="w-3 h-3 text-emerald-400 ml-1" />
              ) : (
                <Copy className="w-3 h-3 opacity-60 ml-1" />
              )}
            </button>

            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/10">
              v{skill.version}
            </span>
          </div>
        </div>

        {/* Expandable Security Findings */}
        {showFindings && scanResult.findings.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
            <div className="text-[11px] font-semibold tracking-wide text-slate-300">
              Detected Patterns:
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {scanResult.findings.map((f, idx) => (
                <div
                  key={`${f.ruleId}-${idx}`}
                  className="p-2 rounded-lg bg-black/40 border border-white/10 text-[11px] flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-slate-400">
                      {f.filePath}:{f.lineNumber}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                      f.severity === "CRITICAL"
                        ? "bg-rose-500/20 text-rose-300"
                        : f.severity === "HIGH"
                        ? "bg-orange-500/20 text-orange-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}>
                      {f.severity}
                    </span>
                  </div>
                  <div className="text-slate-200">{f.message}</div>
                  <pre className="font-mono text-[10px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded overflow-x-auto">
                    {f.snippet}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main File Explorer Container */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/90 overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          {/* File Explorer Sidebar */}
          <div className="p-4 bg-slate-950/70 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
              <FolderTree className="w-3.5 h-3.5" />
              Skill Files ({skill.files.length})
            </div>

            <nav className="space-y-1">
              {skill.files.map((file, idx) => {
                const isActive = idx === activeFileIndex;
                return (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => setActiveFileIndex(idx)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs transition-all text-left ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {file.filename.endsWith(".md") ? (
                        <FileText className="w-3.5 h-3.5 shrink-0 opacity-80" />
                      ) : (
                        <FileCode className="w-3.5 h-3.5 shrink-0 opacity-80" />
                      )}
                      <span className="truncate">{file.path}</span>
                    </div>
                    <span className="text-[10px] opacity-70 font-mono">
                      {(file.sizeBytes / 1024).toFixed(1)}k
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Supported Agents */}
            <div className="pt-4 mt-4 border-t border-white/10 px-2 space-y-2">
              <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-blue-400" /> Compatible Runtimes
              </div>
              <div className="flex flex-wrap gap-1">
                {skill.compatibility.map((runtime) => (
                  <span
                    key={runtime}
                    className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300"
                  >
                    {runtime}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* File Content Area */}
          <div className="lg:col-span-3 flex flex-col bg-slate-950/90">
            {/* Action Bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-950 border-b border-white/10">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>{activeFile.path}</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-500 uppercase text-[10px]">
                  {activeFile.language}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Code
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="p-4 sm:p-6 overflow-x-auto max-h-[600px] overflow-y-auto">
              <pre className="text-xs sm:text-sm font-mono text-slate-200 leading-relaxed whitespace-pre selection:bg-blue-500/30">
                {activeFile.content}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
