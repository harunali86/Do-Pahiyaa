"use client";

import { useState, useEffect, useRef } from "react";
import {
    Clock,
    Gavel,
    AlertCircle,
    TrendingUp,
    MessageSquare,
    User,
    ChevronDown
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { toast } from "sonner";
import { formatDistanceToNow, isAfter } from "date-fns";

import { RealtimeChannel } from "@supabase/supabase-js";

interface Bid {
    id: string;
    amount: number;
    created_at: string;
    bidder_id: string;
    bidder?: { full_name: string };
    isOptimistic?: boolean;
}

interface Auction {
    id: string;
    current_highest_bid: number;
    start_price: number;
    min_bid_increment: number;
    min_increment?: number;
    end_time: string;
    highest_bidder_id?: string;
}

interface RealtimeAuctionEngineProps {
    auction: any;
}

export default function RealtimeAuctionEngine({ auction: initialAuction }: RealtimeAuctionEngineProps) {
    const [auction, setAuction] = useState<Auction>(initialAuction);
    const [bids, setBids] = useState<Bid[]>(initialAuction.bids || []);
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [isEndingSoon, setIsEndingSoon] = useState(false);
    const [isBidding, setIsBidding] = useState(false);
    const [user, setUser] = useState<any>(null);
    const supabase = createSupabaseBrowserClient();
    const bidContainerRef = useRef<HTMLDivElement>(null);

    const [status, setStatus] = useState<string>('CONNECTING');
    const [latency, setLatency] = useState<number>(0);
    const effectiveIncrement = auction.min_bid_increment || auction.min_increment || 500;

    // 1. Initial Setup & User Fetch
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };
        fetchUser();
    }, []);

    // 2. Realtime Subscriptions & Connection Health
    useEffect(() => {
        const startTime = Date.now();

        // A. Listen for Auction Updates
        const auctionChannel = supabase.channel(`auction_${auction.id}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'auctions', filter: `id=eq.${auction.id}` },
                (payload) => {
                    setAuction(prev => ({ ...prev, ...payload.new }));
                    setLatency(Date.now() - startTime); // Rough estimate of activity latency
                }
            )
            .subscribe((status) => {
                setStatus(status);
            });

        // B. Listen for New Bids
        const bidsChannel = supabase.channel(`bids_${auction.id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'bids', filter: `auction_id=eq.${auction.id}` },
                async (payload) => {
                    // Remove optimistic bid if it exists (by matching amount/bidder)
                    setBids((prev: Bid[]) => {
                        const filtered = prev.filter(b => !b.isOptimistic);

                        // Fetch profile for the new bidder
                        // NOTE: In a real high-freq scenario, we might skip this fetch and just show "Bidder X"
                        // or broadcast the profile in the payload via Edge Functions.
                        // For now, fast fetch:
                        return [{ ...payload.new, bidder: { full_name: "New Bidder" } } as Bid, ...filtered];
                    });

                    // Re-fetch profile in background to update name
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', payload.new.bidder_id)
                        .single();

                    if (profile) {
                        setBids(prev => prev.map(b =>
                            b.id === payload.new.id ? { ...b, bidder: profile } : b
                        ));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(auctionChannel);
            supabase.removeChannel(bidsChannel);
        };
    }, [auction.id]);

    // 3. Timer Logic
    useEffect(() => {
        const interval = setInterval(() => {
            if (!auction.end_time) return;

            const end = new Date(auction.end_time);
            const now = new Date();

            if (isAfter(now, end)) {
                setTimeLeft("Auction Ended");
                setIsEndingSoon(false);
                clearInterval(interval);
                return;
            }

            const diff = end.getTime() - now.getTime();
            const minutes = Math.floor(diff / 1000 / 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

            if (diff < 60000) { // Less than 1 minute
                setIsEndingSoon(true);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [auction.end_time]);

    // 4. Bidding Action with Optimistic Update
    const handlePlaceBid = async (amountAddition: number = 0) => {
        if (!user) {
            toast.error("Please login to place a bid");
            return;
        }

        const minRequired = (auction.current_highest_bid || auction.start_price || 0) + effectiveIncrement;
        const finalAmount = amountAddition > 0
            ? (auction.current_highest_bid || auction.start_price || 0) + amountAddition
            : minRequired;

        if (finalAmount < minRequired) {
            toast.error(`Minimum bid required is ₹${minRequired.toLocaleString()}`);
            return;
        }

        // OPTIMISTIC UPDATE
        const optimisticBid = {
            id: `temp-${Date.now()}`,
            amount: finalAmount,
            created_at: new Date().toISOString(),
            bidder_id: user.id,
            bidder: { full_name: user.user_metadata?.full_name || "You" },
            isOptimistic: true
        };

        setBids(prev => [optimisticBid, ...prev]);
        setAuction(prev => ({ ...prev, current_highest_bid: finalAmount })); // Optimistic price update
        setIsBidding(true);

        try {
            const { data, error } = await supabase.rpc("place_bid", {
                p_auction_id: auction.id,
                p_bidder_id: user.id,
                p_amount: finalAmount,
            });

            if (error) {
                throw new Error(error.message);
            }

            const result = data as { success?: boolean; message?: string } | null;
            if (!result?.success) {
                throw new Error(result?.message || "Failed to place bid");
            }

            toast.success("Bid Placed!");
            // The real subscription event will replace the optimistic one
        } catch (error: any) {
            toast.error(error.message || "Bidding failed");
            // Revert optimistic update on failure
            setBids(prev => prev.filter(b => b.id !== optimisticBid.id));
            setAuction(prev => ({ ...prev, current_highest_bid: initialAuction.current_highest_bid })); // Revert price (simplified)
        } finally {
            setIsBidding(false);
        }
    };

    const isHighestBidder = user?.id === auction.highest_bidder_id;

    return (
        <div className="flex flex-col gap-6 h-full">

            {/* Timer Card */}
            <div className={`glass-panel p-6 border transition-colors duration-500 ${isEndingSoon
                ? "border-red-500/30 bg-gradient-to-br from-slate-900 to-red-950/20 shadow-lg shadow-red-500/10"
                : "border-white/5 bg-slate-900/50"
                }`}>
                <div className="flex justify-between items-center mb-2">
                    <p className={`text-sm font-bold flex items-center gap-1.5 ${isEndingSoon ? "text-red-400 animate-pulse" : "text-brand-400"}`}>
                        <Clock className="h-4 w-4" /> {isEndingSoon ? "Final Countdown" : "Ending In"}
                    </p>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Auto-Extend On</span>
                </div>
                <p className={`text-5xl font-mono font-bold tracking-widest tabular-nums ${isEndingSoon ? "text-red-500" : "text-white"}`}>
                    {timeLeft || "Calculating..."}
                </p>
            </div>

            {/* Bidding Engine */}
            <div className="glass-panel p-6 border border-white/5 bg-slate-900/40 relative overflow-hidden group">
                {isHighestBidder && (
                    <div className="absolute top-0 right-0 p-2">
                        <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                            Winning Bid
                        </span>
                    </div>
                )}

                <p className="text-sm font-medium text-slate-400 text-center mb-1">Current Highest Bid</p>
                <div className="bg-slate-950/80 rounded-2xl py-6 text-center border border-white/10 mb-6 shadow-inner relative overflow-hidden">
                    <span className="text-4xl font-bold text-white tracking-tight drop-shadow-xl relative z-10">
                        {formatINR(auction.current_highest_bid || auction.start_price || 0)}
                    </span>
                    <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Quick Bid Increments */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {[1000, 2000].map(amt => (
                        <button
                            key={amt}
                            onClick={() => handlePlaceBid(amt)}
                            disabled={isBidding}
                            className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all border border-white/5 shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                        >
                            <span className="text-xs text-slate-400 font-medium group-hover/btn:text-white transition-colors">Add</span>
                            <br />
                            +{formatINR(amt)}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => handlePlaceBid()}
                    disabled={isBidding}
                    className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-lg shadow-xl shadow-brand-500/20 transition-all active:scale-95 relative overflow-hidden group flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {isBidding ? (
                        <TrendingUp className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <Gavel className="w-5 h-5" />
                            <span>Place Custom Bid</span>
                        </>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>

                <p className="text-[10px] text-center text-slate-500 mt-4 flex items-center justify-center gap-1.5 uppercase font-bold tracking-widest">
                    <AlertCircle className="h-3 w-3" />
                    Bids are binding & non-refundable
                </p>
            </div>

            {/* Live Bid Stream Internalized */}
            <div className="flex-1 min-h-0 flex flex-col glass-panel border border-white/5 bg-slate-950/50 backdrop-blur-xl overflow-hidden rounded-2xl">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-brand-400" /> Live Activity
                    </h3>
                    <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Realtime Feed</span>
                    </span>
                </div>

                <div
                    ref={bidContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth scrollbar-hide"
                >
                    {bids.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-3">
                            <Gavel className="w-8 h-8" />
                            <p className="text-xs font-medium">No bids received yet.<br />Be the first one!</p>
                        </div>
                    ) : (
                        bids.map((bid: any, idx: number) => (
                            <div
                                key={bid.id}
                                className={`flex items-start gap-3 p-3 rounded-xl border animate-in slide-in-from-right-4 duration-300 ${idx === 0 ? "bg-white/5 border-white/10" : "bg-transparent border-transparent"
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${idx === 0 ? 'bg-brand-500/20 text-brand-400' : 'bg-slate-800 text-slate-500'}`}>
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold text-white truncate max-w-[100px]">
                                            {bid.bidder?.full_name?.split(' ')[0]}...
                                        </p>
                                        <p className="text-[10px] text-slate-500">
                                            {formatDistanceToNow(new Date(bid.created_at))} ago
                                        </p>
                                    </div>
                                    <p className={`text-sm font-black mt-1 ${idx === 0 ? "text-brand-400" : "text-white/80"}`}>
                                        {formatINR(bid.amount)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-3 border-t border-white/5 bg-slate-900/30 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${status === 'SUBSCRIBED' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-[10px] uppercase font-bold text-slate-500">
                            {status === 'SUBSCRIBED' ? 'Live System' : status}
                        </span>
                    </div>
                    {status === 'SUBSCRIBED' && latency > 0 && (
                        <span className="text-[10px] font-mono text-slate-600">
                            {latency}ms
                        </span>
                    )}
                </div>
            </div>

        </div>
    );
}
