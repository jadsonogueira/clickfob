import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  
  return {
    metadataBase: new URL(baseUrl),
    title: "ClickFob - On-Site Fob Copying & Garage Remote Service | Toronto GTA",
    description: "Professional on-site fob copying and garage remote programming service in Toronto and the Greater Toronto Area. Fast service, fixed pricing, working guarantee.",
    keywords: "fob copying, key fob, garage remote, Toronto, GTA, on-site service",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "ClickFob - On-Site Fob Copying & Garage Remote Service",
      description: "Professional on-site fob copying and garage remote programming service in Toronto GTA.",
      images: ["/og-image.png"],
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
        <style dangerouslySetInnerHTML={{ __html: `[data-hydration-error] { display: none !important; }` }} />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50`} suppressHydrationWarning>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
