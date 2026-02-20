export const dynamic = "force-dynamic";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LeadService } from "@/lib/services/lead.service";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Calendar, Check, Zap, Lock, User, MoreHorizontal, Mail } from "lucide-react";
import { UnlockLeadButton } from "@/components/dealer/UnlockLeadButton";
import { LeadFilters } from "@/components/dealer/LeadFilters";
import { LeadStatusSimple } from "@/components/dealer/LeadStatusSimple";
import { LeadDetailsModal } from "@/components/dealer/LeadDetailsModal";

export default async function DealerLeadsPage({ searchParams }: { searchParams: { tab?: string; make?: string; city?: string; status?: string; search?: string } }) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>Please login</div>;

  // Determine active tab
  const activeTab = searchParams.tab || "market";

  // Fetch Data based on active tab
  let myLeads = [];
  let marketLeads = [];

  if (activeTab === "myleads") {
    myLeads = await LeadService.getUnlockedLeads(user.id, {
      status: searchParams.status,
      search: searchParams.search
    });
  } else {
    marketLeads = await LeadService.getMarketplaceLeads(user.id, {
      make: searchParams.make,
      city: searchParams.city
    });
  }

  // Get Credits (Optional: Fetch real credits if needed, for now placeholder or separate query)
  const { data: dealer } = await supabase.from('dealers').select('credits_balance').eq('profile_id', user.id).single();
  const credits = dealer?.credits_balance || 0;

  return (
    <div className="p-6 md:p-8 space-y-6 w-full min-h-screen">
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

      <LeadFilters />

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
                      {/* Masked Contact Info hint */}
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

      {/* My Leads Tab Content - Table View */}
      {activeTab === "myleads" && (
        <div className="glass-panel border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/50 text-xs text-slate-500 uppercase tracking-wider font-semibold border-b border-white/5">
                  <th className="py-3 px-6">Unlocked Date</th>
                  <th className="py-3 px-6">Buyer Details</th>
                  <th className="py-3 px-6">Interested In</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {myLeads.map((item: any) => (
                  <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 text-sm text-slate-400">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{new Date(item.created_at).toLocaleDateString()}</span>
                        <span className="text-xs">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400 font-bold text-xs border border-brand-500/20">
                          {item.lead.buyer.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{item.lead.buyer.full_name}</p>
                          <a href={`tel:${item.lead.buyer.phone}`} className="text-xs text-slate-400 hover:text-brand-400 flex items-center gap-1 transition-colors">
                            <Phone className="h-3 w-3" /> {item.lead.buyer.phone}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-start gap-3">
                        {item.lead.listing.images?.[0] && (
                          <img src={item.lead.listing.images[0]} alt="" className="h-10 w-14 object-cover rounded bg-slate-800 border border-white/10" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{item.lead.listing.title}</p>
                          <p className="text-xs text-slate-500">{item.lead.listing.city} • {item.lead.listing.make}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <LeadStatusSimple leadId={item.lead.id} currentStatus={item.lead.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <div className="flex gap-1 mr-2">
                          <a href={`tel:${item.lead.buyer.phone}`} className="h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white border border-white/5 transition-colors">
                            <Phone className="h-4 w-4" />
                          </a>
                          <a href={`mailto:${item.lead.buyer.email}`} className="h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white border border-white/5 transition-colors">
                            <Mail className="h-4 w-4" />
                          </a>
                        </div>
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
