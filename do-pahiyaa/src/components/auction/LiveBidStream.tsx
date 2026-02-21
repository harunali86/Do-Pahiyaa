"use client";

import { useRef, useEffect } from "react";
import { formatINR } from "@/lib/utils";
import { liveBids } from "@/lib/demo/mock-data";

export default function LiveBidStream() {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of bid stream
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []);

    return (
        <div className="flex flex-col h-full min-h-[320px] glass-panel border border-white/5 relative overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Live Bid Feed
                </h3>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
                {/* Add some previous bids for context */}
                <div className="text-center py-4">
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-500">Auction Started at 10:00 AM</span>
                </div>

                {liveBids.map((bid) => (
                    <div key={bid.id} className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-300">
                            {bid.bidder.substring(0, 2)}
                        </div>
                        <div className="flex-1 bg-white/5 rounded-lg rounded-tl-none p-3 border border-white/5">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="text-sm font-semibold text-brand-300">{bid.bidder}</span>
                                <span className="text-xs text-slate-500 font-mono">{bid.timestamp}</span>
                            </div>
                            <p className="text-white font-bold">{formatINR(bid.amount)}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-2 border-t border-white/5 bg-slate-900/30 text-center">
                <p className="text-xs text-slate-500">Realtime feed demo (WebSocket in production)</p>
            </div>
        </div>
    );
}
