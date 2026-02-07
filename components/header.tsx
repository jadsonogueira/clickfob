"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, X } from "lucide-react";

type Lang = "en" | "fr";

function getLang(sp: ReturnType<typeof useSearchParams>): Lang {
  const raw = (sp?.get("lang") || "en").toLowerCase();
  return raw === "fr" ? "fr" : "en";
}

function withLang(pathname: string, lang: Lang) {
  // Preserve non-home hash navigation by keeping pathname and using query param.
  const base = pathname || "/";
  return `${base}?lang=${lang}`;
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // ✅ Ultra minimal landing: hide global header on /fob-copy
  if ((pathname || "").startsWith("/fob-copy")) return null;

  const lang = useMemo(() => getLang(searchParams), [searchParams]);
  const isFR = lang === "fr";

  const labels = useMemo(
    () =>
      isFR
        ? {
            services: "Services",
            manage: "Gérer la réservation",
            book: "Réserver",
            compatibility: "Compatibilité",
            terms: "Conditions",
            privacy: "Confidentialité",
            contact: "Contact",
          }
        : {
            services: "Services",
            manage: "Manage Booking",
            book: "Book Now",
            compatibility: "Compatibility",
            terms: "Terms",
            privacy: "Privacy",
            contact: "Contact",
          },
    [isFR]
  );

  const navHref = (href: string) => {
    // Keep /#services style anchors working by appending query before hash.
    if (href.includes("#")) {
      const [path, hash] = href.split("#");
      return `${path || pathname || "/"}?lang=${lang}#${hash}`;
    }
    return `${href}?lang=${lang}`;
  };

  const switchLangHref = (nextLang: Lang) => {
    return withLang(pathname || "/", nextLang);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href={navHref("/")} className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              ClickFob
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href={navHref("/#services")}
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              {labels.services}
            </Link>
            <Link
              href={navHref("/manage")}
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              {labels.manage}
            </Link>

            <Link
              href={navHref("/compatibility")}
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              {labels.compatibility}
            </Link>

            <Link
              href={navHref("/contact")}
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              {labels.contact}
            </Link>

            <div className="flex items-center gap-2 text-sm">
              <Link
                href={switchLangHref("en")}
                className={`px-2 py-1 rounded-md border ${
                  lang === "en"
                    ? "border-blue-600 text-blue-600"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
                aria-label="Switch to English"
              >
                EN
              </Link>
              <Link
                href={switchLangHref("fr")}
                className={`px-2 py-1 rounded-md border ${
                  lang === "fr"
                    ? "border-blue-600 text-blue-600"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
                aria-label="Passer au français"
              >
                FR
              </Link>
            </div>
            <Link
              href={navHref("/book")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
            >
              {labels.book}
            </Link>
          </nav>

          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-3">
              <Link
                href={navHref("/#services")}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {labels.services}
              </Link>
              <Link
                href={navHref("/manage")}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {labels.manage}
              </Link>

              <Link
                href={navHref("/compatibility")}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {labels.compatibility}
              </Link>

              <Link
                href={navHref("/contact")}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {labels.contact}
              </Link>

              <div className="flex items-center gap-2 py-2">
                <Link
                  href={switchLangHref("en")}
                  className={`px-2 py-1 rounded-md border text-sm ${
                    lang === "en"
                      ? "border-blue-600 text-blue-600"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  EN
                </Link>
                <Link
                  href={switchLangHref("fr")}
                  className={`px-2 py-1 rounded-md border text-sm ${
                    lang === "fr"
                      ? "border-blue-600 text-blue-600"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FR
                </Link>
              </div>
              <Link
                href={navHref("/book")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                {labels.book}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
