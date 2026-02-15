import { notFound } from "next/navigation";
import Image from "next/image";
import {
    ArrowLeft,
    Clock,
    MapPin,
    ShieldCheck,
    AlertCircle,
    Play,
    Maximize2,
    Volume2,
    Users
} from "lucide-react";
import { demoAuctions } from "@/lib/demo/mock-data";
import LiveBidStream from "@/components/auction/LiveBidStream";
import { formatINR } from "@/lib/utils";
import { defaultBlurDataURL, imageQuality, imageSizes } from "@/lib/image";
import Link from "next/link";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AuctionRoomPage({ params }: PageProps) {
    const { id } = await params;
    const auction = demoAuctions.find((a) => a.id === id);

    if (!auction) {
        notFound();
    }
    const isReserveMet = auction.currentPrice >= auction.reservePrice;

    return (
        <div className="min-h-screen pb-12">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between mb-6">
                <Link href="/auctions" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Auction Lobby
                </Link>
                <div className="flex items-center gap-3">
                    <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-red-400 font-bold uppercase tracking-wider text-sm">Live Connection Stable</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100dvh-140px)]">

                {/* Main Content: Video Feed & Stats */}
                <div className="lg:col-span-2 flex flex-col gap-6 h-full">
                    {/* Video Player Placeholder */}
                    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group flex-shrink-0">
                        <Image
                            src={auction.imageUrl}
                            alt={`${auction.listingTitle} live auction feed`}
                            fill
                            sizes={imageSizes.auctionRoom}
                            quality={imageQuality.auctionRoom}
                            priority
                            placeholder="blur"
                            blurDataURL={defaultBlurDataURL}
                            className="h-full w-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                        {/* Live UI Overlay */}
                        <div className="absolute top-4 left-4 flex gap-3">
                            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Live
                            </span>
                            <span className="bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1.5 border border-white/10">
                                <Users className="h-3 w-3" /> 142 Viewers
                            </span>
                        </div>

                        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{auction.listingTitle}</h1>
                                <p className="text-slate-300 text-sm flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5" /> {auction.city} • <ShieldCheck className="h-3.5 w-3.5 text-brand-400" /> Verified {auction.seller}
                                </p>
                            </div>

                            {/* Player Controls */}
                            <div className="flex gap-2">
                                <button
                                    aria-label="Toggle auction room audio"
                                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
                                >
                                    <Volume2 className="h-4 w-4" />
                                </button>
                                <button
                                    aria-label="Toggle full screen"
                                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
                                >
                                    <Maximize2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                <Play className="h-6 w-6 text-white fill-white ml-1" />
                            </div>
                        </div>
                    </div>

                    {/* Stats / Graph Area */}
                    <div className="flex-1 glass-panel p-6 border border-white/5 flex gap-8">
                        <div className="flex-1 space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase">Auction Stats</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                                    <p className="text-xs text-slate-500 mb-1">Floor Price</p>
                                    <p className="text-lg font-bold text-white">{formatINR(auction.startPrice)}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                                    <p className="text-xs text-slate-500 mb-1">Reserve Price</p>
                                    <p className="text-lg font-bold text-white flex items-center gap-1.5">
                                        <span className={`h-2 w-2 rounded-full ${isReserveMet ? "bg-green-500" : "bg-amber-500"}`} />
                                        {isReserveMet ? "Met" : "Pending"}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                                    <p className="text-xs text-slate-500 mb-1">Min Increment</p>
                                    <p className="text-lg font-bold text-white">+{formatINR(auction.minIncrement)}</p>
                                </div>
                            </div>

                            {/* Mock Graph Visual */}
                            <div className="h-24 w-full bg-slate-900/30 rounded-xl border border-white/5 relative overflow-hidden flex items-end px-2 gap-1 mt-4">
                                {[40, 60, 45, 70, 85, 65, 90, 75, 55, 80, 95, 100].map((h, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-brand-500/20 rounded-t-sm hover:bg-brand-500/40 transition-colors"
                                        style={{ height: `${h}%` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Bidding Engine */}
                <div className="lg:col-span-1 flex flex-col gap-6 h-full">
                    {/* Timer Card */}
                    <div className="glass-panel p-6 border border-white/5 bg-gradient-to-br from-slate-900 to-red-900/10">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-sm font-medium text-red-400 flex items-center gap-1.5">
                                <Clock className="h-4 w-4" /> Ending In
                            </p>
                            <span className="text-xs text-slate-500">Auto-extend active</span>
                        </div>
                        <p className="text-4xl font-mono font-bold text-white tracking-widest tabular-nums">
                            02:14
                        </p>
                    </div>

                    {/* Current Price & Controls */}
                    <div className="glass-panel p-6 border border-white/5 flex-shrink-0">
                        <p className="text-sm font-medium text-slate-400 text-center mb-1">Current Highest Bid</p>
                        <div className="bg-slate-950 rounded-xl py-4 text-center border border-white/10 mb-6 shadow-inner">
                            <span className="text-4xl font-bold text-white tracking-tight">{formatINR(auction.currentPrice)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button className="py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors border border-white/5 shadow-lg active:scale-95">
                                +{formatINR(2000)}
                            </button>
                            <button className="py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors border border-white/5 shadow-lg active:scale-95">
                                +{formatINR(5000)}
                            </button>
                        </div>

                        <button className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-lg shadow-xl shadow-brand-500/20 transition-all active:scale-95 relative overflow-hidden group">
                            <span className="relative z-10">Place Bid Now</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </button>

                        <p className="text-xs text-center text-slate-500 mt-4 flex items-center justify-center gap-1.5">
                            <AlertCircle className="h-3 w-3" />
                            Anti-sniping extension enabled in last 30s
                        </p>
                    </div>

                    {/* Bid Stream Feed */}
                    <div className="flex-1 min-h-0">
                        <LiveBidStream />
                    </div>
                </div>
            </div>
        </div>
    );
}
