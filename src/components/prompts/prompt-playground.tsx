"use client";

import { useState, useMemo } from "react";
import { Copy, Check, Sparkles, RefreshCw, Cpu, Tag, Share2 } from "lucide-react";
import { Prompt, interpolatePrompt } from "@/lib/prompts/types";

interface PromptPlaygroundProps {
  prompt: Prompt;
}

export function PromptPlayground({ prompt }: PromptPlaygroundProps) {
  // Initialize form state with variable default values or empty strings
  const initialValues = useMemo(() => {
    const map: Record<string, string> = {};
    for (const v of prompt.variables) {
      map[v.name] = v.defaultValue || "";
    }
    return map;
  }, [prompt.variables]);

  const [formValues, setFormValues] = useState<Record<string, string>>(initialValues);
  const [copied, setCopied] = useState(false);

  // Generate real-time customized prompt
  const customizedPrompt = useMemo(() => {
    return interpolatePrompt(prompt.content, formValues);
  }, [prompt.content, formValues]);

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
      {/* Variable Customization Panel (if variables exist) */}
      {prompt.variables.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm sm:text-base font-semibold text-white">
                Customize Prompt Variables ({prompt.variables.length})
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
            {prompt.variables.map((variable) => {
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

          <div className="text-[11px] font-mono text-slate-500">
            License: <span className="text-slate-300">{prompt.license}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
