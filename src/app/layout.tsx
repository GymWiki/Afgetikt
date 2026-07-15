import type { Metadata, Viewport } from "next";
import { Geist_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const title = "Afgetikt — Rekening splitsen door je bon te scannen";
const description =
  "Scan de bon, deel de link, iedereen tikt zijn eigen items aan. Verdeel de rekening met vrienden zonder rekenwerk of Tikkies achteraf. Probeer gratis.";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: title,
    template: "%s — Afgetikt",
  },
  description,
  manifest: "/manifest.webmanifest",
  openGraph: {
    title,
    description,
    url: baseUrl,
    siteName: "Afgetikt",
    locale: "nl_NL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GymWiki",
  alternateName: "Afgetikt",
  url: baseUrl,
  email: "info@afgetikt.nl",
  identifier: "97351911",
  vatID: "NL005266843B58",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f8f7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      data-scroll-behavior="smooth"
      className={`${plexSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* Scroll-onthullingen (zie components/ui/reveal.tsx) starten
            onzichtbaar en wachten op JS om te tonen. Zonder JS — of als een
            crawler nooit scrolt — mag content nooit permanent verborgen
            blijven, dus forceer zichtbaarheid als noscript-vangnet. */}
        <noscript>
          <style>{`[data-reveal] { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
