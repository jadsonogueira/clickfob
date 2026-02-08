import type { Metadata } from "next";
import Link from "next/link";
import { 
  CheckCircle2, 
  ShieldCheck, 
  Camera, 
  Smartphone, 
  MessageSquare, 
  Zap, 
  Search,
  Lock,
  ArrowRight
} from "lucide-react";

const PHONE_E164 = "+14167707036";
const FULL_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://clickfob.onrender.com";

function buildSmsLink(body: string) {
  const encoded = encodeURIComponent(body);
  return `sms:${PHONE_E164}?&body=${encoded}`;
}

export const metadata: Metadata = {
  title: "Condo Fob Copy Toronto | ClickFob",
  description: "Professional key fob duplication in Toronto. Identify your technology and get a copy today.",
};

export default function FobCopyLandingPage() {
  const smsHref = buildSmsLink("Hi! I need an extra condo fob copy. I'm looking at your compatibility list. What's next?");
  const fullSiteHref = `${FULL_SITE_URL}/?lang=en`;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans tracking-tight">
      {/* Barra de Navegação Minimalista */}
      <nav className="border-b border-slate-100 py-6 px-6 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          {/* Logo atualizada para o estilo da imagem azul */}
          <span className="font-bold text-2xl tracking-tight text-blue-600">ClickFob</span>
          
          <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Zap className="w-3 h-3 fill-yellow-400 text-yellow-400" /> Toronto Service
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero Section: Impacto e Clareza */}
        <section className="mb-20 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[0.9] uppercase">
            Extra Condo <br />
            <span className="text-blue-600">Fob Copy.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl leading-relaxed mb-10 font-medium">
            Toronto's most reliable duplication service. Professional equipment, instant testing, and clear pricing.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-2xl border border-emerald-100 text-sm font-bold">
              <CheckCircle2 className="w-4 h-4" /> Tested on Site
            </div>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-5 py-2.5 rounded-2xl border border-blue-100 text-sm font-bold">
              <ShieldCheck className="w-4 h-4" /> Secure Protocol
            </div>
          </div>
        </section>

        {/* Seção de Checagem Técnica (Sem Imagens) */}
        <section className="mb-20">
          <div className="bg-slate-950 rounded-[3rem] p-8 md:p-14 text-white relative overflow-hidden">
            {/* Decoração de fundo (CSS purpouse) */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[120px] opacity-20 -mr-32 -mt-32"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 text-blue-400">
                <Search className="w-6 h-6" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Technical Compatibility</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-10 uppercase italic">Identify your technology</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                {/* Card de Categoria 1 */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-black uppercase text-emerald-400">Standard RFID</h3>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-2 py-1 rounded-md font-bold uppercase">100% Compatible</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">Most common in Toronto condos. Fast duplication.</p>
                  <div className="flex flex-wrap gap-2">
                    {["HID Prox", "Kantech", "Keyscan", "AWID"].map(t => (
                      <span key={t} className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-lg font-bold">{t}</span>
                    ))}
                  </div>
                </div>

                {/* Card de Categoria 2 */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-black uppercase text-blue-400">Smart / High Sec</h3>
                    <span className="bg-blue-500/20 text-blue-400 text-[9px] px-2 py-1 rounded-md font-bold uppercase">Verify First</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">Newer buildings using encrypted technology.</p>
                  <div className="flex flex-wrap gap-2">
                    {["iClass", "Mifare", "Salto", "Schlage"].map(t => (
                      <span key={t} className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-lg font-bold">{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botão de Verificação por Foto */}
              <div className="bg-blue-600 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-blue-900/40 transition-transform hover:scale-[1.02]">
                <div className="flex items-center gap-5">
                  <div className="bg-white/20 p-4 rounded-2xl">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black uppercase leading-tight">Not sure?</h4>
                    <p className="text-blue-100 text-sm font-medium">Text a photo of your fob for an instant check.</p>
                  </div>
                </div>
                <a href={smsHref} className="w-full md:w-auto bg-white text-blue-600 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-colors text-center">
                  Quick Photo Check
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing & CTA */}
        <section className="mb-20">
          <div className="max-w-md mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-white border-2 border-slate-900 rounded-[2.5rem] p-10 shadow-xl">
              <div className="text-center mb-8">
                <span className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-4 block">Fixed Pricing</span>
                <div className="flex justify-center items-baseline gap-1">
                  <span className="text-sm font-black text-slate-400 italic">From</span>
                  <span className="text-6xl font-black tracking-tighter">$30</span>
                  <span className="text-sm font-bold text-slate-400">+ HST</span>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                {[
                  { icon: Zap, text: "Same-day service available" },
                  { icon: Lock, text: "No data stored after copy" },
                  { icon: CheckCircle2, text: "Tested on your reader" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                    <item.icon className="w-4 h-4 text-emerald-500" />
                    {item.text}
                  </div>
                ))}
              </div>

              <a
                href={smsHref}
                className="flex items-center justify-center gap-3 w-full bg-slate-900 text-white py-6 rounded-[1.5rem] font-black text-xl hover:bg-blue-600 transition-all active:scale-95 shadow-lg group"
              >
                <MessageSquare className="w-6 h-6" />
                Text to start
                <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </a>
            </div>
          </div>
        </section>

        {/* Footer com links de apoio */}
<footer className="pt-12 border-t border-slate-100 text-center md:text-left">
  <div className="flex flex-col md:flex-row justify-between items-center gap-8">
    <div className="text-xs text-slate-400 font-medium">
      © {new Date().getFullYear()} ClickFob Duplication Services. <br className="md:hidden" /> Serving the GTA.
    </div>
    <div className="flex gap-8">
      <a 
        href={fullSiteHref} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-xs font-black uppercase tracking-widest hover:text-blue-600 transition-colors"
      >
        Website
      </a>
      {/* Agora abrindo em nova aba da mesma forma que o Website */}
      <a 
        href={`${FULL_SITE_URL}/compatibility?lang=en`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-xs font-black uppercase tracking-widest hover:text-blue-600 transition-colors text-blue-600"
      >
        Full Tech List
      </a>
    </div>
  </div>
  <div className="mt-8 text-[10px] text-slate-300 italic uppercase tracking-widest">
    Authorization from the owner is required. We do not bypass security protocols.
  </div>
</footer>

      </main>
    </div>
  );
}
