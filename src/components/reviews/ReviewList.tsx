"use client";

import { useEffect, useState } from "react";
import { Star, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Review } from "@/lib/services/review.service";

interface ReviewListProps {
    sellerId: string;
}

export default function ReviewList({ sellerId }: ReviewListProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            const supabase = createSupabaseBrowserClient();
            const { data } = await supabase
                .from('reviews')
                .select(`
                    *,
                    reviewer:profiles!reviewer_id (full_name, avatar_url)
                `)
                .eq('reviewee_id', sellerId)
                .order('created_at', { ascending: false });

            if (data) {
                setReviews(data as any[]);
            }
            setLoading(false);
        };

        if (sellerId) {
            fetchReviews();
        }
    }, [sellerId]);

    if (loading) return <div className="text-slate-500 text-sm animate-pulse">Loading reviews...</div>;

    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 bg-slate-900/30 rounded-xl border border-dashed border-white/10">
                <Star className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-slate-500 text-sm">No reviews yet for this seller.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Seller Reviews <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">{reviews.length}</span>
            </h3>

            <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-2">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                                    {review.reviewer?.avatar_url ? (
                                        <img src={review.reviewer.avatar_url} alt={review.reviewer.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-4 h-4 text-slate-500" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{review.reviewer?.full_name || "Anonymous"}</p>
                                    <p className="text-[10px] text-slate-500">{formatDistanceToNow(new Date(review.created_at))} ago</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-0.5 bg-brand-500/10 px-2 py-1 rounded text-brand-400 text-xs font-bold border border-brand-500/20">
                                <span>{review.rating.toFixed(1)}</span>
                                <Star className="w-3 h-3 fill-brand-400" />
                            </div>
                        </div>
                        {review.comment && (
                            <p className="text-slate-300 text-sm leading-relaxed">
                                {review.comment}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
