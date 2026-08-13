"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type SuggestItem = { slug: string; title: string; brandName: string };

export function ProductSearchAutocomplete({
  defaultQuery = "",
  className,
}: {
  defaultQuery?: string;
  className?: string;
}) {
  const [q, setQ] = useState(defaultQuery);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SuggestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear suggestions when query too short
      setItems([]);
      return;
    }
    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/products/suggest?q=${encodeURIComponent(term)}`,
          { signal: ctrl.signal },
        );
        const json = (await res.json()) as { items?: SuggestItem[] };
        setItems(json.items ?? []);
        setOpen(true);
      } catch {
        /* abort / network */
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [q]);

  const hint = useMemo(
    () => (loading ? "Searching…" : items.length ? null : null),
    [loading, items.length],
  );

  return (
    <div ref={boxRef} className={`relative flex-1 ${className ?? ""}`}>
      <label className="sr-only" htmlFor="product-search">
        Search products
      </label>
      <input
        id="product-search"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => items.length > 0 && setOpen(true)}
        placeholder="Search brand, package, or category…"
        autoComplete="off"
        className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--page-soft)] px-4 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
      />
      {hint}
      {open && items.length > 0 ? (
        <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-[var(--border)] bg-white py-1 shadow-lg">
          {items.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/products/${item.slug}`}
                className="block px-3 py-2 text-sm hover:bg-[var(--page-soft)]"
                onClick={() => setOpen(false)}
              >
                <span className="font-medium text-[var(--text)]">{item.title}</span>
                <span className="mt-0.5 block text-[11px] text-[var(--text-muted)]">
                  {item.brandName}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
