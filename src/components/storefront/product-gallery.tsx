"use client";

import { useState } from "react";
import Image from "next/image";
import { FeaturePosterLightbox } from "@/components/storefront/feature-poster-lightbox";
import { Sparkles, Layers } from "lucide-react";
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

  const activeImage = validImages[selectedIndex] || validImages[0] || "/brand/trihex-mark.webp";

  return (
    <div className="space-y-4">
      {/* Main Interactive Lightbox Viewer */}
      <FeaturePosterLightbox
        src={activeImage}
        alt={`${title} feature infographic`}
        title={title}
        className="w-full max-w-xl shadow-[0_8px_30px_rgba(13,28,43,0.06)]"
        priority={priority}
      />

      {/* Multiple Gallery Thumbnail Navigation Strip */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
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
                      isSelected ? "text-blue-700" : "text-slate-800 group-hover:text-slate-900",
                    )}
                  >
                    {label}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-500">
                    {isInfographic ? "12 Features & Spec" : "Quick Summary"}
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
