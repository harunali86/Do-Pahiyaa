"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Gauge,
    Calendar,
    MapPin,
    IndianRupee,
    Fuel,
    Info,
    Check,
    X as XIcon,
    AlertCircle
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { formatINR } from "@/lib/utils";

export default function ComparePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const idsString = searchParams.get('ids');

    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            if (!idsString) {
                setLoading(false);
                return;
            }

            const ids = idsString.split(',').filter(Boolean);
            if (ids.length === 0) {
                setLoading(false);
                return;
            }

            const supabase = createSupabaseBrowserClient();
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .in('id', ids);

            if (data) {
                // Sort by order in URL to maintain user selection order
                const sorted = ids.map(id => data.find(l => l.id === id)).filter(Boolean);
                setListings(sorted);
            }
            setLoading(false);
        };

        fetchListings();
    }, [idsString]);

    const removeFromCompare = (id: string) => {
        const currentIds = idsString?.split(',') || [];
        const newIds = currentIds.filter(cid => cid !== id);

        // Update LocalStorage to keep FloatingBar in sync
        localStorage.setItem('compare_bikes', JSON.stringify(newIds));
        window.dispatchEvent(new Event('comparison_updated'));

        // Update URL
        if (newIds.length > 0) {
            router.push(`/compare?ids=${newIds.join(',')}`);
        } else {
            router.push('/buy-used-bikes');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    if (listings.length === 0) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center text-center">
                <div className="bg-slate-900/50 p-8 rounded-2xl border border-white/5 max-w-md">
                    <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">No Bikes Selected to Compare</h2>
                    <p className="text-slate-400 mb-6">Go back to the marketplace and select up to 3 bikes to see them side-by-side.</p>
                    <Link
                        href="/buy-used-bikes"
                        className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-bold transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" /> Browse Bikes
                    </Link>
                </div>
            </div>
        );
    }

    const headers = [
        { label: "Overview", type: "section" },
        { label: "Price", icon: IndianRupee, key: "price", format: (val: number) => formatINR(val) },
        { label: "Model Year", icon: Calendar, key: "year" },
        { label: "Kilometers", icon: Gauge, key: "kms_driven", format: (val: number) => `${val?.toLocaleString() || 0} km` },
        { label: "Location", icon: MapPin, key: "city" },

        { label: "Engine & Performance", type: "section" },
        { label: "Make", key: "make" },
        { label: "Model", key: "model" },
        { label: "Fuel Type", icon: Fuel, key: "fuel_type", fallback: "Petrol" },

        { label: "Ownership", type: "section" },
        { label: "Owner Type", key: "owner_type", fallback: "1st Owner" },
        { label: "Condition", key: "condition", fallback: "Good" },
        { label: "Verified Seller", key: "is_verified_seller", render: (l: any) => l.seller_id ? <Check className="w-4 h-4 text-green-400 mx-auto" /> : <span className="text-slate-600">-</span> },
    ];

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/buy-used-bikes" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-2 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
                        </Link>
                        <h1 className="text-3xl font-bold text-white">Compare Bikes</h1>
                    </div>
                </div>

                <div className="overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="min-w-[800px] bg-slate-900/40 rounded-2xl border border-white/5 overflow-hidden">

                        {/* Header Row (Images & Titles) */}
                        <div className="grid divide-x divide-white/5" style={{ gridTemplateColumns: `200px repeat(${listings.length}, 1fr)` }}>
                            <div className="p-6 flex items-center bg-slate-900/60 font-bold text-slate-400">
                                Bike Details
                            </div>
                            {listings.map((listing) => (
                                <div key={listing.id} className="p-6 relative group">
                                    <button
                                        onClick={() => removeFromCompare(listing.id)}
                                        className="absolute top-2 right-2 p-1.5 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
                                        title="Remove from comparison"
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                    <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 border border-white/10 bg-slate-800">
                                        {listing.images?.[0] ? (
                                            <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg text-white mb-1 line-clamp-1" title={listing.title}>{listing.title}</h3>
                                    <Link href={`/listings/${listing.id}`} className="text-xs text-brand-400 hover:underline">
                                        View Full Details
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {/* Specs Rows */}
                        <div className="divide-y divide-white/5">
                            {headers.map((row, idx) => {
                                if (row.type === "section") {
                                    return (
                                        <div key={idx} className="grid bg-slate-950/30" style={{ gridTemplateColumns: `200px repeat(${listings.length}, 1fr)` }}>
                                            <div className="p-3 pl-6 font-bold text-slate-500 text-xs uppercase tracking-wider col-span-full">
                                                {row.label}
                                            </div>
                                        </div>
                                    );
                                }

                                const Icon = row.icon;

                                return (
                                    <div key={idx} className="grid divide-x divide-white/5 hover:bg-white/[0.02] transition-colors" style={{ gridTemplateColumns: `200px repeat(${listings.length}, 1fr)` }}>
                                        <div className="p-4 pl-6 flex items-center gap-2 text-sm font-medium text-slate-400">
                                            {Icon && <Icon className="w-4 h-4 opacity-70" />}
                                            {row.label}
                                        </div>
                                        {listings.map((listing) => (
                                            <div key={listing.id} className="p-4 text-center text-sm font-medium text-white">
                                                {row.render ? (
                                                    row.render(listing)
                                                ) : (
                                                    // @ts-ignore
                                                    row.format ? row.format(listing[row.key] || 0) : (listing[row.key] || row.fallback || "-")
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Action Footer */}
                        <div className="grid divide-x divide-white/5 border-t border-white/5 bg-slate-900/60" style={{ gridTemplateColumns: `200px repeat(${listings.length}, 1fr)` }}>
                            <div className="p-6"></div>
                            {listings.map((listing) => (
                                <div key={listing.id} className="p-6">
                                    <Link
                                        href={`/listings/${listing.id}`}
                                        className="block w-full text-center bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold transition-all"
                                    >
                                        I&apos;m Interested
                                    </Link>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
