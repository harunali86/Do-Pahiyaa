export const dynamic = "force-dynamic";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, Filter, Bike, ExternalLink, PenTool, LayoutGrid, CheckCircle, Plus } from "lucide-react";
import { ListingService } from "@/lib/services/listing.service";
import InventoryActions from "@/components/dealer/InventoryActions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function DealerInventoryPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch all dealer listings
  const listings = await ListingService.getDealerListings(user.id);

  // Helper to determine source
  const getSourceDetails = (listing: any) => {
    if (listing.specs?.source === 'manual') return { label: 'Manual Entry', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: PenTool };
    if (listing.specs?.source === 'platform') return { label: 'Platform Source', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: CheckCircle };
    return { label: 'Standard', color: 'bg-slate-800 text-slate-400 border-slate-700', icon: LayoutGrid };
  };

  return (
    <div className="p-6 md:p-8 space-y-6 w-full min-h-screen">
      <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Inventory</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your bike listings and stock</p>
        </div>
        <Button asChild className="bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-500/20">
          <Link href="/dealer/inventory/new">
            <Plus className="h-5 w-5 mr-2" /> Add New Bike
          </Link>
        </Button>
      </div>

      <div className="glass-panel border border-white/5 overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by make, model..."
              className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-500/50 placeholder:text-slate-600"
            />
          </div>
          <Tabs defaultValue="all" className="w-full md:w-auto">
            <TabsList className="grid w-full grid-cols-3 bg-slate-900 border border-white/10">
              <TabsTrigger value="all">All Bikes</TabsTrigger>
              <TabsTrigger value="platform">Platform</TabsTrigger>
              <TabsTrigger value="manual">Manual</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 text-xs text-slate-500 uppercase tracking-wider font-semibold border-b border-white/5">
                <th className="py-3 px-6">Bike Details</th>
                <th className="py-3 px-6">Price</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Source</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {listings.map((listing: any) => {
                const mainImage = listing.images?.[0] || null;
                const source = getSourceDetails(listing);
                const SourceIcon = source.icon;

                return (
                  <tr key={listing.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-16 bg-slate-800 rounded-lg overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                          {mainImage ? (
                            <img src={mainImage} alt={listing.title} className="h-full w-full object-cover" />
                          ) : (
                            <Bike className="h-6 w-6 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{listing.make} {listing.model}</p>
                          <p className="text-xs text-slate-500">{listing.year} • {listing.kms_driven.toLocaleString()} km</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-white">
                      {listing.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${listing.status === 'published'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : listing.status === 'sold'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-slate-700/50 text-slate-400 border-slate-600'
                        }`}>
                        {listing.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="outline" className={`${source.color} gap-1.5`}>
                        <SourceIcon className="w-3 h-3" />
                        {source.label}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {listing.status === 'draft' && (
                          <InventoryActions listingId={listing.id} isDraft={true} />
                        )}
                        {listing.status !== 'draft' && (
                          <InventoryActions listingId={listing.id} />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {listings.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-white/10">
                <Bike className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-white">No listings yet</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto mt-1 mb-6">
                Start adding your inventory to reach thousands of potential buyers.
              </p>
              <Button asChild className="bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-500/20">
                <Link href="/dealer/inventory/new">
                  <Plus className="h-5 w-5 mr-2" /> Add New Bike
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
