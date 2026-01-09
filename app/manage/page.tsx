"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, AlertCircle } from "lucide-react";

export default function ManageBookingPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = orderNumber?.trim()?.toUpperCase();
    if (!trimmed) {
      setError("Please enter your order number");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/bookings/${trimmed}`);
      const data = await res.json();

      if (data?.success) {
        router.push(`/manage/${trimmed}`);
      } else {
        setError("Booking not found. Please check your order number.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Your Booking</h1>
          <p className="text-gray-600">Enter your order number to view or modify your booking</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value?.toUpperCase())}
                  placeholder="OS-XXXX"
                  className="w-full px-4 py-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono uppercase"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle size={14} /> {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {isLoading ? "Searching..." : "Find Booking"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-gray-500">
              Your order number was sent to your email when you booked.
              <br />
              It looks like: <span className="font-mono text-gray-700">OS-K7P3</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
