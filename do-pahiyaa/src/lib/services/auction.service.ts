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
        id,
        status,
        start_price,
        reserve_price,
        min_increment,
        min_bid_increment,
        current_highest_bid,
        start_time,
        end_time,
        created_at,
        listing:listings(id, title, images, city, make, model),
        highest_bidder:profiles!highest_bidder_id(full_name)
      `)
            .order('start_time', { ascending: true });

        if (error) throw error;
        const auctionIds = (data || []).map((auction: any) => auction.id);
        const bidCountMap = new Map<string, number>();

        if (auctionIds.length > 0) {
            const { data: bidRows } = await supabase
                .from("bids")
                .select("auction_id")
                .in("auction_id", auctionIds);

            for (const row of bidRows || []) {
                bidCountMap.set(row.auction_id, (bidCountMap.get(row.auction_id) || 0) + 1);
            }
        }

        return (data || []).map((auction: any) => ({
            ...auction,
            bids_count: bidCountMap.get(auction.id) || 0
        }));
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
