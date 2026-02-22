export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingService } from "@/lib/services/listing.service";
import { PlusCircle, Pencil, Eye, CircleDollarSign } from "lucide-react";

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export default async function SellerListingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const listings = await ListingService.getDealerListings(user.id);

  return (
    <div className="min-h-screen py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Listings</h1>
          <p className="text-slate-400">Manage your active, draft, and sold inventory.</p>
        </div>
        <Link
          href="/seller/listings/new"
          className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" /> New Listing
        </Link>
      </div>

      <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 text-xs text-slate-500 uppercase tracking-wider font-semibold border-b border-white/5">
                <th className="py-3 px-6">Title</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Price</th>
                <th className="py-3 px-6">Views</th>
                <th className="py-3 px-6">Updated</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {listings.map((item: any) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{item.title}</span>
                      <span className="text-xs text-slate-500">{item.make} • {item.model} • {item.year}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider border ${
                      item.status === "published" ? "bg-green-500/10 text-green-400 border-green-400/20" :
                      item.status === "sold" ? "bg-brand-500/10 text-brand-400 border-brand-500/20" :
                      "bg-yellow-500/10 text-yellow-400 border-yellow-400/20"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-white font-mono flex items-center gap-1">
                    <CircleDollarSign className="h-4 w-4 text-brand-400" />
                    {Number(item.price || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="py-4 px-6 text-slate-400">{item.specs?.views || 0}</td>
                  <td className="py-4 px-6 text-slate-500 text-sm">{formatDate(item.updated_at || item.created_at)}</td>
                  <td className="py-4 px-6">
                    <div className="flex justify-end gap-2">
                      <Link href={`/listings/${item.id}`} className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/seller/listings/${item.id}/edit`} className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700">
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {listings.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-slate-500">No listings yet. Create your first listing now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
