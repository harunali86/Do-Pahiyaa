import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { BadgeInfo } from "lucide-react";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import MobileNav from "@/components/common/MobileNav";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Do Pahiyaa | Hybrid Bike Marketplace",
  description: "B2C marketplace + dealer channel + live auctions"
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
      </head>
      <body
        className={cn(
          "min-h-screen bg-slate-950 font-sans antialiased text-slate-100 selection:bg-brand-500/30",
          inter.variable,
          outfit.variable
        )}
      >
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />
        <div className="fixed inset-0 -z-10 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        <Navbar />
        <main className="mx-auto w-full max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8 flex-1">
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-brand-500/20 bg-brand-500/5 px-4 py-2.5 text-sm text-slate-300">
            <BadgeInfo className="h-4 w-4 text-brand-400 shrink-0" />
            <span><span className="font-semibold text-white">Demo Mode:</span> UI preview with curated mock marketplace and auction data.</span>
          </div>
          {children}
        </main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
