import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { BadgeInfo } from "lucide-react";
import { Toaster } from "sonner";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import MobileNav from "@/components/common/MobileNav";
import ComparisonFloatingBar from "@/components/marketplace/ComparisonFloatingBar";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Do Pahiyaa | Buy & Sell Used Bikes in India",
  description: "India's most trusted marketplace for used bikes. Verified sellers, fair pricing, and live auctions for the best deals.",
  keywords: ["used bikes", "second hand bikes", "buy bike", "sell bike", "dopahiyaa", "scooters"],
  authors: [{ name: "Dopahiyaa Team" }],
  creator: "Harun Shaikh",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://dopahiyaa.com",
    title: "Do Pahiyaa | Buy & Sell Used Bikes in India",
    description: "Verified used bikes at unbeatable prices. Join live auctions or buy directly from trusted dealers.",
    siteName: "Do Pahiyaa",
    images: [
      {
        url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "Do Pahiyaa Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Do Pahiyaa | Hybrid Bike Marketplace",
    description: "The smartest way to buy and sell used two-wheelers in India.",
    images: ["https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&h=630&q=80"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="canonical" href="https://dopahiyaa.com" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-slate-950 font-sans antialiased text-slate-100 selection:bg-brand-500/30",
          inter.variable,
          outfit.variable
        )}
      >
        {/* Global Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Do-Pahiyaa",
              "url": "https://dopahiyaa.com",
              "logo": "https://dopahiyaa.com/logo.png",
              "sameAs": [
                "https://www.facebook.com/share/1FHuRrzBBK/",
                "https://www.instagram.com/dopahiyaa"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "https://dopahiyaa.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://dopahiyaa.com/search?query={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />

        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />
        <div className="fixed inset-0 -z-10 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        <Navbar />
        <main className="mx-auto w-full max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8 flex-1">

          {children}
        </main>
        <Footer />
        <MobileNav />
        <ComparisonFloatingBar />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
