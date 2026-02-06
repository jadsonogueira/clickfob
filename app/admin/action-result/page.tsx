"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AdminActionResultPage() {
  const sp = useSearchParams();

  const ok = sp.get("ok") === "1";
  const order = (sp.get("order") || "").toUpperCase();
  const status = sp.get("status") || "";
  const msg = sp.get("msg") || "";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {ok ? "Action completed" : "Action failed"}
        </h1>

        {ok ? (
          <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800">
            Booking <span className="font-mono">{order}</span> updated to{" "}
            <strong>{status}</strong>.
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
            {msg || "Something went wrong."}
          </div>
        )}

        {order && (
          <div className="mt-6">
            <Link
              href={`/manage/${order}`}
              className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all"
            >
              View Booking
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
