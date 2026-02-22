export const dynamic = "force-dynamic";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminAuctionsControl } from "@/components/admin/auctions/AdminAuctionsControl";

export default async function AdminAuctionsPage() {
  const admin = createSupabaseAdminClient();

  const { data: auctions, error } = await admin
    .from("auctions")
    .select(`
      id,
      status,
      start_price,
      current_highest_bid,
      start_time,
      end_time,
      listing:listings(title, city),
      highest_bidder:profiles!highest_bidder_id(full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    console.error("Admin auctions fetch failed:", error);
  }

  const auctionIds = (auctions || []).map((auction: any) => auction.id);
  const bidCountMap = new Map<string, number>();
  if (auctionIds.length > 0) {
    const { data: bidRows } = await admin
      .from("bids")
      .select("auction_id")
      .in("auction_id", auctionIds);

    for (const row of bidRows || []) {
      bidCountMap.set(row.auction_id, (bidCountMap.get(row.auction_id) || 0) + 1);
    }
  }

  const items = (auctions || []).map((auction: any) => ({
    id: auction.id,
    status: auction.status || "scheduled",
    title: auction.listing?.title || "Untitled Auction",
    city: auction.listing?.city || "Unknown",
    startPrice: Number(auction.start_price || 0),
    currentHighestBid: auction.current_highest_bid === null ? null : Number(auction.current_highest_bid),
    startTime: auction.start_time,
    endTime: auction.end_time,
    bidCount: bidCountMap.get(auction.id) || 0,
    highestBidderName: auction.highest_bidder?.full_name || null,
  }));

  return (
    <div className="p-6 md:p-8 space-y-6">
      <AdminAuctionsControl initialAuctions={items} />
    </div>
  );
}
