// app/admin/services/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ServiceRow = {
  id: string; // serviceId
  name: string;
  price: number;
  enabled: boolean;
  sortOrder: number;
  updatedAt?: string;
};

export default function AdminServicesPage() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services", { cache: "no-store" });
      const json = await res.json();

      if (!json?.ok) {
        alert(json?.error || "Failed to load services");
        setServices([]);
        return;
      }

      setServices(json.services || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...services].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    if (!q) return list;

    return list.filter((s) => {
      const hay = `${s.id} ${s.name}`.toLowerCase();
      return hay.includes(q);
    });
  }, [services, query]);

  async function toggleEnabled(serviceId: string, nextEnabled: boolean) {
    // Optimistic UI
    setSavingId(serviceId);
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, enabled: nextEnabled } : s))
    );

    try {
      const res = await fetch(`/api/admin/services/${encodeURIComponent(serviceId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextEnabled }),
      });

      const json = await res.json();
      if (!json?.ok) {
        // rollback
        setServices((prev) =>
          prev.map((s) => (s.id === serviceId ? { ...s, enabled: !nextEnabled } : s))
        );
        alert(json?.error || "Failed to update service");
        return;
      }

      // (opcional) se API retornar o item atualizado
      if (json?.service) {
        setServices((prev) =>
          prev.map((s) => (s.id === serviceId ? { ...s, ...json.service } : s))
        );
      }
    } catch (e) {
      // rollback
      setServices((prev) =>
        prev.map((s) => (s.id === serviceId ? { ...s, enabled: !nextEnabled } : s))
      );
      alert("Network error while updating service");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Services</h1>
            <p className="text-slate-600 mt-1">
              Enable/disable services. Disabled services must show as unavailable in booking.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900"
            >
              Back
            </Link>
            <button
              onClick={load}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or serviceId..."
            className="w-full sm:w-[420px] rounded-xl border border-slate-200 bg-white px-4 py-2"
          />

          <div className="text-sm text-slate-600">
            {loading ? "Loading..." : `${filtered.length} service(s)`}
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white shadow overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="font-bold text-slate-900">Service Catalog</div>
            <div className="text-xs text-slate-500">
              Tip: keep sortOrder small for top items.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr className="text-sm text-slate-600">
                  <th className="p-3">Status</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">serviceId</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Sort</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td className="p-4 text-slate-600" colSpan={6}>
                      No services found.
                    </td>
                  </tr>
                ) : null}

                {filtered.map((s) => {
                  const busy = savingId === s.id;
                  return (
                    <tr key={s.id} className="border-t border-slate-100">
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                            s.enabled
                              ? "bg-green-100 text-green-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {s.enabled ? "ACTIVE" : "DISABLED"}
                        </span>
                      </td>
                      <td className="p-3 text-slate-900 font-semibold">{s.name}</td>
                      <td className="p-3 text-slate-700 font-mono text-sm">{s.id}</td>
                      <td className="p-3 text-slate-800">${Number(s.price).toFixed(2)}</td>
                      <td className="p-3 text-slate-800">{s.sortOrder ?? 0}</td>
                      <td className="p-3">
                        <button
                          disabled={busy}
                          onClick={() => toggleEnabled(s.id, !s.enabled)}
                          className={`inline-flex rounded-xl px-3 py-2 text-sm font-semibold ${
                            s.enabled
                              ? "bg-slate-900 text-white"
                              : "bg-white border border-slate-200 text-slate-900"
                          } ${busy ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          {busy ? "Saving..." : s.enabled ? "Disable" : "Enable"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-6">
          This page depends on: <span className="font-mono">/api/admin/services</span> and{" "}
          <span className="font-mono">/api/admin/services/[serviceId]</span>.
        </p>
      </div>
    </div>
  );
}
