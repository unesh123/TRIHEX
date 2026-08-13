"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type ToastTone = "default" | "success" | "danger";

type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

let pushToastImpl: ((message: string, tone?: ToastTone) => void) | null = null;

export function toast(message: string, tone: ToastTone = "default") {
  pushToastImpl?.(message, tone);
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const mounted = useIsClient();

  useEffect(() => {
    pushToastImpl = (message, tone = "default") => {
      const id = crypto.randomUUID();
      setItems((prev) => [...prev, { id, message, tone }]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    };
    return () => {
      pushToastImpl = null;
    };
  }, []);

  return (
    <>
      {children}
      {mounted
        ? createPortal(
            <div
              className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4"
              aria-live="polite"
            >
              {items.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "pointer-events-auto max-w-md rounded-xl px-4 py-2.5 text-sm font-medium shadow-lg",
                    t.tone === "success" &&
                      "bg-[var(--success)] text-white",
                    t.tone === "danger" && "bg-[var(--danger)] text-white",
                    t.tone === "default" &&
                      "border border-[var(--border)] bg-white text-[var(--text)]",
                  )}
                >
                  {t.message}
                </div>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
