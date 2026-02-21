"use client";

import { useRef, useEffect } from "react";
import { formatINR } from "@/lib/utils";

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
                <div className="text-center py-10 opacity-50">
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-500">Auction not started yet</span>
                </div>
            </div>

            <div className="p-2 border-t border-white/5 bg-slate-900/30 text-center">
                <p className="text-xs text-slate-500">Live auction feature coming soon</p>
            </div>
        </div>
    );
}
