import Link from "next/link";
import { CheckCircle2, AlertCircle, Search, ShieldCheck, CreditCard, Info } from "lucide-react";

type Lang = "en" | "fr";

const CANADIAN_FOBS = [
  { 
    id: 'hid-prox', 
    name: 'HID Prox', 
    desc_en: 'Most common grey teardrop fob.', 
    desc_fr: 'Porte-clé gris classique en forme de goutte.',
    status: 'supported', 
    img: '/fobs/hid-prox.png' 
  },
  { 
    id: 'kantech', 
    name: 'Kantech ioProx', 
    desc_en: 'Common in Montreal & Toronto condos.', 
    desc_fr: 'Fréquent dans les condos de MTL et Toronto.',
    status: 'supported', 
    img: '/fobs/kantech.png' 
  },
  { 
    id: 'keyscan', 
    name: 'Keyscan', 
    desc_en: 'Black textured fob with logo.', 
    desc_fr: 'Porte-clé noir texturé avec logo.',
    status: 'supported', 
    img: '/fobs/keyscan.png' 
  },
  { 
    id: 'mircom', 
    name: 'Mircom', 
    desc_en: 'Standard residential fob.', 
    desc_fr: 'Porte-clé résidentiel standard.',
    status: 'supported', 
    img: '/fobs/mircom.png' 
  },
  { 
    id: 'awid', 
    name: 'AWID', 
    desc_en: 'Flat grey or black fob.', 
    desc_fr: 'Porte-clé plat gris ou noir.',
    status: 'supported', 
    img: '/fobs/awid.png' 
  },
  { 
    id: 'iclass', 
    name: 'HID iClass', 
    desc_en: 'High security (Flat or clamshell).', 
    desc_fr: 'Haute sécurité (Plat ou rigide).',
    status: 'check', 
    img: '/fobs/iclass.png' 
  },
];

function getLang(searchParams?: Record<string, string | string[] | undefined>): Lang {
  const raw = searchParams?.lang;
  const val = Array.isArray(raw) ? raw[0] : raw;
  return (val || "en").toLowerCase() === "fr" ? "fr" : "en";
}

export default function CompatibilityPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const lang = getLang(searchParams);
  const isFR = lang === "fr";

  const t = isFR ? {
    title: "Compatibilité",
    subtitle: "Tous les porte-clés ne peuvent pas être copiés.",
    visualTitle: "Identifiez votre modèle",
    visualSub: "Modèles les plus courants au Canada",
    supported: "Supporté",
    check: "Vérification requise",
    usually: "Généralement compatibles",
    mayNot: "Haute Sécurité / Cryptés",
    why: "Pourquoi la compatibilité est importante",
    whyText: "Même si deux porte-clés se ressemblent, leur technologie interne peut différer. Nous vérifions vos photos avant de procéder.",
    cta: "Commencer ma commande",
    back: "Retour à l'accueil",
    riskFree: "Sans Risque",
    riskText: "Analyse photo gratuite avant tout paiement."
  } : {
    title: "Compatibility",
    subtitle: "Not all key fobs can be duplicated.",
    visualTitle: "Identify your model",
    visualSub: "Most common models in Canada",
    supported: "Supported",
    check: "Verification required",
    usually: "Usually Compatible",
    mayNot: "High Security / Encrypted",
    why: "Why compatibility matters",
    whyText: "Even if two key fobs look identical, their internal technology may be different. We verify your photos before processing.",
    cta: "Start My Order",
    back: "Back to Home",
    riskFree: "Risk-Free",
    riskText: "Free photo analysis before any payment is processed."
  };

  const withLang = (path: string) => `${path}?lang=${lang}`;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 font-sans bg-white text-slate-900">
      {/* Botão Voltar */}
      <div className="mb-10">
        <Link href={withLang("/")} className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors group">
          <span className="mr-2 transition-transform group-hover:-translate-x-1">←</span> {t.back}
        </Link>
      </div>

      {/* Hero Section */}
      <header className="mb-16 border-b pb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{t.title}</h1>
        <p className="text-xl text-slate-600 max-w-3xl leading-relaxed font-medium">
          {t.subtitle} {isFR ? "Nous supportons la majorité des systèmes au Canada." : "We support the vast majority of systems used across Canada."}
        </p>
      </header>

      {/* Grid Visual de Fobs */}
      <section className="mb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Search className="w-6 h-6 text-blue-500" /> {t.visualTitle}
            </h2>
            <p className="text-slate-500">{t.visualSub}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {CANADIAN_FOBS.map((fob) => (
            <div key={fob.id} className="group bg-slate-50 border rounded-2xl p-4 hover:bg-white hover:shadow-xl hover:border-blue-200 transition-all flex flex-col items-center text-center">
              <div className="relative w-24 h-28 mb-4 flex items-center justify-center">
                {/* Placeholder para Imagem Real */}
                <div className="absolute inset-0 bg-slate-200 rounded-xl animate-pulse group-hover:hidden" />
                <img 
                  src={fob.img} 
                  alt={fob.name}
                  className="relative z-10 w-full h-full object-contain mix-blend-multiply transition-transform group-hover:scale-110"
                  onError={(e) => { (e.target as any).style.display = 'none' }} 
                />
                <Info className="absolute bottom-0 right-0 w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <h3 className="font-bold text-sm mb-1">{fob.name}</h3>
              <p className="text-[11px] text-slate-500 leading-tight mb-3 flex-grow">
                {isFR ? fob.desc_fr : fob.desc_en}
              </p>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                fob.status === 'supported' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {fob.status === 'supported' ? t.supported : t.check}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Seção Técnica Estilizada */}
      <div className="grid md:grid-cols-2 gap-8 mb-20">
        <section className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-200">
              <CheckCircle2 className="text-white w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">{t.usually}</h2>
          </div>
          <ul className="space-y-4">
            {["HID Prox (125kHz)", "Kantech ioProx", "Keyscan & AWID", "Indala (Black/Grey)", "Paradox & ICT"].map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-700 font-semibold">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-slate-50 border border-slate-200 rounded-3xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-slate-700 p-3 rounded-2xl shadow-lg shadow-slate-200">
              <AlertCircle className="text-white w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">{t.mayNot}</h2>
          </div>
          <ul className="space-y-4">
            {["HID iClass SE / SEOS", "Mifare DESFire (Encrypted)", "Salto (Some models)", "Corporate Badge Systems"].map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-500 font-medium italic">
                <div className="w-2 h-2 rounded-full bg-slate-300" /> {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Footer / CTA Section */}
      <section className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-10">
            <ShieldCheck className="w-64 h-64 -mr-20 -mt-20" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
              <ShieldCheck className="w-4 h-4" /> {t.riskFree}
            </div>
            <h2 className="text-3xl font-bold mb-4">{t.why}</h2>
            <p className="text-slate-400 text-lg mb-0">{t.whyText} {t.riskText}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <Link
              href={withLang("/book")}
              className="group inline-flex justify-center items-center bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-900/20 active:scale-95"
            >
              {t.cta}
              <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer Pequeno */}
      <p className="mt-10 text-center text-slate-400 text-xs px-6">
        {isFR 
          ? "Nous ne sommes pas affiliés aux marques mentionnées. Les noms et logos sont utilisés uniquement à des fins d’identification de compatibilité."
          : "We are not affiliated with the brands mentioned. Names and logos are used for compatibility identification purposes only."}
      </p>
    </main>
  );
}
