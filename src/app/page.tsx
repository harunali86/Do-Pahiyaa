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

    // Absolute Safety Normalization
    const normalizeListings = (items: any[]) => {
      if (!Array.isArray(items)) return [];
      return items.map((l: any) => ({
        ...l,
        id: l.id || Math.random().toString(),
        title: l.title || "Premium Bike",
        price: Number(l.price) || 0,
        kms_driven: Number(l.kms_driven ?? l.kms) || 0,
        year: l.year || 2023,
        city: l.city || "India",
        make: l.make || l.brand || "Bike",
        model: l.model || "",
        images: Array.isArray(l.images) ? l.images : (l.imageUrl ? [l.imageUrl] : []),
        seller: (Array.isArray(l.seller) ? l.seller[0] : l.seller) || { full_name: "Verified Seller", is_verified: true },
      }));
    };

    // 1. Fetch with absolute safety
    let displayListings: any[] = [];
    try {
      const { listings: dbListings } = await ListingService.getListings({ limit: 12 }).catch(() => ({ listings: [] }));
      const normalizedMock = normalizeListings(demoListings);
      const normalizedReal = normalizeListings(dbListings || []);
      displayListings = [...normalizedReal, ...normalizedMock];
    } catch (e) {
      console.error("Home Data Fetch Error:", e);
      displayListings = normalizeListings(demoListings);
    }

    const featuredListings = displayListings.slice(0, 6);
    const recentListings = displayListings.slice(6, 12);
    let localListings: any[] = [];

    if (selectedCity && selectedCity !== "All India") {
      localListings = displayListings.filter(l => l.city === selectedCity).slice(0, 6);
    }

    return (
      <div className="space-y-16 pb-20">
        {/* Step 1: Hero */}
        <Hero />

        {/* Step 2: Search by Categories (Bikewale Style) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900/30 rounded-3xl p-8 border border-white/5 premium-ring">
            <h2 className="text-xl font-bold text-white mb-8 border-l-4 border-brand-500 pl-4">FIND YOUR BIKE</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* By Brand */}
              <div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Popular Brands</h3>
                <div className="grid grid-cols-3 gap-4">
                  {["Royal Enfield", "KTM", "Yamaha", "Honda", "Bajaj", "TVS"].map(brand => (
                    <Link key={brand} href={`/search?brand=${brand}`} className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-3 text-center transition-all group">
                      <p className="text-sm font-medium text-slate-300 group-hover:text-brand-400">{brand}</p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* By Budget */}
              <div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">By Budget</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Under 1 Lakh", val: "100000" },
                    { label: "1L - 2L", val: "200000" },
                    { label: "2L - 5L", val: "500000" },
                    { label: "Above 5L", val: "1000000" }
                  ].map(b => (
                    <Link key={b.label} href={`/search?maxPrice=${b.val}`} className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 text-center hover:border-brand-500/30 transition-all">
                      {b.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* By Style */}
              <div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">By Style</h3>
                <div className="grid grid-cols-2 gap-3">
                  {["Cruiser", "Sports", "Adventure", "Commuter"].map(style => (
                    <Link key={style} href={`/search?style=${style}`} className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 text-center hover:border-brand-500/30 transition-all">
                      {style}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3: Latest Inventory */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Superbikes for You</h2>
              <p className="text-slate-500 text-sm mt-1">Direct from verified owners & dealers</p>
            </div>
            <Link href="/search" className="text-brand-400 hover:text-brand-300 text-sm font-bold uppercase tracking-widest">
              View All &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredListings.map(listing => (
              <VerifiedListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>

        {/* Step 4: Local Priority (Bikewale uses location heavily) */}
        {localListings.length > 0 && (
          <section className="bg-slate-900/40 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-emerald-500 pl-4 uppercase tracking-tighter">
                Popular in <span className="text-emerald-400">{selectedCity}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {localListings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Step 5: Trust Banners */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-white/5">
              <ShieldCheck className="h-10 w-10 text-brand-400 mb-6" />
              <h3 className="text-lg font-bold text-white mb-2 uppercase italic">Verified Only</h3>
              <p className="text-slate-500 text-sm leading-relaxed">No duplicate entries or fake ads. Every listing is screened by our team.</p>
            </div>
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-white/5">
              <Zap className="h-10 w-10 text-accent-gold mb-6" />
              <h3 className="text-lg font-bold text-white mb-2 uppercase italic">Instant Quote</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Get the best on-road price estimates and financing options immediately.</p>
            </div>
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-white/5">
              <MapPin className="h-10 w-10 text-emerald-400 mb-6" />
              <h3 className="text-lg font-bold text-white mb-2 uppercase italic">Local Presence</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Serving 42+ cities across India with local dealership support.</p>
            </div>
          </div>
        </section>

        {/* Step 6: SEO Footer (Popular Markets) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 border-t border-white/5">
          <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-10">Popular Used Bike Markets</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {["Mumbai", "Delhi", "Pune", "Bengaluru", "Hyderabad", "Chennai", "Ahmedabad", "Jaipur", "Kochi", "Lucknow"].map(city => (
              <Link key={city} href={`/search?city=${city}`} className="text-slate-600 hover:text-brand-400 text-xs transition-colors">
                Used Bikes in {city}
              </Link>
            ))}
          </div>
        </section>
      </div>
    );

  } catch (error) {
    console.error("Home Critical Error:", error);
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
        <Link href="/search" className="bg-brand-600 text-white px-8 py-3 rounded-full font-bold shadow-2xl">
          Explore Marketplace
        </Link>
      </div>
    );
  }
}
