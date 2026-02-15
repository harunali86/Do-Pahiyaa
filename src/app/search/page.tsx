"use client";

import { useState } from "react";
import { Filter, Map as MapIcon, List, ChevronDown, Check } from "lucide-react";
import ListingCard from "@/components/marketplace/ListingCard";
import { demoListings } from "@/lib/demo/mock-data";
import { cn } from "@/lib/utils";

export default function SearchPage() {
    const [viewMode, setViewMode] = useState<"list" | "map">("list");
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Mock filters
    const brands = ["Royal Enfield", "KTM", "Honda", "Yamaha", "Ather", "TVS"];
    const cities = ["Bengaluru", "Delhi", "Mumbai", "Pune", "Hyderabad", "Chennai"];
    const featuredFilters = ["Budget < ₹2L", "Single Owner", "ABS", "Top Rated"];
    const visibleListings = [
        ...demoListings,
        ...demoListings.map((listing, idx) => ({
            ...listing,
            id: `${listing.id}-v${idx + 1}`,
            price: listing.price + (idx + 1) * 3500,
            kms: listing.kms + (idx + 1) * 420
        }))
    ];

    return (
        <div className="min-h-screen pb-20">
            {/* Search Header */}
            <div className="sticky top-16 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-4 mb-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Find Your Ride</h1>
                        <p className="text-slate-400 text-sm">Showing {visibleListings.length} curated results across metro cities</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setShowMobileFilters((prev) => !prev)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors border border-white/5 md:hidden"
                        >
                            <Filter className="h-4 w-4" /> Filters
                        </button>

                        <div className="flex bg-slate-800 rounded-lg p-1 border border-white/5">
                            <button
                                onClick={() => setViewMode("list")}
                                aria-label="Switch to list view"
                                aria-pressed={viewMode === "list"}
                                className={cn(
                                    "p-2 rounded-md transition-all",
                                    viewMode === "list" ? "bg-slate-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                                )}
                            >
                                <List className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("map")}
                                aria-label="Switch to map view"
                                aria-pressed={viewMode === "map"}
                                className={cn(
                                    "p-2 rounded-md transition-all",
                                    viewMode === "map" ? "bg-slate-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                                )}
                            >
                                <MapIcon className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="relative group">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors border border-white/5">
                                Sort by: Newest <ChevronDown className="h-4 w-4 text-slate-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showMobileFilters && (
                <div className="lg:hidden mb-6 rounded-2xl border border-white/10 bg-slate-900/70 p-5 space-y-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-white">Filters</h2>
                        <button
                            onClick={() => setShowMobileFilters(false)}
                            className="text-xs text-brand-300 hover:text-brand-200"
                        >
                            Close
                        </button>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price Range</h3>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <input type="number" placeholder="Min" className="w-full bg-slate-950 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-500/50 text-sm" />
                            <span>-</span>
                            <input type="number" placeholder="Max" className="w-full bg-slate-950 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-500/50 text-sm" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Brand</h3>
                        <div className="flex flex-wrap gap-2">
                            {brands.map((brand) => (
                                <button
                                    key={brand}
                                    className="rounded-full border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-slate-200"
                                >
                                    {brand}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <button className="rounded-lg border border-white/10 bg-white/5 py-2 text-sm text-slate-200">Reset</button>
                        <button className="rounded-lg border border-brand-500/20 bg-brand-600 py-2 text-sm font-semibold text-white">Apply Filters</button>
                    </div>
                </div>
            )}

            <div className="mb-6 flex flex-wrap gap-2">
                {featuredFilters.map((filter) => (
                    <button
                        key={filter}
                        className="rounded-full border border-white/10 bg-slate-900/40 px-3 py-1.5 text-xs text-slate-200 hover:border-brand-500/30"
                    >
                        {filter}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <div className="hidden lg:block lg:col-span-1 space-y-8 sticky top-36 h-fit bg-slate-900/20 p-6 rounded-2xl border border-white/5">
                    {/* Price Range */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price Range</h3>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <input type="number" placeholder="Min" className="w-full bg-slate-950 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-500/50 text-sm" />
                            <span>-</span>
                            <input type="number" placeholder="Max" className="w-full bg-slate-950 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-500/50 text-sm" />
                        </div>
                    </div>

                    <div className="h-px w-full bg-white/5" />

                    {/* Brand Filter */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Brand</h3>
                        <div className="space-y-3">
                            {brands.map((brand) => (
                                <label key={brand} className="flex items-center gap-3 cursor-pointer group hover:bg-white/5 p-2 rounded-lg transition-colors -mx-2">
                                    <div className="h-4 w-4 rounded bg-slate-800 border border-white/10 flex items-center justify-center group-hover:border-brand-500/50 transition-colors">
                                        <Check className="h-3 w-3 text-brand-500 opacity-0 bg-transparent group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="text-slate-300 text-sm group-hover:text-white transition-colors">{brand}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="h-px w-full bg-white/5" />

                    {/* City Filter */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">City</h3>
                        <div className="space-y-3">
                            {cities.map((city) => (
                                <label key={city} className="flex items-center gap-3 cursor-pointer group hover:bg-white/5 p-2 rounded-lg transition-colors -mx-2">
                                    <div className="h-4 w-4 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center group-hover:border-brand-500/50 transition-colors">
                                        <div className="h-2 w-2 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="text-slate-300 text-sm group-hover:text-white transition-colors">{city}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="lg:col-span-3">
                    {viewMode === "list" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {visibleListings.map((listing) => (
                                <ListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    ) : (
                        <div className="h-[600px] rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center relative overflow-hidden group">
                            <div className="bg-slate-950/80 backdrop-blur-md p-8 rounded-2xl border border-white/10 text-center relative z-10 max-w-sm shadow-2xl">
                                <MapIcon className="h-16 w-16 text-brand-500 mx-auto mb-6 bg-brand-500/10 p-4 rounded-full border border-brand-500/20" />
                                <h3 className="text-2xl font-bold text-white mb-3">Interactive Map View</h3>
                                <p className="text-slate-400 mb-8 leading-relaxed">Map integration requires Google Maps API key configuration. Currently showing planned listing density in Metro areas.</p>
                                <button onClick={() => setViewMode("list")} className="w-full px-6 py-3 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/20 active:scale-95">
                                    Switch to List View
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
