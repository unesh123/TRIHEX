import fs from "fs";
import path from "path";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  getLiveMerchCardBySlug,
  getLiveMerchandisingCatalogue,
} from "@/lib/catalog/merchandising";
import { ALL_SEED_PRODUCTS } from "@/db/seed-data";
import {
  OWNER_AVAILABLE,
  OWNER_UNDER_REVIEW,
  OWNER_ARCHIVE_SLUGS,
  OWNER_BLOCKED_SLUGS,
} from "@/db/catalogue-overrides";
import {
  resolveProductThumbnail,
  resolveProductInfographic,
  resolveProductGallery,
} from "@/lib/catalog/product-image-resolver";
import { formatNpr } from "@/lib/money";
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, Database, Layers, Tag, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function checkDisk(p?: string | null): { exists: boolean; sizeKb: number } {
  if (!p) return { exists: false, sizeKb: 0 };
  try {
    const absPath = path.join(process.cwd(), "public", p.replace(/^\//, ""));
    if (fs.existsSync(absPath)) {
      const stats = fs.statSync(absPath);
      return { exists: true, sizeKb: Math.round(stats.size / 1024) };
    }
  } catch {
    // Ignore
  }
  return { exists: false, sizeKb: 0 };
}

export default async function AdminCatalogueTracePage({ params }: PageProps) {
  const { slug } = await params;
  const card = await getLiveMerchCardBySlug(slug);
  const seed = ALL_SEED_PRODUCTS.find((p) => p.slug === slug);
  const ownerAvailable = OWNER_AVAILABLE.find((o) => o.slug === slug);
  const ownerUnderReview = OWNER_UNDER_REVIEW.find((o) => o.slug === slug);
  const isArchived = (OWNER_ARCHIVE_SLUGS as readonly string[]).includes(slug);
  const isBlocked = (OWNER_BLOCKED_SLUGS as readonly string[]).includes(slug);

  if (!card && !seed) {
    notFound();
  }

  const thumbPath = resolveProductThumbnail(card ?? { slug });
  const infoPath = resolveProductInfographic(card ?? { slug });
  const gallery = resolveProductGallery(card ?? { slug });

  const thumbCheck = checkDisk(thumbPath);
  const infoCheck = checkDisk(infoPath);

  const priceNpr = card?.priceNprMinor ? card.priceNprMinor / 100 : 0;
  const costUsd = seed?.variants[0]?.supplierCostUsdMinor ? seed.variants[0].supplierCostUsdMinor / 100 : 0;
  const costNpr = ownerAvailable?.costNpr ?? (costUsd > 0 ? Math.round(costUsd * 160) : 0);
  const profitNpr = priceNpr > 0 && costNpr > 0 ? priceNpr - costNpr : 0;
  const marginPct = priceNpr > 0 && profitNpr > 0 ? Math.round((profitNpr / priceNpr) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/media-health"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Media Health</span>
        </Link>
      </div>

      <AdminHeader
        title={`Forensic Trace: ${card?.title ?? seed?.name ?? slug}`}
        description={`Complete provenance and pricing pipeline trace for slug: ${slug}`}
      />

      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-14 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {thumbCheck.exists ? (
              <Image
                src={thumbPath}
                alt=""
                fill
                sizes="56px"
                className="object-contain p-1"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{card?.title ?? seed?.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="font-mono text-xs text-slate-400">{slug}</span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-semibold text-slate-600">{card?.brandName}</span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-semibold text-slate-600">{card?.categoryName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {card && (
            <Link
              href={`/products/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <span>Live PDP</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
          <span
            className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
              card?.visibility === "AVAILABLE"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : card?.visibility === "AVAILABILITY_UNDER_REVIEW"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            {card?.visibility ?? (isArchived ? "ARCHIVED" : "OFFLINE")}
          </span>
        </div>
      </div>

      {/* Grid: Merchandising Card vs Applied Overrides vs Seed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Merchandising Card (Live Output) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-slate-900">Live Merchandising Output</h3>
          </div>

          <dl className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <dt className="text-slate-500">Display Title:</dt>
              <dd className="font-bold text-slate-900 text-right">{card?.title ?? "None"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Package Label:</dt>
              <dd className="font-semibold text-slate-800">{card?.packageLabel ?? "None"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Duration Label:</dt>
              <dd className="font-semibold text-slate-800">{card?.durationLabel ?? "None"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Selling Price:</dt>
              <dd className="font-black text-emerald-600 font-mono">
                {card?.priceNprMinor ? formatNpr(card.priceNprMinor) : "Inquire"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Compare-At:</dt>
              <dd className="font-mono text-slate-400 line-through">
                {card?.compareAtPriceNprMinor ? formatNpr(card.compareAtPriceNprMinor) : "None"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Purchasable (Add-to-Cart):</dt>
              <dd className="font-bold text-slate-800">{card?.purchasable ? "YES" : "NO"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Fulfillment Note:</dt>
              <dd className="font-semibold text-slate-800 text-right max-w-[180px]">
                {card?.fulfillmentEstimate ?? "None"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Stock Qty:</dt>
              <dd className="font-semibold text-slate-800">{card?.stockQty ?? "On Demand"}</dd>
            </div>
          </dl>
        </div>

        {/* Column 2: Applied Overrides (Owner Directives) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900">Owner Authoritative Overrides</h3>
          </div>

          <dl className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <dt className="text-slate-500">In OWNER_AVAILABLE:</dt>
              <dd className="font-bold text-slate-900">{ownerAvailable ? "YES" : "NO"}</dd>
            </div>
            {ownerAvailable && (
              <>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Override Price NPR:</dt>
                  <dd className="font-bold font-mono text-emerald-600">Rs. {ownerAvailable.priceNpr}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Override Cost NPR:</dt>
                  <dd className="font-mono text-slate-600">Rs. {ownerAvailable.costNpr ?? "Default"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Override Compliance:</dt>
                  <dd className="font-semibold text-slate-800">{ownerAvailable.complianceStatus ?? "Default"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Override Status:</dt>
                  <dd className="font-semibold text-slate-800">{ownerAvailable.productStatus ?? "Default"}</dd>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <dt className="text-slate-500">In OWNER_UNDER_REVIEW:</dt>
              <dd className="font-semibold text-slate-800">{ownerUnderReview ? "YES" : "NO"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">In OWNER_BLOCKED_SLUGS:</dt>
              <dd className={`font-bold ${isBlocked ? "text-red-600" : "text-slate-600"}`}>
                {isBlocked ? "YES (Blocked)" : "NO"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">In OWNER_ARCHIVE_SLUGS:</dt>
              <dd className={`font-bold ${isArchived ? "text-red-600" : "text-slate-600"}`}>
                {isArchived ? "YES (Strictly Hidden)" : "NO"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Column 3: Seed Data Defaults */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Database className="h-4 w-4 text-purple-600" />
            <h3 className="font-bold text-slate-900">Seed Registry Baseline</h3>
          </div>

          <dl className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <dt className="text-slate-500">Registered in Seed:</dt>
              <dd className="font-bold text-slate-900">{seed ? "YES" : "NO"}</dd>
            </div>
            {seed && (
              <>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Seed Name:</dt>
                  <dd className="font-semibold text-slate-800 text-right max-w-[180px]">{seed.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Seed Variants:</dt>
                  <dd className="font-semibold text-slate-800">{seed.variants.length} SKU(s)</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Default Status:</dt>
                  <dd className="font-semibold text-slate-800">{seed.productStatus}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Default Compliance:</dt>
                  <dd className="font-semibold text-slate-800">{seed.complianceStatus}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Fulfillment Type:</dt>
                  <dd className="font-semibold text-slate-800">{seed.fulfillmentType}</dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </div>

      {/* Media Resolution Trace Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900">Media Pipeline Resolution</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Thumbnail Asset (4:5)</span>
              <span className={thumbCheck.exists ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>
                {thumbCheck.exists ? `Found (${thumbCheck.sizeKb} KB)` : "Missing on Disk"}
              </span>
            </div>
            <div className="font-mono text-slate-600 break-all">{thumbPath}</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Infographic Poster (2:3)</span>
              <span className={infoCheck.exists ? "text-blue-600 font-bold" : "text-amber-600 font-bold"}>
                {infoCheck.exists ? `Found (${infoCheck.sizeKb} KB)` : "Optional / None"}
              </span>
            </div>
            <div className="font-mono text-slate-600 break-all">{infoPath}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
