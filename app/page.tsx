import Link from "next/link";
import {
  Zap,
  Shield,
  MapPin,
  ArrowRight,
  Key,
  Radio,
  Settings,
  Truck,
  Store,
  AlertCircle,
} from "lucide-react";

type Lang = "en" | "fr";

function getLang(searchParams?: Record<string, string | string[] | undefined>): Lang {
  const raw = searchParams?.lang;
  const val = Array.isArray(raw) ? raw[0] : raw;
  return (val || "en").toLowerCase() === "fr" ? "fr" : "en";
}

export default function HomePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const lang = getLang(searchParams);
  const isFR = lang === "fr";

  const t = isFR
    ? {
        heroTitle1: "Copie de porte-clés (Fob) à Toronto",
        heroTitle2: "Rapide, pratique — pour porte-clés compatibles",
        heroSubtitle:
          "Commandez en ligne en quelques minutes. Téléversez des photos, confirmez les détails, puis choisissez ramassage ou livraison.",
        ctaStart: "Commencer ma commande",
        ctaCompat: "Vérifier la compatibilité",
        disclaimer:
          "Le client doit être autorisé. Service soumis à la compatibilité technique.",
        trust1: "Service rapide",
        trust1d: "Selon disponibilité",
        trust2: "Compatibilité d’abord",
        trust2d: "Systèmes compatibles uniquement",
        trust3: "Toronto & GTA",
        trust3d: "Zone de service",
        howTitle: "Comment ça fonctionne",
        step1: "Passez votre commande",
        step1d: "Choisissez le service, la quantité et vos infos.",
        step2: "Téléversez des photos",
        step2d: "Recto/verso du porte-clés (photos nettes).",
        step3: "Vérification de compatibilité",
        step3d: "Nous confirmons la compatibilité avant de procéder.",
        step4: "Ramassage ou livraison",
        step4d: "Choisissez l’option qui vous convient.",
        servicesTitle: "Services",
        servicesSubtitle:
          "Duplication de porte-clés compatibles et programmation de télécommandes de garage.",
        book: "Réserver",
        unavailable: "Indisponible",
        pickupDeliveryTitle: "Ramassage & livraison",
        pickup: "Ramassage",
        pickupd: "Options de ramassage pratiques.",
        delivery: "Livraison",
        deliveryd: "Livraison disponible à Toronto & GTA.",
        faqTitle: "FAQ",
        q1: "Copiez-vous les porte-clés de tous les immeubles?",
        a1:
          "Nous dupliquons les porte-clés compatibles. Le client doit être un utilisateur autorisé.",
        q2: "Avez-vous accès au système du condo?",
        a2:
          "Non. Nous dupliquons uniquement la crédential présentée. Aucun accès aux systèmes/bases de données.",
        q3: "La copie est-elle garantie?",
        a3:
          "Non. Certains porte-clés sont cryptés ou restreints et ne peuvent pas être copiés.",
        q4: "Offrez-vous des remboursements?",
        a4:
          "Aucun remboursement n’est offert après une tentative de duplication. Voir Conditions.",
        ctaBottomTitle: "Prêt à commencer?",
        ctaBottomText:
          "Commencez votre commande et téléversez des photos pour vérifier la compatibilité.",
        getStarted: "Commencer",
      }
    : {
        heroTitle1: "Key Fob Copy in Toronto",
        heroTitle2: "Fast, convenient — for compatible key fobs",
        heroSubtitle:
          "Order online in minutes. Upload photos, confirm details, then choose pickup or delivery.",
        ctaStart: "Start My Order",
        ctaCompat: "Check Compatibility",
        disclaimer:
          "Client authorization required. Duplication subject to technical compatibility.",
        trust1: "Fast service",
        trust1d: "Based on availability",
        trust2: "Compatibility first",
        trust2d: "Compatible systems only",
        trust3: "Toronto & GTA",
        trust3d: "Service area",
        howTitle: "How it works",
        step1: "Place your order",
        step1d: "Choose service, quantity, and your details.",
        step2: "Upload clear photos",
        step2d: "Front and back of the fob (clear photos).",
        step3: "Compatibility check",
        step3d: "We confirm compatibility before proceeding.",
        step4: "Pickup or delivery",
        step4d: "Choose what works best for you.",
        servicesTitle: "Services",
        servicesSubtitle:
          "Compatible key fob duplication and garage remote programming.",
        book: "Book Now",
        unavailable: "Unavailable",
        pickupDeliveryTitle: "Pickup & Delivery",
        pickup: "Pickup",
        pickupd: "Convenient pickup options.",
        delivery: "Delivery",
        deliveryd: "Delivery available across Toronto & the GTA.",
        faqTitle: "FAQ",
        q1: "Do you copy fobs for any building?",
        a1:
          "We duplicate compatible key fobs when supported. The client must be an authorized user.",
        q2: "Do you need access to my condo system?",
        a2:
          "No. We only duplicate the credential presented. No access to building systems/databases.",
        q3: "Is duplication guaranteed?",
        a3:
          "No. Some credentials are encrypted or restricted and cannot be duplicated.",
        q4: "Do you offer refunds?",
        a4: "No refunds after a duplication attempt has been made. See Terms.",
        ctaBottomTitle: "Ready to start?",
        ctaBottomText:
          "Start your order and upload photos so we can verify compatibility.",
        getStarted: "Get Started",
      };

  const withLang = (path: string) => `${path}?lang=${lang}`;

  const trust = [
    { icon: Zap, title: t.trust1, desc: t.trust1d },
    { icon: Shield, title: t.trust2, desc: t.trust2d },
    { icon: MapPin, title: t.trust3, desc: t.trust3d },
  ];

  const steps = [
    { title: t.step1, desc: t.step1d },
    { title: t.step2, desc: t.step2d },
    { title: t.step3, desc: t.step3d },
    { title: t.step4, desc: t.step4d },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t.heroTitle1}
              <br />
              <span className="text-blue-300">{t.heroTitle2}</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8">{t.heroSubtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={withLang("/book")}
                className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
              >
                {t.ctaStart} <ArrowRight size={20} />
              </Link>
              <Link
                href={withLang("/compatibility")}
                className="bg-blue-600/30 hover:bg-blue-600/40 border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
              >
                {t.ctaCompat}
              </Link>
            </div>
            <p className="text-blue-100/80 text-sm mt-4">{t.disclaimer}</p>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {trust.map((prop, idx) => (
              <div key={idx} className="text-center p-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 mb-3">
                  <prop.icon size={28} />
                </div>
                <h3 className="font-bold text-gray-900">{prop.title}</h3>
                <p className="text-sm text-gray-500">{prop.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50 border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              {t.howTitle}
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="text-blue-600 font-bold text-sm mb-2">{idx + 1}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services (client component) */}
      <ServicesSection lang={lang} />

      {/* Pickup & Delivery */}
      <section className="py-16 bg-gray-50 border-t border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              {t.pickupDeliveryTitle}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-2 text-blue-600">
                <Store size={22} />
                <h3 className="font-semibold text-gray-900">{t.pickup}</h3>
              </div>
              <p className="text-gray-600">{t.pickupd}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-2 text-blue-600">
                <Truck size={22} />
                <h3 className="font-semibold text-gray-900">{t.delivery}</h3>
              </div>
              <p className="text-gray-600">{t.deliveryd}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{t.faqTitle}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { q: t.q1, a: t.a1 },
              { q: t.q2, a: t.a2 },
              { q: t.q3, a: t.a3 },
              { q: t.q4, a: t.a4 },
            ].map((item) => (
              <div key={item.q} className="bg-gray-50 rounded-2xl border p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-700">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t.ctaBottomTitle}</h2>
          <p className="text-xl text-blue-100 mb-8">{t.ctaBottomText}</p>
          <Link
            href={withLang("/book")}
            className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
          >
            {t.getStarted} <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ---------------------- */
/* CLIENT SERVICES SECTION */
/* ---------------------- */

"use client";

import { useEffect, useMemo, useState } from "react";

type ServiceApiItem = {
  id: string; // serviceId
  name: string;
  price: number;
  active?: boolean;
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

function ServicesSection({ lang }: { lang: "en" | "fr" }) {
  const isFR = lang === "fr";

  const t = isFR
    ? {
        servicesTitle: "Services",
        servicesSubtitle:
          "Duplication de porte-clés compatibles et programmation de télécommandes de garage.",
        book: "Réserver",
        unavailable: "Indisponible",
        failed: "Impossible de charger les services.",
      }
    : {
        servicesTitle: "Services",
        servicesSubtitle:
          "Compatible key fob duplication and garage remote programming.",
        book: "Book Now",
        unavailable: "Unavailable",
        failed: "Failed to load services.",
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
    // cria map da API
    const m = new Map<string, ServiceApiItem>();
    for (const s of api) m.set(String(s.id), s);

    // monta lista baseada no LOCAL (mantém desc/ícone)
    return LOCAL.map((lc) => {
      const a = m.get(lc.id);
      const active = a ? a.active !== false : true;
      const price = a ? Number(a.price || 0) : 0;

      return {
        id: lc.id,
        icon: lc.icon,
        name: (isFR ? lc.fr.name : lc.en.name),
        desc: (isFR ? lc.fr.desc : lc.en.desc),
        active,
        price,
      };
    });
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
                  <div className={`p-3 rounded-xl ${disabled ? "bg-gray-200 text-gray-500" : "bg-blue-100 text-blue-600"}`}>
                    <Icon size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{service.name}</h3>
                    <p className={`text-2xl font-bold ${disabled ? "text-gray-600" : "text-blue-600"}`}>
                      {loading ? "—" : `$${Number(service.price).toFixed(2)}`}
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
