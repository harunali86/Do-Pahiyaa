import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Check,
    Shield,
    CircleDollarSign,
    Zap,
    Lock,
    MessageCircle,
    BadgeCheck,
    Timer,
    TrendingUp,
    FileCheck2,
    PhoneCall,
    MapPin,
    Calendar,
    Gauge
} from "lucide-react";
import ImageGallery from "@/components/marketplace/ImageGallery";
import { demoListings } from "@/lib/demo/mock-data";
import { ListingService } from "@/lib/services/listing.service";
import { formatINR, cn } from "@/lib/utils";
import LeadCaptureButton from "@/components/marketplace/LeadCaptureButton";
import ReviewList from "@/components/reviews/ReviewList";
import ReviewForm from "@/components/reviews/ReviewForm";
import ViewTracker from "@/components/analytics/ViewTracker";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: PageProps) {
    const { id } = await params;
    let listing: any = null;
    let isRealListing = false;

    // 1. Try fetching from Real DB
    try {
        const rawListing = await ListingService.getListingById(id);
        if (rawListing) {
            // Normalize Supabase FK join
            const seller = Array.isArray((rawListing as any).seller) ? (rawListing as any).seller[0] : rawListing.seller;
            const realListing = { ...rawListing, seller };
            listing = {
                ...realListing,
                imageUrl: realListing.images?.[0] || "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
                kms: realListing.kms_driven,
                ownerType: seller?.role === 'dealer' ? 'Dealer' : 'Individual',
                specs: realListing.specs || {},
                condition: "Good",
                postedBy: seller?.full_name || "Seller",
                rating: 4.8
            };
            isRealListing = true;
        }
    } catch (e) {
        console.error("Fetch Listing Error:", e);
    }

    if (!listing) {
        notFound();
    }

    // 2. AEO-Focused JSON-LD (Product, LocalBusiness & Breadcrumb)
    const jsonLd: any = [
        {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": listing.title,
            "image": listing.images || [listing.imageUrl],
            "description": listing.description || `Buy this ${listing.year} ${listing.make} ${listing.model} in ${listing.city}.`,
            "brand": {
                "@type": "Brand",
                "name": listing.make
            },
            "offers": {
                "@type": "Offer",
                "url": `https://dopahiyaa.com/listings/${id}`,
                "priceCurrency": "INR",
                "price": listing.price,
                "itemCondition": "https://schema.org/UsedCondition",
                "availability": "https://schema.org/InStock",
                "seller": {
                    "@type": listing.ownerType === 'Dealer' ? "LocalBusiness" : "Person",
                    "name": listing.postedBy
                }
            },
            "additionalProperty": [
                { "@type": "PropertyValue", "name": "Kms Driven", "value": listing.kms },
                { "@type": "PropertyValue", "name": "Year", "value": listing.year },
                { "@type": "PropertyValue", "name": "City", "value": listing.city }
            ]
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dopahiyaa.com" },
                { "@type": "ListItem", "position": 2, "name": "Bikes", "item": "https://dopahiyaa.com/search" },
                { "@type": "ListItem", "position": 3, "name": listing.title, "item": `https://dopahiyaa.com/listings/${id}` }
            ]
        }
    ];

    return (
        <div className="min-h-screen pb-20">
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Breadcrumb */}
            <div className="mb-6">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Marketplace
                </Link>
            </div>

            {/* Silent View Tracker */}
            <ViewTracker listingId={id} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Gallery & Description */}
                <div className="lg:col-span-2 space-y-8">
                    <ImageGallery
                        mainImage={listing.imageUrl}
                        title={listing.title}
                    />

                    <div className="glass-panel p-8 space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{listing.title}</h1>
                            <div className="flex items-center gap-4 text-slate-400 text-sm">
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {listing.year}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Gauge className="h-3 w-3" /> {listing.kms.toLocaleString()} km</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {listing.city}</span>
                            </div>

                            {/* Tags */}
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300">Verified Listing</span>
                                {isRealListing && <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">Direct From Seller</span>}
                            </div>
                        </div>

                        <div className="h-px w-full bg-white/10" />

                        <h2 className="text-xl font-bold text-white">About this bike</h2>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                            {listing.description || "No description provided."}
                        </p>
                    </div>

                    {/* Reviews Section */}
                    {isRealListing && listing.seller?.id && (
                        <div className="glass-panel p-8 space-y-6">
                            <h2 className="text-xl font-bold text-white">Seller Reviews</h2>
                            <ReviewList sellerId={listing.seller.id} />
                            <div className="pt-6 border-t border-white/10">
                                <ReviewForm sellerId={listing.seller.id} listingId={id} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Action Card */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <div className="glass-panel p-6 shadow-2xl shadow-black/50 border-brand-500/10 relative overflow-hidden">
                            <div className="relative z-10 mb-8">
                                <p className="text-slate-400 text-sm font-medium mb-1">Asking Price</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-4xl font-bold text-white tracking-tight">
                                        {formatINR(listing.price)}
                                    </h2>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 relative z-10">
                                {isRealListing ? (
                                    <LeadCaptureButton listingId={id} listingTitle={listing.title} />
                                ) : (
                                    // Demo Action (Auction Style)
                                    <button className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg shadow-brand-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 group">
                                        Place Bid (Demo)
                                    </button>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-white/10">
                                        <span className="text-white font-bold">{listing.postedBy[0]}</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{listing.postedBy}</p>
                                        <p className="text-xs text-slate-400">Verified Seller</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
