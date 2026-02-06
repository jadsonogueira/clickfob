"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Mail, MessageCircle } from "lucide-react";

type Lang = "en" | "fr";

function getLang(sp: ReturnType<typeof useSearchParams>): Lang {
  const raw = (sp?.get("lang") || "en").toLowerCase();
  return raw === "fr" ? "fr" : "en";
}

export default function Footer() {
  const sp = useSearchParams();
  const pathname = usePathname();

  const lang = useMemo(() => getLang(sp), [sp]);
  const isFR = lang === "fr";

  const t = useMemo(
    () =>
      isFR
        ? {
            tagline:
              "Service professionnel de duplication de porte-clés (fob) et télécommandes de garage à Toronto et dans le GTA.",
            contact: "Contact",
            quickLinks: "Liens",
            book: "Réserver",
            manage: "Gérer la réservation",
            compatibility: "Compatibilité",
            terms: "Conditions d’utilisation",
            privacy: "Politique de confidentialité",
            disclaimer:
              "Le client doit être autorisé. Service soumis à la compatibilité technique.",
            rights: "Tous droits réservés.",
          }
        : {
            tagline:
              "Professional key fob duplication and garage remote service across Toronto & the GTA.",
            contact: "Contact",
            quickLinks: "Quick Links",
            book: "Book a Service",
            manage: "Manage Booking",
            compatibility: "Compatibility",
            terms: "Terms & Conditions",
            privacy: "Privacy Policy",
            disclaimer:
              "Client authorization required. Duplication subject to technical compatibility.",
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
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">ClickFob</h3>
            <p className="text-gray-400 text-sm">{t.tagline}</p>
            <p className="text-gray-500 text-xs mt-3">{t.disclaimer}</p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">{t.contact}</h4>
            <div className="space-y-3">
              <a
                href="https://wa.me/14167707036"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-400 hover:text-green-400 transition-colors"
              >
                <MessageCircle size={18} />
                <span>+1 (416) 770-7036</span>
              </a>
              <a
                href="mailto:clickfob@gmail.com"
                className="flex items-center gap-3 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Mail size={18} />
                <span>clickfob@gmail.com</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">{t.quickLinks}</h4>
            <div className="space-y-2">
              <Link href={href("/book")} className="block text-gray-400 hover:text-blue-400 transition-colors">
                {t.book}
              </Link>
              <Link href={href("/manage")} className="block text-gray-400 hover:text-blue-400 transition-colors">
                {t.manage}
              </Link>
              <Link
                href={href("/compatibility")}
                className="block text-gray-400 hover:text-blue-400 transition-colors"
              >
                {t.compatibility}
              </Link>
              <Link href={href("/terms")} className="block text-gray-400 hover:text-blue-400 transition-colors">
                {t.terms}
              </Link>
              <Link
                href={href("/privacy")}
                className="block text-gray-400 hover:text-blue-400 transition-colors"
              >
                {t.privacy}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} ClickFob. {t.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
