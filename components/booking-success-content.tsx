"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Calendar, MessageCircle, ArrowRight } from "lucide-react";

export default function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams?.get("order") || "";
  const lang = (searchParams?.get("lang") || "en").toLowerCase() === "fr" ? "fr" : "en";
  const isFR = lang === "fr";

  const t = isFR
    ? {
        title: "Réservation envoyée !",
        subtitle: "Merci d’avoir choisi ClickFob",
        order: "Numéro de commande",
        pending: "En attente de confirmation",
        pendingText:
          "Votre réservation est en attente. Nous vous contacterons bientôt pour confirmer.",
        email: "Un e-mail de confirmation a été envoyé.",
        manage: "Gérer la réservation",
        whatsapp: "Nous écrire sur WhatsApp",
        home: "Retour à l’accueil",
      }
    : {
        title: "Booking Submitted!",
        subtitle: "Thank you for choosing ClickFob",
        order: "Your Order Number",
        pending: "Pending Confirmation",
        pendingText:
          "Your booking is currently pending. We will contact you shortly to confirm your appointment.",
        email: "A confirmation email has been sent to your inbox.",
        manage: "Manage Booking",
        whatsapp: "WhatsApp Us",
        home: "Return to Home",
      };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6">
            <CheckCircle size={48} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-600 mb-6">{t.subtitle}</p>

          {orderNumber && (
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <p className="text-sm text-blue-600 font-medium">{t.order}</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">{orderNumber}</p>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
            <p className="text-yellow-800 text-sm">
              <strong>{t.pending}:</strong> {t.pendingText}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-gray-600 text-sm">{t.email}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              {orderNumber && (
                <Link
                  href={`/manage/${orderNumber}?lang=${lang}`}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  <Calendar size={20} />
                  {t.manage}
                </Link>
              )}
              <a
                href="https://wa.me/14167707036"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                <MessageCircle size={20} />
                {t.whatsapp}
              </a>
            </div>

            <Link
              href={`/?lang=${lang}`}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium mt-4"
            >
              {t.home} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
