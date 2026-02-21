export const dynamic = "force-dynamic";

import Link from "next/link";
import { CalendarDays, CheckCircle2, CircleDot, Wallet } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const statusColorMap: Record<string, string> = {
  contact_locked: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  token_paid: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  inspection: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default async function BuyerDealsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <CircleDot className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-white mb-2">Login Required</h1>
        <p className="text-slate-400 mb-5">Please login to see your active and completed deals.</p>
        <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-white font-semibold hover:bg-brand-500">
          Go to Login
        </Link>
      </div>
    );
  }

  const { data: deals } = await supabase
    .from("deals")
    .select("id, status, created_at, listing:listings(id, title, city, price)")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">My Deals</h1>
        <p className="text-slate-400 text-sm mt-1">Track your lead unlocks, token payments, and deal completion status.</p>
      </div>

      <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
        {!deals?.length ? (
          <div className="text-center py-16 px-6">
            <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h2 className="text-white font-semibold mb-1">No deals yet</h2>
            <p className="text-sm text-slate-400 mb-5">Start by browsing bikes and placing offers to create your first deal.</p>
            <Link href="/search" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-white font-semibold hover:bg-brand-500">
              Explore Bikes
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {deals.map((deal: any) => (
              <li key={deal.id} className="px-5 py-4 hover:bg-white/[0.02]">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-white font-semibold">{deal.listing?.title || "Listing unavailable"}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        {deal.listing?.price ? `₹${Number(deal.listing.price).toLocaleString("en-IN")}` : "Price n/a"}
                      </span>
                      <span>{deal.listing?.city || "City n/a"}</span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {new Date(deal.created_at).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${statusColorMap[deal.status] || "border-white/20 text-slate-300"}`}>
                      {deal.status}
                    </span>
                    <Link href={`/deals/${deal.id}`} className="text-sm text-brand-400 hover:text-brand-300">
                      View
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
