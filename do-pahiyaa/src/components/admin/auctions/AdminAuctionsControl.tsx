"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play, Pause, Flag, Ban, Loader2, Search, Gavel } from "lucide-react";
import { updateAuctionStatusAction } from "@/app/actions/admin";
import type { AuctionStatus } from "@/types/domain";

type AdminAuction = {
    id: string;
    status: string;
    title: string;
    city: string;
    startPrice: number;
    currentHighestBid: number | null;
    startTime: string;
    endTime: string;
    bidCount: number;
    highestBidderName: string | null;
};

interface AdminAuctionsControlProps {
    initialAuctions: AdminAuction[];
}

const STATUS_OPTIONS = ["all", "scheduled", "live", "paused", "ended", "cancelled"] as const;

const getStatusBadgeClass = (status: string) => {
    if (status === "live") return "bg-green-500/10 text-green-400 border-green-500/20";
    if (status === "paused") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    if (status === "ended") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (status === "cancelled") return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    return "bg-slate-700/50 text-slate-300 border-slate-600";
};

export function AdminAuctionsControl({ initialAuctions }: AdminAuctionsControlProps) {
    const [auctions, setAuctions] = useState(initialAuctions);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>("all");
    const [pendingId, setPendingId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const filteredAuctions = useMemo(() => {
        return auctions.filter((auction) => {
            const matchesStatus = statusFilter === "all" || auction.status === statusFilter;
            const q = search.trim().toLowerCase();
            const matchesSearch = !q
                || auction.title.toLowerCase().includes(q)
                || auction.city.toLowerCase().includes(q);
            return matchesStatus && matchesSearch;
        });
    }, [auctions, search, statusFilter]);

    const handleStatusChange = (auctionId: string, nextStatus: AuctionStatus) => {
        setPendingId(auctionId);
        startTransition(async () => {
            const result = await updateAuctionStatusAction(auctionId, nextStatus);
            if (result.success) {
                setAuctions((prev) => prev.map((item) => (
                    item.id === auctionId ? { ...item, status: nextStatus } : item
                )));
                toast.success(`Auction marked as ${nextStatus}`);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update auction status");
            }
            setPendingId(null);
        });
    };

    const isRowLoading = (auctionId: string) => isPending && pendingId === auctionId;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Auction Control</h1>
                <p className="text-slate-400">Manage start, pause, end, and cancel actions for live auction operations.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by bike title or city..."
                        className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-500/40"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {STATUS_OPTIONS.map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors whitespace-nowrap ${
                                statusFilter === status
                                    ? "bg-brand-600 text-white"
                                    : "bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800"
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass-panel border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-500 border-b border-white/5">
                                <th className="py-3 px-4">Auction</th>
                                <th className="py-3 px-4">Start / Current</th>
                                <th className="py-3 px-4">Bids</th>
                                <th className="py-3 px-4">Timeline</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredAuctions.map((auction) => (
                                <tr key={auction.id} className="hover:bg-white/[0.02]">
                                    <td className="py-4 px-4">
                                        <p className="font-semibold text-white">{auction.title}</p>
                                        <p className="text-xs text-slate-500">{auction.city}</p>
                                    </td>
                                    <td className="py-4 px-4 text-sm">
                                        <p className="text-slate-300">₹{Math.round(auction.startPrice).toLocaleString("en-IN")}</p>
                                        <p className="text-brand-400 font-semibold">
                                            ₹{Math.round(auction.currentHighestBid || auction.startPrice).toLocaleString("en-IN")}
                                        </p>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-slate-300">
                                        <p className="font-semibold">{auction.bidCount}</p>
                                        <p className="text-xs text-slate-500 truncate max-w-[180px]">
                                            {auction.highestBidderName || "No highest bidder yet"}
                                        </p>
                                    </td>
                                    <td className="py-4 px-4 text-xs text-slate-400">
                                        <p>Start: {new Date(auction.startTime).toLocaleString()}</p>
                                        <p>End: {new Date(auction.endTime).toLocaleString()}</p>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wide border ${getStatusBadgeClass(auction.status)}`}>
                                            {auction.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex justify-end flex-wrap gap-2">
                                            {auction.status !== "live" && auction.status !== "ended" && auction.status !== "cancelled" && (
                                                <button
                                                    onClick={() => handleStatusChange(auction.id, "live")}
                                                    disabled={isRowLoading(auction.id)}
                                                    className="h-8 px-3 rounded-md bg-green-600/90 hover:bg-green-500 text-white text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-1.5"
                                                >
                                                    {isRowLoading(auction.id) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                                                    Start
                                                </button>
                                            )}
                                            {auction.status === "live" && (
                                                <button
                                                    onClick={() => handleStatusChange(auction.id, "paused")}
                                                    disabled={isRowLoading(auction.id)}
                                                    className="h-8 px-3 rounded-md bg-amber-600/90 hover:bg-amber-500 text-white text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-1.5"
                                                >
                                                    {isRowLoading(auction.id) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pause className="h-3.5 w-3.5" />}
                                                    Pause
                                                </button>
                                            )}
                                            {auction.status !== "ended" && auction.status !== "cancelled" && (
                                                <button
                                                    onClick={() => handleStatusChange(auction.id, "ended")}
                                                    disabled={isRowLoading(auction.id)}
                                                    className="h-8 px-3 rounded-md bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-1.5"
                                                >
                                                    {isRowLoading(auction.id) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Flag className="h-3.5 w-3.5" />}
                                                    End
                                                </button>
                                            )}
                                            {auction.status !== "cancelled" && auction.status !== "ended" && (
                                                <button
                                                    onClick={() => handleStatusChange(auction.id, "cancelled")}
                                                    disabled={isRowLoading(auction.id)}
                                                    className="h-8 px-3 rounded-md bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-1.5"
                                                >
                                                    {isRowLoading(auction.id) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredAuctions.length === 0 && (
                    <div className="py-16 text-center text-slate-500">
                        <Gavel className="h-10 w-10 mx-auto mb-3 text-slate-700" />
                        <p>No auctions found for current filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
