"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { formatINR } from "@/lib/utils";
import { MoreHorizontal, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";

interface Lead {
    id: string;
    listing: {
        id: string;
        title: string;
        city: string;
        make: string;
        model: string;
    } | null;
    buyer: {
        full_name: string | null;
        email: string;
    } | null;
    message: string | null;
    status: string;
    created_at: string;
}

interface RealtimeLeadsListProps {
    initialLeads: Lead[];
    dealerId: string;
}

// Lean select matching LeadService.LEAD_LIST_SELECT
const REALTIME_LEAD_SELECT = `
    id, message, status, created_at,
    listing:listings(id, title, city, make, model),
    buyer:profiles(full_name, email)
`;

export default function RealtimeLeadsList({ initialLeads, dealerId }: RealtimeLeadsListProps) {
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        setLeads(initialLeads);
    }, [initialLeads]);

    useEffect(() => {
        // Subscribe to NEW leads
        const channel = supabase
            .channel('dealer-leads')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'leads',
                },
                async (payload) => {
                    const newLeadId = payload.new.id;

                    const { data: fullLead, error } = await supabase
                        .from("leads")
                        .select(REALTIME_LEAD_SELECT)
                        .eq("id", newLeadId)
                        .single();

                    if (fullLead && !error) {
                        toast.info("🔔 New Lead Received!");
                        setLeads((prev) => [fullLead as unknown as Lead, ...prev]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);


    // Handle Unlock (Optimistic UI)
    const handleUnlock = async (leadId: string) => {
        toast.loading("Unlocking lead...");
        try {
            const res = await fetch("/api/leads/unlock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leadId })
            });

            if (!res.ok) throw new Error("Unlock failed");

            toast.dismiss();
            toast.success("Lead Unlocked!");

            // Update local state
            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'unlocked' } : l));

        } catch (err) {
            toast.dismiss();
            toast.error("Failed to unlock. Check credits.");
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
                        <th className="pb-3 px-4">Listing</th>
                        <th className="pb-3 px-4">Buyer Status</th>
                        <th className="pb-3 px-4">Message</th>
                        <th className="pb-3 px-4">Status</th>
                        <th className="pb-3 px-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {leads.length > 0 ? leads.map((lead: any) => (
                        <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors animate-in fade-in slide-in-from-top-2">
                            <td className="py-4 px-4">
                                <p className="text-white font-medium text-sm">{lead.listing?.title || "Unknown Bike"}</p>
                                <p className="text-slate-500 text-xs">{lead.listing?.city}</p>
                            </td>
                            <td className="py-4 px-4 text-slate-300 text-sm">
                                {lead.status === 'unlocked' ? (
                                    <span className="text-green-400 flex items-center gap-1"><Unlock className="w-3 h-3" /> {lead.buyer?.phone || "Contact Visible"}</span>
                                ) : (
                                    <span className="text-slate-500 flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</span>
                                )}
                            </td>
                            <td className="py-4 px-4 text-slate-400 text-sm truncate max-w-[150px]">{lead.message}</td>
                            <td className="py-4 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                ${lead.status === 'new' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                        lead.status === 'unlocked' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            'bg-slate-700/50 text-slate-400 border-slate-600'}`}>
                                    {lead.status}
                                </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                                {lead.status === 'new' && (
                                    <button
                                        onClick={() => handleUnlock(lead.id)}
                                        className="text-xs bg-brand-600 hover:bg-brand-500 text-white px-2 py-1 rounded transition-colors shadow-lg shadow-brand-500/20"
                                    >
                                        Unlock (1 Credit)
                                    </button>
                                )}
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-500">
                                No inquiries yet. Boost your listings to get more leads!
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
