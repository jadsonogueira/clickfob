"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Key, Radio, Settings, ArrowRight } from "lucide-react";

type Lang = "en" | "fr";

type ServiceApiItem = {
  id: string;
  name: string;
  price: number;

  // alguns endpoints usam "active", outros usam "enabled"
  active?: boolean;
  enabled?: boolean;
};

type UiService = {
  id: string;
  name: string;
  price: number;
  icon: any;
};

const ICON_BY_ID: Record<string, any> = {
  "fob-lf": Key,
  "fob-hf": Radio,
  "garage-remote": Settings,
};

// ✅ regra única e segura para entender se está ativo
function isServiceActive(s: ServiceApiItem) {
  if (typeof s.active === "boolean") return s.active;
  if (typeof s.enabled === "boolean") return s.enabled;
  return true; // default
}

export default function ServicesSection({ lang }: { lang: Lang }) {
  const isFR = lang === "fr";
  const [services, setServices] = useState<UiService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/services", { cache: "no-store" });
        const data = await res.json();

        const apiList: ServiceApiItem[] =
          data?.services || data?.data?.services || [];

        // ✅ só serviços ativos (considera active OU enabled)
        const activeOnly = (apiList || []).filter(isServiceActive);

        const normalized: UiService[] = activeOnly.map((s) => ({
          id: String(s.id),
          name: String(s.name),
          price: Number(s.price || 0),
          icon: ICON_BY_ID[String(s.id)] || Key,
        }));

        if (!cancelled) setServices(normalized);
      } catch {
        if (!cancelled) setServices([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const withLang = (path: string) => `${path}?lang=${lang}`;

  const t = isFR
    ? {
        title: "Services",
        subtitle:
          "Duplication de porte-clés compatibles et programmation de télécommandes.",
        book: "Réserver",
        empty: "Aucun service disponible pour le moment.",
      }
    : {
        title: "Services",
        subtitle:
          "Compatible key fob duplication and garage remote programming.",
        book: "Book Now",
        empty: "No services available at the moment.",
      };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-gray-500">
          {isFR ? "Chargement des services..." : "Loading services..."}
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-16 lg:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {t.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {services.length === 0 ? (
          <div className="text-center text-gray-500">{t.empty}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-gray-50 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 lg:p-8 flex flex-col border"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                    <service.icon size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {service.name}
                    </h3>
                    <p className="text-2xl font-bold text-blue-600">
                      ${service.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                <Link
                  href={`${withLang("/book")}&service=${service.id}`}
                  className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-center transition-all flex items-center justify-center gap-2"
                >
                  {t.book} <ArrowRight size={18} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
