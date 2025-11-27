import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Love Facts — Media Literacy Stickers",
  description: "Free stickers to fight misinformation and spread media literacy. Download, share, and make the truth go viral!",
  keywords: ["stickers", "media literacy", "misinformation", "fact-checking", "whatsapp stickers", "free download", "africa", "uganda", "MCI"],
  authors: [{ name: "Media Challenge Initiative", url: "https://mciug.org" }],
  creator: "Media Challenge Initiative",
  publisher: "Media Challenge Initiative",
  metadataBase: new URL("https://lovefacts.mciug.org"),
  icons: {
    icon: [
      { url: "/images/love-facts-logo.png", sizes: "any" },
    ],
    apple: "/images/love-facts-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lovefacts.mciug.org",
    siteName: "Love Facts Stickers",
    title: "Love Facts — Media Literacy Stickers",
    description: "Free stickers to fight misinformation and spread media literacy. Download, share, and make the truth go viral!",
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
    title: "Love Facts — Media Literacy Stickers",
    description: "Free stickers to fight misinformation and spread media literacy.",
    images: ["/images/love-facts-logo.png"],
    creator: "@MediaChallengeI",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white antialiased transition-colors duration-300">
        <ThemeProvider>
          <Header />
          <main className="pt-16">{children}</main>
          <Footer />
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
