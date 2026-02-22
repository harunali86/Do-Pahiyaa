"use client";

import { useState } from "react";
import { Search, Zap, Clock, User, Building2, ChevronRight, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface AdminSubscriptionTableProps {
    initialSubscriptions: any[];
    metadata?: any;
}

export function AdminSubscriptionTable({ initialSubscriptions, metadata }: AdminSubscriptionTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filtered = initialSubscriptions.filter(sub => {
        const matchesSearch =
            sub.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.dealer_name.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;
        if (statusFilter !== "all" && sub.status !== statusFilter) return false;
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Lead Subscriptions</h1>
                    <p className="text-slate-400">Manage and monitor dealer lead filter packs and quotas.</p>
                </div>
                {metadata?.total !== undefined && (
                    <Badge variant="outline" className="bg-brand-500/10 text-brand-400 border-brand-500/20 px-3 py-1">
                        Total Packs: {metadata.total}
                    </Badge>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search dealer or business..."
                        className="pl-10 bg-slate-900 border-white/10 text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'active', 'exhausted', 'expired'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === status
                                    ? 'bg-brand-600 text-white shadow-lg'
                                    : 'bg-slate-900 text-slate-400 border border-white/5 hover:bg-white/5'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filtered.map((sub) => (
                    <Card key={sub.id} className="glass-panel p-6 border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                            {/* Dealer Info */}
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                                    <Building2 className="h-6 w-6 text-brand-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{sub.business_name}</h3>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                        <User className="h-3 w-3" /> {sub.dealer_name}
                                    </p>
                                </div>
                            </div>

                            {/* Subscription Filters */}
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Filters</p>
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {Object.keys(sub.filters).length === 0 ? (
                                        <Badge variant="secondary" className="bg-slate-800 text-slate-400 text-[10px]">Unfiltered</Badge>
                                    ) : (
                                        Object.entries(sub.filters).map(([k, v]) => (
                                            <Badge key={k} variant="outline" className="text-[10px] bg-slate-800/50 border-white/5 text-slate-300">
                                                {k}: {String(v)}
                                            </Badge>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Quota & Usage */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-400">Quota: {sub.remaining_quota} / {sub.total_quota}</span>
                                    <span className="text-white font-mono">{Math.round((sub.remaining_quota / sub.total_quota) * 100)}% left</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className={`h-full transition-all duration-1000 ${sub.remaining_quota === 0 ? 'bg-red-500' :
                                                sub.remaining_quota < sub.total_quota * 0.2 ? 'bg-yellow-500' : 'bg-brand-500'
                                            }`}
                                        style={{ width: `${(sub.remaining_quota / sub.total_quota) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Status & Dates */}
                            <div className="flex items-center justify-between lg:justify-end gap-6 text-right">
                                <div className="space-y-1">
                                    <Badge className={`
                                        uppercase text-[10px] tracking-wider
                                        ${sub.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            sub.status === 'exhausted' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                'bg-slate-800 text-slate-500 border-white/5'}
                                    `}>
                                        {sub.status}
                                    </Badge>
                                    <p className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                                        <Clock className="h-3 w-3" /> {new Date(sub.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-700" />
                            </div>
                        </div>
                    </Card>
                ))}

                {filtered.length === 0 && (
                    <div className="py-20 text-center glass-panel border-white/5 bg-slate-900/50 rounded-xl">
                        <Zap className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500">No lead subscriptions found matching filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
