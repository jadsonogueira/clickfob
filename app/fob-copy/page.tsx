import type { Metadata } from "next";

const PHONE_E164 = "+14167707036"; // ClickFob

function buildSmsLink(body: string) {
  // iOS supports: sms:+1416...?body=...
  const encoded = encodeURIComponent(body);
  return `sms:${PHONE_E164}?&body=${encoded}`;
}

export const metadata: Metadata = {
  title: "Condo Fob Copy Toronto | ClickFob",
  description:
    "Need an extra condo fob? Fast, reliable key fob copying in Toronto. Clear pricing + HST. Text to get started.",
  alternates: { canonical: "/fob-copy" },
  openGraph: {
    title: "Condo Fob Copy Toronto | ClickFob",
    description:
      "Fast, reliable condo fob copy in Toronto. Clear pricing + HST. Text to get started.",
    url: "/fob-copy",
    type: "website",
  },
};

export default function FobCopyLandingPage() {
  const smsHref = buildSmsLink(
    "Hi! I need an extra condo fob copy. What do you need from me?"
  );

  return (
    <div className="min-h-[calc(100vh-0px)] bg-white">
      <div className="mx-auto max-w-xl px-6 py-14 sm:py-20">
        <div className="text-sm font-semibold tracking-tight text-gray-900">
          ClickFob
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Need an extra condo fob?
        </h1>

        <p className="mt-4 text-base leading-relaxed text-gray-600">
          Fast, reliable key fob copying in Toronto. No condo hassle. Same-day
          service available.
        </p>

        <ul className="mt-8 space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span aria-hidden>•</span>
            <span>Tested before delivery</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden>•</span>
            <span>Clear pricing + HST</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden>•</span>
            <span>Serving Toronto condo residents</span>
          </li>
        </ul>

        <div className="mt-10 rounded-2xl border border-gray-200 p-5">
          <div className="text-sm font-semibold text-gray-900">Pricing</div>
          <div className="mt-2 text-sm text-gray-700">From $30 + HST</div>
          <div className="mt-1 text-xs text-gray-500">
            Same-day / urgent service available
          </div>

          <a
            href={smsHref}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
            aria-label="Text ClickFob"
          >
            Text to get started
          </a>

        
        </div>

        <div className="mt-10 text-xs text-gray-500">
          Client authorization required. Duplication subject to technical
          compatibility.
        </div>
      </div>
    </div>
  );
}
