"use client";

import { useState } from "react";
import { 
  FileCode, 
  FileText, 
  Copy, 
  Check, 
  ShieldCheck, 
  FolderTree, 
  Terminal, 
  Layers,
  Cpu,
  Info
} from "lucide-react";
import { AgentSkill, SkillFile } from "@/lib/skills/types";

interface SkillViewerProps {
  skill: AgentSkill;
}

export function SkillViewer({ skill }: SkillViewerProps) {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeFile = skill.files[activeFileIndex] || skill.files[0];

  const handleCopy = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Security & Sandboxing Banner */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Inert Code Verification:</strong> This skill contains static instructions and scripts designed for agent environments. Code is sandboxed and never executed automatically in browser.
          </span>
        </div>
        <span className="shrink-0 font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
          v{skill.version}
        </span>
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
