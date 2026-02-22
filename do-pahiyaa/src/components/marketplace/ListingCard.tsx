import Link from "next/link";
import type { Route } from "next";
import Image from "next/image";
import { Heart, MapPin, Gauge, Calendar, Star, GitCompare } from "lucide-react";
import { toast } from "sonner";
import { defaultBlurDataURL, imageQuality, imageSizes } from "@/lib/image";
import { formatINR, cn } from "@/lib/utils";

// Union type to support Real DB
type CardListing = {
    id: string;
    title: string;
    make: string;
    model: string;
    year: number;
    price: number;
    kms_driven?: number;
    kms?: number;
    city: string;
    images?: string[] | null;
    imageUrl?: string;
    status: string;
    is_company_listing?: boolean;
    condition?: string;
    postedBy?: string;
    rating?: number;
    ownerType?: string;
};

interface ListingCardProps {
    listing: CardListing;
}

const FALLBACK_LISTING_IMAGE =
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80";

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

export default function ListingCard({ listing }: ListingCardProps) {
    const normalizedImages = Array.isArray((listing as any).images)
        ? (listing as any).images.filter(isNonEmptyString)
        : [];
    const fallbackImage = isNonEmptyString((listing as any).imageUrl)
        ? (listing as any).imageUrl
        : FALLBACK_LISTING_IMAGE;
    const imageUrl = normalizedImages[0] ?? fallbackImage;

    const kmsDisplay = ((listing as any).kms_driven ?? (listing as any).kms ?? 0).toLocaleString();
    const condition = listing.condition || "Verified";
    const ratingValue = typeof listing.rating === "number" && Number.isFinite(listing.rating)
        ? listing.rating
        : 4.8;
    const rating = ratingValue.toFixed(1);
    const ownerType = listing.ownerType || ((listing as any).is_company_listing ? "Certified" : "Individual");
    const postedByLabel = listing.postedBy === "Dealer" ? "Dealer" : "";
    return (
        <div className="group relative overflow-hidden rounded-2xl bg-slate-900/50 border border-white/5 hover:border-brand-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/10">
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden">
                {/* Badge */}
                <span className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-semibold backdrop-blur-md border",
                    condition === "Excellent"
                        ? "bg-green-500/20 border-green-500/30 text-green-300"
                        : "bg-accent-gold/20 border-accent-gold/30 text-accent-gold"
                )}>
                    {condition}
                </span>
                {postedByLabel === "Dealer" && (
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-accent-gold/20 border border-accent-gold/30 text-accent-gold backdrop-blur-md">
                        Dealer
                    </span>
                )}
            </div>

            {/* Favorite Button */}
            {/* Action Buttons */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
                <button
                    aria-label={`Save ${listing.title} to favorites`}
                    className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Heart className="h-4 w-4" />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Add to LocalStorage
                        const stored = localStorage.getItem('compare_bikes');
                        const current = stored ? JSON.parse(stored) : [];

                        if (current.includes(listing.id)) {
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

                        // Dispatch custom event for FloatingBar
                        window.dispatchEvent(new Event('comparison_updated'));
                    }}
                    aria-label={`Compare ${listing.title}`}
                    className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100 delay-75"
                >
                    <GitCompare className="h-4 w-4" />
                </button>
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

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent opacity-60" />

            {/* Content */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-brand-400 transition-colors line-clamp-1">
                            {listing.title}
                        </h3>
                        <p className="text-sm text-slate-400">{listing.model}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold text-white tracking-tight">
                            {formatINR(listing.price)}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">on-road est.</p>
                    </div>
                </div>

                <div className="mb-3 flex items-center justify-between">
                    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                        <Star className="h-3.5 w-3.5 text-accent-gold" />
                        {rating} seller rating
                    </div>
                    <span className="text-xs text-slate-500">{ownerType}</span>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 my-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>{listing.year}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Gauge className="h-3.5 w-3.5 text-slate-500" />
                        <span>{kmsDisplay} km</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        <span className="truncate">{listing.city}</span>
                    </div>
                </div>

                {/* Action */}
                <div className="pt-4 border-t border-white/5 flex gap-2">
                    <button className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm font-medium transition-colors border border-white/5">
                        Quick Offer
                    </button>
                    <Link
                        href={`/listings/${listing.id}` as Route}
                        className="flex-1 bg-brand-600 hover:bg-brand-500 text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-brand-500/20 text-center"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
}
