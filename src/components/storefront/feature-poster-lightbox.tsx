"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Maximize2, X, ZoomIn, ZoomOut, RotateCcw, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturePosterLightboxProps {
  src: string;
  alt: string;
  title: string;
  images?: string[];
  className?: string;
  priority?: boolean;
}

export function FeaturePosterLightbox({
  src,
  alt,
  title,
  images,
  className,
  priority = false,
}: FeaturePosterLightboxProps) {
  const allImages = images && images.length > 0 ? images : [src];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Sync current index if initial src changes
  useEffect(() => {
    const idx = allImages.indexOf(src);
    if (idx !== -1) setCurrentIndex(idx);
  }, [src, allImages]);

  const activeSrc = allImages[currentIndex] || src;

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
    setZoomLevel(1);
  }, [allImages.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
    setZoomLevel(1);
  }, [allImages.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setZoomLevel(1);
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    },
    [handlePrev, handleNext],
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

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.35, 2.5));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.35, 1));
  const resetZoom = () => setZoomLevel(1);

  return (
    <>
      {/* Thumbnail preview with 4:5 vertical ratio and pearl-white ambient background */}
      <div
        onClick={() => setIsOpen(true)}
        className={cn(
          "group relative cursor-zoom-in overflow-hidden rounded-2xl border border-slate-200/80 bg-[linear-gradient(160deg,#ffffff_0%,#f8fafc_60%,#eff6ff_100%)] shadow-sm transition duration-300 hover:border-blue-500/40 hover:shadow-[0_16px_36px_rgba(37,99,235,0.09)]",
          className,
        )}
      >
        <div className="relative aspect-[4/5] w-full">
          <Image
            src={activeSrc}
            alt={alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 640px"
            quality={82}
            className="object-contain p-2.5 transition duration-500 group-hover:scale-[1.018]"
            priority={priority}
          />
        </div>

        {/* Hover overlay hint */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-xl border border-white/90 bg-slate-950/80 px-3.5 py-2 text-white opacity-0 shadow-lg backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
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
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950/94 p-3 sm:p-5 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
              setZoomLevel(1);
            }
          }}
        >
          {/* Top Control Bar */}
          <div className="flex w-full max-w-5xl items-center justify-between px-2 py-2 text-white">
            <div className="flex items-center gap-2.5">
              <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-cyan-300 border border-blue-400/30">
                Official Spec Poster
              </span>
              <h3 className="font-[family-name:var(--font-sora)] text-sm font-semibold text-white/90 sm:text-base line-clamp-1">
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
                <span className="px-2 text-xs font-mono font-medium text-white/90 min-w-11 text-center">
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
            {/* Gallery Previous Arrow */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            <div
              className="relative max-h-[82vh] max-w-[90vw] transition-transform duration-200 flex items-center justify-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <Image
                src={activeSrc}
                alt={alt}
                width={1600}
                height={2400}
                unoptimized
                className="max-h-[80vh] w-auto rounded-xl object-contain shadow-2xl ring-1 ring-white/10"
                priority
              />
            </div>

            {/* Gallery Next Arrow */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Bottom Control / Gallery indicators */}
          <div className="flex flex-col items-center gap-1.5 py-1 text-center text-xs text-white/70">
            {allImages.length > 1 && (
              <div className="flex items-center gap-1.5 mb-1">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(i);
                      setZoomLevel(1);
                    }}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-200",
                      i === currentIndex ? "w-6 bg-cyan-400" : "w-1.5 bg-white/40 hover:bg-white/60",
                    )}
                    aria-label={`View image ${i + 1}`}
                  />
                ))}
              </div>
            )}
            <div>
              Press <kbd className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] text-white">ESC</kbd> to close · Scroll or zoom to inspect features in detail
            </div>
          </div>
        </div>
      )}
    </>
  );
}

