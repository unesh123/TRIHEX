"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  resolveProductThumbnail,
  FALLBACK_PRODUCT_IMAGE,
  type ResolveProductInput,
} from "@/lib/catalog/product-image-resolver";
import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

interface ProductImageProps {
  product: ResolveProductInput & {
    title?: string;
    categoryLabel?: string;
  };
  alt?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
}

export function ProductImage({
  product,
  alt,
  sizes = "(max-width: 639px) calc(100vw - 32px), (max-width: 767px) calc(50vw - 24px), (max-width: 1023px) 33vw, 240px",
  priority = false,
  className,
  containerClassName,
}: ProductImageProps) {
  const initialSrc = resolveProductThumbnail(product);
  const [currentSrc, setCurrentSrc] = useState<string>(initialSrc);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync if product changes
  useEffect(() => {
    const resolved = resolveProductThumbnail(product);
    setCurrentSrc(resolved);
    setHasError(false);
    setIsLoaded(false);
  }, [product.slug, product.thumbnailPublicPath, product.coverPublicPath]);

  const handleError = () => {
    // If exact thumbnail failed, attempt fallback to generic fallback-product.webp
    if (currentSrc !== FALLBACK_PRODUCT_IMAGE) {
      setCurrentSrc(FALLBACK_PRODUCT_IMAGE);
    } else {
      // If even fallback image fails, trigger the branded vector placeholder
      setHasError(true);
    }
  };

  const imageAlt = alt ?? `${product.title ?? product.slug} product image`;
  const isRemoteExternal =
    currentSrc.startsWith("http") && !currentSrc.includes("supabase.co");

  return (
    <div
      className={cn(
        "relative aspect-[4/5] w-full overflow-hidden border-b border-slate-100 bg-[linear-gradient(160deg,#ffffff_0%,#f8fafc_60%,#eff6ff_100%)]",
        containerClassName,
      )}
    >
      {/* 1. Loading Skeleton Shimmer */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-0 animate-pulse bg-slate-100/80 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-2 border-blue-500/20 border-t-blue-600 animate-spin" />
        </div>
      )}

      {/* 2. Main Image with Next.js high-performance optimization */}
      {!hasError ? (
        <Image
          src={currentSrc}
          alt={imageAlt}
          fill
          unoptimized={isRemoteExternal}
          sizes={sizes}
          quality={80}
          priority={priority}
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          className={cn(
            "object-contain p-2.5 transition-all duration-300 group-hover:scale-[1.025]",
            isLoaded ? "opacity-100" : "opacity-0",
            className,
          )}
        />
      ) : (
        /* 3. High-Fidelity Branded SVG Placeholder (Never broken dark navy rectangle) */
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-between p-5 text-center bg-gradient-to-br from-white via-slate-50 to-blue-50">
          <div className="flex items-center gap-1.5 pt-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-700">
              TRIHEX DIGITAL
            </span>
          </div>

          <div className="flex flex-col items-center my-auto">
            {/* Hex Emblem */}
            <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50/80 shadow-sm">
              <span className="font-[family-name:var(--font-sora)] text-2xl font-black text-blue-600">
                ⬡
              </span>
            </div>
            <h4 className="line-clamp-2 font-[family-name:var(--font-sora)] text-sm font-bold text-slate-900 leading-tight">
              {product.title ?? product.slug}
            </h4>
            <span className="mt-1 inline-block rounded-full bg-slate-200/70 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-600">
              {product.categoryLabel ?? "AI & Digital"}
            </span>
          </div>

          <p className="pb-1 text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
            100% Genuine Activation
          </p>
        </div>
      )}
    </div>
  );
}
