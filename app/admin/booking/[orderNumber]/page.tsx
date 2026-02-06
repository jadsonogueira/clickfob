// app/admin/booking/[orderNumber]/page.tsx
"use client";

import { useEffect, useState } from "react";
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
  additionalNotes?: string | null;
  photoFrontUrl?: string | null;
  photoBackUrl?: string | null;
  status: "pending" | "confirmed" | "cancelled";
};

export default function AdminBookingDetailsPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const orderNumber = params.orderNumber;

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/booking/${orderNumber}`, { cache: "no-store" });
      const json = await res.json();
      if (!json?.ok) {
        alert(json?.error || "Failed to load booking");
        setBooking(null);
        return;
      }
      setBooking(json.booking);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  async function doAction(action: "confirm" | "cancel") {
    if (!booking) return;
    const sure =
      action === "confirm"
        ? confirm("Confirm this booking?")
        : confirm("Cancel this booking?");
    if (!sure) return;

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

  const manageUrl = `/manage/${orderNumber}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href="/admin" className="text-sm underline text-slate-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              Booking #{orderNumber}
            </h1>
            <p className="text-slate-600 mt-1">
              {loading ? "Loading..." : booking ? booking.status.toUpperCase() : ""}
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href={manageUrl}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold"
              target="_blank"
              rel="noreferrer"
            >
              Open Manage Page
            </a>
          </div>
        </div>

        {!loading && !booking ? (
          <div className="mt-6 rounded-2xl bg-white shadow p-6 text-slate-700">
            Booking not found.
          </div>
        ) : null}

        {booking ? (
          <>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white shadow p-5">
                <div className="font-bold text-slate-900">Service</div>
                <div className="mt-2 text-slate-700">{booking.serviceType}</div>
                <div className="text-slate-600 mt-1">
                  ${booking.servicePrice.toFixed(2)}
                </div>

                <div className="mt-4 font-bold text-slate-900">Date / Time</div>
                <div className="mt-2 text-slate-700">
                  {new Date(booking.bookingDate).toLocaleDateString("en-CA")}
                </div>
                <div className="text-slate-600 mt-1">{booking.bookingTime}</div>
              </div>

              <div className="rounded-2xl bg-white shadow p-5">
                <div className="font-bold text-slate-900">Customer</div>
                <div className="mt-2 text-slate-700 font-semibold">
                  {booking.customerName}
                </div>
                <div className="text-slate-600 mt-1">{booking.customerEmail}</div>
                <div className="text-slate-600 mt-1">{booking.customerWhatsapp}</div>

                <div className="mt-4 font-bold text-slate-900">Address</div>
                <div className="mt-2 text-slate-700">{booking.customerAddress}</div>
                {booking.customerUnit ? (
                  <div className="text-slate-600 mt-1">{booking.customerUnit}</div>
                ) : null}
              </div>
            </div>

            {booking.additionalNotes ? (
              <div className="mt-4 rounded-2xl bg-white shadow p-5">
                <div className="font-bold text-slate-900">Notes</div>
                <div className="mt-2 text-slate-700 whitespace-pre-wrap">
                  {booking.additionalNotes}
                </div>
              </div>
            ) : null}

            <div className="mt-4 rounded-2xl bg-white shadow p-5">
              <div className="font-bold text-slate-900">Photos</div>
              <div className="mt-3 flex flex-wrap gap-3">
                {booking.photoFrontUrl ? (
                  <a
                    href={booking.photoFrontUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-slate-900 text-white px-4 py-2 font-semibold"
                  >
                    View Front
                  </a>
                ) : null}
                {booking.photoBackUrl ? (
                  <a
                    href={booking.photoBackUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-slate-900 text-white px-4 py-2 font-semibold"
                  >
                    View Back
                  </a>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={() => doAction("confirm")}
                disabled={booking.status === "confirmed"}
                className="rounded-xl bg-green-600 text-white px-5 py-3 font-extrabold disabled:opacity-50"
              >
                Confirm
              </button>
              <button
                onClick={() => doAction("cancel")}
                disabled={booking.status === "cancelled"}
                className="rounded-xl bg-red-600 text-white px-5 py-3 font-extrabold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={load}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold"
              >
                Refresh
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
