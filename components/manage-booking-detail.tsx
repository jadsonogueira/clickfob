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
  Shield,
} from "lucide-react";

interface Booking {
  orderNumber: string;
  serviceType: string;
  servicePrice: number;
  bookingDate: string;
  bookingTime: string;
  customerName: string;
  customerAddress: string;
  customerUnit?: string;
  customerEmail: string;
  customerWhatsapp?: string;
  additionalNotes?: string;
  status: "pending" | "confirmed" | "cancelled";
  photoFrontUrl: string;
  photoBackUrl: string;
  createdAt: string;

  // opcionais (se existirem no retorno)
  statusUpdatedAt?: string | null;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
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
      {icons[status] || icons.pending} {labels[status] || "Unknown"}
    </span>
  );
}

type Props = {
  orderNumber: string;
  mode?: "customer" | "admin";
};

export default function ManageBookingDetail({
  orderNumber,
  mode = "customer",
}: Props) {
  const isAdmin = mode === "admin";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // customer flow
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [changeRequest, setChangeRequest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // admin flow
  const [isAdminUpdating, setIsAdminUpdating] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");

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
    setIsLoading(true);
    setError("");
    setAdminMessage("");

    try {
      const url = isAdmin
        ? `/api/admin/booking/${orderNumber}`
        : `/api/bookings/${orderNumber}`;

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      if (isAdmin) {
        if (data?.ok) {
          setBooking(data.booking);
        } else {
          setError(data?.error || "Booking not found");
        }
      } else {
        if (data?.success) {
          setBooking(data.booking);
        } else {
          setError(data?.error || "Booking not found");
        }
      }
    } catch {
      setError("Failed to load booking");
    } finally {
      setIsLoading(false);
    }
  }, [orderNumber, isAdmin]);

  useEffect(() => {
    if (orderNumber) fetchBooking();
  }, [orderNumber, fetchBooking]);

  const handleSubmitChangeRequest = async () => {
    if (!changeRequest?.trim()) return;

    setIsSubmitting(true);
    setError("");

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

  const handleAdminSetStatus = async (status: "confirmed" | "cancelled") => {
    if (!booking) return;

    setError("");
    setAdminMessage("");

    const pretty = status === "confirmed" ? "CONFIRM" : "CANCEL";
    const ok = window.confirm(
      `Are you sure you want to ${pretty} booking ${booking.orderNumber}?`
    );
    if (!ok) return;

    setIsAdminUpdating(true);

    try {
      const res = await fetch(`/api/admin/booking/${orderNumber}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!data?.ok) {
        setError(data?.error || "Failed to update status");
        return;
      }

      // Se endpoint retornou booking atualizado
      if (data?.booking) setBooking(data.booking);

      setAdminMessage(
        status === "confirmed"
          ? "Booking confirmed and customer was notified."
          : "Booking cancelled and customer was notified."
      );

      // reforça atualização
      await fetchBooking();
    } catch {
      setError("Failed to update status");
    } finally {
      setIsAdminUpdating(false);
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

  const backHref = isAdmin ? "/admin" : "/manage";
  const backLabel = isAdmin ? "Back to Admin" : "Back to Search";

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
              href={backHref}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft size={18} /> {backLabel}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const wa = booking?.customerWhatsapp || "14167707036";
  const waDigits = String(wa).replace(/[^0-9]/g, "") || "14167707036";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6"
        >
          <ArrowLeft size={18} /> {backLabel}
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

            {isAdmin && (
              <div className="mt-4 inline-flex items-center gap-2 text-blue-100 text-sm">
                <Shield size={16} />
                Admin view
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Service Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-500">Service</p>
                <p className="font-semibold text-gray-900">{booking?.serviceType}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${booking?.servicePrice?.toFixed?.(2) || "0.00"}
                </p>
              </div>
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
                    {timeSlotLabels[booking?.bookingTime || ""] ||
                      booking?.bookingTime ||
                      "N/A"}
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
                {booking?.customerUnit && (
                  <p className="text-gray-600">Unit/Buzzer: {booking.customerUnit}</p>
                )}
              </div>
            </div>

            {/* Customer */}
            {isAdmin && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Customer</p>
                <p className="font-semibold text-gray-900">{booking?.customerName}</p>
                <p className="text-gray-700 text-sm">{booking?.customerEmail}</p>
              </div>
            )}

            {/* Photos */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="text-blue-600" size={20} />
                <p className="font-medium text-gray-900">Uploaded Photos</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Front */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Front</p>

                  {frontUrl ? (
                    <a
                      href={frontUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-video bg-gray-200 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={frontUrl}
                        alt="Front photo"
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ) : (
                    <div className="block aspect-video bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center text-gray-500 text-sm">
                      No image
                    </div>
                  )}
                </div>

                {/* Back */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Back</p>

                  {backUrl ? (
                    <a
                      href={backUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-video bg-gray-200 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={backUrl}
                        alt="Back photo"
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ) : (
                    <div className="block aspect-video bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center text-gray-500 text-sm">
                      No image
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-6 space-y-4">
              {/* ADMIN ACTIONS */}
              {isAdmin && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-gray-900">Admin Actions</p>
                      <p className="text-sm text-gray-600">
                        Confirm or cancel this booking (customer will receive an email).
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAdminSetStatus("confirmed")}
                        disabled={isAdminUpdating || booking?.status === "confirmed"}
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold transition-all disabled:opacity-50"
                      >
                        {isAdminUpdating ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <CheckCircle size={18} />
                        )}
                        Confirm
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAdminSetStatus("cancelled")}
                        disabled={isAdminUpdating || booking?.status === "cancelled"}
                        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold transition-all disabled:opacity-50"
                      >
                        {isAdminUpdating ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <XCircle size={18} />
                        )}
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col sm:flex-row gap-3">
                    <a
                      href={`https://wa.me/${waDigits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-all"
                    >
                      <MessageCircle size={20} />
                      WhatsApp Customer
                    </a>

                    <button
                      type="button"
                      onClick={fetchBooking}
                      disabled={isAdminUpdating}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
                    >
                      Refresh
                    </button>
                  </div>

                  {adminMessage && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
                      {adminMessage}
                    </div>
                  )}
                </div>
              )}

              {/* CUSTOMER ACTIONS */}
              {!isAdmin && !showChangeForm && !submitSuccess && (
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

              {!isAdmin && showChangeForm && !submitSuccess && (
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
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <Send size={20} />
                      )}
                      Submit Request
                    </button>
                  </div>
                </div>
              )}

              {!isAdmin && submitSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={24} />
                    <div>
                      <p className="font-semibold text-green-800">Request Submitted!</p>
                      <p className="text-sm text-green-700">
                        We will contact you shortly to discuss the changes.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Errors */}
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
