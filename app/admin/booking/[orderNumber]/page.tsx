// app/admin/booking/[orderNumber]/page.tsx
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

  additionalNotes?: string | null;

  photoFrontUrl?: string | null;
  photoBackUrl?: string | null;

  status: "pending" | "confirmed" | "cancelled";

  createdAt?: string | null;
  updatedAt?: string | null;
};

const timeSlotLabels: Record<string, string> = {
  "9-11": "9:00 AM - 11:00 AM",
  "11-13": "11:00 AM - 1:00 PM",
  "13-15": "1:00 PM - 3:00 PM",
  "15-17": "3:00 PM - 5:00 PM",
};

function normalizePhoneDigits(input: string) {
  return (input || "").replace(/[^0-9]/g, "");
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    alert("Copied ✅");
  } catch {
    // fallback bem simples
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    alert("Copied ✅");
  }
}

function StatusPill({ status }: { status: Booking["status"] }) {
  const cls =
    status === "confirmed"
      ? "bg-green-100 text-green-800"
      : status === "cancelled"
      ? "bg-red-100 text-red-800"
      : "bg-amber-100 text-amber-900";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${cls}`}>
      {status.toUpperCase()}
    </span>
  );
}

function Timeline({
  createdAt,
  status,
}: {
  createdAt?: string | null;
  status: Booking["status"];
}) {
  const createdLabel = createdAt
    ? new Date(createdAt).toLocaleString("en-CA", { hour12: true })
    : null;

  const step2Label = status === "pending" ? "Pending" : "Pending";
  const step3Label = status === "confirmed" ? "Confirmed" : status === "cancelled" ? "Cancelled" : "—";

  const step1Active = true;
  const step2Active = true; // sempre passa por pending
  const step3Active = status === "confirmed" || status === "cancelled";

  return (
    <div className="rounded-2xl bg-white shadow p-5">
      <div className="font-bold text-slate-900">Timeline</div>

      <div className="mt-4">
        <div className="flex items-start gap-3">
          <div className={`mt-1 h-3 w-3 rounded-full ${step1Active ? "bg-slate-900" : "bg-slate-300"}`} />
          <div className="flex-1">
            <div className="font-semibold text-slate-900">Created</div>
            <div className="text-sm text-slate-600">
              {createdLabel ? createdLabel : "—"}
            </div>
          </div>
        </div>

        <div className="ml-[5px] h-6 w-[2px] bg-slate-200" />

        <div className="flex items-start gap-3">
          <div className={`mt-1 h-3 w-3 rounded-full ${step2Active ? "bg-amber-500" : "bg-slate-300"}`} />
          <div className="flex-1">
            <div className="font-semibold text-slate-900">{step2Label}</div>
            <div className="text-sm text-slate-600">Waiting for admin action</div>
          </div>
        </div>

        <div className="ml-[5px] h-6 w-[2px] bg-slate-200" />

        <div className="flex items-start gap-3">
          <div
            className={`mt-1 h-3 w-3 rounded-full ${
              step3Active
                ? status === "confirmed"
                  ? "bg-green-600"
                  : "bg-red-600"
                : "bg-slate-300"
            }`}
          />
          <div className="flex-1">
            <div className="font-semibold text-slate-900">{step3Label}</div>
            <div className="text-sm text-slate-600">
              {step3Active ? "Final state" : "Not decided yet"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

  const prettyDate = useMemo(() => {
    if (!booking) return "";
    return new Date(booking.bookingDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [booking]);

  const prettyTime = useMemo(() => {
    if (!booking) return "";
    return timeSlotLabels[booking.bookingTime] || booking.bookingTime;
  }, [booking]);

  const waDigits = useMemo(() => (booking ? normalizePhoneDigits(booking.customerWhatsapp) : ""), [booking]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href="/admin" className="text-sm underline text-slate-700">
              ← Back
            </Link>

            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                Booking #{orderNumber}
              </h1>
              {booking ? <StatusPill status={booking.status} /> : null}
            </div>

            <p className="text-slate-600 mt-1">
              {loading ? "Loading..." : booking ? "Booking details and quick actions." : ""}
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
            {/* Top grid */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Service + date/time */}
              <div className="rounded-2xl bg-white shadow p-5">
                <div className="font-bold text-slate-900">Service</div>
                <div className="mt-2 text-slate-800 font-semibold">{booking.serviceType}</div>
                <div className="text-slate-600 mt-1">
                  ${booking.servicePrice.toFixed(2)}
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="font-bold text-slate-900">Date / Time</div>
                  <div className="mt-2 text-slate-800">{prettyDate}</div>
                  <div className="text-slate-600 mt-1">{prettyTime}</div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="font-bold text-slate-900">Quick actions</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => doAction("confirm")}
                      disabled={booking.status === "confirmed"}
                      className="rounded-xl bg-green-600 text-white px-4 py-2 font-extrabold disabled:opacity-50"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => doAction("cancel")}
                      disabled={booking.status === "cancelled"}
                      className="rounded-xl bg-red-600 text-white px-4 py-2 font-extrabold disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={load}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold"
                    >
                      Refresh
                    </button>
                  </div>

                  {booking.status !== "pending" ? (
                    <p className="text-xs text-slate-500 mt-3">
                      Tip: for safety, you usually only need quick actions while it’s pending.
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Customer card */}
              <div className="rounded-2xl bg-white shadow p-5">
                <div className="font-bold text-slate-900">Customer</div>

                <div className="mt-3">
                  <div className="text-slate-900 font-semibold">{booking.customerName}</div>
                  <div className="text-slate-600 text-sm">{booking.customerEmail}</div>
                  <div className="text-slate-600 text-sm">{booking.customerWhatsapp}</div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => copyToClipboard(booking.customerEmail)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
                  >
                    Copy email
                  </button>

                  <button
                    onClick={() => copyToClipboard(booking.customerWhatsapp)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
                  >
                    Copy WhatsApp
                  </button>

                  {waDigits ? (
                    <a
                      href={`https://wa.me/${waDigits}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-green-600 text-white px-3 py-2 text-sm font-extrabold"
                    >
                      Open WhatsApp
                    </a>
                  ) : null}
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="font-bold text-slate-900">Address</div>
                  <div className="mt-2 text-slate-800">{booking.customerAddress}</div>

                  {booking.customerUnit ? (
                    <div className="mt-1 text-slate-600 text-sm">
                      Unit/Buzzer: <span className="font-semibold">{booking.customerUnit}</span>
                    </div>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        copyToClipboard(
                          booking.customerUnit
                            ? `${booking.customerAddress}, ${booking.customerUnit}`
                            : booking.customerAddress
                        )
                      }
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
                    >
                      Copy address
                    </button>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <Timeline createdAt={booking.createdAt} status={booking.status} />
            </div>

            {/* Notes */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 rounded-2xl bg-white shadow p-5">
                <div className="font-bold text-slate-900">Notes</div>
                {booking.additionalNotes ? (
                  <div className="mt-2 text-slate-700 whitespace-pre-wrap">
                    {booking.additionalNotes}
                  </div>
                ) : (
                  <div className="mt-2 text-slate-500 text-sm">No notes provided.</div>
                )}
              </div>

              <div className="rounded-2xl bg-white shadow p-5">
                <div className="font-bold text-slate-900">Links</div>

                <div className="mt-3 flex flex-col gap-2">
                  <a
                    href={manageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-slate-900 text-white px-4 py-3 font-extrabold text-center"
                  >
                    Open Manage Page
                  </a>

                  <Link
                    href="/admin"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-center"
                  >
                    Back to list
                  </Link>
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="mt-4 rounded-2xl bg-white shadow p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900">Photos</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Click to open full size.
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Front */}
                <div className="rounded-2xl border border-slate-100 overflow-hidden bg-slate-50">
                  <div className="px-4 py-3 border-b border-slate-100 bg-white font-bold text-slate-900">
                    Front
                  </div>
                  <div className="p-4">
                    {booking.photoFrontUrl ? (
                      <a href={booking.photoFrontUrl} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={booking.photoFrontUrl}
                          alt="Front photo"
                          className="w-full h-64 object-contain bg-white rounded-xl border border-slate-100"
                          loading="lazy"
                        />
                      </a>
                    ) : (
                      <div className="text-slate-500 text-sm">No front photo.</div>
                    )}

                    {booking.photoFrontUrl ? (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        <button
                          onClick={() => copyToClipboard(booking.photoFrontUrl!)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
                        >
                          Copy link
                        </button>
                        <a
                          href={booking.photoFrontUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm font-extrabold"
                        >
                          Open
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Back */}
                <div className="rounded-2xl border border-slate-100 overflow-hidden bg-slate-50">
                  <div className="px-4 py-3 border-b border-slate-100 bg-white font-bold text-slate-900">
                    Back
                  </div>
                  <div className="p-4">
                    {booking.photoBackUrl ? (
                      <a href={booking.photoBackUrl} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={booking.photoBackUrl}
                          alt="Back photo"
                          className="w-full h-64 object-contain bg-white rounded-xl border border-slate-100"
                          loading="lazy"
                        />
                      </a>
                    ) : (
                      <div className="text-slate-500 text-sm">No back photo.</div>
                    )}

                    {booking.photoBackUrl ? (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        <button
                          onClick={() => copyToClipboard(booking.photoBackUrl!)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
                        >
                          Copy link
                        </button>
                        <a
                          href={booking.photoBackUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm font-extrabold"
                        >
                          Open
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
