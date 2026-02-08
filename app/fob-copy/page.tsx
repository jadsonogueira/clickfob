"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Search, ShieldCheck, Camera, Check, ArrowLeft } from "lucide-react";

// --- Dados e Configurações ---
const CATEGORIES = [
  {
    id: "compatible",
    title_en: "100% Compatible (Instant Copy)",
    title_fr: "100% Compatible (Copie Instantanée)",
    fobs: [
      { name: "HID Prox", img: "/fobs/hid-prox.png", brand: "HID", freq: "125kHz" },
      { name: "ioProx", img: "/fobs/ioprox.png", brand: "Kantech", freq: "125kHz" },
      { name: "Keyscan", img: "/fobs/keyscan.png", brand: "Keyscan", freq: "125kHz" },
      { name: "AWID", img: "/fobs/awid.png", brand: "AWID", freq: "125kHz" },
    ]
  },
  {
    id: "special",
    title_en: "High Security (Verification Needed)",
    title_fr: "Haute Sécurité (Vérification Requise)",
    fobs: [
      { name: "iClass", img: "/fobs/iclass.png", brand: "HID", freq: "13.56MHz" },
      { name: "Mifare", img: "/fobs/mifare.png", brand: "NXP", freq: "13.56MHz" },
    ]
  }
];

// --- Componente de Conteúdo (Onde o erro costuma ocorrer) ---
function CompatibilityContent() {
  const searchParams = useSearchParams();
  const lang = searchParams.get("lang") === "fr" ? "fr" : "en";
  const isFR = lang === "fr";

  const t = isFR ? {
    title: "Vérificateur de Compatibilité",
    subtitle: "La solution la plus rapide au Canada pour dupliquer vos accès.",
    visualTitle: "Identifiez votre modèle",
    compatibleLabel: "Copiable",
    checkLabel: "À vérifier",
    photoCta: "Envoyez une photo",
    notSure: "Pas certain du modèle ?",
    back: "Retour",
    guarantee: "Analyse gratuite avant paiement"
  } : {
    title: "Compatibility Checker",
    subtitle: "Canada's fastest way to identify and duplicate your key fob.",
    visualTitle: "Identify your key fob",
    compatibleLabel: "Copyable",
    checkLabel: "Verification Needed",
    photoCta: "Upload a Photo",
    notSure: "Not sure which one you have?",
    back: "Back",
    guarantee: "Free photo review before you pay"
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 bg-white min-h-screen">
      {/* Header com a Logo Azul conforme solicitado */}
      <div className="flex justify-between items-center mb-12">
         <Link href={`/?lang=${lang}`} className="font-bold text-2xl tracking-tight text-blue-600">
            ClickFob
         </Link>
         <Link href={`/?lang=${lang}`} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
           <ArrowLeft size={16} /> {t.back}
         </Link>
      </div>

      <header className="mb-16">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase italic text-slate-950">{t.title}</h1>
        <p className="text-xl text-slate-500 max-w-2xl">{t.subtitle}</p>
        <div className="mt-6 flex gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold border border-emerald-100">
                <CheckCircle2 size={14} /> {t.guarantee}
            </div>
        </div>
      </header>

      <div className="space-y-20">
        {CATEGORIES.map((cat) => (
          <section key={cat.id}>
            <div className="flex items-center gap-3 mb-8">
              <div className={`p-2 rounded-xl ${cat.id === 'compatible' ? 'bg-emerald-500' : 'bg-blue-600'} text-white`}>
                {cat.id === 'compatible' ? <Check size={20} /> : <Search size={20} />}
              </div>
              <h2 className="text-2xl font-black uppercase italic italic">{isFR ? cat.title_fr : cat.title_en}</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {cat.fobs.map((fob) => (
                <div key={fob.name} className="border-2 border-slate-100 rounded-[2rem] p-6 flex flex-col items-center text-center hover:border-blue-500 transition-all">
                  <div className="w-full aspect-square bg-slate-50 rounded-2xl mb-4 flex items-center justify-center font-bold text-slate-300">
                     {/* Placeholder pois removemos imagens conforme pedido anterior */}
                     {fob.brand}
                  </div>
                  <h3 className="font-black uppercase text-sm">{fob.name}</h3>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{fob.freq}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Banner de Verificação Humana */}
      <section className="mt-20 bg-slate-950 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-md text-center md:text-left">
              <h2 className="text-3xl font-black uppercase italic mb-4">{t.notSure}</h2>
              <p className="text-slate-400 font-medium">Send us a photo and our experts will identify the technology for you.</p>
          </div>
          <Link href={`/book?lang=${lang}`} className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-tighter hover:bg-white hover:text-black transition-all">
              {t.photoCta}
          </Link>
      </section>
    </main>
  );
}

// --- Componente Principal com Suspense (Essencial para evitar o erro no Render) ---
export default function CompatibilityPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold">Loading...</div>}>
      <CompatibilityContent />
    </Suspense>
  );
}
