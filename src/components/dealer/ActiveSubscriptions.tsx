"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Zap, Clock, MapPin, Tag } from "lucide-react";

interface Subscription {
    id: string;
    filters: any;
    total_quota: number;
    remaining_quota: number;
    status: string;
    created_at: string;
}

export function ActiveSubscriptions({ subscriptions }: { subscriptions: Subscription[] }) {
    if (!subscriptions.length) return null;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent-gold" />
                Active Lead Packs
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subscriptions.map(sub => (
                    <Card key={sub.id} className="glass-panel p-4 border-white/10 bg-slate-900/50">
                        <div className="flex justify-between items-start mb-3">
                            <Badge variant="outline" className="bg-brand-500/10 text-brand-400 border-brand-500/20">
                                {sub.status === 'active' ? 'Active' : sub.status} {sub.status === 'active' && '●'}
                            </Badge>
                            <span className="text-xs text-slate-500">
                                {new Date(sub.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="space-y-2 mb-4">
                            {Object.entries(sub.filters).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2 text-sm text-slate-300">
                                    {key === 'city' && <MapPin className="h-4 w-4 text-slate-500" />}
                                    {key === 'brand' && <Tag className="h-4 w-4 text-slate-500" />}
                                    <span className="capitalize">{key}:</span>
                                    <span className="font-medium text-white">{String(value)}</span>
                                </div>
                            ))}
                            {Object.keys(sub.filters).length === 0 && (
                                <span className="text-sm text-slate-400 italic">Unfiltered (Any Lead)</span>
                            )}
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Quota Usage</span>
                                <span>{sub.total_quota - sub.remaining_quota} / {sub.total_quota}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-brand-500 transition-all duration-500"
                                    style={{ width: `${((sub.total_quota - sub.remaining_quota) / sub.total_quota) * 100}%` }}
                                />
                            </div>
                            <p className="text-right text-xs text-accent-gold font-bold pt-1">
                                {sub.remaining_quota} Leads Remaining
                            </p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
