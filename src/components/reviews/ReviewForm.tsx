"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
// Actually I implemented `ReviewService` which is server-side. 
// I should probably make a server action to call it, or just use Supabase client directly if policies allow.
// Policies allow INSERT for authenticated users. So client-side is fine.

interface ReviewFormProps {
    sellerId: string;
    listingId?: string;
    onSuccess?: () => void;
}

export default function ReviewForm({ sellerId, listingId, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        setIsSubmitting(true);
        try {
            const supabase = createSupabaseBrowserClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                toast.error("You must be logged in to leave a review");
                setIsSubmitting(false);
                return;
            }

            if (session.user.id === sellerId) {
                toast.error("You cannot review yourself");
                setIsSubmitting(false);
                return;
            }

            const { error } = await supabase
                .from('reviews')
                .insert({
                    reviewer_id: session.user.id,
                    reviewee_id: sellerId,
                    listing_id: listingId,
                    rating,
                    comment
                });

            if (error) throw error;

            toast.success("Review submitted successfully!");
            setRating(0);
            setComment("");
            if (onSuccess) onSuccess();

        } catch (error: any) {
            toast.error(error.message || "Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-900/50 p-6 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-white">Rate your experience</h3>

            {/* Star Rating */}
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className="transition-transform hover:scale-110 focus:outline-none"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                    >
                        <Star
                            className={`w-8 h-8 transition-colors ${star <= (hoverRating || rating)
                                ? "fill-accent-gold text-accent-gold"
                                : "text-slate-600"
                                }`}
                        />
                    </button>
                ))}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Comment (Optional)</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Shared your experience with this seller..."
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 min-h-[100px]"
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                ) : (
                    "Submit Review"
                )}
            </button>
        </form>
    );
}
