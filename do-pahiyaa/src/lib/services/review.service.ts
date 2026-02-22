import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface Review {
    id: string;
    listing_id?: string;
    reviewer_id: string;
    reviewee_id: string;
    rating: number; // 1-5
    comment?: string;
    created_at: string;
    reviewer?: {
        full_name: string;
        avatar_url?: string;
    };
}

export class ReviewService {

    static async createReview(
        reviewerId: string,
        revieweeId: string,
        rating: number,
        comment: string,
        listingId?: string
    ) {
        const supabase = await createSupabaseServerClient();

        // Validate Rating
        if (rating < 1 || rating > 5) {
            throw new Error("Rating must be between 1 and 5");
        }

        const { data, error } = await supabase
            .from('reviews')
            .insert({
                reviewer_id: reviewerId,
                reviewee_id: revieweeId,
                rating,
                comment,
                listing_id: listingId
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async getReviewsForDealer(dealerId: string) {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from('reviews')
            .select(`
        *,
        reviewer:profiles!reviewer_id (full_name, avatar_url)
      `)
            .eq('reviewee_id', dealerId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Review[];
    }

    static async getAverageRating(dealerId: string) {
        const supabase = await createSupabaseServerClient();

        // Supabase doesn't support aggregate functions directly in JS client easily without RPC
        // But for MVP scale, fetching fields is okay, or use .select('rating')

        const { data, error } = await supabase
            .from('reviews')
            .select('rating')
            .eq('reviewee_id', dealerId);

        if (error) throw error;

        if (!data || data.length === 0) return { average: 0, count: 0 };

        const total = data.reduce((sum, r) => sum + r.rating, 0);
        const average = total / data.length;

        return {
            average: Number(average.toFixed(1)),
            count: data.length
        };
    }
}
