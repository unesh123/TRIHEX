"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Truck,
  DollarSign,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Eye,
  RefreshCw,
} from "lucide-react";
import { formatNpr } from "@/lib/money";

export interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subtotalMinor: number;
  grandTotalMinor: number;
  orderStatus: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  paymentMethod?: string;
  proofUrl?: string | null;
  itemsSummary: string;
  itemCount: number;
  placedAt: string;
  notes?: string | null;
}

interface OrderCommandTableProps {
  initialOrders: OrderRow[];
}

export function OrderCommandTable({ initialOrders }: OrderCommandTableProps) {
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      (o.notes && o.notes.toLowerCase().includes(q)) ||
      (o.paymentMethod && o.paymentMethod.toLowerCase().includes(q)) ||
      o.itemsSummary.toLowerCase().includes(q);

    let matchesTab = true;
    if (activeTab === "PENDING") {
      matchesTab = o.paymentStatus !== "PAID" && o.orderStatus !== "CANCELLED";
    } else if (activeTab === "PAID") {
      matchesTab =
        o.paymentStatus === "PAID" &&
        o.fulfillmentStatus !== "DELIVERED" &&
        o.orderStatus !== "FULFILLED";
    } else if (activeTab === "FULFILLED") {
      matchesTab =
        o.fulfillmentStatus === "DELIVERED" || o.orderStatus === "FULFILLED";
    } else if (activeTab === "CANCELLED") {
      matchesTab = o.orderStatus === "CANCELLED";
    }

    return matchesSearch && matchesTab;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);

    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          orderStatus: newStatus,
          paymentStatus: newStatus === "PAID" || newStatus === "FULFILLED" ? "PAID" : o.paymentStatus,
          fulfillmentStatus: newStatus === "FULFILLED" ? "DELIVERED" : o.fulfillmentStatus,
        };
      }),
    );

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
      if (!data.success) {
        alert(data.error || "Failed to update status.");
      }
    } catch (err) {
      console.error("Order status update failed", err);
      alert("Failed to update order status on server.");
    } finally {
      setUpdatingId(null);
    }
  };

  const buildWhatsAppMessage = (order: OrderRow) => {
    const cleanPhone = order.customerPhone.replace(/\D/g, "");
    const nepPhone = cleanPhone.startsWith("977") ? cleanPhone : `977${cleanPhone}`;
    const text = encodeURIComponent(
      `Hello ${order.customerName || "Customer"}! This is TRIHEX DIGITAL operations regarding your order ${order.orderNumber}.\n\n` +
      `Items: ${order.itemsSummary}\n` +
      `Total: ${formatNpr(order.grandTotalMinor)}\n` +
      `Current Status: ${order.orderStatus}\n\n` +
      `We are ready to deliver your access credentials / verification code. Please confirm this chat.`
    );
    return `https://wa.me/${nepPhone}?text=${text}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "FULFILLED":
        return "bg-cyan-100 text-cyan-800 border-cyan-300";
      case "PROCESSING":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search order #, customer name, phone, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "ALL", label: "All Orders", count: orders.length },
            {
              id: "PENDING",
              label: "Awaiting Payment",
              count: orders.filter((o) => o.paymentStatus !== "PAID" && o.orderStatus !== "CANCELLED").length,
            },
            {
              id: "PAID",
              label: "Ready to Fulfill",
              count: orders.filter((o) => o.paymentStatus === "PAID" && o.orderStatus !== "FULFILLED").length,
            },
            {
              id: "FULFILLED",
              label: "Delivered",
              count: orders.filter((o) => o.orderStatus === "FULFILLED").length,
            },
            {
              id: "CANCELLED",
              label: "Cancelled",
              count: orders.filter((o) => o.orderStatus === "CANCELLED").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  activeTab === tab.id ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Order</th>
                <th className="px-5 py-3.5">Customer &amp; Contact</th>
                <th className="px-5 py-3.5">Items</th>
                <th className="px-5 py-3.5">Total (NPR)</th>
                <th className="px-5 py-3.5">Status Changer</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isUpdating = updatingId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Order Number & Placed Date */}
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono text-xs font-bold text-indigo-600 hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(order.placedAt).toLocaleString("en-NP", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{order.customerName || "Guest"}</div>
                        <div className="text-xs text-slate-500">{order.customerEmail}</div>
                        {order.customerPhone ? (
                          <div className="flex items-center gap-1 font-mono text-xs text-slate-700 mt-0.5">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{order.customerPhone}</span>
                          </div>
                        ) : null}
                      </td>

                      {/* Items */}
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800 line-clamp-1 max-w-[200px]">
                          {order.itemsSummary || "Subscription Package"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">
                        {formatNpr(order.grandTotalMinor)}
                      </td>

                      {/* Interactive Status Changer Dropdown */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            disabled={isUpdating}
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`rounded-xl border px-3 py-1.5 text-xs font-bold uppercase transition focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${getStatusBadge(
                              order.orderStatus,
                            )}`}
                          >
                            <option value="AWAITING_PAYMENT">Awaiting Payment</option>
                            <option value="PROCESSING">Under Review (Proof)</option>
                            <option value="PAID">Paid (Approved &amp; Stock Deducted)</option>
                            <option value="FULFILLED">Fulfilled (Delivered)</option>
                            <option value="CANCELLED">Cancelled (Restored)</option>
                          </select>

                          {isUpdating && (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-400" />
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {order.customerPhone ? (
                            <a
                              href={buildWhatsAppMessage(order)}
                              target="_blank"
                              rel="noreferrer"
                              title="Chat & Deliver on WhatsApp"
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition shadow-sm"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </a>
                          ) : null}

                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Details</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
