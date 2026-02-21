"use client";

import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { defaultBlurDataURL, imageQuality, imageSizes } from "@/lib/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Hero() {
    const router = useRouter();
    const [query, setQuery] = useState("");

    const handleSearch = () => {
        if (query.trim()) {
            router.push(`/search?query=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <div className="group relative min-h-[620px] w-full overflow-hidden rounded-2xl mx-auto premium-ring bg-mesh">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                <Image
                    src="https://images.unsplash.com/photo-1558981806-ec527fa84f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                    alt="Premium bikes showcase"
                    fill
                    priority
                    unoptimized // Bypass server-side optimization to prevent timeouts in test
                    placeholder="blur"
                    blurDataURL={defaultBlurDataURL}
                    sizes={imageSizes.hero}
                    quality={imageQuality.hero}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/20" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col justify-center px-8 md:px-16 max-w-4xl">
                <div>
                    <span className="inline-block rounded-full bg-brand-500/10 px-4 py-1.5 text-sm font-semibold text-brand-300 border border-brand-500/20 backdrop-blur-md mb-6">
                        Do Pahiyaa • Verified Bikes & Trusted Deals
                    </span>

                    <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                        Find Your Dream Ride <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-gold">
                            Without the Hassle.
                        </span>
                    </h1>

                    <p className="text-lg text-slate-300 max-w-xl mb-8 leading-relaxed">
                        Certified pre-owned superbikes, cruisers, and daily commuters. Verified sellers, transparent deals, and instant financing options.
                    </p>

                    <div className="mb-8 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">12,000+ verified listings</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">140-point inspection support</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">Dealer + Individual sellers</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/search" className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-8 py-4 text-lg font-semibold text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/25 active:scale-95 group">
                            Browse Inventory
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>

                        <Link href="/sell" className="flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-8 py-4 text-lg font-semibold text-white hover:bg-white/10 backdrop-blur-md transition-all active:scale-95">
                            Sell Your Bike
                        </Link>
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-4 max-w-xl">
                        <div className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2">
                            <p className="text-lg font-bold text-white">4.8/5</p>
                            <p className="text-xs text-slate-400">Dealer rating</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2">
                            <p className="text-lg font-bold text-white">25K+</p>
                            <p className="text-xs text-slate-400">Monthly users</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2">
                            <p className="text-lg font-bold text-white">98%</p>
                            <p className="text-xs text-slate-400">Verified listings</p>
                        </div>
                    </div>

                    <p className="mt-4 text-xs uppercase tracking-wider text-slate-500">
                        Trusted by riders in Bengaluru, Delhi, Mumbai, Hyderabad, Pune & Chennai
                    </p>

                    <div className="mt-10 hidden md:flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md max-w-lg">
                        <Search className="h-5 w-5 text-slate-400 ml-3" />
                        <input
                            type="text"
                            placeholder="Search by brand, model, or keywords..."
                            className="bg-transparent border-none text-white placeholder:text-slate-400 focus:outline-none flex-1 py-2 px-2"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <button
                            onClick={handleSearch}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
