"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Check,
  X,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Clock,
  Key,
  Layers,
} from "lucide-react";
import { formatNpr } from "@/lib/money";

export interface CompareProductItem {
  slug: string;
  title: string;
  packageLabel: string;
  durationLabel: string | null;
  priceNprMinor: number | null;
  categoryLabel: string;
  activationLabel: string;
  fulfillmentEstimate: string;
  warrantyLabel: string | null;
  features: string[];
  purchasable: boolean;
  coverPublicPath?: string | null;
}

interface ProductCompareProps {
  initialItems: CompareProductItem[];
  allAvailableProducts: CompareProductItem[];
}

export function ProductCompare({
  initialItems,
  allAvailableProducts,
}: ProductCompareProps) {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(() => {
    if (initialItems.length >= 2) return initialItems.map((i) => i.slug);
    if (allAvailableProducts.length >= 2) {
      return [allAvailableProducts[0].slug, allAvailableProducts[1].slug];
    }
    return [];
  });

  const selectedProducts = selectedSlugs
    .map((slug) => allAvailableProducts.find((p) => p.slug === slug))
    .filter((p): p is CompareProductItem => Boolean(p));

  const availableToAdd = allAvailableProducts.filter(
    (p) => !selectedSlugs.includes(p.slug)
  );

  const handleAddProduct = (slug: string) => {
    if (selectedSlugs.length >= 4) return;
    setSelectedSlugs([...selectedSlugs, slug]);
  };

  const handleRemoveProduct = (slug: string) => {
    if (selectedSlugs.length <= 1) return;
    setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
  };

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-blue-600">
            Multi-Product Comparison
          </span>
          <h2 className="mt-1 font-[family-name:var(--font-sora)] text-2xl font-black text-slate-900">
            Side-by-Side Architectural Comparison
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Evaluating {selectedProducts.length} products on verified price, entitlements, and fulfillment terms.
          </p>
        </div>

        {selectedSlugs.length < 4 && availableToAdd.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              aria-label="Add product to compare"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  handleAddProduct(e.target.value);
                  e.target.value = "";
                }
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="" disabled>
                + Add another tool to compare...
              </option>
              {availableToAdd.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title} ({p.packageLabel})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Comparison Grid */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              <th className="p-4 w-48 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                Product Specification
              </th>
              {selectedProducts.map((p) => (
                <th key={p.slug} className="p-4 min-w-[240px] max-w-[280px]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                        {p.coverPublicPath ? (
                          <Image
                            src={p.coverPublicPath}
                            alt={p.title}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-600 font-bold text-xs">
                            AI
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 leading-snug text-xs line-clamp-1">
                          {p.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {p.categoryLabel}
                        </span>
                      </div>
                    </div>
                    {selectedSlugs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(p.slug)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                        title="Remove product"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Price Row */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50/40">
                Local Price (NPR)
              </td>
              {selectedProducts.map((p) => (
                <td key={p.slug} className="p-4">
                  <div className="text-base font-black text-slate-900">
                    {p.priceNprMinor != null ? formatNpr(p.priceNprMinor) : "Price on Enquiry"}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    No foreign card fees
                  </span>
                </td>
              ))}
            </tr>

            {/* Plan & Duration */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50/40">
                Plan Duration
              </td>
              {selectedProducts.map((p) => (
                <td key={p.slug} className="p-4">
                  <span className="inline-flex rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-800">
                    {p.durationLabel ?? p.packageLabel}
                  </span>
                </td>
              ))}
            </tr>

            {/* Activation Type */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50/40">
                <div className="flex items-center gap-1">
                  <Key className="h-3.5 w-3.5 text-slate-400" />
                  <span>Activation Mode</span>
                </div>
              </td>
              {selectedProducts.map((p) => (
                <td key={p.slug} className="p-4 text-slate-700 font-medium">
                  {p.activationLabel}
                </td>
              ))}
            </tr>

            {/* Fulfillment Turnaround */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50/40">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Delivery SLA</span>
                </div>
              </td>
              {selectedProducts.map((p) => (
                <td key={p.slug} className="p-4 text-emerald-700 font-semibold">
                  {p.fulfillmentEstimate}
                </td>
              ))}
            </tr>

            {/* Warranty Guarantee */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50/40">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                  <span>Warranty Coverage</span>
                </div>
              </td>
              {selectedProducts.map((p) => (
                <td key={p.slug} className="p-4 text-slate-700">
                  {p.warrantyLabel ?? "Full subscription duration replacement guarantee"}
                </td>
              ))}
            </tr>

            {/* Inclusions & Features */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50/40">
                <div className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-slate-400" />
                  <span>Key Inclusions</span>
                </div>
              </td>
              {selectedProducts.map((p) => (
                <td key={p.slug} className="p-4 align-top">
                  <ul className="space-y-1.5">
                    {p.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                        <Check className="h-3 w-3 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>

            {/* Action Row */}
            <tr className="bg-slate-50/40">
              <td className="p-4 font-bold text-slate-700">
                Direct Action
              </td>
              {selectedProducts.map((p) => (
                <td key={p.slug} className="p-4">
                  <Link
                    href={`/products/${p.slug}`}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700 shadow-sm"
                  >
                    View Product
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
