import Image from "next/image";
import { FamilyArtwork } from "@/components/storefront/family-artwork";
import {
  getProductCover,
  isRasterCover,
  type ProductCoverEntry,
} from "@/lib/catalog/product-covers";
import type { BrandFamily } from "@/components/storefront/family-artwork";
import { getGeneratedCover } from "@/lib/catalog/generated-covers";
import { cn } from "@/lib/utils";

export function ProductCover({
  slug,
  family,
  title,
  className,
  priority = false,
  coverPublicPath,
}: {
  slug: string;
  family: BrandFamily;
  title: string;
  className?: string;
  priority?: boolean;
  coverPublicPath?: string | null;
}) {
  const generatedPath = getGeneratedCover(slug, family);
  const manifest: ProductCoverEntry | null = getProductCover(slug);
  const cover: ProductCoverEntry | null = generatedPath
    ? {
        slug,
        family: String(family),
        canonical: generatedPath.split("/").pop() ?? slug,
        publicPath: generatedPath,
        mode: "ARTWORK_ONLY",
        alt: title,
      }
    : coverPublicPath
    ? {
        slug,
        family: String(family),
        canonical: coverPublicPath.split("/").pop() ?? slug,
        publicPath: coverPublicPath,
        mode: "ARTWORK_ONLY",
        alt: title,
      }
    : manifest;

  if (isRasterCover(cover) && cover) {
    const isRemote = cover.publicPath.startsWith("http");
    return (
      <div
        className={cn(
          "relative aspect-square w-full overflow-hidden rounded-xl bg-[var(--page-soft)]",
          className,
        )}
      >
        <Image
          src={cover.publicPath}
          alt={cover.alt || title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
          className="object-cover transition duration-500"
          priority={priority}
          unoptimized={isRemote}
        />
      </div>
    );
  }

  return (
    <FamilyArtwork family={family} title={title} className={className} />
  );
}
