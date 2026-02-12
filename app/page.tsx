import Link from "next/link";
import ServicesSection from "@/components/services-section";
import {
  Zap,
  Shield,
  MapPin,
  ArrowRight,
  Truck,
  Store,
  Camera,
  Search,
  CheckCircle2,
  Clock,
} from "lucide-react";

type Lang = "en" | "fr";

function getLang(
  searchParams?: Record<string, string | string[] | undefined>
): Lang {
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
        pickupDeliveryTitle: "Ramassage & livraison",
        pickup: "Ramassage",
        pickupd: "Options de ramassage pratiques.",
        delivery: "Livraison",
        deliveryd: "Livraison disponible à Toronto & GTA.",
        faqTitle: "FAQ",
        q1: "Copiez-vous les porte-clés de tous les immeubles?",
        a1: "Nous dupliquons les porte-clés compatibles. Le client doit être un utilisateur autorisé.",
        q2: "Avez-vous accès au système du condo?",
        a2: "Non. Nous dupliquons uniquement la crédential présentée. Aucun accès aux systèmes/bases de données.",
        q3: "La copie est-elle garantie?",
        a3: "Non. Certains porte-clés sont cryptés ou restreints et ne peuvent pas être copiés.",
        q4: "Offrez-vous des remboursements?",
        a4: "Aucun remboursement n’est offert après une tentative de duplication. Voir Conditions.",
        ctaBottomTitle: "Prêt à commencer?",
        ctaBottomText:
          "Commencez votre commande et téléversez des photos pour vérifier la compatibilité.",
        getStarted: "Commencer",
        jumpServices: "Services",
        jumpPickup: "Ramassage",
        jumpFaq: "FAQ",
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
        pickupDeliveryTitle: "Pickup & Delivery",
        pickup: "Pickup",
        pickupd: "Convenient pickup options.",
        delivery: "Delivery",
        deliveryd: "Delivery available across Toronto & the GTA.",
        faqTitle: "FAQ",
        q1: "Do you copy fobs for any building?",
        a1: "We duplicate compatible key fobs when supported. The client must be an authorized user.",
        q2: "Do you need access to my condo system?",
        a2: "No. We only duplicate the credential presented. No access to building systems/databases.",
        q3: "Is duplication guaranteed?",
        a3: "No. Some credentials are encrypted or restricted and cannot be duplicated.",
        q4: "Do you offer refunds?",
        a4: "No refunds after a duplication attempt has been made. See Terms.",
        ctaBottomTitle: "Ready to start?",
        ctaBottomText:
          "Start your order and upload photos so we can verify compatibility.",
        getStarted: "Get Started",
        jumpServices: "Services",
        jumpPickup: "Pickup",
        jumpFaq: "FAQ",
      };

  const withLang = (path: string) => `${path}?lang=${lang}`;

  const hrefHash = (hash: string) => {
    // mantém lang e só navega para âncora na mesma página
    return `/?lang=${lang}#${hash}`;
  };

  return (
    <div className="flex flex-col bg-white text-slate-900 font-sans tracking-tight">
      {/* Hero */}
      <section className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-32 lg:pb-28 bg-slate-950 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 skew-x-12 translate-x-1/3" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 sm:mb-8 border border-blue-500/30">
              <Zap className="w-3 h-3 fill-current" /> {t.trust1}
            </div>

            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black mb-6 sm:mb-8 leading-[0.95] uppercase italic">
              {t.heroTitle1}
              <br />
              <span className="text-blue-500">{t.heroTitle2}</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-slate-400 mb-7 sm:mb-10 max-w-2xl leading-relaxed">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={withLang("/book")}
                className="bg-white text-black hover:bg-blue-500 hover:text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 uppercase tracking-tighter"
              >
                {t.ctaStart} <ArrowRight size={22} />
              </Link>

              <Link
                href={withLang("/compatibility")}
                className="bg-transparent border-2 border-slate-800 hover:border-blue-500 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
              >
                <Search size={20} /> {t.ctaCompat}
              </Link>
            </div>

            {/* Jump Pills (mobile-first) */}
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-2">
              {[
                { label: t.jumpServices, hash: "services" },
                { label: t.jumpPickup, hash: "pickup" },
                { label: t.jumpFaq, hash: "faq" },
              ].map((x) => (
                <Link
                  key={x.hash}
                  href={hrefHash(x.hash)}
                  className="bg-slate-900/60 hover:bg-slate-900 text-slate-200 border border-slate-800 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all"
                >
                  {x.label}
                </Link>
              ))}
            </div>

            <p className="text-slate-500 text-xs mt-6 sm:mt-8 font-bold uppercase tracking-widest">
              {t.disclaimer}
            </p>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-7 sm:py-10 bg-slate-900 border-y border-slate-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: Clock, title: t.trust1, desc: t.trust1d },
              { icon: Shield, title: t.trust2, desc: t.trust2d },
              { icon: MapPin, title: t.trust3, desc: t.trust3d },
            ].map((prop, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 shrink-0">
                  <prop.icon size={24} />
                </div>
                <div>
                  <h3 className="font-black uppercase text-sm tracking-widest">
                    {prop.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold">{prop.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-9 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">
              {t.howTitle}
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { title: t.step1, desc: t.step1d, icon: ArrowRight },
              { title: t.step2, desc: t.step2d, icon: Camera },
              { title: t.step3, desc: t.step3d, icon: Search },
              { title: t.step4, desc: t.step4d, icon: CheckCircle2 },
            ].map((s, idx) => (
              <div
                key={idx}
                className="group relative bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 md:p-8 hover:border-blue-500 transition-all hover:shadow-2xl hover:shadow-blue-100"
              >
                <div className="text-5xl font-black text-slate-200 mb-5 md:mb-6 group-hover:text-blue-100 transition-colors">
                  0{idx + 1}
                </div>
                <div className="mb-4 text-blue-600">
                  <s.icon size={32} />
                </div>
                <h3 className="text-lg md:text-xl font-black uppercase mb-3 leading-tight">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <div id="services" className="bg-slate-50 py-7 md:py-12 scroll-mt-24">
        <ServicesSection lang={lang} />
      </div>

      {/* Pickup & Delivery */}
      <section id="pickup" className="py-12 md:py-24 bg-white scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-slate-950 text-white rounded-[2rem] md:rounded-[2.5rem] p-7 md:p-10 flex flex-col justify-between overflow-hidden relative group transition-transform hover:scale-[1.02]">
              <Store className="absolute -right-8 -bottom-8 w-36 h-36 md:w-40 md:h-40 text-white/5 group-hover:text-blue-500/10 transition-colors" />
              <div className="relative z-10">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-5 md:mb-6">
                  <Store size={26} />
                </div>
                <h3 className="text-2xl md:text-3xl font-black uppercase mb-3 md:mb-4 italic">
                  {t.pickup}
                </h3>
                <p className="text-slate-400 text-base md:text-lg font-medium">
                  {t.pickupd}
                </p>
              </div>
            </div>

            <div className="bg-blue-600 text-white rounded-[2rem] md:rounded-[2.5rem] p-7 md:p-10 flex flex-col justify-between overflow-hidden relative group transition-transform hover:scale-[1.02]">
              <Truck className="absolute -right-8 -bottom-8 w-36 h-36 md:w-40 md:h-40 text-black/5 group-hover:text-white/10 transition-colors" />
              <div className="relative z-10">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white text-blue-600 flex items-center justify-center mb-5 md:mb-6">
                  <Truck size={26} />
                </div>
                <h3 className="text-2xl md:text-3xl font-black uppercase mb-3 md:mb-4 italic">
                  {t.delivery}
                </h3>
                <p className="text-blue-100 text-base md:text-lg font-medium">
                  {t.deliveryd}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12 md:py-24 bg-slate-50 scroll-mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-black uppercase italic mb-9 md:mb-12 text-center">
            {t.faqTitle}
          </h2>
          <div className="space-y-4">
            {[
              { q: t.q1, a: t.a1 },
              { q: t.q2, a: t.a2 },
              { q: t.q3, a: t.a3 },
              { q: t.q4, a: t.a4 },
            ].map((item) => (
              <div
                key={item.q}
                className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm"
              >
                <h3 className="text-base md:text-lg font-black uppercase mb-3 text-blue-600">
                  {item.q}
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14 md:py-24 bg-slate-950 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <h2 className="text-4xl md:text-7xl font-black uppercase italic mb-7 md:mb-8 tracking-tighter">
            {t.ctaBottomTitle}
          </h2>
          <p className="text-lg md:text-xl text-slate-400 mb-9 md:mb-12 font-medium">
            {t.ctaBottomText}
          </p>
          <Link
            href={withLang("/book")}
            className="inline-flex items-center gap-4 bg-blue-600 text-white hover:bg-white hover:text-black px-10 md:px-12 py-5 md:py-6 rounded-2xl font-black text-xl md:text-2xl transition-all shadow-2xl shadow-blue-900/40 uppercase tracking-tighter"
          >
            {t.getStarted} <ArrowRight size={26} />
          </Link>
        </div>
      </section>
    </div>
  );
}