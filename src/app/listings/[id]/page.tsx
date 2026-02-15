import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
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
    PhoneCall
} from "lucide-react";
import ListingCard from "@/components/marketplace/ListingCard";
import ImageGallery from "@/components/marketplace/ImageGallery";
import { demoListings } from "@/lib/demo/mock-data";
import { formatINR, cn } from "@/lib/utils";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: PageProps) {
    // Await the params
    const { id } = await params;

    const listing = demoListings.find((l) => l.id === id);

    if (!listing) {
        notFound();
    }

    const similarListings = demoListings
        .filter((l) => l.brand === listing.brand && l.id !== listing.id)
        .slice(0, 3);

    return (
        <div className="min-h-screen pb-20">
            {/* Breadcrumb / Back */}
            <div className="mb-6">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Marketplace
                </Link>
            </div>

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
                                <span>{listing.year}</span>
                                <span>•</span>
                                <span>{listing.kms.toLocaleString()} km</span>
                                <span>•</span>
                                <span>{listing.ownerType}</span>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-300">Insurance Active</span>
                                <span className="rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300">Verified RC</span>
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-200">No Accident Claim Reported</span>
                            </div>
                        </div>

                        <div className="h-px w-full bg-white/10" />

                        <h2 className="text-xl font-bold text-white">About this bike</h2>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                            {listing.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                            {Object.entries(listing.specs).map(([key, value]) => (
                                <div key={key} className="p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-brand-500/20 transition-colors">
                                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1 tracking-wider">{key}</p>
                                    <p className="text-white font-medium capitalize truncate">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl premium-ring p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Deal Confidence Snapshot</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                                <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Price Position</p>
                                <p className="text-white font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-brand-400" /> Fair for current market</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                                <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Paperwork</p>
                                <p className="text-white font-semibold flex items-center gap-2"><FileCheck2 className="h-4 w-4 text-brand-400" /> Ownership docs ready</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                                <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Response Time</p>
                                <p className="text-white font-semibold flex items-center gap-2"><Timer className="h-4 w-4 text-brand-400" /> Avg seller reply: 11 mins</p>
                            </div>
                        </div>
                    </div>

                    {/* Seller Assurance */}
                    <div className="flex items-start gap-4 p-6 rounded-xl bg-gradient-to-r from-brand-900/20 to-transparent border border-brand-500/10">
                        <div className="p-3 rounded-full bg-brand-500/10 border border-brand-500/20">
                            <Shield className="h-6 w-6 text-brand-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Verified {listing.postedBy}</h3>
                            <p className="text-slate-400 text-sm mt-1 max-w-lg">
                                This listing has been manually verified by the Do Pahiyaa team. The bike passed our comprehensive 140-point inspection check ensuring quality and transparency.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sticky Sidebar / Action Card */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <div className="glass-panel p-6 shadow-2xl shadow-black/50 border-brand-500/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <CircleDollarSign className="h-32 w-32 text-brand-500" />
                            </div>

                            <div className="relative z-10 mb-8">
                                <p className="text-slate-400 text-sm font-medium mb-1">Asking Price</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-4xl font-bold text-white tracking-tight">
                                        {formatINR(listing.price)}
                                    </h2>
                                </div>
                                <p className="mt-2 text-xs text-slate-500">Indicative on-road pricing for {listing.city}</p>

                                <div className="flex items-center gap-2 mt-4">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md",
                                        listing.condition === "Excellent"
                                            ? "bg-green-500/10 border-green-500/20 text-green-400"
                                            : "bg-accent-gold/10 border-accent-gold/20 text-accent-gold"
                                    )}>
                                        {listing.condition} Condition
                                    </span>
                                    <span className="text-slate-500 text-sm flex items-center gap-1">
                                        <Zap className="h-3 w-3 text-accent-gold" />
                                        High Demand
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 relative z-10">
                                <button className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg shadow-brand-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 group">
                                    Make an Offer
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </button>

                                <div className="group relative">
                                    <button className="relative w-full py-3.5 rounded-xl bg-slate-800/50 border border-white/10 text-white font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2 backdrop-blur-md">
                                        <Lock className="h-4 w-4 text-accent-gold" />
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">Unlock Contact Info</span>
                                    </button>
                                    <p className="text-[10px] text-center text-slate-500 mt-2 uppercase tracking-wide">Lead Unlock Fee: ₹499 (demo)</p>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-white/10">
                                        <span className="text-white font-bold">{listing.postedBy[0]}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-medium">{listing.postedBy === "Dealer" ? "Certified Dealer" : "Private Seller"}</p>
                                            <Check className="h-3.5 w-3.5 text-brand-400 bg-brand-500/10 rounded-full p-0.5" />
                                        </div>
                                        <p className="text-xs text-slate-400">Member since 2023</p>
                                    </div>
                                </div>
                                <div className="mb-4 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300 flex items-center gap-2">
                                    <BadgeCheck className="h-4 w-4 text-brand-400 shrink-0" />
                                    KYC completed. Contact visible after lead unlock.
                                </div>
                                <button className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-sm transition-colors flex items-center justify-center gap-2 border border-white/5">
                                    <MessageCircle className="h-4 w-4" />
                                    Chat with Seller
                                </button>
                                <button className="mt-2 w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-sm transition-colors flex items-center justify-center gap-2 border border-white/5">
                                    <PhoneCall className="h-4 w-4" />
                                    Request Callback
                                </button>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/10 flex items-center gap-3 backdrop-blur-sm">
                            <div className="p-2 rounded-full bg-brand-500/10">
                                <Zap className="h-4 w-4 text-brand-400" />
                            </div>
                            <p className="text-sm text-slate-300">
                                <span className="font-bold text-white">2 people</span> made an offer on this bike in the last 24h.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Suggestion Section */}
            {similarListings.length > 0 && (
                <div className="mt-20 pt-10 border-t border-white/5">
                    <h2 className="text-2xl font-bold text-white mb-8">Similar Listings You Might Like</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {similarListings.map((similar) => (
                            <ListingCard key={similar.id} listing={similar} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
