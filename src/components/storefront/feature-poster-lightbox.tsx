"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Maximize2, X, ZoomIn, ZoomOut, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturePosterLightboxProps {
  src: string;
  alt: string;
  title: string;
  className?: string;
  priority?: boolean;
}

export function FeaturePosterLightbox({
  src,
  alt,
  title,
  className,
  priority = false,
}: FeaturePosterLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setZoomLevel(1);
      }
    },
    [],
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.3, 2.5));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.3, 1));
  const resetZoom = () => setZoomLevel(1);

  return (
    <>
      {/* Thumbnail with interactive hover trigger */}
      <div
        onClick={() => setIsOpen(true)}
        className={cn(
          "group relative cursor-zoom-in overflow-hidden rounded-2xl border border-[var(--border)] bg-[linear-gradient(145deg,#f4f7fb,#ffffff)] shadow-sm transition duration-300 hover:border-[var(--primary)]/40 hover:shadow-[0_12px_32px_rgba(16,24,39,.12)]",
          className,
        )}
      >
        <div className="relative aspect-square w-full">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 640px"
            className="object-contain p-2 transition duration-500 group-hover:scale-[1.015]"
            priority={priority}
          />
        </div>

        {/* Hover overlay hint */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-xl border border-white/80 bg-black/75 px-3.5 py-2 text-white opacity-0 shadow-lg backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
            Click to view full feature infographic
          </span>
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 text-white">
            <Maximize2 className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/92 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
              setZoomLevel(1);
            }
          }}
        >
          {/* Top Control Bar */}
          <div className="flex w-full max-w-5xl items-center justify-between px-2 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                Official Spec Poster
              </span>
              <h3 className="font-[family-name:var(--font-sora)] text-sm font-semibold text-white/90 sm:text-base">
                {title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg border border-white/10 bg-white/10 p-1">
                <button
                  type="button"
                  onClick={zoomOut}
                  disabled={zoomLevel <= 1}
                  className="rounded p-1.5 text-white/80 hover:bg-white/20 disabled:opacity-40"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="px-2 text-xs font-mono font-medium text-white/90">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={zoomIn}
                  disabled={zoomLevel >= 2.5}
                  className="rounded p-1.5 text-white/80 hover:bg-white/20 disabled:opacity-40"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={resetZoom}
                  className="ml-1 rounded p-1.5 text-white/80 hover:bg-white/20"
                  aria-label="Reset zoom"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setZoomLevel(1);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition hover:bg-white/25"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main Poster Display Container */}
          <div
            className="relative flex flex-1 w-full max-w-5xl items-center justify-center overflow-auto p-2"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsOpen(false);
                setZoomLevel(1);
              }
            }}
          >
            <div
              className="relative max-h-[82vh] max-w-[85vw] transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <Image
                src={src}
                alt={alt}
                width={1200}
                height={1200}
                className="max-h-[80vh] w-auto rounded-xl object-contain shadow-2xl ring-1 ring-white/10"
                priority
              />
            </div>
          </div>

          {/* Bottom Hint */}
          <div className="py-2 text-center text-xs text-white/60">
            Press <kbd className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] text-white">ESC</kbd> or click outside to close · Drag or scroll to inspect features
          </div>
        </div>
      )}
    </>
  );
}
