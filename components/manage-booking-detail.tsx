"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Send,
  Image as ImageIcon,
} from "lucide-react";

interface Booking {
  orderNumber: string;
  serviceType: string;
  servicePrice: number;
  items?:
    | Array<{
        serviceId?: string;
        serviceName?: string;
        unitPrice?: number;
        quantity?: number;
        label?: string;
        photoFrontUrl?: string;
        photoBackUrl?: string;
      }>
    | null;
  totalPrice?: number | null;
  bookingDate: string;
  bookingTime: string;
  customerName: string;
  customerAddress: string;
  customerUnit?: string;
  customerEmail: string;
  status: "pending" | "confirmed" | "cancelled";
  photoFrontUrl: string;
  photoBackUrl: string;
  createdAt: string;
}

const timeSlotLabels: Record<string, string> = {
  "9-11": "9:00 AM - 11:00 AM",
  "11-13": "11:00 AM - 1:00 PM",
  "13-15": "1:00 PM - 3:00 PM",
  "15-17": "3:00 PM - 5:00 PM",
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const icons: Record<string, React.ReactNode> = {
    pending: <AlertCircle size={14} />,
    confirmed: <CheckCircle size={14} />,
    cancelled: <XCircle size={14} />,
  };

  const labels: Record<string, string> = {
    pending: "Pending Confirmation",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
        styles[status] || styles.pending
      }`}
    >
      {icons[status]} {labels[status] || "Unknown"}
    </span>
  );
}

export default function ManageBookingDetail({ orderNumber }: { orderNumber: string }) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [changeRequest, setChangeRequest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ✅ Normaliza URL (Cloudinary absoluta fica intacta; "/https://..." vira "https://...")
  const normalizeImageUrl = useCallback((input?: string | null) => {
    if (!input) return "";
    const value = String(input).trim();

    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    if (value.startsWith("/http://") || value.startsWith("/https://")) return value.slice(1);

    // dataURL (caso apareça)
    if (value.startsWith("data:image/")) return value;

    // path relativo (legado)
    return `/${value.replace(/^\/+/, "")}`;
  }, []);

  const fetchBooking = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings/${orderNumber}`);
      const data = await res.json();

      if (data?.success) {
        setBooking(data.booking);
      } else {
        setError(data?.error || "Booking not found");
      }
    } catch {
      setError("Failed to load booking");
    } finally {
      setIsLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    if (orderNumber) {
      fetchBooking();
    }
  }, [orderNumber, fetchBooking]);

  const handleSubmitChangeRequest = async () => {
    if (!changeRequest?.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${orderNumber}/change-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestedChanges: changeRequest }),
      });

      const data = await res.json();
      if (data?.success) {
        setSubmitSuccess(true);
        setChangeRequest("");
      } else {
        setError(data?.error || "Failed to submit request");
      }
    } catch {
      setError("Failed to submit change request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ✅ URLs prontas e seguras para render
  const frontUrl = useMemo(
    () => normalizeImageUrl(booking?.photoFrontUrl),
    [booking?.photoFrontUrl, normalizeImageUrl]
  );
  const backUrl = useMemo(
    () => normalizeImageUrl(booking?.photoBackUrl),
    [booking?.photoBackUrl, normalizeImageUrl]
  );

  // ✅ Evita "booking possibly null" no JSX
  const items = useMemo(() => (Array.isArray(booking?.items) ? booking!.items! : []), [booking?.items]);
  const hasItems = items.length > 0;

  const computedTotal = useMemo(() => {
    if (typeof booking?.totalPrice === "number") return booking.totalPrice;
    if (!hasItems) return booking?.servicePrice || 0;

    return items.reduce((sum, it) => {
      const unit = Number(it?.unitPrice || 0);
      const qty = Math.max(1, Number(it?.quantity || 1));
      return sum + unit * qty;
    }, 0);
  }, [booking?.totalPrice, booking?.servicePrice, items, hasItems]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
              <AlertCircle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
            <p className="text-gray-600 mb-6">
              We couldn't find a booking with order number <strong>{orderNumber}</strong>
            </p>
            <Link
              href="/manage"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft size={18} /> Try Another Order Number
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link
          href="/manage"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6"
        >
          <ArrowLeft size={18} /> Back to Search
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-blue-200 text-sm">Order Number</p>
                <h1 className="text-2xl font-bold text-white">{booking?.orderNumber}</h1>
              </div>
              <StatusBadge status={booking?.status || "pending"} />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Service / Items Info */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Service</p>
                  <p className="font-semibold text-gray-900">{booking?.serviceType}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${computedTotal.toFixed(2)}
                  </p>
                </div>
              </div>

              {hasItems && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <p className="text-sm text-gray-500">Items</p>
                  {items.map((it, idx) => {
                    const name = it?.label || it?.serviceName || `Item ${idx + 1}`;
                    const qty = Math.max(1, Number(it?.quantity || 1));
                    const unit = Number(it?.unitPrice || 0);
                    return (
                      <div key={`${idx}_${name}`} className="flex items-center justify-between text-sm">
                        <div className="text-gray-800">
                          {name} × {qty}
                        </div>
                        <div className="font-semibold text-gray-900">${(unit * qty).toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Date & Time */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Calendar className="text-blue-600 mt-0.5" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {booking?.bookingDate ? formatDate(booking.bookingDate) : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Clock className="text-blue-600 mt-0.5" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium text-gray-900">
                    {timeSlotLabels[booking?.bookingTime || ""] || booking?.bookingTime || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <MapPin className="text-blue-600 mt-0.5" size={20} />
              <div>
                <p className="text-sm text-gray-500">Service Address</p>
                <p className="font-medium text-gray-900">{booking?.customerAddress}</p>
                {booking?.customerUnit && <p className="text-gray-600">Unit/Buzzer: {booking.customerUnit}</p>}
              </div>
            </div>

            {/* Photos */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="text-blue-600" size={20} />
                <p className="font-medium text-gray-900">Uploaded Photos</p>
              </div>

              {hasItems ? (
                <div className="space-y-4">
                  {items.map((it, idx) => {
                    const name = it?.label || it?.serviceName || `Item ${idx + 1}`;
                    const f = normalizeImageUrl(it?.photoFrontUrl);
                    const b = normalizeImageUrl(it?.photoBackUrl);
                    return (
                      <div key={`${idx}_${name}`} className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-semibold text-gray-900">{name}</div>
                          <div className="text-sm text-gray-600">× {Math.max(1, Number(it?.quantity || 1))}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Front</p>
                            {f ? (
                              <a
                                href={f}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block aspect-video bg-gray-200 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                              >
                                <img src={f} alt="Front photo" className="w-full h-full object-cover" />
                              </a>
                            ) : (
                              <div className="block aspect-video bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center text-gray-500 text-sm">
                                No image
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="text-sm text-gray-500 mb-2">Back</p>
                            {b ? (
                              <a
                                href={b}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block aspect-video bg-gray-200 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                              >
                                <img src={b} alt="Back photo" className="w-full h-full object-cover" />
                              </a>
                            ) : (
                              <div className="block aspect-video bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center text-gray-500 text-sm">
                                No image
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Front</p>
                    {frontUrl ? (
                      <a
                        href={frontUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-video bg-gray-200 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                      >
                        <img src={frontUrl} alt="Front photo" className="w-full h-full object-cover" />
                      </a>
                    ) : (
                      <div className="block aspect-video bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center text-gray-500 text-sm">
                        No image
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Back</p>
                    {backUrl ? (
                      <a
                        href={backUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-video bg-gray-200 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                      >
                        <img src={backUrl} alt="Back photo" className="w-full h-full object-cover" />
                      </a>
                    ) : (
                      <div className="block aspect-video bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center text-gray-500 text-sm">
                        No image
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t pt-6 space-y-4">
              {!showChangeForm && !submitSuccess && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setShowChangeForm(true)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all"
                  >
                    Request Changes
                  </button>
                  <a
                    href="https://wa.me/14167707036"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-all"
                  >
                    <MessageCircle size={20} />
                    WhatsApp Us
                  </a>
                </div>
              )}

              {showChangeForm && !submitSuccess && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Request Changes</h3>
                  <textarea
                    value={changeRequest}
                    onChange={(e) => setChangeRequest(e.target.value)}
                    placeholder="Describe the changes you need (e.g., new date, time, or address)..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() => setShowChangeForm(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitChangeRequest}
                      disabled={isSubmitting || !changeRequest?.trim()}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                      Submit Request
                    </button>
                  </div>
                </div>
              )}

              {submitSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={24} />
                    <div>
                      <p className="font-semibold text-green-800">Request Submitted!</p>
                      <p className="text-sm text-green-700">We will contact you shortly to discuss the changes.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && booking && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
