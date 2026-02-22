"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight, GitCompare } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ComparisonFloatingBar() {
    const [compareIds, setCompareIds] = useState<string[]>([]);
    const [listings, setListings] = useState<any[]>([]);

    // 1. Sync with LocalStorage & Listen for Custom Events
    useEffect(() => {
        const updateState = () => {
            const stored = localStorage.getItem('compare_bikes');
            if (stored) {
                setCompareIds(JSON.parse(stored));
            } else {
                setCompareIds([]);
            }
        };

        // Initial load
        updateState();

        // Listen for updates from ListingCards
        window.addEventListener('comparison_updated', updateState);
        return () => window.removeEventListener('comparison_updated', updateState);
    }, []);

    // 2. Fetch details for thumbnails (only when IDs change)
    useEffect(() => {
        const fetchThumbnails = async () => {
            if (compareIds.length === 0) {
                setListings([]);
                return;
            }

            const supabase = createSupabaseBrowserClient();
            const { data } = await supabase
                .from('listings')
                .select('id, title, images')
                .in('id', compareIds);

            if (data) setListings(data);
        };

        fetchThumbnails();
    }, [compareIds]);

    const removeId = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const newIds = compareIds.filter(cid => cid !== id);
        localStorage.setItem('compare_bikes', JSON.stringify(newIds));
        window.dispatchEvent(new Event('comparison_updated'));
        toast.info("Removed from comparison");
    };

    const clearAll = () => {
        localStorage.removeItem('compare_bikes');
        window.dispatchEvent(new Event('comparison_updated'));
        toast.info("Comparison cleared");
    };

    if (compareIds.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-6 duration-300">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">

                <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
                    {listings.map(l => (
                        <div key={l.id} className="relative group shrink-0">
                            <div className="h-12 w-12 rounded-lg bg-slate-800 border border-white/10 overflow-hidden">
                                {l.images?.[0] ? (
                                    <img src={l.images[0]} alt={l.title} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-xs text-slate-500">Img</div>
                                )}
                            </div>
                            <button
                                onClick={(e) => removeId(l.id, e)}
                                className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}

                    {compareIds.length < 3 && (
                        <div className="h-12 w-12 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center text-slate-600 text-xs text-center shrink-0">
                            Add<br />Bike
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <button
                        onClick={clearAll}
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                        Clear
                    </button>
                    <Link
                        href={`/compare?ids=${compareIds.join(',')}`}
                        className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all hover:scale-105"
                    >
                        Compare <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{compareIds.length}</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
