import Link from "next/link";

type Lang = "en" | "fr";

function getLang(searchParams?: Record<string, string | string[] | undefined>): Lang {
  const raw = searchParams?.lang;
  const val = Array.isArray(raw) ? raw[0] : raw;
  return (val || "en").toLowerCase() === "fr" ? "fr" : "en";
}

export default function TermsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const lang = getLang(searchParams);
  const isFR = lang === "fr";

  const t = isFR
    ? {
        title: "Conditions d’utilisation",
        back: "Retour à l’accueil",
        intro:
          "En utilisant ClickFob, vous acceptez les présentes conditions. Elles décrivent le service, vos responsabilités et nos limites.",
        sections: [
          {
            h: "1. Description du service",
            p: "ClickFob fournit un service de duplication de porte-clés (fob) limité à la duplication physique des identifiants compatibles fournis par le client. Nous n’accédons pas aux systèmes de contrôle d’accès des immeubles, bases de données ou panneaux d’administration.",
          },
          {
            h: "2. Autorisation du client",
            p: "Le client confirme être un utilisateur autorisé du porte-clés présenté. Le client est seul responsable de vérifier que la duplication ne viole aucune règle de copropriété, politique d’immeuble ou entente avec le gestionnaire.",
          },
          {
            h: "3. Compatibilité",
            p: "Tous les porte-clés ne sont pas compatibles. La compatibilité dépend de la technologie, de la fréquence et du niveau de sécurité et peut nécessiter une vérification technique. Aucun résultat n’est garanti pour les systèmes cryptés, propriétaires ou restreints.",
          },
          {
            h: "4. Aucune tentative de contournement",
            p: "ClickFob ne contourne pas, ne pirate pas, ne décrypte pas et ne tente pas d’échapper aux mécanismes de sécurité. Les services sont limités aux identifiants pris en charge.",
          },
          {
            h: "5. Limitation de responsabilité",
            p: "ClickFob n’est pas responsable de l’utilisation non autorisée des identifiants, d’un refus d’accès, d’une désactivation par un tiers, de dommages liés à la violation de politiques d’immeuble, ni de dommages indirects.",
          },
          {
            h: "6. Remboursements",
            p: "En raison de la nature du service, aucun remboursement n’est offert après une tentative de duplication.",
          },
          {
            h: "7. Refus de service",
            p: "ClickFob se réserve le droit de refuser le service, notamment en cas d’incompatibilité, d’usage suspect ou de conflit de politiques.",
          },
          {
            h: "8. Modifications",
            p: "Ces conditions peuvent être mises à jour à tout moment. L’utilisation continue du service constitue l’acceptation de la version en vigueur.",
          },
        ],
      }
    : {
        title: "Terms & Conditions",
        back: "Back to Home",
        intro:
          "By using ClickFob, you agree to these terms. They describe the service, your responsibilities, and our limitations.",
        sections: [
          {
            h: "1. Service Description",
            p: "ClickFob provides key fob duplication services strictly limited to the physical duplication of compatible credentials presented by the client. We do not access, modify, or connect to any building access control systems, databases, or admin panels.",
          },
          {
            h: "2. Client Authorization",
            p: "The client confirms they are the authorized user of the key fob presented. The client is solely responsible for ensuring duplication does not violate any condominium rule, building policy, or property management agreement.",
          },
          {
            h: "3. Compatibility",
            p: "Not all key fobs are compatible. Compatibility depends on the technology, frequency, and security level and may require technical verification. No guarantee is provided for encrypted, proprietary, or restricted systems.",
          },
          {
            h: "4. No Circumvention",
            p: "ClickFob does not bypass, hack, decrypt, or attempt to circumvent any security mechanism. Services are limited to supported credentials only.",
          },
          {
            h: "5. Limitation of Liability",
            p: "ClickFob is not responsible for unauthorized use of duplicated credentials, access denial, credential deactivation by third parties, damages resulting from policy violations, or indirect/consequential damages.",
          },
          {
            h: "6. Refunds",
            p: "Due to the nature of the service, no refunds are provided once a duplication attempt has been performed.",
          },
          {
            h: "7. Service Refusal",
            p: "ClickFob reserves the right to refuse service, including cases of incompatibility, suspected misuse, or policy conflicts.",
          },
          {
            h: "8. Changes",
            p: "These terms may be updated at any time. Continued use of the service constitutes acceptance of the current version.",
          },
        ],
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

      <div className="space-y-6">
        {t.sections.map((s) => (
          <section key={s.h} className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{s.h}</h2>
            <p className="text-gray-700">{s.p}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
