import Link from "next/link";
import { CheckCircle2, Search, HelpCircle, ShieldCheck, Camera, AlertCircle, Check } from "lucide-react";

type Lang = "en" | "fr";

const CATEGORIES = [
  {
    id: "compatible",
    title_en: "100% Compatible (Instant Copy)",
    title_fr: "100% Compatible (Copie Instantanée)",
    fobs: [
      { name: "HID Prox", img: "/fobs/hid-prox.png", brand: "HID", freq: "125kHz" },
      { name: "ioProx", img: "/fobs/ioprox.png", brand: "Kantech", freq: "125kHz" },
      { name: "Keyscan", img: "/fobs/keyscan.png", brand: "Keyscan", freq: "125kHz" },
      { name: "Indala", img: "/fobs/indala.png", brand: "HID", freq: "125kHz" },
      { name: "AWID", img: "/fobs/awid.png", brand: "AWID", freq: "125kHz" },
      { name: "Mira/Mircom", img: "/fobs/mira.png", brand: "Mircom", freq: "125kHz" },
      { name: "Paradox", img: "/fobs/paradox.png", brand: "Paradox", freq: "125kHz" },
      { name: "Pyramid", img: "/fobs/pyramid.png", brand: "Farpointe", freq: "125kHz" },
    ]
  },
  {
    id: "special",
    title_en: "High Security (Verification Needed)",
    title_fr: "Haute Sécurité (Vérification Requise)",
    fobs: [
      { name: "iClass", img: "/fobs/iclass.png", brand: "HID", freq: "13.56MHz" },
      { name: "Mifare", img: "/fobs/mifare.png", brand: "NXP", freq: "13.56MHz" },
      { name: "Salto", img: "/fobs/salto.png", brand: "Salto", freq: "13.56MHz" },
      { name: "Desfire", img: "/fobs/desfire.png", brand: "NXP", freq: "13.56MHz" },
    ]
  }
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
    title: "Vérificateur de Compatibilité",
    subtitle: "La solution la plus rapide au Canada pour dupliquer vos accès.",
    visualTitle: "Identifiez votre modèle",
    compatibleLabel: "Copiable",
    checkLabel: "À vérifier",
    cta: "Commander ma copie",
    notSure: "Pas certain du modèle ?",
    photoCta: "Envoyez une photo",
    back: "Retour",
    guarantee: "Analyse gratuite avant paiement"
  } : {
    title: "Compatibility Checker",
    subtitle: "Canada's fastest way to identify and duplicate your key fob.",
    visualTitle: "Identify your key fob",
    compatibleLabel: "Copyable",
    checkLabel: "Verification Needed",
    cta: "Start My Order",
    notSure: "Not sure which one you have?",
    photoCta: "Upload a Photo",
    back: "Back",
    guarantee: "Free photo review before you pay"
  };

  const withLang = (path: string) => `${path}?lang=${lang}`;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 font-sans bg-white text-slate-900">
      {/* Voltar */}
      <div className="mb-8">
        <Link href={withLang("/")} className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors group">
          <span className="mr-2 transition-transform group-hover:-translate-x-1">←</span> {t.back}
        </Link>
      </div>

      {/* Header Estilo App */}
      <header className="mb-16 border-b pb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 uppercase">{t.title}</h1>
        <p className="text-xl text-slate-500 max-w-3xl leading-relaxed">
          {t.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" /> {t.guarantee}
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold border border-blue-100">
            <ShieldCheck className="w-4 h-4" /> {isFR ? "Service Sécurisé" : "Secure Service"}
          </div>
        </div>
      </header>

      {/* Seções de Fobs */}
      <div className="space-y-20">
        {CATEGORIES.map((cat) => (
          <section key={cat.id}>
            <div className="flex items-center gap-3 mb-8">
              <div className={`p-2 rounded-lg ${cat.id === 'compatible' ? 'bg-emerald-500' : 'bg-amber-500'} text-white`}>
                {cat.id === 'compatible' ? <Check className="w-6 h-6 stroke-[3]" /> : <Search className="w-6 h-6" />}
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight">
                {isFR ? cat.title_fr : cat.title_en}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {cat.fobs.map((fob) => (
                <div key={fob.name} className="group relative bg-white border-2 border-slate-100 rounded-3xl p-6 transition-all hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 flex flex-col items-center text-center">
                  <div className="aspect-square w-full mb-6 flex items-center justify-center relative bg-slate-50 rounded-2xl overflow-hidden">
                    <img 
                      src={fob.img} 
                      alt={fob.name} 
                      className="max-h-[80%] max-w-[80%] object-contain transition-transform group-hover:scale-110 duration-500"
                    />
                    {/* Badge de Frequência */}
                    <span className="absolute bottom-2 right-2 text-[9px] font-black bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md text-slate-400 border border-slate-100 uppercase tracking-tighter">
                      {fob.freq}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{fob.brand}</p>
                    <h3 className="text-lg font-black text-slate-800">{fob.name}</h3>
                  </div>

                  <div className={`mt-4 w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    cat.id === 'compatible' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {cat.id === 'compatible' ? t.compatibleLabel : t.checkLabel}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Banner de Verificação Humana (Conceito de Checagem) */}
      <section className="mt-24 bg-slate-950 rounded-[2.5rem] p-8 md:p-16 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/10 skew-x-12 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <Camera className="w-4 h-4" /> Expert Review
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
              {t.notSure.toUpperCase()}
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              {isFR 
                ? "Prenez une photo du recto et du verso. Nos experts confirmeront la compatibilité en moins de 15 minutes."
                : "Snap a photo of the front and back. Our experts will confirm compatibility within 15 minutes."}
            </p>
          </div>
          
          <div className="flex flex-col gap-4 w-full md:w-auto min-w-[240px]">
            <Link
              href={withLang("/book")}
              className="bg-white text-black px-10 py-5 rounded-2xl font-black text-lg text-center hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-95"
            >
              {t.photoCta}
            </Link>
            <p className="text-center text-slate-500 text-xs font-bold">
              {isFR ? "Service gratuit 7j/7" : "Free service 7 days a week"}
            </p>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs">
        <p>© {new Date().getFullYear()} ClickFob Canada - Fast & Secure Duplication.</p>
        <div className="flex gap-6 italic">
          <span>* All logos are property of their respective owners.</span>
        </div>
      </footer>
    </main>
  );
}
