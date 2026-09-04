"use client";

import { useState, useMemo } from "react";
import { Copy, Check, Sparkles, RefreshCw, Cpu, History, Calendar, Hash } from "lucide-react";
import { Prompt, PromptVersion, extractPromptVariables, interpolatePrompt } from "@/lib/prompts/types";

interface PromptPlaygroundProps {
  prompt: Prompt;
  versions?: PromptVersion[];
}

export function PromptPlayground({ prompt, versions = [] }: PromptPlaygroundProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  // Active content based on version selection
  const activeVersion = useMemo(() => {
    if (!selectedVersionId) return null;
    return versions.find((v) => v.id === selectedVersionId) || null;
  }, [selectedVersionId, versions]);

  const activeContent = activeVersion ? activeVersion.content : prompt.content;

  // Extract variables for currently displayed content
  const activeVariables = useMemo(() => {
    return activeVersion ? extractPromptVariables(activeVersion.content) : prompt.variables;
  }, [activeVersion, prompt.variables]);

  // Initialize form state with variable default values
  const initialValues = useMemo(() => {
    const map: Record<string, string> = {};
    for (const v of activeVariables) {
      map[v.name] = v.defaultValue || "";
    }
    return map;
  }, [activeVariables]);

  const [formValues, setFormValues] = useState<Record<string, string>>(initialValues);
  const [copied, setCopied] = useState(false);

  // Generate real-time customized prompt
  const customizedPrompt = useMemo(() => {
    return interpolatePrompt(activeContent, formValues);
  }, [activeContent, formValues]);

  const handleInputChange = (varName: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [varName]: value,
    }));
  };

  const handleReset = () => {
    setFormValues(initialValues);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Version History Toolbar if versions exist */}
      {versions.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <History className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold">Version History:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedVersionId(null)}
                className={`px-2.5 py-1 rounded-lg font-mono transition-all ${
                  selectedVersionId === null
                    ? "bg-cyan-500 text-white font-bold shadow-sm"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                Latest (v{versions[0]?.version || 1})
              </button>
              {versions.slice(1).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVersionId(v.id)}
                  className={`px-2.5 py-1 rounded-lg font-mono transition-all ${
                    selectedVersionId === v.id
                      ? "bg-cyan-500 text-white font-bold shadow-sm"
                      : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  v{v.version}
                </button>
              ))}
            </div>
          </div>

          {activeVersion && (
            <div className="flex items-center gap-2 text-[11px] text-amber-300/90 font-mono">
              <Calendar className="w-3 h-3" />
              <span>Viewing revision v{activeVersion.version} ({new Date(activeVersion.capturedAt).toLocaleDateString()})</span>
            </div>
          )}
        </div>
      )}

      {/* Variable Customization Panel (if variables exist) */}
      {activeVariables.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm sm:text-base font-semibold text-white">
                Customize Prompt Variables ({activeVariables.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeVariables.map((variable) => {
              const val = formValues[variable.name] ?? "";
              return (
                <div key={variable.name} className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    {variable.label || variable.name}
                    {variable.required && <span className="text-rose-400 ml-1">*</span>}
                  </label>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => handleInputChange(variable.name, e.target.value)}
                    placeholder={`Enter ${variable.label || variable.name}...`}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Output / Interactive Code Box */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-950/80 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Ready-to-Use Prompt</span>
            {activeVersion && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
                Revision v{activeVersion.version}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/20 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Prompt
                </>
              )}
            </button>
          </div>
        </div>

        {/* Formatted Content */}
        <div className="p-4 sm:p-6 bg-slate-950/50">
          <pre className="text-xs sm:text-sm text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto selection:bg-blue-500/30">
            {customizedPrompt}
          </pre>
        </div>

        {/* Model Compatibility Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Recommended Models:</span>
            <div className="flex flex-wrap gap-1.5">
              {prompt.modelCompatibility.map((model) => (
                <span
                  key={model}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] font-medium"
                >
                  {model}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
            {prompt.contentHash && (
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3 opacity-60" />
                <span>{prompt.contentHash.slice(0, 8)}</span>
              </span>
            )}
            <span>License: <span className="text-slate-300">{prompt.license}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
