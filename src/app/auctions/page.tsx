import AuctionCard from "@/components/auction/AuctionCard";
import { Search, SlidersHorizontal, ArrowUpRight } from "lucide-react";
import { AuctionService } from "@/lib/services/auction.service";

export const dynamic = "force-dynamic";

type AuctionCardModel = {
    id: string;
    status: string;
    listingTitle: string;
    seller: string;
    city: string;
    currentPrice: number;
    bids: number;
    imageUrl: string;
    startTime?: string | null;
    endTime?: string | null;
};

export default async function AuctionsPage() {
    let auctionCards: AuctionCardModel[] = [];
    try {
        const liveAuctions = await AuctionService.getAuctions();
        auctionCards = (liveAuctions || []).map((auction: any) => ({
            id: auction.id,
            status: auction.status || "scheduled",
            listingTitle: auction.listing?.title || "Untitled Auction",
            seller: auction.highest_bidder?.full_name || "Verified Seller",
            city: auction.listing?.city || "Unknown",
            currentPrice: Number(auction.current_highest_bid || auction.start_price || 0),
            bids: Number(auction.bids_count || 0),
            imageUrl: auction.listing?.images?.[0] || "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=2940&auto=format&fit=crop",
            startTime: auction.start_time,
            endTime: auction.end_time
        }));
    } catch (error) {
        console.error("Auctions page fetch failed:", error);
    }

    const liveAuctions = auctionCards.filter((a) => a.status === "live");
    const upcomingAuctions = auctionCards.filter((a) => a.status === "scheduled" || a.status === "paused");
    const endedAuctions = auctionCards.filter((a) => a.status === "ended" || a.status === "cancelled");

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
                    {liveAuctions.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/20 p-8 text-center md:col-span-2 lg:col-span-3">
                            <p className="text-slate-400 text-sm">No live auctions currently. Check upcoming lots.</p>
                        </div>
                    )}
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
                    {endedAuctions.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/20 p-8 text-center md:col-span-2 lg:col-span-3">
                            <p className="text-slate-500 text-sm">No settled/closed auctions yet.</p>
                        </div>
                    )}
                </div>
            </section>

        </div>
    );
}
