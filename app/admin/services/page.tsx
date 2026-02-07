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

type DraftMap = Record<
  string,
  {
    name: string;
    price: string; // string pra input
    sortOrder: string; // string pra input
  }
>;

export default function AdminServicesPage() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [query, setQuery] = useState("");

  // drafts por linha (pra permitir editar sem bagunçar state principal)
  const [drafts, setDrafts] = useState<DraftMap>({});

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services", { cache: "no-store" });
      const json = await res.json();

      if (!json?.ok) {
        alert(json?.error || "Failed to load services");
        setServices([]);
        setDrafts({});
        return;
      }

      const list: ServiceRow[] = json.services || [];
      setServices(list);

      // inicializa drafts
      const nextDrafts: DraftMap = {};
      for (const s of list) {
        nextDrafts[s.id] = {
          name: String(s.name ?? ""),
          price: String(Number(s.price ?? 0)),
          sortOrder: String(Number(s.sortOrder ?? 0)),
        };
      }
      setDrafts(nextDrafts);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...services].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
    if (!q) return list;

    return list.filter((s) => {
      const hay = `${s.id} ${s.name}`.toLowerCase();
      return hay.includes(q);
    });
  }, [services, query]);

  function setDraftField(serviceId: string, field: "name" | "price" | "sortOrder", value: string) {
    setDrafts((prev) => ({
      ...prev,
      [serviceId]: {
        ...(prev[serviceId] || { name: "", price: "0", sortOrder: "0" }),
        [field]: value,
      },
    }));
  }

  function isDirty(s: ServiceRow) {
    const d = drafts[s.id];
    if (!d) return false;

    const nameDirty = (d.name ?? "") !== String(s.name ?? "");
    const priceDirty = Number(d.price || 0) !== Number(s.price || 0);
    const sortDirty = Number(d.sortOrder || 0) !== Number(s.sortOrder || 0);

    return nameDirty || priceDirty || sortDirty;
  }

  function validateDraft(serviceId: string) {
    const d = drafts[serviceId];
    if (!d) return { ok: false as const, error: "Draft not found" };

    const name = String(d.name || "").trim();
    if (!name) return { ok: false as const, error: "Name is required" };

    const priceNum = Number(d.price);
    if (!Number.isFinite(priceNum) || priceNum < 0)
      return { ok: false as const, error: "Price must be a valid number" };

    const sortNum = Number(d.sortOrder);
    if (!Number.isFinite(sortNum) || sortNum < 0)
      return { ok: false as const, error: "Sort must be a valid number" };

    return { ok: true as const, name, price: priceNum, sortOrder: sortNum };
  }

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

      if (json?.service) {
        setServices((prev) =>
          prev.map((s) => (s.id === serviceId ? { ...s, ...json.service } : s))
        );
      }
    } catch {
      // rollback
      setServices((prev) =>
        prev.map((s) => (s.id === serviceId ? { ...s, enabled: !nextEnabled } : s))
      );
      alert("Network error while updating service");
    } finally {
      setSavingId(null);
    }
  }

  async function saveRow(serviceId: string) {
    const check = validateDraft(serviceId);
    if (!check.ok) {
      alert(check.error);
      return;
    }

    const { name, price, sortOrder } = check;

    // snapshot pra rollback
    const before = services.find((s) => s.id === serviceId);
    if (!before) return;

    setSavingId(serviceId);

    // optimistic update
    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId ? { ...s, name, price, sortOrder } : s
      )
    );

    try {
      const res = await fetch(`/api/admin/services/${encodeURIComponent(serviceId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, sortOrder }),
      });

      const json = await res.json();
      if (!json?.ok) {
        // rollback
        setServices((prev) =>
          prev.map((s) => (s.id === serviceId ? before : s))
        );
        alert(json?.error || "Failed to save changes");
        return;
      }

      // se API retornar o item atualizado, aplica
      if (json?.service) {
        setServices((prev) =>
          prev.map((s) => (s.id === serviceId ? { ...s, ...json.service } : s))
        );
      }
    } catch {
      // rollback
      setServices((prev) =>
        prev.map((s) => (s.id === serviceId ? before : s))
      );
      alert("Network error while saving");
    } finally {
      setSavingId(null);
    }
  }

  function resetRow(serviceId: string) {
    const s = services.find((x) => x.id === serviceId);
    if (!s) return;

    setDrafts((prev) => ({
      ...prev,
      [serviceId]: {
        name: String(s.name ?? ""),
        price: String(Number(s.price ?? 0)),
        sortOrder: String(Number(s.sortOrder ?? 0)),
      },
    }));
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Services</h1>
            <p className="text-slate-600 mt-1">
              Enable/disable services. Edit name/price/order. Disabled services must show as unavailable in booking & home.
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
            <div className="text-xs text-slate-500">Tip: keep sortOrder small for top items.</div>
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
                  <th className="p-3">Actions</th>
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
                  const d = drafts[s.id] || {
                    name: s.name,
                    price: String(Number(s.price ?? 0)),
                    sortOrder: String(Number(s.sortOrder ?? 0)),
                  };
                  const dirty = isDirty(s);

                  return (
                    <tr key={s.id} className="border-t border-slate-100">
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                            s.enabled ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {s.enabled ? "ACTIVE" : "DISABLED"}
                        </span>
                      </td>

                      {/* Name editable */}
                      <td className="p-3">
                        <input
                          value={d.name}
                          onChange={(e) => setDraftField(s.id, "name", e.target.value)}
                          disabled={busy}
                          className={`w-full max-w-[360px] rounded-xl border px-3 py-2 font-semibold ${
                            busy ? "bg-slate-50 text-slate-500" : "bg-white"
                          } ${dirty ? "border-blue-300" : "border-slate-200"}`}
                        />
                      </td>

                      <td className="p-3 text-slate-700 font-mono text-sm">{s.id}</td>

                      {/* Price editable */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">$</span>
                          <input
                            value={d.price}
                            onChange={(e) => setDraftField(s.id, "price", e.target.value)}
                            disabled={busy}
                            inputMode="decimal"
                            className={`w-[120px] rounded-xl border px-3 py-2 ${
                              busy ? "bg-slate-50 text-slate-500" : "bg-white"
                            } ${dirty ? "border-blue-300" : "border-slate-200"}`}
                          />
                        </div>
                      </td>

                      {/* Sort editable */}
                      <td className="p-3">
                        <input
                          value={d.sortOrder}
                          onChange={(e) => setDraftField(s.id, "sortOrder", e.target.value)}
                          disabled={busy}
                          inputMode="numeric"
                          className={`w-[90px] rounded-xl border px-3 py-2 ${
                            busy ? "bg-slate-50 text-slate-500" : "bg-white"
                          } ${dirty ? "border-blue-300" : "border-slate-200"}`}
                        />
                      </td>

                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          {/* Enable/Disable */}
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

                          {/* Save changes */}
                          <button
                            disabled={busy || !dirty}
                            onClick={() => saveRow(s.id)}
                            className={`inline-flex rounded-xl px-3 py-2 text-sm font-semibold ${
                              dirty
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-slate-100 text-slate-400"
                            } ${busy ? "opacity-60 cursor-not-allowed" : ""}`}
                          >
                            {busy ? "Saving..." : "Save"}
                          </button>

                          {/* Reset */}
                          <button
                            disabled={busy || !dirty}
                            onClick={() => resetRow(s.id)}
                            className={`inline-flex rounded-xl px-3 py-2 text-sm font-semibold border ${
                              dirty
                                ? "bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
                                : "bg-white border-slate-100 text-slate-300"
                            } ${busy ? "opacity-60 cursor-not-allowed" : ""}`}
                          >
                            Reset
                          </button>
                        </div>

                        {dirty ? (
                          <div className="text-xs text-blue-600 mt-1">Unsaved changes</div>
                        ) : null}
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
