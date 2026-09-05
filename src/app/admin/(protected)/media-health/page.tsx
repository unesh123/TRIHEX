import fs from "fs";
import path from "path";
import Link from "next/link";
import Image from "next/image";
import { AdminHeader } from "@/components/admin/admin-header";
import { getLiveMerchandisingCatalogue } from "@/lib/catalog/merchandising";
import {
  resolveProductThumbnail,
  resolveProductInfographic,
  resolveProductGallery,
  FALLBACK_PRODUCT_IMAGE,
} from "@/lib/catalog/product-image-resolver";
import { CheckCircle2, AlertTriangle, Image as ImageIcon, ExternalLink, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

interface MediaItemReport {
  slug: string;
  title: string;
  brandName: string;
  categoryName: string;
  visibility: string;
  thumbnail: {
    path: string;
    exists: boolean;
    sizeKb: number;
    isFallback: boolean;
  };
  infographic: {
    path: string;
    exists: boolean;
    sizeKb: number;
  };
  galleryCount: number;
}

function getFileReport(publicPath: string): { exists: boolean; sizeKb: number } {
  try {
    const absPath = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
    if (fs.existsSync(absPath)) {
      const stats = fs.statSync(absPath);
      return { exists: true, sizeKb: Math.round(stats.size / 1024) };
    }
  } catch {
    // Ignore error
  }
  return { exists: false, sizeKb: 0 };
}

export default async function AdminMediaHealthPage() {
  const catalogue = await getLiveMerchandisingCatalogue({ includeBlocked: true });
  
  const reports: MediaItemReport[] = catalogue.map((item) => {
    const thumbPath = resolveProductThumbnail(item);
    const infoPath = resolveProductInfographic(item);
    const gallery = resolveProductGallery(item);

    const thumbReport = getFileReport(thumbPath);
    const infoReport = getFileReport(infoPath);

    return {
      slug: item.slug,
      title: item.title,
      brandName: item.brandName,
      categoryName: item.categoryName,
      visibility: item.visibility,
      thumbnail: {
        path: thumbPath,
        exists: thumbReport.exists,
        sizeKb: thumbReport.sizeKb,
        isFallback: thumbPath === FALLBACK_PRODUCT_IMAGE,
      },
      infographic: {
        path: infoPath,
        exists: infoReport.exists,
        sizeKb: infoReport.sizeKb,
      },
      galleryCount: gallery.length,
    };
  });

  const totalProducts = reports.length;
  const validThumbnails = reports.filter((r) => r.thumbnail.exists && !r.thumbnail.isFallback).length;
  const validInfographics = reports.filter((r) => r.infographic.exists).length;
  const totalDiskKb = reports.reduce((acc, r) => acc + r.thumbnail.sizeKb + r.infographic.sizeKb, 0);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Catalogue Media Health & Image Delivery"
        description="Automated forensic inspection of all product thumbnails, posters, and responsive WebP assets."
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Catalogue</span>
          <p className="mt-2 text-2xl font-black text-slate-900">{totalProducts} Products</p>
          <span className="mt-1 text-xs text-slate-400">All registered active &amp; review lines</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Thumbnails (4:5)</span>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {validThumbnails} / {totalProducts}
          </p>
          <span className="mt-1 text-xs text-slate-400">
            {validThumbnails === totalProducts ? "100% verified on disk" : "Some items need artwork"}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Infographics (2:3)</span>
          <p className="mt-2 text-2xl font-black text-blue-600">
            {validInfographics} / {totalProducts}
          </p>
          <span className="mt-1 text-xs text-slate-400">High-resolution feature posters</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Media Disk Footprint</span>
          <p className="mt-2 text-2xl font-black text-slate-900">{(totalDiskKb / 1024).toFixed(1)} MB</p>
          <span className="mt-1 text-xs text-slate-400">Compressed WebP source assets</span>
        </div>
      </div>

      {/* Products Media Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Asset Verification Matrix</h3>
          <span className="text-xs text-slate-500">Auto-validates file existence, format, and size</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 pl-6 pr-3">Product</th>
                <th className="px-3 py-3.5">Thumbnail (4:5)</th>
                <th className="px-3 py-3.5">Infographic (2:3)</th>
                <th className="px-3 py-3.5">Gallery</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((r) => (
                <tr key={r.slug} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 pl-6 pr-3">
                    <div className="font-bold text-slate-900">{r.title}</div>
                    <div className="text-xs font-mono text-slate-400">{r.slug}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span>{r.brandName}</span>
                      <span>·</span>
                      <span>{r.categoryName}</span>
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        {r.thumbnail.exists ? (
                          <Image
                            src={r.thumbnail.path}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-contain p-0.5"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        {r.thumbnail.exists ? (
                          <>
                            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>{r.thumbnail.sizeKb} KB</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px] block">
                              {r.thumbnail.path.split("/").pop()}
                            </span>
                          </>
                        ) : (
                          <div className="flex items-center gap-1 text-xs font-semibold text-red-600">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>Missing</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        {r.infographic.exists ? (
                          <Image
                            src={r.infographic.path}
                            alt=""
                            fill
                            sizes="32px"
                            className="object-contain p-0.5"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        {r.infographic.exists ? (
                          <>
                            <div className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>{r.infographic.sizeKb} KB</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px] block">
                              {r.infographic.path.split("/").pop()}
                            </span>
                          </>
                        ) : (
                          <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                            <span>Optional / None</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-4 text-xs font-medium text-slate-600">
                    {r.galleryCount} views
                  </td>

                  <td className="px-3 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                        r.thumbnail.exists
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {r.thumbnail.exists ? "HEALTHY" : "NEEDS IMAGE"}
                    </span>
                  </td>

                  <td className="py-4 pl-3 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/products/${r.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <span>View</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                      <Link
                        href={`/admin/catalogue-trace/${r.slug}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800 transition"
                      >
                        Trace
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
