// app/admin/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Booking = {
  id: string;
  orderNumber: string;
  serviceType: string;
  servicePrice: number;
  bookingDate: string;
  bookingTime: string;
  customerName: string;
  customerEmail: string;
  customerWhatsapp: string;
  customerAddress: string;
  customerUnit?: string | null;
  status: "pending" | "confirmed" | "cancelled";
  createdAt?: string;
};

const timeSlotLabels: Record<string, string> = {
  "9-11": "9:00 AM - 11:00 AM",
  "11-13": "11:00 AM - 1:00 PM",
  "13-15": "1:00 PM - 3:00 PM",
  "15-17": "3:00 PM - 5:00 PM",
};

export default function AdminDashboardPage() {
  const [status, setStatus] = useState<"all" | "pending" | "confirmed" | "cancelled">(
    "all"
  );
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [counts, setCounts] = useState({
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    total: 0,
  });

  const qDebounced = useDebounce(q, 300);

  async function load() {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("status", status);
      if (qDebounced.trim()) qs.set("q", qDebounced.trim());

      const res = await fetch(`/api/admin/bookings?${qs.toString()}`, {
        cache: "no-store",
      });

      const json = await res.json();
      if (!json?.ok) {
        alert(json?.error || "Failed to load bookings");
        setBookings([]);
        return;
      }

      setBookings(json.bookings || []);
      setCounts(json.counts || counts);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, qDebounced]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  async function doQuickAction(orderNumber: string, action: "confirm" | "cancel") {
    const ok =
      action === "confirm"
        ? confirm(`Confirm booking ${orderNumber}?`)
        : confirm(`Cancel booking ${orderNumber}?`);
    if (!ok) return;

    const res = await fetch(
      `/api/admin/booking-action?order=${encodeURIComponent(orderNumber)}&action=${action}`,
      { method: "POST" }
    );
    const json = await res.json();

    if (!json?.ok) {
      alert(json?.error || "Action failed");
      return;
    }

    await load();
  }

  const statusButtons = useMemo(
    () =>
      [
        { key: "all", label: "ALL", count: counts.total },
        { key: "pending", label: "PENDING", count: counts.pending },
        { key: "confirmed", label: "CONFIRMED", count: counts.confirmed },
        { key: "cancelled", label: "CANCELLED", count: counts.cancelled },
      ] as const,
    [counts]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ClickFob Admin</h1>
            <p className="text-slate-600 mt-1">
              Manage bookings (confirm/cancel) and view details.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={load}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold"
            >
              Refresh
            </button>
            <button
              onClick={logout}
              className="rounded-xl bg-slate-900 text-white px-4 py-2 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {statusButtons.map((s) => (
              <button
                key={s.key}
                onClick={() => setStatus(s.key)}
                className={`rounded-xl px-4 py-2 font-semibold border ${
                  status === s.key
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-800 border-slate-200"
                }`}
              >
                {s.label}{" "}
                <span className="ml-2 text-xs opacity-80">{s.count ?? 0}</span>
              </button>
            ))}
          </div>

          <div className="md:ml-auto w-full md:w-[360px]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="Search: order / customer / email"
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 rounded-2xl bg-white shadow overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="font-bold text-slate-900">Bookings</div>
            <div className="text-sm text-slate-600">
              {loading ? "Loading..." : `${bookings.length} item(s)`}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr className="text-sm text-slate-600">
                  <th className="p-3">Order</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Date/Time</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading && bookings.length === 0 ? (
                  <tr>
                    <td className="p-4 text-slate-600" colSpan={6}>
                      No bookings found.
                    </td>
                  </tr>
                ) : null}

                {bookings.map((b) => {
                  const timeLabel = timeSlotLabels[b.bookingTime] || b.bookingTime;
                  const dateLabel = new Date(b.bookingDate).toLocaleDateString("en-CA");

                  return (
                    <tr key={b.id} className="border-t border-slate-100">
                      <td className="p-3 font-semibold text-slate-900">
                        <Link className="underline" href={`/admin/booking/${b.orderNumber}`}>
                          #{b.orderNumber}
                        </Link>
                      </td>

                      <td className="p-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                            b.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : b.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {b.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="p-3 text-slate-800">
                        <div className="font-semibold">{b.customerName}</div>
                        <div className="text-sm text-slate-600">{b.customerEmail}</div>
                      </td>

                      <td className="p-3 text-slate-800">
                        <div className="font-semibold">{b.serviceType}</div>
                        <div className="text-sm text-slate-600">
                          ${b.servicePrice.toFixed(2)}
                        </div>
                      </td>

                      <td className="p-3 text-slate-800">
                        <div>{dateLabel}</div>
                        <div className="text-sm text-slate-600">{timeLabel}</div>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/admin/booking/${b.orderNumber}`}
                            className="inline-flex rounded-xl bg-slate-900 text-white px-3 py-2 text-sm font-semibold"
                          >
                            Open
                          </Link>

                          {b.status === "pending" ? (
                            <>
                              <button
                                onClick={() => doQuickAction(b.orderNumber, "confirm")}
                                className="inline-flex rounded-xl bg-green-600 text-white px-3 py-2 text-sm font-extrabold"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => doQuickAction(b.orderNumber, "cancel")}
                                className="inline-flex rounded-xl bg-red-600 text-white px-3 py-2 text-sm font-extrabold"
                              >
                                Cancel
                              </button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-6">
          Tip: Quick actions are available for <strong>pending</strong> bookings only.
        </p>
      </div>
    </div>
  );
}

function useDebounce<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}
