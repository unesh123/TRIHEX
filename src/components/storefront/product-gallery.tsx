"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FeaturePosterLightbox } from "@/components/storefront/feature-poster-lightbox";
import { Sparkles, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  slug: string;
  title: string;
  images: string[];
  priority?: boolean;
}

export function ProductGallery({
  slug,
  title,
  images,
  priority = false,
}: ProductGalleryProps) {
  const validImages = images.filter(Boolean);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeImage =
    validImages[selectedIndex] || validImages[0] || "/brand/trihex-mark.webp";

  // Handle native scroll swipe on mobile
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth <= 0) return;
    const newIdx = Math.round(scrollLeft / clientWidth);
    if (newIdx !== selectedIndex && newIdx >= 0 && newIdx < validImages.length) {
      setSelectedIndex(newIdx);
    }
  };

  const scrollToSlide = (idx: number) => {
    setSelectedIndex(idx);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: idx * scrollRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-3.5">
      {/* 1. Mobile Touch-Native Horizontal Swiper (< md) */}
      <div className="md:hidden relative w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-[linear-gradient(160deg,#ffffff_0%,#f8fafc_60%,#eff6ff_100%)] shadow-sm">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
        >
          {validImages.map((imgUrl, idx) => (
            <div
              key={imgUrl + idx}
              className="relative aspect-[4/5] w-full shrink-0 snap-center p-3"
            >
              <FeaturePosterLightbox
                src={imgUrl}
                alt={`${title} view ${idx + 1}`}
                title={title}
                images={validImages}
                priority={priority && idx === 0}
                className="h-full w-full border-0 shadow-none bg-transparent"
              />
            </div>
          ))}
        </div>

        {/* Mobile Swipe Indicators / Dots */}
        {validImages.length > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 pointer-events-none">
            <div className="flex items-center gap-1.5 rounded-full bg-slate-950/60 px-2.5 py-1 backdrop-blur-md">
              {validImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => scrollToSlide(idx)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-200 pointer-events-auto",
                    idx === selectedIndex
                      ? "w-4 bg-white"
                      : "w-1.5 bg-white/50 hover:bg-white/80",
                  )}
                />
              ))}
              <span className="ml-1 text-[10px] font-bold text-white/90">
                {selectedIndex + 1}/{validImages.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Desktop Lightbox Viewer (>= md) */}
      <div className="hidden md:block">
        <FeaturePosterLightbox
          src={activeImage}
          alt={`${title} feature infographic`}
          title={title}
          images={validImages}
          className="w-full max-w-xl shadow-[0_8px_30px_rgba(13,28,43,0.06)]"
          priority={priority}
        />
      </div>

      {/* 3. Desktop Thumbnail Strip (>= md) */}
      {validImages.length > 1 && (
        <div className="hidden md:flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
          {validImages.map((imgUrl, idx) => {
            const isSelected = idx === selectedIndex;
            const isInfographic = imgUrl.includes("infographic");
            const label = isInfographic ? "Full Infographic" : "Overview Card";

            return (
              <button
                key={imgUrl + idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={cn(
                  "group relative flex items-center gap-2 rounded-xl border p-1.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  isSelected
                    ? "border-blue-600 bg-blue-50/60 shadow-sm ring-1 ring-blue-500/20"
                    : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                <div className="relative h-14 w-11 overflow-hidden rounded-lg bg-slate-100">
                  <Image
                    src={imgUrl}
                    alt={`${title} view ${idx + 1}`}
                    fill
                    sizes="44px"
                    quality={75}
                    className="object-contain p-0.5"
                  />
                </div>
                <div className="flex flex-col items-start pr-2.5 text-left">
                  <span
                    className={cn(
                      "text-[11px] font-bold leading-tight",
                      isSelected
                        ? "text-blue-700"
                        : "text-slate-800 group-hover:text-slate-900",
                    )}
                  >
                    {label}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-500">
                    {isInfographic ? "Feature Spec" : "Overview"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
