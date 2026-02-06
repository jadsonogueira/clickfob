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

export default function AdminDashboardPage() {
  const [status, setStatus] = useState<"all" | "pending" | "confirmed" | "cancelled">(
    "all"
  );
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings?status=${status}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!json?.ok) {
        alert(json?.error || "Failed to load bookings");
        setBookings([]);
        return;
      }
      setBookings(json.bookings || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const counts = useMemo(() => {
    const c = { pending: 0, confirmed: 0, cancelled: 0 };
    for (const b of bookings) c[b.status]++;
    return c;
  }, [bookings]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

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

        <div className="mt-6 flex flex-wrap gap-2">
          {(["all", "pending", "confirmed", "cancelled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-xl px-4 py-2 font-semibold border ${
                status === s
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-800 border-slate-200"
              }`}
            >
              {s.toUpperCase()}
              {s !== "all" ? (
                <span className="ml-2 text-xs opacity-80">
                  {counts[s as "pending" | "confirmed" | "cancelled"] ?? 0}
                </span>
              ) : null}
            </button>
          ))}
        </div>

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

                {bookings.map((b) => (
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
                      <div className="text-sm text-slate-600">${b.servicePrice.toFixed(2)}</div>
                    </td>
                    <td className="p-3 text-slate-800">
                      <div>{new Date(b.bookingDate).toLocaleDateString("en-CA")}</div>
                      <div className="text-sm text-slate-600">{b.bookingTime}</div>
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/admin/booking/${b.orderNumber}`}
                        className="inline-flex rounded-xl bg-slate-900 text-white px-3 py-2 text-sm font-semibold"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-6">
          Admin session uses a signed cookie (no DB). Protected by middleware.
        </p>
      </div>
    </div>
  );
}
