import Hero from "@/components/marketplace/Hero";
import ListingCard from "@/components/marketplace/ListingCard";
import { demoListings } from "@/lib/demo/mock-data";
import { ArrowRight, Flame, ShieldCheck, Zap, Search, Handshake, FileCheck2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { defaultBlurDataURL, imageQuality, imageSizes } from "@/lib/image";

import VerifiedListingCard from "@/components/marketplace/VerifiedListingCard";
import { cookies } from "next/headers";
import { ListingService } from "@/lib/services/listing.service";
import { MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    const cookieStore = await cookies();
    const selectedCity = cookieStore.get("user_city")?.value || "All India";

    // Normalize Supabase FK joins (arrays → single objects)
    const normalizeListings = (items: any[]) =>
      items.map((l: any) => ({
        ...l,
        seller: Array.isArray(l.seller) ? l.seller[0] ?? null : l.seller,
      }));


    // PRESERVE MOCK DATA FOR DEMO (Requested by User)
    const realListings = normalizeListings(demoListings.slice(0, 6));
    const featuredListings = normalizeListings(demoListings.slice(6, 9));
    const recentListings = normalizeListings(demoListings.slice(0, 3));
    let localListings: any[] = [];

    // Optional: Try to fetch real city data, but fallback to mock immediately if it fails or is empty
    if (selectedCity && selectedCity !== "All India") {
      localListings = realListings.slice(0, 3);
    }

    // FAQ Schema for AEO (Answer Engine Optimization)
    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How to buy a certified bike on Do-Pahiyaa?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Browse verified listings, shortlist your favorite bike, and connect with the seller via our secure Lead Unlock system. Our platform ensures transparency and verified documents."
          }
        },
        {
          "@type": "Question",
          "name": "Can I sell my used bike locally in Mumbai or Delhi?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! Do-Pahiyaa supports programmatic SEO pages for all major Indian cities. Just list your bike, and it will be featured in local search results for your specific city."
          }
        },
        {
          "@type": "Question",
          "name": "Is ownership transfer handled by Do-Pahiyaa?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We handle all RTO documentation and ownership transfers for verified dealer listings across major hubs like Pune, Bangalore, and Hyderabad."
          }
        }
      ]
    };

    return (
      <div className="space-y-14 pb-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        {/* Hero Section */}
        <section>
          <Hero />
        </section>

        {/* Featured Categories (Bento Grid) */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <Zap className="h-6 w-6 text-accent-gold" />
              Shop by Category
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-96">
            <div className="md:col-span-2 relative group overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-80 z-10" />
              <Image
                src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1600&q=80"
                alt="Superbikes"
                fill
                sizes={imageSizes.homeCategoryWide}
                quality={imageQuality.homeCategory}
                placeholder="blur"
                blurDataURL={defaultBlurDataURL}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute bottom-6 left-6 z-20">
                <h3 className="text-2xl font-bold text-white mb-1">Superbikes</h3>
                <p className="text-slate-300 text-sm">Adrenaline junkies only</p>
              </div>
            </div>

            <div className="md:col-span-1 relative group overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-80 z-10" />
              <Image
                src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=960&q=80"
                alt="Cruisers"
                fill
                sizes={imageSizes.homeCategoryTile}
                quality={imageQuality.homeCategory}
                placeholder="blur"
                blurDataURL={defaultBlurDataURL}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute bottom-6 left-6 z-20">
                <h3 className="text-xl font-bold text-white mb-1">Cruisers</h3>
                <p className="text-slate-300 text-sm">Comfort & Style</p>
              </div>
            </div>

            <div className="md:col-span-1 grid grid-rows-2 gap-4">
              <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-80 z-10" />
                <Image
                  src="https://images.unsplash.com/photo-1621932906530-1c095c27633d?auto=format&fit=crop&w=960&q=80"
                  alt="Electric"
                  fill
                  sizes={imageSizes.homeCategoryTile}
                  quality={imageQuality.homeCategory}
                  placeholder="blur"
                  blurDataURL={defaultBlurDataURL}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute bottom-4 left-4 z-20">
                  <h3 className="text-lg font-bold text-white">Electric</h3>
                </div>
              </div>
              <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-80 z-10" />
                <Image
                  src="https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=960&q=80"
                  alt="Commuter"
                  fill
                  sizes={imageSizes.homeCategoryTile}
                  quality={imageQuality.homeCategory}
                  placeholder="blur"
                  blurDataURL={defaultBlurDataURL}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute bottom-4 left-4 z-20">
                  <h3 className="text-lg font-bold text-white">Commuter</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Local Verified Inventory (City-Wise Priority) */}
        {selectedCity && selectedCity !== "All India" && localListings.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <MapPin className="h-6 w-6 text-brand-500" />
                Bikes in <span className="text-brand-400">{selectedCity}</span>
              </h2>
              <Link href={`/listings?city=${selectedCity}`} className="text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1 transition-colors">
                View All in {selectedCity} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localListings.map((listing) => (
                <VerifiedListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </section>
        )}

        {/* Verified Inventory (Real Data - All India) */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-brand-500" />
              Latest Verified Inventory
            </h2>
            <Link href="/listings" className="text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1 transition-colors">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {realListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {realListings.map((listing) => (
                <VerifiedListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-12 text-center">
              <p className="text-slate-400">No verified listings available yet. Be the first to sell!</p>
              <Link href="/sell" className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500">
                Sell Your Bike
              </Link>
            </div>
          )}
        </section>

        {/* Live Auctions (Demo/Visual Only) */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <Flame className="h-6 w-6 text-accent-gold" />
              Live Auctions (Coming Soon)
            </h2>
            <Link href="/auctions" className="text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1 transition-colors">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Listings", value: "12,480+" },
            { label: "Verified Dealers", value: "860+" },
            { label: "Cities Covered", value: "42" },
            { label: "Auction Lots/Week", value: "320+" }
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-5 text-center">
              <p className="text-2xl font-bold text-white">{item.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">{item.label}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl premium-ring bg-gradient-to-r from-slate-900/70 to-slate-900/30 p-8 md:p-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-white">How Do Pahiyaa Works</h2>
            <Link href="/sell" className="text-brand-300 text-sm font-medium hover:text-brand-200">
              Start Listing
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <Search className="h-6 w-6 text-brand-400 mb-3" />
              <h3 className="text-white font-semibold mb-1">Discover & Compare</h3>
              <p className="text-sm text-slate-400">Filter by city, budget, model year and shortlist the right bike.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <Handshake className="h-6 w-6 text-brand-400 mb-3" />
              <h3 className="text-white font-semibold mb-1">Negotiate Securely</h3>
              <p className="text-sm text-slate-400">Use offer/counter-offer flow with controlled lead unlock in one place.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <FileCheck2 className="h-6 w-6 text-brand-400 mb-3" />
              <h3 className="text-white font-semibold mb-1">Close with Confidence</h3>
              <p className="text-sm text-slate-400">Verified documents, transparent price history, and trackable deal status.</p>
            </div>
          </div>
        </section>

        {/* Trust Markers */}
        <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/50 border border-white/5 p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <ShieldCheck className="h-64 w-64 text-white" />
          </div>

          <div className="relative z-10 grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                <ShieldCheck className="h-6 w-6 text-brand-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Verified Sellers</h3>
              <p className="text-slate-400">Every dealer is vetted. Every bike is inspected. No spam, no scams.</p>
            </div>
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-xl bg-accent-gold/10 flex items-center justify-center border border-accent-gold/20">
                <Zap className="h-6 w-6 text-accent-gold" />
              </div>
              <h3 className="text-xl font-bold text-white">Instant Finance</h3>
              <p className="text-slate-400">Get loan approvals in minutes from our partner banks.</p>
            </div>
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-xl bg-accent-green/10 flex items-center justify-center border border-accent-green/20">
                <Flame className="h-6 w-6 text-accent-green" />
              </div>
              <h3 className="text-xl font-bold text-white">Best Value</h3>
              <p className="text-slate-400">Our dynamic pricing engine ensures you get the fair market rate.</p>
            </div>
          </div>
        </section>

        {/* Recent Listings */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Fresh Arrivals</h2>
            <Link href="/search" className="text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1 transition-colors">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>

        {/* Internal Linking SEO Footprint (Popular Locations) */}
        <section className="pt-12 border-t border-white/5">
          <h3 className="text-white font-bold mb-8 uppercase tracking-widest text-xs opacity-50">Explore Popular Markets</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-4 gap-x-8">
            {[
              "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
              "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
              "Surat", "Kanpur", "Nagpur", "Indore", "Thane",
              "Bhopal", "Patna", "Vadodara", "Ghaziabad", "Ludhiana"
            ].map((city) => (
              <Link
                key={city}
                href={`/buy-used-bikes/${city.toLowerCase()}`}
                className="text-slate-500 hover:text-brand-400 text-sm transition-colors"
              >
                Used Bikes in {city}
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error("Home page crash:", error);
    // Absolute fallback if everything fails
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-slate-950">
        <Hero />
        <div className="mt-12 text-center">
          <p className="text-slate-400 mb-6 italic">Loading premium inventory...</p>
          <Link href="/sell" className="rounded-full bg-brand-600 px-8 py-3 font-bold text-white shadow-lg shadow-brand-500/20 hover:scale-105 transition-all">
            Post Your Bike
          </Link>
        </div>
      </div>
    );
  }
}
