"use client";

import { useState, useEffect } from "react";
import { Bookmark, Check } from "lucide-react";
import { SavedEntityType } from "@/lib/saved/types";

interface SaveButtonProps {
  entityType: SavedEntityType;
  entityId: string;
  initialSaved?: boolean;
  className?: string;
  showText?: boolean;
}

export function SaveButton({
  entityType,
  entityId,
  initialSaved = false,
  className = "",
  showText = false,
}: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const [guestId, setGuestId] = useState<string>("");

  useEffect(() => {
    // Generate or retrieve persistent guest identifier in browser
    let stored = localStorage.getItem("trihex_guest_id");
    if (!stored) {
      stored = `guest_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
      localStorage.setItem("trihex_guest_id", stored);
    }
    setGuestId(stored);

    // Check status if not provided initially
    if (!initialSaved && stored) {
      fetch(`/api/saved?userId=${encodeURIComponent(stored)}&checkType=${entityType}&checkId=${encodeURIComponent(entityId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.saved !== undefined) setSaved(data.saved);
        })
        .catch(() => {});
    }
  }, [entityType, entityId, initialSaved]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!guestId || loading) return;

    // Optimistic toggle
    const nextSaved = !saved;
    setSaved(nextSaved);
    setLoading(true);

    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: guestId,
          entityType,
          entityId,
        }),
      });
      const data = await res.json();
      if (data.saved !== undefined) {
        setSaved(data.saved);
      }
    } catch {
      // Revert on error
      setSaved(!nextSaved);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={saved ? "Remove from saved items" : "Save for later"}
      className={`inline-flex items-center gap-1.5 transition-all text-xs font-medium rounded-lg p-1.5 ${
        saved
          ? "bg-red-500/20 text-red-400 border border-red-500/30"
          : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10"
      } ${className}`}
    >
      <Bookmark
        className={`w-3.5 h-3.5 transition-transform ${
          saved ? "fill-red-400 text-red-400 scale-110" : "text-slate-400"
        }`}
      />
      {showText && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
