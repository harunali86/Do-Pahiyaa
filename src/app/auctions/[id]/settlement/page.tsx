export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Gavel, Landmark, Receipt, ShieldCheck } from "lucide-react";
import { AuctionService } from "@/lib/services/auction.service";
import { formatINR } from "@/lib/utils";

interface AuctionSettlementPageProps {
  params: Promise<{ id: string }>;
}

export default async function AuctionSettlementPage({ params }: AuctionSettlementPageProps) {
  const { id } = await params;

  let auction: any = null;
  try {
    auction = await AuctionService.getAuctionDetailWithBids(id);
  } catch {
    notFound();
  }

  if (!auction) {
    notFound();
  }

  const bids = Array.isArray(auction.bids) ? [...auction.bids].sort((a, b) => Number(b.amount) - Number(a.amount)) : [];
  const winningBid = bids[0];
  const winnerName = winningBid?.bidder?.full_name || "Top Bidder";
  const finalAmount = Number(winningBid?.amount || auction.current_highest_bid || auction.start_price || 0);
  const reserve = Number(auction.reserve_price || 0);
  const reserveMet = finalAmount >= reserve;
  const settlementFee = Math.round(finalAmount * 0.015);

  return (
    <div className="min-h-screen py-8 max-w-6xl mx-auto space-y-6">
      <Link href={`/auctions/${id}/result`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Result
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-panel border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Auction Settlement</h1>
            <p className="text-slate-400">Finalize payment, transfer ownership, and close audit trail.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Winner</p>
              <p className="text-white font-semibold mt-2 truncate">{winnerName}</p>
            </div>
            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Final Bid</p>
              <p className="text-white font-semibold mt-2">{formatINR(finalAmount)}</p>
            </div>
            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Reserve</p>
              <p className={`font-semibold mt-2 ${reserveMet ? "text-green-400" : "text-yellow-400"}`}>
                {reserveMet ? "Met" : "Not Met"}
              </p>
            </div>
            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Settlement Fee</p>
              <p className="text-brand-400 font-semibold mt-2">{formatINR(settlementFee)}</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Settlement timeline</h2>
            <div className="space-y-4">
              {[
                { icon: Gavel, title: "Auction ended", status: "completed", note: "Highest bid locked" },
                { icon: Landmark, title: "Winner payment", status: "pending", note: "Awaiting transaction reference" },
                { icon: Receipt, title: "Seller payout", status: "pending", note: "Payout after compliance checks" },
                { icon: ShieldCheck, title: "Ownership transfer", status: "pending", note: "RTO + document handover" },
              ].map((step) => (
                <div key={step.title} className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${
                    step.status === "completed"
                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                      : "bg-slate-800 border-white/10 text-slate-400"
                  }`}>
                    <step.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{step.title}</p>
                    <p className="text-xs text-slate-500">{step.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="glass-panel border border-white/5 rounded-2xl p-5 space-y-4">
          <h3 className="text-lg font-bold text-white">Top Bid History</h3>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {bids.slice(0, 10).map((bid, index) => (
              <div key={bid.id} className="bg-slate-900/60 border border-white/5 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{bid.bidder?.full_name || "Bidder"}</p>
                  <p className="text-xs text-slate-500">Rank #{index + 1}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${index === 0 ? "text-green-400" : "text-slate-300"}`}>
                    {formatINR(Number(bid.amount || 0))}
                  </p>
                  {index === 0 && <CheckCircle2 className="h-3 w-3 text-green-400 ml-auto mt-1" />}
                </div>
              </div>
            ))}
            {bids.length === 0 && (
              <p className="text-sm text-slate-500">No bids recorded for this auction.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
