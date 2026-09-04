"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
  size?: "sm" | "md";
}

export function CopyButton({ textToCopy, className, size = "sm" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border transition",
        copied
          ? "border-emerald-500 bg-emerald-50 text-emerald-600"
          : "border-[var(--border)] bg-white text-slate-600 hover:bg-[var(--page-soft)] hover:text-slate-900",
        size === "sm" ? "h-7 px-2 text-xs" : "h-9 px-3 text-sm",
        className
      )}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 mr-1" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}
