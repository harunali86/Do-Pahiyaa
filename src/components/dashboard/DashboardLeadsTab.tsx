"use client";

import { Unlock, Phone, Mail, MapPin, ChevronRight, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface DashboardLeadsTabProps {
    leads: any[];
}

export default function DashboardLeadsTab({ leads }: DashboardLeadsTabProps) {
    if (leads.length === 0) {
        return (
            <div className="py-20 text-center opacity-40">
                <Unlock className="w-16 h-16 mx-auto mb-4" />
                <p className="text-xl font-bold">No leads unlocked yet</p>
                <p className="text-sm mt-2">Unlock potential buyers from the marketplace leads section to start deals.</p>
                <Link
                    href="/dealer/leads"
                    className="mt-6 inline-flex items-center gap-2 text-brand-400 font-bold hover:underline"
                >
                    Browse Leads <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {leads.map((item) => {
                const lead = item.lead;
                const buyer = lead.buyer || {};
                const listing = lead.listing || {};

                return (
                    <div key={item.id} className="glass-panel p-6 border border-white/5 bg-slate-900/30 flex flex-col lg:flex-row lg:items-center justify-between gap-8 hover:border-white/10 transition-all group">

                        {/* Buyer Info */}
                        <div className="flex items-center gap-6 flex-1">
                            <div className="h-16 w-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center font-bold text-2xl text-brand-400">
                                {buyer.full_name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-white mb-1">{buyer.full_name}</h3>
                                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                    <a href={`tel:${buyer.phone}`} className="flex items-center gap-2 hover:text-brand-400 transition-colors">
                                        <Phone className="w-4 h-4" /> {buyer.phone}
                                    </a>
                                    <a href={`mailto:${buyer.email}`} className="flex items-center gap-2 hover:text-brand-400 transition-colors">
                                        <Mail className="w-4 h-4" /> {buyer.email}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Bike Segment */}
                        <div className="flex items-center gap-4 px-6 border-l border-white/5">
                            <div className="h-12 w-12 rounded-xl bg-slate-800 border border-white/5 overflow-hidden">
                                {listing.images?.[0] ? (
                                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-xs uppercase font-bold text-slate-500 tracking-widest">Inquired About</p>
                                <p className="text-sm font-bold text-white">{listing.title}</p>
                                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {listing.city}
                                </p>
                            </div>
                        </div>

                        {/* Date & Actions */}
                        <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0">
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Unlocked At</p>
                                <p className="text-sm font-medium text-slate-300">
                                    {format(new Date(item.created_at), 'dd MMM, yyyy')}
                                </p>
                            </div>
                            <Link
                                href={`/listings/${listing.id}`}
                                className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-brand-500/10"
                            >
                                View Deal
                            </Link>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
