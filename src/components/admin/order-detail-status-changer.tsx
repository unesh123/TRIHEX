"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";

interface OrderDetailStatusChangerProps {
  orderId: string;
  currentOrderStatus: string;
  currentPaymentStatus: string;
  currentFulfillmentStatus: string;
}

export function OrderDetailStatusChanger({
  orderId,
  currentOrderStatus,
  currentPaymentStatus,
  currentFulfillmentStatus,
}: OrderDetailStatusChangerProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState(currentOrderStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const statuses = [
    {
      value: "PENDING_PAYMENT",
      label: "Pending Payment",
      icon: Clock,
      color: "border-amber-300 text-amber-800 bg-amber-50",
    },
    {
      value: "PROCESSING",
      label: "Processing",
      icon: Clock,
      color: "border-blue-300 text-blue-800 bg-blue-50",
    },
    {
      value: "PAID",
      label: "Mark as Paid",
      icon: CheckCircle2,
      color: "border-emerald-300 text-emerald-800 bg-emerald-50",
    },
    {
      value: "FULFILLED",
      label: "Delivered / Fulfilled",
      icon: Truck,
      color: "border-cyan-300 text-cyan-800 bg-cyan-50",
    },
    {
      value: "CANCELLED",
      label: "Cancelled / Void",
      icon: XCircle,
      color: "border-rose-300 text-rose-800 bg-rose-50",
    },
  ];

  const handleUpdate = async (newStatus: string) => {
    if (newStatus === selectedStatus) return;
    setIsUpdating(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }

      setSelectedStatus(newStatus);
      setFeedback(`Status successfully updated to ${newStatus}`);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error updating order status";
      setFeedback(message);
    } finally {
      setIsUpdating(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text)]">
              Live Order Status Transition
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Changes auto-sync payment status, stock inventory balance, and audit timeline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isUpdating && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-violet-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating status...
            </span>
          )}
          {feedback && (
            <span
              className={`text-xs font-semibold ${
                feedback.includes("successfully") ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {feedback}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {statuses.map((s) => {
          const Icon = s.icon;
          const isActive = selectedStatus === s.value;
          return (
            <button
              key={s.value}
              type="button"
              disabled={isUpdating}
              onClick={() => handleUpdate(s.value)}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                isActive
                  ? "border-violet-600 bg-violet-600 text-white shadow-xs"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : ""}`} />
              <span>{s.label}</span>
              {isActive && (
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-extrabold uppercase">
                  Active
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
