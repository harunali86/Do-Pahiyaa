export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FavoriteService } from "@/lib/services/favorite.service";

export default async function BuyerSavedPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-white mb-2">Login Required</h1>
        <p className="text-slate-400 mb-5">Please login to access your saved bikes.</p>
        <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-white font-semibold hover:bg-brand-500">
          Go to Login
        </Link>
      </div>
    );
  }

  const favorites = await FavoriteService.getUserFavorites(user.id).catch(() => []);

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Saved Bikes</h1>
        <p className="text-slate-400 text-sm mt-1">Your watchlist for quick comparison and follow-up offers.</p>
      </div>

      {!favorites.length ? (
        <div className="text-center py-16 px-6 bg-slate-900/50 border border-white/10 rounded-2xl">
          <Heart className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h2 className="text-white font-semibold mb-1">No saved bikes yet</h2>
          <p className="text-sm text-slate-400 mb-5">Browse marketplace listings and save bikes to compare later.</p>
          <Link href="/search" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-white font-semibold hover:bg-brand-500">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorites.map((item: any) => {
            const listing = item.listing;
            return (
              <article key={item.id} className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden hover:border-brand-500/40 transition-all">
                <Link href={`/listings/${listing?.id || ""}`} className="block relative h-52">
                  <Image
                    src={listing?.images?.[0] || "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80"}
                    alt={listing?.title || "Bike"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </Link>
                <div className="p-4">
                  <Link href={`/listings/${listing?.id || ""}`} className="text-white font-semibold hover:text-brand-400 transition-colors line-clamp-2">
                    {listing?.title || "Untitled Listing"}
                  </Link>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-brand-400 font-bold">
                      {listing?.price ? `₹${Number(listing.price).toLocaleString("en-IN")}` : "Price on request"}
                    </p>
                    <p className="text-xs text-slate-500">{listing?.year || "—"}</p>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {listing?.city || "Unknown location"}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
