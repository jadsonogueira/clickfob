import Link from "next/link";

type Lang = "en" | "fr";

function getLang(searchParams?: Record<string, string | string[] | undefined>): Lang {
  const raw = searchParams?.lang;
  const val = Array.isArray(raw) ? raw[0] : raw;
  return (val || "en").toLowerCase() === "fr" ? "fr" : "en";
}

export default function PrivacyPolicyPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const lang = getLang(searchParams);
  const isFR = lang === "fr";

  const t = isFR
    ? {
        title: "Politique de confidentialité",
        back: "Retour à l’accueil",
        intro:
          "ClickFob respecte votre vie privée et s’engage à protéger vos renseignements personnels.",
        h1: "Informations collectées",
        c1: [
          "Nom et coordonnées",
          "Détails de la commande",
          "Images téléversées du porte-clés",
          "Communications liées à la commande",
        ],
        h2: "Utilisation des informations",
        c2: [
          "Traiter et exécuter votre commande",
          "Vérifier la compatibilité",
          "Communiquer l’état de la commande",
          "Fournir le support client",
        ],
        h3: "Protection des données",
        c3: [
          "Les images sont utilisées uniquement pour la vérification de compatibilité",
          "Nous ne vendons ni ne louons vos informations personnelles",
          "Les données ne sont partagées que si nécessaire pour fournir le service (ex.: envoi d’e-mails, hébergement d’images)",
        ],
        h4: "Systèmes d’accès",
        p4: "ClickFob n’accède pas aux systèmes de contrôle d’accès des immeubles et n’interagit pas avec les bases de données des bâtiments.",
        h5: "Conservation des données",
        p5: "Les données sont conservées uniquement le temps nécessaire au service ou aux obligations légales.",
        h6: "Contact",
        p6: "Pour toute question concernant cette politique, veuillez nous contacter via la page Contact.",
        contact: "Contact",
      }
    : {
        title: "Privacy Policy",
        back: "Back to Home",
        intro:
          "ClickFob respects your privacy and is committed to protecting your personal information.",
        h1: "Information we collect",
        c1: [
          "Name and contact details",
          "Order details",
          "Uploaded images of key fobs",
          "Communication records related to your order",
        ],
        h2: "How we use your information",
        c2: [
          "Process and fulfill your order",
          "Verify compatibility",
          "Communicate order status",
          "Provide customer support",
        ],
        h3: "Data protection",
        c3: [
          "Uploaded images are used only for compatibility verification",
          "We do not sell or rent personal information",
          "Data is shared only when required to complete the service (e.g., email delivery, image hosting)",
        ],
        h4: "Access control systems",
        p4: "ClickFob does not access, store, or interact with any building access control systems or databases.",
        h5: "Data retention",
        p5: "Information is retained only for as long as necessary to fulfill the service or meet legal obligations.",
        h6: "Contact",
        p6: "If you have questions about this policy, please contact us through the Contact page.",
        contact: "Contact",
      };

  const withLang = (path: string) => `${path}?lang=${lang}`;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <Link href={withLang("/")} className="text-sm text-blue-600 hover:underline">
          ← {t.back}
        </Link>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.title}</h1>
      <p className="text-gray-700 mb-8">{t.intro}</p>

      <section className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{t.h1}</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          {t.c1.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{t.h2}</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          {t.c2.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{t.h3}</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          {t.c3.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      </section>

      <section className="bg-gray-50 rounded-2xl border p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.h4}</h2>
        <p className="text-gray-700">{t.p4}</p>
      </section>

      <section className="bg-gray-50 rounded-2xl border p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.h5}</h2>
        <p className="text-gray-700">{t.p5}</p>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.h6}</h2>
        <p className="text-gray-700 mb-4">{t.p6}</p>
        <Link
          href={withLang("/contact")}
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
        >
          {t.contact}
        </Link>
      </section>
    </main>
  );
}
