export const dynamic = "force-dynamic";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LeadService } from "@/lib/services/lead.service";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Calendar, Check, Zap, Lock, User, MoreHorizontal, Mail } from "lucide-react";
import { UnlockLeadButton } from "@/components/dealer/UnlockLeadButton";
import { LeadFilters } from "@/components/dealer/LeadFilters";
import Link from "next/link";
import { LeadStatusSimple } from "@/components/dealer/LeadStatusSimple";
import { LeadDetailsModal } from "@/components/dealer/LeadDetailsModal";
import { DealerLeadsRealtimeSync } from "@/components/dealer/DealerLeadsRealtimeSync";

type DealerLeadsSearchParams = {
  tab?: string | string[];
  make?: string | string[];
  city?: string | string[];
  status?: string | string[];
  search?: string | string[];
  date?: string | string[];
};

const readFirstParam = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;

export default async function DealerLeadsPage({ searchParams }: { searchParams: Promise<DealerLeadsSearchParams> }) {
  const supabase = await createSupabaseServerClient();
  const resolvedParams = await searchParams;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>Please login</div>;

  // Determine active tab - Robust detection (GEMINI Rule 11.2)
  const tabParam = readFirstParam(resolvedParams.tab);
  const activeTab = tabParam === "myleads" ? "myleads" : "market";

  // Fetch Data based on active tab
  let myLeads = [];
  let marketLeads = [];

  if (activeTab === "myleads") {
    myLeads = await LeadService.getUnlockedLeads(user.id, {
      status: readFirstParam(resolvedParams.status),
      search: readFirstParam(resolvedParams.search),
      date: readFirstParam(resolvedParams.date)
    });
  } else {
    marketLeads = await LeadService.getMarketplaceLeads(user.id, {
      make: readFirstParam(resolvedParams.make),
      city: readFirstParam(resolvedParams.city)
    });
  }

  // 1. Fetch Subscription Stats for Cards (Bikes4Sale Style)
  const { data: activeSubscriptions } = await supabase
    .from("dealer_subscriptions")
    .select("total_quota, remaining_quota")
    .eq("dealer_id", user.id)
    .eq("status", "active");

  const totalSubscribed = activeSubscriptions?.reduce((acc, sub) => acc + sub.total_quota, 0) || 0;
  const remainingLeads = activeSubscriptions?.reduce((acc, sub) => acc + sub.remaining_quota, 0) || 0;
  const deliveredLeads = totalSubscribed - remainingLeads;

  // Get Credits
  const { data: dealer } = await supabase.from('dealers').select('credits_balance').eq('profile_id', user.id).single();
  const credits = dealer?.credits_balance || 0;

  return (
    <div className="p-6 md:p-8 space-y-6 w-full min-h-screen">
      <DealerLeadsRealtimeSync dealerId={user.id} activeTab={activeTab} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Leads Central</h1>
          <p className="text-slate-400 text-sm">Find new buyers and manage your contacts</p>
        </div>
        <div className="bg-slate-900 border border-brand-500/20 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-brand-500/5">
          <Zap className="h-4 w-4 text-brand-500 fill-brand-500" />
          <span className="text-white font-bold">Balance: ₹{credits}</span>
        </div>
      </div>

      {/* Summary Cards (Bikes4Sale Design) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 p-6 rounded-xl text-center">
          <p className="text-[#8B5CF6] text-xs font-bold uppercase tracking-widest mb-2">Subscribed Leads</p>
          <h2 className="text-4xl font-black text-white">{totalSubscribed}</h2>
        </div>
        <div className="bg-[#10B981]/10 border border-[#10B981]/20 p-6 rounded-xl text-center">
          <p className="text-[#10B981] text-xs font-bold uppercase tracking-widest mb-2">Delivered Leads</p>
          <h2 className="text-4xl font-black text-white">{deliveredLeads}</h2>
        </div>
        <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 p-6 rounded-xl text-center">
          <p className="text-[#F59E0B] text-xs font-bold uppercase tracking-widest mb-2">Remaining Leads</p>
          <h2 className="text-4xl font-black text-white">{remainingLeads}</h2>
        </div>
      </div>

      <LeadFilters activeTab={activeTab} />

      {/* Marketplace Tab Content */}
      {activeTab === "market" && (
        <div className="glass-panel border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/50 text-xs text-slate-500 uppercase tracking-wider font-semibold border-b border-white/5">
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Bike Details</th>
                  <th className="py-3 px-6">Location</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {marketLeads.map((lead: any) => (
                  <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 text-sm text-slate-400">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{new Date(lead.created_at).toLocaleDateString()}</span>
                        <span className="text-xs">{new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-14 bg-slate-800 rounded bg-cover bg-center shrink-0 border border-white/10 flex items-center justify-center">
                          {lead.listing.images?.[0] ? (
                            <img src={lead.listing.images[0]} alt="" className="h-full w-full object-cover rounded" />
                          ) : (
                            <User className="h-5 w-5 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{lead.listing.title}</p>
                          <p className="text-xs text-slate-500">{lead.listing.make} • {lead.listing.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        {lead.listing.city}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="secondary" className="bg-slate-800 text-slate-400 font-normal border border-white/5">
                        <Lock className="h-3 w-3 mr-1" /> Locked
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <UnlockLeadButton leadId={lead.id} />
                      <div className="flex justify-end gap-1 mt-1 opacity-50">
                        <div className="h-1.5 w-12 bg-slate-800 rounded animate-pulse" />
                        <div className="h-1.5 w-8 bg-slate-800 rounded animate-pulse" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {marketLeads.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-white/10">
                  <User className="h-8 w-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-white">No New Leads Found</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto mt-1">
                  Try adjusting your filters or check back later for new inquiries.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Leads Tab Content - Enhanced Table View */}
      {activeTab === "myleads" && (
        <div className="glass-panel border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/50 text-[10px] text-slate-500 uppercase tracking-widest font-bold border-b border-white/5">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Mobile</th>
                  <th className="py-4 px-6 text-center">Pics</th>
                  <th className="py-4 px-6">Model</th>
                  <th className="py-4 px-6">Year</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Reg No</th>
                  <th className="py-4 px-6">City</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {myLeads.map((item: any) => (
                  <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-white text-sm">{item.lead.buyer.full_name}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{new Date(item.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <a href={`tel:${item.lead.buyer.phone}`} className="text-brand-400 font-medium hover:underline flex items-center gap-2">
                        {item.lead.buyer.phone}
                      </a>
                    </td>
                    <td className="py-4 px-6 text-center text-xs text-slate-500">
                      {item.lead.listing.images?.length || 0}
                    </td>
                    <td className="py-4 px-6">
                      <Link href={`/listings/${item.lead.listing.id}`} target="_blank" className="text-sm font-bold text-white hover:text-brand-400 transition-colors uppercase">
                        {item.lead.listing.title}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-400">
                      {item.lead.listing.year || '-'}
                    </td>
                    <td className="py-4 px-6 text-sm font-mono text-slate-300">
                      {item.lead.listing.price ? `₹${item.lead.listing.price.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-400 font-medium">
                      {(item.lead.listing.specs?.reg_number ||
                        item.lead.listing.specs?.registration_number ||
                        item.lead.listing.specs?.regNo ||
                        '-') as string}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-400">
                      {item.lead.listing.city}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <LeadDetailsModal lead={item.lead} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {myLeads.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-white/10">
                  <Lock className="h-8 w-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-white">No Leads Unlocked Yet</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto mt-1 mb-6">
                  Go to &quot;Buy Leads&quot; to unlock potential buyers for your inventory.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
