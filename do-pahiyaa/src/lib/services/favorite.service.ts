import { createSupabaseServerClient } from "@/lib/supabase/server";

export class FavoriteService {
    /**
     * Toggle favorite status for a listing
     */
    static async toggleFavorite(userId: string, listingId: string) {
        const supabase = await createSupabaseServerClient();

        // 1. Check if already exists
        const { data: existing } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', userId)
            .eq('listing_id', listingId)
            .maybeSingle();

        if (existing) {
            // Remove
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('id', existing.id);
            if (error) throw error;
            return { isFavorite: false };
        } else {
            // Add
            const { error } = await supabase
                .from('favorites')
                .insert({ user_id: userId, listing_id: listingId });
            if (error) throw error;
            return { isFavorite: true };
        }
    }

    /**
     * Get all favorites for a user
     */
    static async getUserFavorites(userId: string) {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from('favorites')
            .select(`
        id,
        created_at,
        listing:listings(
          id, 
          title, 
          price, 
          city, 
          make, 
          model, 
          images,
          status,
          is_company_listing,
          kms_driven,
          year,
          ownerType
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Check if a specific listing is favorited by user
     */
    static async isFavorited(userId: string, listingId: string) {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', userId)
            .eq('listing_id', listingId)
            .maybeSingle();

        return !!data;
    }
}
