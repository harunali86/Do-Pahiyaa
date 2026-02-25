import { notFound } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
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
import { format } from "date-fns";
import { AuctionService } from "@/lib/services/auction.service";
import { formatINR } from "@/lib/utils";
import { defaultBlurDataURL, imageQuality, imageSizes } from "@/lib/image";
import Link from "next/link";

const RealtimeAuctionEngine = dynamic(
    () => import("@/components/auction/RealtimeAuctionEngine"),
    {
        loading: () => (
            <div className="glass-panel border border-white/5 p-6 h-full animate-pulse">
                <div className="h-8 bg-slate-800 rounded w-3/4 mb-4" />
                <div className="h-12 bg-slate-800 rounded mb-4" />
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-6 bg-slate-800 rounded" />
                    ))}
                </div>
            </div>
        )
    }
);

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AuctionRoomPage({ params }: PageProps) {
    const { id } = await params;

    let auctionData;
    try {
        auctionData = await AuctionService.getAuctionDetailWithBids(id);
    } catch (e) {
        notFound();
    }

    if (!auctionData) {
        notFound();
    }

    const isReserveMet = (auctionData.current_highest_bid || 0) >= (auctionData.reserve_price || 0);
    const imageUrl = auctionData.listing?.images?.[0] || "/placeholder-bike.jpg";
    const effectiveMinIncrement = auctionData.min_bid_increment || auctionData.min_increment || 500;

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
                            src={imageUrl}
                            alt={`${auctionData.listing?.title} live auction feed`}
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
                                <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{auctionData.listing?.title}</h1>
                                <p className="text-slate-300 text-sm flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5" /> {auctionData.listing?.city} • <ShieldCheck className="h-3.5 w-3.5 text-brand-400" /> Verified Deal
                                </p>
                            </div>

                            {/* Player Controls */}
                            <div className="flex gap-2">
                                <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors">
                                    <Volume2 className="h-4 w-4" />
                                </button>
                                <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors">
                                    <Maximize2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 glass-panel p-6 border border-white/5 flex gap-8">
                        <div className="flex-1 space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase">Auction Stats</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                                    <p className="text-xs text-slate-500 mb-1">Floor Price</p>
                                    <p className="text-lg font-bold text-white">{formatINR(auctionData.start_price || 0)}</p>
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
                                    <p className="text-lg font-bold text-white">+{formatINR(effectiveMinIncrement)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Integrated Realtime Engine */}
                <div className="lg:col-span-1">
                    <RealtimeAuctionEngine auction={auctionData} />
                </div>
            </div>
        </div>
    );
}
