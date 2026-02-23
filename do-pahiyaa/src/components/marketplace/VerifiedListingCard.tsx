"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Gauge, Calendar, ShieldCheck, CheckCircle2, GitCompare } from "lucide-react";
import { formatINR, cn } from "@/lib/utils";
import { defaultBlurDataURL, imageQuality, imageSizes } from "@/lib/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Lean type matching LISTING_CARD_SELECT — only what the card renders
type ListingCardData = {
    id: string;
    title: string;
    make: string;
    model: string;
    year: number;
    price: number;
    kms_driven: number;
    city: string;
    images: string[] | null;
    status: string;
    is_company_listing: boolean;
    created_at: string;
    seller: {
        full_name: string | null;
        avatar_url: string | null;
        is_verified: boolean;
    } | null;
};

interface VerifiedListingCardProps {
    listing: ListingCardData;
}

const FALLBACK_VERIFIED_IMAGE =
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80";

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

export default function VerifiedListingCard({ listing }: VerifiedListingCardProps) {
    const [isCompared, setIsCompared] = useState(false);

    useEffect(() => {
        const checkCompare = () => {
            const stored = localStorage.getItem('compare_bikes');
            if (stored) {
                const ids = JSON.parse(stored);
                setIsCompared(ids.includes(listing.id));
            } else {
                setIsCompared(false);
            }
        };

        checkCompare();
        window.addEventListener('comparison_updated', checkCompare);
        return () => window.removeEventListener('comparison_updated', checkCompare);
    }, [listing.id]);

    const toggleCompare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const stored = localStorage.getItem('compare_bikes');
        const current = stored ? JSON.parse(stored) : [];

        if (isCompared) {
            const newIds = current.filter((id: string) => id !== listing.id);
            localStorage.setItem('compare_bikes', JSON.stringify(newIds));
            toast.info("Removed from comparison");
        } else {
            if (current.length >= 3) {
                toast.error("Max 3 bikes allowed for comparison");
                return;
            }
            localStorage.setItem('compare_bikes', JSON.stringify([...current, listing.id]));
            toast.success("Added to comparison");
        }

        window.dispatchEvent(new Event('comparison_updated'));
    };

    const normalizedImages = Array.isArray(listing.images)
        ? listing.images.filter(isNonEmptyString)
        : [];
    const imageUrl = normalizedImages[0] ?? FALLBACK_VERIFIED_IMAGE;

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-slate-900/50 border border-brand-500/20 hover:border-brand-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/10">
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden">
                {/* Verified Badge */}
                <div className="absolute top-3 left-3 z-10 flex gap-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-brand-500/20 border border-brand-500/30 text-brand-300 backdrop-blur-md flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                    </span>
                </div>

                <Image
                    src={imageUrl}
                    alt={listing.title}
                    fill
                    sizes={imageSizes.listingCard}
                    quality={imageQuality.listingCard}
                    placeholder="blur"
                    blurDataURL={defaultBlurDataURL}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent opacity-60" />
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-brand-400 transition-colors line-clamp-1">
                            {listing.title}
                        </h3>
                        <p className="text-sm text-slate-400">{listing.make} {listing.model}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold text-white tracking-tight">
                            {formatINR(listing.price)}
                        </p>
                    </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 my-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>{listing.year}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Gauge className="h-3.5 w-3.5 text-slate-500" />
                        <span>{(listing.kms_driven || 0).toLocaleString()} km</span>
                    </div>

                    <div className="flex items-center gap-1.5 col-span-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        <span className="truncate">{listing.city}</span>
                    </div>
                </div>

                {/* Seller Info */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-700 overflow-hidden relative">
                            {/* Avatar placeholder if null */}
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold bg-brand-600">
                                {listing.seller?.full_name?.charAt(0) || "U"}
                            </div>
                        </div>
                        <span className="text-sm text-slate-300">{listing.seller?.full_name || "Seller"}</span>
                        {listing.seller?.is_verified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleCompare}
                            className={cn(
                                "flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md transition-all border",
                                isCompared
                                    ? "bg-brand-500/10 border-brand-500/30 text-brand-400"
                                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                            )}
                        >
                            <GitCompare className="w-3.5 h-3.5" />
                            {isCompared ? "Compared" : "Compare"}
                        </button>

                        <Link
                            href={`/listings/${listing.id}`}
                            className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors"
                        >
                            View Details &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
