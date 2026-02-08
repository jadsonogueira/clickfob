"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Mail, MessageCircle, ShieldCheck, Zap } from "lucide-react";

type Lang = "en" | "fr";

function getLang(sp: ReturnType<typeof useSearchParams>): Lang {
  const raw = (sp?.get("lang") || "en").toLowerCase();
  return raw === "fr" ? "fr" : "en";
}

export default function Footer() {
  const sp = useSearchParams();
  const pathname = usePathname();

  // ✅ Ultra minimal landing: hide global footer on /fob-copy
  if ((pathname || "").startsWith("/fob-copy")) return null;

  const lang = useMemo(() => getLang(sp), [sp]);
  const isFR = lang === "fr";

  const t = useMemo(
    () =>
      isFR
        ? {
            tagline: "Service professionnel de duplication de porte-clés (fob) et télécommandes de garage à Toronto et dans le GTA.",
            contact: "Contact",
            quickLinks: "Liens Rapides",
            book: "Réserver",
            manage: "Gérer la réservation",
            compatibility: "Compatibilité",
            terms: "Conditions d’utilisation",
            privacy: "Politique de confidentialité",
            disclaimer: "Le client doit être autorisé. Service soumis à la compatibilité technique.",
            rights: "Tous droits réservés.",
          }
        : {
            tagline: "Professional key fob duplication and garage remote service across Toronto & the GTA.",
            contact: "Contact",
            quickLinks: "Quick Links",
            book: "Book a Service",
            manage: "Manage Booking",
            compatibility: "Compatibility",
            terms: "Terms & Conditions",
            privacy: "Privacy Policy",
            disclaimer: "Client authorization required. Duplication subject to technical compatibility.",
            rights: "All rights reserved.",
          },
    [isFR]
  );

  const href = (path: string) => {
    if (path.includes("#")) {
      const [p, hash] = path.split("#");
      return `${p || pathname || "/"}?lang=${lang}#${hash}`;
    }
    return `${path}?lang=${lang}`;
  };

  return (
    <footer className="bg-black text-slate-400 border-t border-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand Column */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-black text-white mb-6 uppercase italic tracking-tighter flex items-center gap-2">
              ClickFob <Zap className="w-5 h-5 text-blue-500 fill-current" />
            </h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm mb-6">
              {t.tagline}
            </p>
            <div className="inline-flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{t.disclaimer}</span>
            </div>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">{t.contact}</h4>
            <div className="space-y-4">
              <a
                href="https://wa.me/14167707036"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 hover:text-blue-500 transition-all font-bold text-sm"
              >
                <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-blue-600/10 transition-colors">
                  <MessageCircle size={18} className="text-blue-500" />
                </div>
                <span>+1 (416) 770-7036</span>
              </a>
              <a
                href="mailto:clickfobtoronto@gmail.com"
                className="group flex items-center gap-3 hover:text-blue-500 transition-all font-bold text-sm"
              >
                <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-blue-600/10 transition-colors">
                  <Mail size={18} className="text-blue-500" />
                </div>
                <span className="truncate">clickfobtoronto@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">{t.quickLinks}</h4>
            <nav className="flex flex-col space-y-3">
              {[
                { label: t.book, path: "/book" },
                { label: t.manage, path: "/manage" },
                { label: t.compatibility, path: "/compatibility" },
                { label: t.terms, path: "/terms" },
                { label: t.privacy, path: "/privacy" },
              ].map((link) => (
                <Link
                  key={link.path}
                  href={href(link.path)}
                  className="text-sm font-bold text-slate-500 hover:text-white hover:translate-x-1 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            &copy; {new Date().getFullYear()} ClickFob Duplication. {t.rights}
          </p>
          <div className="flex gap-4">
             <div className="w-8 h-5 bg-slate-900 rounded border border-slate-800" /> {/* Visa Placeholder */}
             <div className="w-8 h-5 bg-slate-900 rounded border border-slate-800" /> {/* MC Placeholder */}
             <div className="w-8 h-5 bg-slate-900 rounded border border-slate-800" /> {/* Amex Placeholder */}
          </div>
        </div>
      </div>
    </footer>
  );
}
