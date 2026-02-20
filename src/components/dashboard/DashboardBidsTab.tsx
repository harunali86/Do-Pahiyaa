"use client";

import { Gavel, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface DashboardBidsTabProps {
    bids: any[];
}

export default function DashboardBidsTab({ bids }: DashboardBidsTabProps) {
    if (bids.length === 0) {
        return (
            <div className="py-20 text-center opacity-40">
                <Gavel className="w-16 h-16 mx-auto mb-4" />
                <p className="text-xl font-bold">No active bids</p>
                <p className="text-sm mt-2">Check out the upcoming auctions and place your first bid!</p>
                <Link
                    href="/auctions"
                    className="mt-6 inline-flex items-center gap-2 text-brand-400 font-bold hover:underline"
                >
                    View Auctions <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {bids.map((bid) => (
                <div key={bid.id} className="glass-panel p-6 border border-white/5 bg-slate-900/30 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/10 transition-all group">
                    <div className="flex items-center gap-6">
                        <div className="h-24 w-24 rounded-2xl bg-slate-800 border border-white/5 overflow-hidden">
                            {bid.auction?.listing?.images?.[0] ? (
                                <img
                                    src={bid.auction.listing.images[0]}
                                    alt={bid.auction.listing.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-700">
                                    <Gavel className="w-8 h-8" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors">
                                {bid.auction?.listing?.title}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Bidded on {format(new Date(bid.created_at), 'dd MMM, yyyy')}
                                </span>
                                <span className="h-1 w-1 rounded-full bg-slate-700" />
                                <span className={`uppercase font-bold tracking-tighter ${bid.auction?.status === 'live' ? 'text-green-400' : 'text-slate-400'
                                    }`}>
                                    {bid.auction?.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-8">
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Your Bid</p>
                            <p className="text-xl font-bold text-brand-400">₹{bid.amount.toLocaleString()}</p>
                        </div>
                        <Link
                            href={`/auctions/${bid.auction_id}`}
                            className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl transition-all border border-white/10"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}
