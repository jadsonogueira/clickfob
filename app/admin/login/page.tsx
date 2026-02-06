// app/admin/login/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const nextPath = useMemo(() => sp.get("next") || "/admin", [sp]);

  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const json = await res.json();

      if (!json?.ok) {
        alert(json?.error || "Login failed");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow p-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
        <p className="text-slate-600 mt-2">
          Enter the admin key to access ClickFob dashboard.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <label className="block text-sm font-semibold text-slate-700">
            Admin key
          </label>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="ADMIN_DASHBOARD_KEY"
            type="password"
            autoComplete="off"
          />

          <button
            disabled={loading || !key}
            className="w-full rounded-xl bg-slate-900 text-white font-semibold py-3 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-slate-500 mt-4">
          Tip: store your key in Render env var <code>ADMIN_DASHBOARD_KEY</code>.
        </p>
      </div>
    </div>
  );
}
