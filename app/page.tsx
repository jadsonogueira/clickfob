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
        heroTitle2: "Rapide & Professionnel",
        heroSubtitle:
          "Commandez en ligne en quelques minutes. Téléversez des photos, confirmez les détails, puis choisissez ramassage ou livraison.",
        ctaStart: "Commencer ma commande",
        ctaCompat: "Vérifier la compatibilité",
        disclaimer:
          "Le client doit être autorisé. Service soumis à la compatibilité technique.",
        trust1: "Service rapide",
        trust1d: "Selon disponibilité",
        trust2: "Compatibilité d'abord",
        trust2d: "Systèmes compatibles uniquement",
        trust3: "Toronto & GTA",
        trust3d: "Zone de service",
        howTitle: "Comment ça fonctionne",
        step1: "Passez commande",
        step1d: "Choisissez le service et vos informations.",
        step2: "Photos nettes",
        step2d: "Recto/verso du porte-clés pour analyse.",
        step3: "Vérification",
        step3d: "Nous confirmons avant de procéder.",
        step4: "Récupération",
        step4d: "Ramassage ou livraison à domicile.",
        pickup: "Ramassage",
        pickupd: "Options de ramassage pratiques à Toronto.",
        delivery: "Livraison",
        deliveryd: "Livraison rapide dans toute la zone GTA.",
        faqTitle: "FAQ",
        q1: "Copiez-vous les porte-clés de tous les immeubles?",
        a1: "Nous dupliquons les porte-clés compatibles. Le client doit être un utilisateur autorisé.",
        q2: "Avez-vous accès au système du condo?",
        a2: "Non. Nous dupliquons uniquement la crédential physique présentée.",
        q3: "La copie est-elle garantie?",
        a3: "Non. Certains porte-clés cryptés ne peuvent pas être copiés.",
        q4: "Offrez-vous des remboursements?",
        a4: "Aucun remboursement après une tentative de duplication. Voir Conditions.",
        ctaBottomTitle: "Prêt à commencer?",
        ctaBottomText:
          "Téléversez vos photos pour vérifier la compatibilité instantanément.",
        getStarted: "Commencer",
        jumpServices: "Services",
        jumpPickup: "Ramassage",
        jumpFaq: "FAQ",
      }
    : {
        heroTitle1: "Key Fob Copy in Toronto",
        heroTitle2: "Fast & Professional",
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
        step1: "Place order",
        step1d: "Choose service, quantity, and details.",
        step2: "Upload photos",
        step2d: "Clear front/back photos of the fob.",
        step3: "Verification",
        step3d: "We confirm compatibility before starting.",
        step4: "Get your fob",
        step4d: "Choose pickup or door-to-door delivery.",
        pickup: "Pickup",
        pickupd: "Convenient pickup options in Toronto.",
        delivery: "Delivery",
        deliveryd: "Fast delivery available across the GTA.",
        faqTitle: "Common Questions",
        q1: "Do you copy fobs for any building?",
        a1: "We duplicate compatible key fobs. The client must be an authorized user.",
        q2: "Do you need access to my condo system?",
        a2: "No. We only duplicate the physical credential presented.",
        q3: "Is duplication guaranteed?",
        a3: "No. Some credentials are encrypted and cannot be duplicated.",
        q4: "Do you offer refunds?",
        a4: "No refunds after a duplication attempt is made. See Terms.",
        ctaBottomTitle: "Ready to start?",
        ctaBottomText:
          "Start your order and upload photos for instant verification.",
        getStarted: "Get Started",
        jumpServices: "Services",
        jumpPickup: "Pickup",
        jumpFaq: "FAQ",
      };

  const withLang = (path: string) => `${path}?lang=${lang}`;
  const hrefHash = (hash: string) => `/?lang=${lang}#${hash}`;

  return (
    <div className="flex flex-col bg-white text-slate-900 font-sans selection:bg-blue-100">
      {/* Hero Section Refined */}
      <section className="relative pt-20 pb-16 lg:pt-36 lg:pb-32 bg-slate-950 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_120%,#2563eb33,transparent_50%)]" />
        <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md text-blue-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-8 border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              {t.trust1}
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-[0.9] tracking-tighter uppercase italic">
              {t.heroTitle1}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                {t.heroTitle2}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-xl leading-relaxed font-medium">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href={withLang("/book")}
                className="group bg-blue-600 hover:bg-blue-500 text-white px-8 py-5 rounded-2xl font-bold text-lg transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 uppercase tracking-tight"
              >
                {t.ctaStart} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href={withLang("/compatibility")}
                className="bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-white px-8 py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 uppercase tracking-tight"
              >
                <Search size={20} /> {t.ctaCompat}
              </Link>
            </div>

            {/* Jump Pills - Glassmorphism */}
            <div className="flex flex-wrap gap-3">
              {[
                { label: t.jumpServices, hash: "services" },
                { label: t.jumpPickup, hash: "pickup" },
                { label: t.jumpFaq, hash: "faq" },
              ].map((x) => (
                <Link
                  key={x.hash}
                  href={hrefHash(x.hash)}
                  className="bg-white/5 hover:bg-white/20 text-slate-300 border border-white/5 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                >
                  {x.label}
                </Link>
              ))}
            </div>

            <p className="text-slate-600 text-[10px] mt-10 font-bold uppercase tracking-[0.2em] max-w-md">
              {t.disclaimer}
            </p>
          </div>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Clock, title: t.trust1, desc: t.trust1d },
              { icon: Shield, title: t.trust2, desc: t.trust2d },
              { icon: MapPin, title: t.trust3, desc: t.trust3d },
            ].map((prop, idx) => (
              <div key={idx} className="flex flex-col items-center text-center md:items-start md:text-left gap-4 group">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <prop.icon size={28} />
                </div>
                <div>
                  <h3 className="font-extrabold uppercase text-sm tracking-widest text-slate-900 mb-1">
                    {prop.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">{prop.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Modern Step Cards */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter uppercase mb-4 italic">
              {t.howTitle}
            </h2>
            <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: t.step1, desc: t.step1d, icon: ArrowRight },
              { title: t.step2, desc: t.step2d, icon: Camera },
              { title: t.step3, desc: t.step3d, icon: Search },
              { title: t.step4, desc: t.step4d, icon: CheckCircle2 },
            ].map((s, idx) => (
              <div
                key={idx}
                className="relative bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="absolute top-8 right-8 text-4xl font-black text-slate-100 group-hover:text-blue-50 transition-colors">
                  0{idx + 1}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-slate-50 text-blue-600 flex items-center justify-center mb-8">
                  <s.icon size={28} />
                </div>
                <h3 className="text-xl font-extrabold uppercase mb-4 tracking-tight">
                  {s.title}
                </h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Wrapper */}
      <div id="services" className="scroll-mt-24">
        <ServicesSection lang={lang} />
      </div>

      {/* Pickup & Delivery - Bento Style */}
      <section id="pickup" className="py-24 bg-white scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="group relative bg-slate-900 text-white rounded-[3rem] p-10 md:p-16 overflow-hidden transition-transform duration-500 hover:scale-[1.01]">
              <div className="relative z-10">
                <div className="inline-flex p-4 rounded-2xl bg-blue-600 mb-8">
                  <Store size={32} />
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold uppercase mb-6 tracking-tighter italic">
                  {t.pickup}
                </h3>
                <p className="text-slate-400 text-lg leading-relaxed max-w-sm mb-8 font-medium">
                  {t.pickupd}
                </p>
                <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-widest text-xs">
                  <MapPin size={16} /> Toronto Central
                </div>
              </div>
              <Store className="absolute -right-12 -bottom-12 w-64 h-64 text-white/5 group-hover:text-blue-500/10 group-hover:rotate-12 transition-all duration-700" />
            </div>

            <div className="group relative bg-blue-600 text-white rounded-[3rem] p-10 md:p-16 overflow-hidden shadow-[0_30px_60px_-15px_rgba(37,99,235,0.4)] transition-transform duration-500 hover:scale-[1.01]">
              <div className="relative z-10">
                <div className="inline-flex p-4 rounded-2xl bg-white text-blue-600 mb-8">
                  <Truck size={32} />
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold uppercase mb-6 tracking-tighter italic">
                  {t.delivery}
                </h3>
                <p className="text-blue-50 text-lg leading-relaxed max-w-sm mb-8 font-medium">
                  {t.deliveryd}
                </p>
                <div className="flex items-center gap-2 text-white/80 font-bold uppercase tracking-widest text-xs">
                  <Clock size={16} /> GTA Wide Coverage
                </div>
              </div>
              <Truck className="absolute -right-12 -bottom-12 w-64 h-64 text-black/5 group-hover:text-white/10 group-hover:-translate-x-8 transition-all duration-700" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-slate-50 scroll-mt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tighter mb-4 italic">
              {t.faqTitle}
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { q: t.q1, a: t.a1 },
              { q: t.q2, a: t.a2 },
              { q: t.q3, a: t.a3 },
              { q: t.q4, a: t.a4 },
            ].map((item, i) => (
              <div
                key={i}
                className="group bg-white rounded-3xl border border-slate-200 p-8 hover:border-blue-400 transition-all duration-300"
              >
                <h3 className="text-lg font-extrabold uppercase mb-3 text-blue-600 tracking-tight group-hover:translate-x-1 transition-transform">
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

      {/* Final Call to Action - Large Floating Card */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-slate-950 rounded-[4rem] p-12 md:p-24 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#2563eb44,transparent_40%)]" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-7xl font-extrabold text-white uppercase tracking-tighter mb-8 italic">
                {t.ctaBottomTitle}
              </h2>
              <p className="text-xl text-slate-400 mb-12 font-medium">
                {t.ctaBottomText}
              </p>
              <Link
                href={withLang("/book")}
                className="inline-flex items-center gap-4 bg-white text-slate-950 hover:bg-blue-600 hover:text-white px-12 py-6 rounded-2xl font-extrabold text-xl transition-all shadow-2xl hover:scale-105 active:scale-95 uppercase tracking-tight"
              >
                {t.getStarted} <ArrowRight size={24} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
