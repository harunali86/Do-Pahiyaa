import Link from "next/link";
import Image from "next/image";
import { Clock, Users, Gavel, ArrowRight } from "lucide-react";
import { defaultBlurDataURL, imageQuality, imageSizes } from "@/lib/image";
import { formatINR, cn } from "@/lib/utils";

type AuctionCardData = {
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

interface AuctionCardProps {
    auction: AuctionCardData;
}

export default function AuctionCard({ auction }: AuctionCardProps) {
    const isLive = auction.status === "live";
    const isEnded = auction.status === "ended";
    const countdownLabel = (() => {
        if (isEnded || auction.status === "cancelled") return "Closed";
        const targetTime = isLive ? auction.endTime : auction.startTime;
        if (!targetTime) return isLive ? "Live" : "Upcoming";
        const targetDate = new Date(targetTime);
        if (!Number.isFinite(targetDate.getTime())) return isLive ? "Live" : "Upcoming";
        const time = targetDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        return isLive ? `Ends ${time}` : `Starts ${time}`;
    })();

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-slate-900/50 border border-white/5 hover:border-brand-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/10">
            {/* Status Badge */}
            <div className="absolute top-3 left-3 z-10">
                <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-lg",
                    isLive
                        ? "bg-red-600 text-white animate-pulse"
                        : isEnded
                            ? "bg-slate-700 text-slate-200"
                        : "bg-slate-800 text-slate-300"
                )}>
                    {isLive && <span className="h-2 w-2 rounded-full bg-white animate-ping" />}
                    {auction.status}
                </span>
            </div>

            {/* Image */}
            <div className="relative aspect-video overflow-hidden">
                <Image
                    src={auction.imageUrl}
                    alt={auction.listingTitle}
                    fill
                    sizes={imageSizes.auctionCard}
                    quality={imageQuality.auctionCard}
                    placeholder="blur"
                    blurDataURL={defaultBlurDataURL}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent opacity-60" />

                {/* Timer Overlay */}
                <div className="absolute bottom-3 right-3 z-10">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white font-mono text-sm">
                        <Clock className="h-3.5 w-3.5 text-accent-gold" />
                        {countdownLabel}
                    </div>
                </div>
            </div>

            <div className="p-5">
                <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1 mb-1">
                    {auction.listingTitle}
                </h3>
                <p className="text-xs text-slate-500 mb-4 uppercase tracking-wider">
                    {auction.seller} • {auction.city}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <p className="text-xs text-slate-400 mb-0.5">Current Bid</p>
                        <p className="text-lg font-bold text-white tracking-tight">
                            {formatINR(auction.currentPrice)}
                        </p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <p className="text-xs text-slate-400 mb-0.5">Total Bids</p>
                        <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-brand-400" />
                            <p className="text-lg font-bold text-white">{auction.bids}</p>
                        </div>
                    </div>
                </div>

                <Link
                    href={`/auctions/${auction.id}`}
                    className={cn(
                        "flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all active:scale-95 shadow-lg",
                        isLive
                            ? "bg-red-600 hover:bg-red-500 text-white shadow-red-500/20"
                            : isEnded
                                ? "bg-slate-800 text-slate-300"
                                : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                    )}
                >
                    {isLive ? (
                        <>
                            <Gavel className="h-4 w-4" /> Join Auction
                        </>
                    ) : isEnded ? (
                        <>View Result</>
                    ) : (
                        <>
                            View Details <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </Link>
            </div>
        </div>
    );
}
