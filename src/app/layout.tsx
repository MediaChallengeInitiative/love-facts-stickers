import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { FeedbackPill } from "@/components/feedback/FeedbackPill";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://stickers.lovefacts.africa";

const SITE_TITLE = "Love Facts Stickers — Clap back at lies in one tap";
const SITE_DESCRIPTION =
  "Free media literacy stickers from the Media Challenge Initiative. Save and send on WhatsApp, Telegram, TikTok, Facebook, Instagram, X — no signup, no email, just one tap.";

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: "%s — Love Facts",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "love facts stickers",
    "whatsapp stickers uganda",
    "media literacy",
    "misinformation",
    "fact-checking",
    "red flags disinformation",
    "uganda",
    "africa",
    "MCI",
    "media challenge initiative",
    "free stickers",
    "telegram stickers",
  ],
  authors: [{ name: "Media Challenge Initiative", url: "https://mciug.org" }],
  creator: "Media Challenge Initiative",
  publisher: "Media Challenge Initiative",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/images/love-facts-logo.png", sizes: "any" }],
    apple: "/images/love-facts-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_UG",
    url: SITE_URL,
    siteName: "Love Facts Stickers",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/images/love-facts-logo.png",
        width: 512,
        height: 512,
        alt: "Love Facts Media Literacy Stickers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/images/love-facts-logo.png"],
    creator: "@MediaChallengeI",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "education",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0A3D4C" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

// JSON-LD Organization + WebSite — gives Google sitelinks searchbox and rich
// publisher metadata when our pages appear in results.
const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Media Challenge Initiative",
  alternateName: "MCI",
  url: "https://mciug.org",
  logo: `${SITE_URL}/images/love-facts-logo.png`,
  sameAs: [
    "https://twitter.com/MediaChallengeI",
    "https://www.facebook.com/MediaChallengeInitiative",
    "https://www.linkedin.com/company/media-challenge-initiative",
  ],
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Love Facts Stickers",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  publisher: { "@id": "https://mciug.org#org" },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
  inLanguage: "en-UG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-UG" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://lh3.googleusercontent.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
      </head>
      <body className="min-h-[100svh] bg-white dark:bg-slate-900 text-slate-900 dark:text-white antialiased transition-colors duration-300">
        <ThemeProvider>
          <Header />
          <main className="pt-16">{children}</main>
          <Footer />
          <ToastProvider />
          <FeedbackPill />
        </ThemeProvider>
      </body>
    </html>
  );
}
