"use client";

import { demoAuctions } from "@/lib/demo/mock-data";
import AuctionCard from "@/components/auction/AuctionCard";
import { Search, SlidersHorizontal, ArrowUpRight } from "lucide-react";

export default function AuctionsPage() {
    const liveAuctions = demoAuctions.filter((a) => a.status === "live");
    const upcomingAuctions = demoAuctions.filter((a) => a.status === "scheduled");
    const endedAuctions = demoAuctions.filter((a) => a.status === "ended");

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Live Dealer Auctions
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        Bid on verified trade-in inventory in realtime. Exclusive access for registered dealers.
                    </p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search lots..."
                            className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-500/50"
                        />
                    </div>
                    <button className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors">
                        <SlidersHorizontal className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Live Section */}
            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <h2 className="text-2xl font-bold text-white">Live Now</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {liveAuctions.map((auction) => (
                        <AuctionCard key={auction.id} auction={auction} />
                    ))}
                </div>
            </section>

            {/* Upcoming Section */}
            <section className="mb-16">
                <h2 className="text-2xl font-bold text-white mb-6">Upcoming Lots</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingAuctions.map((auction) => (
                        <AuctionCard key={auction.id} auction={auction} />
                    ))}
                    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/20 flex flex-col items-center justify-center p-8 text-center group hover:border-brand-500/30 hover:bg-brand-500/5 transition-all">
                        <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ArrowUpRight className="h-6 w-6 text-slate-400 group-hover:text-brand-400" />
                        </div>
                        <h3 className="text-white font-semibold">View Full Schedule</h3>
                        <p className="text-slate-500 text-sm mt-1">14 more auctions today</p>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-white mb-6">Recently Closed</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {endedAuctions.map((auction) => (
                        <AuctionCard key={auction.id} auction={auction} />
                    ))}
                </div>
            </section>

        </div>
    );
}
