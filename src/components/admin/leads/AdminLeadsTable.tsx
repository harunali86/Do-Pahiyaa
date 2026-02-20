"use client";

import { useState } from "react";
import { Search, Phone, MessageSquare, Bike, User, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaginationMetadata {
    total?: number;
    page?: number;
    totalPages?: number;
    limit?: number;
}

interface AdminLeadsTableProps {
    initialLeads: any[];
    metadata?: PaginationMetadata;
}

const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(date);
};

export function AdminLeadsTable({ initialLeads, metadata }: AdminLeadsTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [makeFilter, setMakeFilter] = useState("all");
    const [cityFilter, setCityFilter] = useState("all");

    // Get unique makes and cities for filters
    const uniqueMakes = Array.from(new Set(initialLeads.map(l => l.listing?.make).filter(Boolean))).sort();
    const uniqueCities = Array.from(new Set(initialLeads.map(l => l.listing?.city).filter(Boolean))).sort();

    // Filter Logic
    const normalizedSearchTerm = searchTerm.toLowerCase();
    const filteredLeads = initialLeads.filter(lead => {
        const buyerName = lead.buyer?.name || "";
        const listingTitle = lead.listing?.title || "";
        const unlockedDealer = lead.unlocked_by?.dealer_name || "";
        const leadId = lead.id || "";
        const matchesSearch =
            buyerName.toLowerCase().includes(normalizedSearchTerm) ||
            listingTitle.toLowerCase().includes(normalizedSearchTerm) ||
            unlockedDealer.toLowerCase().includes(normalizedSearchTerm) ||
            leadId.includes(searchTerm);

        if (!matchesSearch) return false;

        if (statusFilter !== "all" && lead.status !== statusFilter) return false;
        if (makeFilter !== "all" && lead.listing?.make !== makeFilter) return false;
        if (cityFilter !== "all" && lead.listing?.city !== cityFilter) return false;

        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Lead CRM</h1>
                    <p className="text-slate-400">Track inquiries, unlocks, and conversions across the platform.</p>
                </div>
                {typeof metadata?.total === "number" && (
                    <p className="text-xs text-slate-400">
                        Total Leads: <span className="text-white font-medium">{metadata.total}</span>
                        {metadata.page && metadata.totalPages ? (
                            <span className="ml-2">• Page {metadata.page} / {metadata.totalPages}</span>
                        ) : null}
                    </p>
                )}
            </div>

            <div className="glass-panel border border-white/5 overflow-hidden p-6">

                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px] bg-slate-900 border-white/10">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="unlocked">Unlocked</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="converted">Converted</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={makeFilter} onValueChange={setMakeFilter}>
                            <SelectTrigger className="w-[140px] bg-slate-900 border-white/10">
                                <SelectValue placeholder="Brand" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                <SelectItem value="all">All Brands</SelectItem>
                                {uniqueMakes.map(make => (
                                    <SelectItem key={make} value={make}>{make}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={cityFilter} onValueChange={setCityFilter}>
                            <SelectTrigger className="w-[140px] bg-slate-900 border-white/10">
                                <SelectValue placeholder="City" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                <SelectItem value="all">All Cities</SelectItem>
                                {uniqueCities.map(city => (
                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search buyer, bike, or dealer..."
                            className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-500/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900/50 text-xs text-slate-500 uppercase tracking-wider font-semibold border-b border-white/5">
                                <th className="py-3 px-6">Buyer</th>
                                <th className="py-3 px-6">Interest (Bike)</th>
                                <th className="py-3 px-6">Status</th>
                                <th className="py-3 px-6">Unlocked By</th>
                                <th className="py-3 px-6">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredLeads.map((lead) => (
                                <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium flex items-center gap-2">
                                                <User className="h-3 w-3 text-slate-400" />
                                                {lead.buyer?.name || "Unknown Buyer"}
                                            </span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                <Phone className="h-3 w-3" /> {lead.buyer?.phone || "-"}
                                            </span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3" /> {lead.buyer?.email || "-"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium flex items-center gap-2">
                                                <Bike className="h-3 w-3 text-brand-400" />
                                                {lead.listing?.title || "Untitled Listing"}
                                            </span>
                                            <span className="text-xs text-slate-500 mt-1">
                                                ₹{Number(lead.listing?.price || 0).toLocaleString('en-IN')} • {lead.listing?.city || "-"}
                                            </span>
                                            <span className="text-[10px] text-slate-600 truncate max-w-[150px]">
                                                Seller: {lead.listing?.seller_name || "-"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <Badge variant="outline" className={`
                                                uppercase text-[10px] tracking-wide border
                                                ${lead.status === 'new' ? 'text-blue-400 border-blue-400/20 bg-blue-400/5' :
                                                lead.status === 'unlocked' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5' :
                                                    lead.status === 'converted' ? 'text-green-400 border-green-400/20 bg-green-400/5' :
                                                        'text-slate-400 border-slate-400/20 bg-slate-400/5'}
                                            `}>
                                            {lead.status}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-6">
                                        {lead.unlocked_by ? (
                                            <div className="flex flex-col">
                                                <span className="text-accent-gold text-sm font-medium flex items-center gap-1">
                                                    <ShieldCheck className="h-3 w-3" />
                                                    {lead.unlocked_by.dealer_name}
                                                </span>
                                                <span className="text-[10px] text-slate-600">
                                                    {formatDate(lead.unlocked_by.at)}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-600 italic">Locked</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                                        {formatDate(lead.created_at)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredLeads.length === 0 && (
                        <div className="py-20 text-center">
                            <p className="text-slate-500">No leads found matching criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
