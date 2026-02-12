import Link from "next/link";
import { Mail, MessageCircle, MapPin, Smartphone } from "lucide-react";

type Lang = "en" | "fr";

function getLang(searchParams?: Record<string, string | string[] | undefined>): Lang {
  const raw = searchParams?.lang;
  const val = Array.isArray(raw) ? raw[0] : raw;
  return (val || "en").toLowerCase() === "fr" ? "fr" : "en";
}

export default function ContactPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const lang = getLang(searchParams);
  const isFR = lang === "fr";

  const t = isFR
    ? {
        title: "Contact",
        back: "Retour à l’accueil",
        subtitle: "Questions sur la compatibilité ou les commandes multiples? Écrivez-nous.",
        area: "Zone de service",
        areaText: "Toronto & GTA",
        whatsapp: "WhatsApp",
        sms: "SMS",
        email: "Email",
        whatsappCta: "Nous écrire sur WhatsApp",
        smsCta: "Envoyer un SMS",
        emailCta: "Nous envoyer un email",
      }
    : {
        title: "Contact",
        back: "Back to Home",
        subtitle: "Questions about compatibility or multi-copy orders? Message us.",
        area: "Service area",
        areaText: "Toronto & GTA",
        whatsapp: "WhatsApp",
        sms: "SMS",
        email: "Email",
        whatsappCta: "Message us on WhatsApp",
        smsCta: "Send us a text message",
        emailCta: "Send us an email",
      };

  const withLang = (path: string) => `${path}?lang=${lang}`;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="mb-5 md:mb-8">
        <Link href={withLang("/")} className="text-sm font-bold text-blue-600 hover:underline">
          ← {t.back}
        </Link>
      </div>

      <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">{t.title}</h1>
      <p className="text-gray-700 mb-6 md:mb-8">{t.subtitle}</p>

      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        {/* WhatsApp */}
        <section className="bg-white rounded-2xl shadow-sm border p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-black text-gray-900">{t.whatsapp}</h2>
            <div className="w-10 h-10 rounded-xl bg-slate-50 border flex items-center justify-center">
              <MessageCircle size={18} className="text-green-600" />
            </div>
          </div>

          <a
            href="https://wa.me/14167707036"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-black text-sm md:text-base transition-all active:scale-[0.99]"
          >
            {t.whatsappCta}
          </a>
        </section>

        {/* SMS */}
        <section className="bg-white rounded-2xl shadow-sm border p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-black text-gray-900">{t.sms}</h2>
            <div className="w-10 h-10 rounded-xl bg-slate-50 border flex items-center justify-center">
              <Smartphone size={18} className="text-slate-800" />
            </div>
          </div>

          <a
            href="sms:+14167707036"
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-950 text-white px-5 py-3 rounded-xl font-black text-sm md:text-base transition-all active:scale-[0.99]"
          >
            {t.smsCta}
          </a>
        </section>

        {/* Email */}
        <section className="bg-white rounded-2xl shadow-sm border p-5 md:p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-black text-gray-900">{t.email}</h2>
            <div className="w-10 h-10 rounded-xl bg-slate-50 border flex items-center justify-center">
              <Mail size={18} className="text-blue-600" />
            </div>
          </div>

          <a
            href="mailto:clickfobtoronto@gmail.com"
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-black text-sm md:text-base transition-all active:scale-[0.99]"
          >
            {t.emailCta}
          </a>
        </section>
      </div>

      {/* Service area */}
      <section className="mt-4 md:mt-6 bg-gray-50 rounded-2xl border p-5 md:p-6">
        <h2 className="text-lg md:text-xl font-black text-gray-900 mb-2">{t.area}</h2>
        <p className="text-gray-700 flex items-center gap-2 font-medium">
          <MapPin size={18} /> {t.areaText}
        </p>
      </section>
    </main>
  );
}