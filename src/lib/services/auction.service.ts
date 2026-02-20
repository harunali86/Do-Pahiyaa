import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AuctionStatus } from "@/types/domain";

export class AuctionService {
    /**
     * Fetch all active/upcoming auctions
     */
    static async getAuctions() {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from('auctions')
            .select(`
        *,
        listing:listings(id, title, images, price, city, make, model)
      `)
            .order('start_time', { ascending: true });

        if (error) throw error;
        return data;
    }

    /**
     * Place a bid on an auction
     */
    static async placeBid(auctionId: string, bidderId: string, amount: number) {
        const supabase = await createSupabaseServerClient();

        // Call the atomic RPC function
        const { data, error } = await supabase
            .rpc('place_bid', {
                p_auction_id: auctionId,
                p_bidder_id: bidderId,
                p_amount: amount
            });

        if (error) throw new Error(error.message);

        // The RPC returns { success: boolean, message: string, ... }
        const result = data as any;

        if (!result.success) {
            throw new Error(result.message || "Failed to place bid");
        }

        return result;
    }

    /**
     * Get bid history for a user
     */
    static async getUserBidHistory(userId: string) {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from('bids')
            .select(`
        *,
        auction:auctions(
          id, 
          status, 
          end_time,
          listing:listings(id, title, images)
        )
      `)
            .eq('bidder_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Get specific auction details with bid stream
     */
    static async getAuctionDetailWithBids(auctionId: string) {
        const supabase = await createSupabaseServerClient();
        const { data: auction, error } = await supabase
            .from('auctions')
            .select(`
        *,
        listing:listings(*),
        bids:bids(
          id,
          amount,
          created_at,
          bidder:profiles(full_name)
        )
      `)
            .eq('id', auctionId)
            .single();

        if (error) throw error;
        return auction;
    }
}
