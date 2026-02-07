"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Key, Radio, Settings, AlertCircle } from "lucide-react";

type Lang = "en" | "fr";

type ServiceApiItem = {
  id: string; // serviceId
  name: string;
  price: number;
  active?: boolean;
  sortOrder?: number;
};

type LocalContent = {
  id: string;
  icon: any;
  en: { name: string; desc: string };
  fr: { name: string; desc: string };
};

const LOCAL: LocalContent[] = [
  {
    id: "fob-lf",
    icon: Key,
    en: {
      name: "Fob Low Frequency (LF)",
      desc:
        "Duplicate low frequency (125kHz) key fobs. Common for older apartment and condo buildings.",
    },
    fr: {
      name: "Porte-clés basse fréquence (LF)",
      desc:
        "Duplication de porte-clés basse fréquence (125 kHz). Fréquent dans les immeubles plus anciens.",
    },
  },
  {
    id: "fob-hf",
    icon: Radio,
    en: {
      name: "Fob High Frequency (HF)",
      desc:
        "Duplicate high frequency (13.56MHz) key fobs. Common for newer secure buildings and offices.",
    },
    fr: {
      name: "Porte-clés haute fréquence (HF)",
      desc:
        "Duplication de porte-clés haute fréquence (13,56 MHz). Courant dans les immeubles plus récents.",
    },
  },
  {
    id: "garage-remote",
    icon: Settings,
    en: {
      name: "Garage Remote",
      desc:
        "Program a new garage remote to work with your existing opener. Fast and reliable.",
    },
    fr: {
      name: "Télécommande de garage",
      desc:
        "Programmation d’une télécommande compatible avec votre ouvre-porte existant.",
    },
  },
];

export default function ServicesSection({ lang }: { lang: Lang }) {
  const isFR = lang === "fr";

  const t = isFR
    ? {
        servicesTitle: "Services",
        servicesSubtitle:
          "Duplication de porte-clés compatibles et programmation de télécommandes de garage.",
        book: "Réserver",
        unavailable: "Indisponible",
        failed: "Impossible de charger les services.",
        loadingPrice: "—",
      }
    : {
        servicesTitle: "Services",
        servicesSubtitle:
          "Compatible key fob duplication and garage remote programming.",
        book: "Book Now",
        unavailable: "Unavailable",
        failed: "Failed to load services.",
        loadingPrice: "—",
      };

  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(true);
  const [api, setApi] = useState<ServiceApiItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setOk(true);
      try {
        const res = await fetch("/api/services", { cache: "no-store" });
        const data = await res.json();
        const list: ServiceApiItem[] = data?.services || data?.data?.services || [];
        if (!cancelled) setApi(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) {
          setOk(false);
          setApi([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const merged = useMemo(() => {
    const m = new Map<string, ServiceApiItem>();
    for (const s of api) m.set(String(s.id), s);

    // Mantém a ordem definida no Mongo (sortOrder) quando existir
    const base = LOCAL.map((lc) => {
      const a = m.get(lc.id);
      const active = a ? a.active !== false : true;
      const price = a ? Number(a.price || 0) : 0;
      const sortOrder = a?.sortOrder ?? 0;

      return {
        id: lc.id,
        icon: lc.icon,
        name: isFR ? lc.fr.name : lc.en.name,
        desc: isFR ? lc.fr.desc : lc.en.desc,
        active,
        price,
        sortOrder,
      };
    });

    return base.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [api, isFR]);

  const withLang = (path: string) => `${path}?lang=${lang}`;

  return (
    <section id="services" className="py-16 lg:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {t.servicesTitle}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.servicesSubtitle}
          </p>
        </div>

        {!ok ? (
          <div className="mb-6 text-sm text-red-600 flex items-center justify-center gap-2">
            <AlertCircle size={16} />
            {t.failed}
          </div>
        ) : null}

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {merged.map((service) => {
            const Icon = service.icon;
            const disabled = service.active === false;

            return (
              <div
                key={service.id}
                className={`relative bg-gray-50 rounded-2xl shadow-sm transition-all p-6 lg:p-8 flex flex-col border ${
                  disabled ? "opacity-70" : "hover:shadow-md"
                }`}
              >
                {disabled ? (
                  <div className="absolute inset-0 rounded-2xl flex items-start justify-end p-4 pointer-events-none">
                    <span className="inline-flex items-center rounded-full bg-gray-200 text-gray-700 px-3 py-1 text-xs font-bold">
                      {t.unavailable}
                    </span>
                  </div>
                ) : null}

                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`p-3 rounded-xl ${
                      disabled ? "bg-gray-200 text-gray-500" : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    <Icon size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{service.name}</h3>
                    <p
                      className={`text-2xl font-bold ${
                        disabled ? "text-gray-600" : "text-blue-600"
                      }`}
                    >
                      {loading ? t.loadingPrice : `$${Number(service.price).toFixed(2)}`}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 mb-6 flex-1">{service.desc}</p>

                {disabled ? (
                  <button
                    type="button"
                    disabled
                    className="w-full bg-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    {t.unavailable}
                  </button>
                ) : (
                  <Link
                    href={`${withLang("/book")}&service=${service.id}`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-center transition-all flex items-center justify-center gap-2"
                  >
                    {t.book} <ArrowRight size={18} />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
