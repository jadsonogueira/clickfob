import Link from "next/link";

type Lang = "en" | "fr";

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

  const t = isFR
    ? {
        title: "Compatibilité",
        subtitle: "Tous les porte-clés ne peuvent pas être copiés.",
        p1:
          "La compatibilité dépend de la technologie, de la fréquence et du niveau de sécurité du porte-clés. Certains systèmes sont conçus pour empêcher la duplication.",
        usually: "Généralement compatibles",
        usuallyItems: [
          "Porte-clés RFID standards",
          "Identifiants non cryptés",
          "Systèmes d’accès résidentiels courants",
        ],
        mayNot: "Peuvent ne pas être compatibles",
        mayNotItems: [
          "Identifiants cryptés",
          "Systèmes propriétaires",
          "Programmes corporatifs ou de copropriété restreints",
          "Accès géré uniquement par l’administration de l’immeuble",
        ],
        why: "Pourquoi la compatibilité est importante",
        whyText:
          "Deux porte-clés identiques en apparence peuvent utiliser des technologies internes différentes. La compatibilité est confirmée après l’analyse des photos fournies lors de la commande.",
        notes: "Notes importantes",
        notesItems: [
          "Nous n’accédons pas aux systèmes de contrôle d’accès des immeubles",
          "Nous ne contournons pas les mécanismes de sécurité",
          "La compatibilité est vérifiée avant toute duplication",
        ],
        cta: "Commencer ma commande",
        back: "Retour à l’accueil",
      }
    : {
        title: "Compatibility",
        subtitle: "Not all key fobs can be duplicated.",
        p1:
          "Key fob compatibility depends on the technology, frequency, and security level of the credential. Some systems are designed to prevent duplication and cannot be copied.",
        usually: "What is usually compatible",
        usuallyItems: [
          "Standard RFID key fobs",
          "Non-encrypted credentials",
          "Common residential access systems",
        ],
        mayNot: "What may NOT be compatible",
        mayNotItems: [
          "Encrypted or cryptographic credentials",
          "Proprietary access systems",
          "Restricted corporate or condominium programs",
          "Credentials managed exclusively by building administrators",
        ],
        why: "Why compatibility matters",
        whyText:
          "Even if two key fobs look identical, their internal technology may be different. Compatibility is confirmed after reviewing the photos provided during the order.",
        notes: "Important notes",
        notesItems: [
          "We do not access or connect to building access control systems",
          "We do not bypass, hack, or decrypt security mechanisms",
          "Compatibility is verified before any duplication",
        ],
        cta: "Start My Order",
        back: "Back to Home",
      };

  const withLang = (path: string) => `${path}?lang=${lang}`;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <Link href={withLang("/")} className="text-sm text-blue-600 hover:underline">
          ← {t.back}
        </Link>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{t.title}</h1>
      <p className="text-lg text-gray-700 mb-4 font-medium">{t.subtitle}</p>
      <p className="text-gray-600 mb-8">{t.p1}</p>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <section className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">{t.usually}</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            {t.usuallyItems.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">{t.mayNot}</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            {t.mayNotItems.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="bg-gray-50 rounded-2xl border p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.why}</h2>
        <p className="text-gray-700">{t.whyText}</p>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border p-6 mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{t.notes}</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          {t.notesItems.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={withLang("/book")}
          className="inline-flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
        >
          {t.cta}
        </Link>
        <Link
          href={withLang("/")}
          className="inline-flex justify-center items-center border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-xl font-semibold"
        >
          {t.back}
        </Link>
      </div>
    </main>
  );
}
