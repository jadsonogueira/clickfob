import Link from "next/link";
import { CheckCircle2, AlertCircle, Search, ShieldCheck } from "lucide-react";

type Lang = "en" | "fr";

// Mock data para os fobs canadenses
const CANADIAN_FOBS = [
  { id: 'hid-prox', name: 'HID Prox', tech: '125kHz', status: 'supported', img: '/fobs/hid-prox.png' },
  { id: 'kantech', name: 'Kantech ioProx', tech: '125kHz', status: 'supported', img: '/fobs/kantech.png' },
  { id: 'keyscan', name: 'Keyscan', tech: '125kHz', status: 'supported', img: '/fobs/keyscan.png' },
  { id: 'iclass', name: 'HID iClass', tech: '13.56MHz', status: 'special', img: '/fobs/iclass.png' },
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
    // ... suas traduções em FR mantidas
    title: "Compatibilité",
    visualTitle: "Identifiez votre porte-clés",
    supported: "Supporté",
    check: "Vérification requise",
    cta: "Commencer ma commande",
    back: "Retour"
  } : {
    title: "Compatibility",
    visualTitle: "Identify your Key Fob",
    supported: "Supported",
    check: "Special Handling",
    cta: "Start My Order",
    back: "Back"
  };

  const withLang = (path: string) => `${path}?lang=${lang}`;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 font-sans">
      <div className="mb-8">
        <Link href={withLang("/")} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
          ← {t.back}
        </Link>
      </div>

      <header className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t.title}</h1>
        <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
          {isFR ? "Nous supportons 90% des systèmes utilisés au Canada." : "We support 90% of the systems used in Canada."}
        </p>
      </header>

      {/* --- NOVA SEÇÃO VISUAL --- */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Search className="w-6 h-6 text-blue-500" /> {t.visualTitle}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CANADIAN_FOBS.map((fob) => (
            <div key={fob.id} className="group bg-white border rounded-2xl p-4 hover:shadow-md transition-all border-gray-100 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full mb-4 flex items-center justify-center overflow-hidden border border-gray-50 group-hover:scale-105 transition-transform">
                {/* Aqui você coloca a tag <img src={fob.img} /> real */}
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest text-center px-2">
                   Image: {fob.name}
                </div>
              </div>
              <h3 className="font-bold text-gray-900 text-sm">{fob.name}</h3>
              <span className={`mt-2 text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                fob.status === 'supported' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {fob.status === 'supported' ? t.supported : t.check}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* --- COMPARATIVO TÉCNICO --- */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-8">
          <div className="bg-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <CheckCircle2 className="text-white w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 italic">Standard RFID</h2>
          <ul className="space-y-3">
            {["HID Prox", "Kantech", "Keyscan", "Indala", "AWID"].map(item => (
              <li key={item} className="flex items-center gap-3 text-gray-700 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 opacity-80">
          <div className="bg-gray-400 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <AlertCircle className="text-white w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 italic">High Security</h2>
          <p className="text-sm text-gray-500 mb-4">May require professional verification:</p>
          <ul className="space-y-3">
            {["Mifare DESFire", "HID iClass (Elite)", "Salto Systems"].map(item => (
              <li key={item} className="flex items-center gap-3 text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* --- RODAPÉ DE CONFIANÇA --- */}
      <section className="bg-blue-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-100">
        <div className="flex gap-4 items-center">
           <ShieldCheck className="w-12 h-12 text-blue-200" />
           <div>
             <h3 className="text-xl font-bold">100% Risk Free</h3>
             <p className="text-blue-100 text-sm">Not sure? We verify every photo before charging you.</p>
           </div>
        </div>
        <Link
          href={withLang("/book")}
          className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg active:scale-95"
        >
          {t.cta}
        </Link>
      </section>
    </main>
  );
}
