export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Trophy, Download } from "lucide-react";
import { AuctionService } from "@/lib/services/auction.service";
import { formatINR } from "@/lib/utils";

interface AuctionResultPageProps {
    params: Promise<{ id: string }>;
}

export default async function AuctionResultPage({ params }: AuctionResultPageProps) {
    const { id } = await params;

    let auction: any;
    try {
        auction = await AuctionService.getAuctionDetailWithBids(id);
    } catch {
        notFound();
    }

    if (!auction) {
        notFound();
    }

    const highestBid = Number(auction.current_highest_bid || auction.start_price || 0);
    const buyerPremiumRate = 0.05;
    const buyerPremium = Math.round(highestBid * buyerPremiumRate);
    const totalPayable = highestBid + buyerPremium;
    const topBid = (auction.bids || []).reduce((best: any, bid: any) => {
        if (!best) return bid;
        if (Number(bid.amount || 0) > Number(best.amount || 0)) return bid;
        return best;
    }, null as any);
    const winnerName = topBid?.bidder?.full_name || "Winning bidder";
    const imageUrl = auction.listing?.images?.[0] || "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=2940&auto=format&fit=crop";

    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
            <div className="w-full max-w-lg text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-yellow-500/40">
                    <Trophy className="w-12 h-12 text-white" />
                </div>

                <h1 className="text-4xl font-black text-white mb-2">Auction Closed</h1>
                <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                    Winner: <strong className="text-white">{winnerName}</strong>
                </p>

                <div className="bg-glass-gradient border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl mb-8 text-left">
                    <div className="flex gap-4 items-center mb-6 border-b border-white/5 pb-6">
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 relative">
                            <Image src={imageUrl} alt="Auction bike" fill className="object-cover" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">{auction.listing?.title || "Auction Lot"}</h3>
                            <p className="text-xs text-slate-500">Auction #{auction.id}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Winning Bid</span>
                            <span className="text-white font-bold text-lg">{formatINR(highestBid)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Buyer Premium (5%)</span>
                            <span className="text-slate-300">{formatINR(buyerPremium)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm pt-4 border-t border-white/5">
                            <span className="text-white font-bold">Total Payable</span>
                            <span className="text-brand-400 font-mono font-bold text-xl">{formatINR(totalPayable)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 flex-col sm:flex-row">
                    <button className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/20 active:scale-95 transition-all flex justify-center items-center gap-2">
                        <Download className="w-5 h-5" /> Download Invoice
                    </button>
                    <Link href="/dashboard" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3.5 rounded-xl transition-all flex justify-center items-center gap-2">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
