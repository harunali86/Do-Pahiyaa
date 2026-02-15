"use client";

import {
    TrendingUp,
    Users,
    DollarSign,
    Package,
    ArrowUpRight,
    MoreHorizontal
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { dealerLeads } from "@/lib/demo/mock-data";

export default function DealerDashboard() {
    const stats = [
        {
            label: "Total Sales",
            value: "₹24.8L",
            change: "+12%",
            icon: DollarSign,
            color: "text-green-400",
            bg: "bg-green-500/10"
        },
        {
            label: "Active Leads",
            value: "18",
            change: "+4",
            icon: Users,
            color: "text-brand-400",
            bg: "bg-brand-500/10"
        },
        {
            label: "Inventory Value",
            value: "₹85.2L",
            change: "+2.5%",
            icon: Package,
            color: "text-accent-gold",
            bg: "bg-accent-gold/10"
        },
        {
            label: "Conversion Rate",
            value: "14.2%",
            change: "+1.1%",
            icon: TrendingUp,
            color: "text-accent-gold",
            bg: "bg-accent-gold/10"
        },
    ];

    return (
        <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400">Welcome back, BlueWheel Premium</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 rounded-lg bg-slate-800 border border-white/5 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors">
                        Download Report
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/10">
                        Boost Listings
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="glass-card p-6 relative overflow-hidden group hover:-translate-y-1">
                            <div className="flex justify-between items-start">
                                <div className={`p-3 rounded-xl ${stat.bg} ring-1 ring-white/5`}>
                                    <Icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                                    {stat.change} <ArrowUpRight className="h-3 w-3" />
                                </span>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                                <p className="text-slate-400 text-sm font-medium mt-1">{stat.label}</p>
                            </div>
                            {/* Decorative gradient */}
                            <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full ${stat.bg} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Leads Table */}
                <div className="lg:col-span-2 glass-panel p-6 border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-white">Recent Inquiries</h2>
                        <button className="text-brand-400 text-sm font-medium hover:text-brand-300 transition-colors">View All</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
                                    <th className="pb-3 px-4">Listing</th>
                                    <th className="pb-3 px-4">Buyer</th>
                                    <th className="pb-3 px-4">Offer</th>
                                    <th className="pb-3 px-4">Status</th>
                                    <th className="pb-3 px-4">Time</th>
                                    <th className="pb-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {dealerLeads.map((lead) => (
                                    <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 px-4">
                                            <p className="text-white font-medium text-sm">{lead.listingTitle}</p>
                                            <p className="text-slate-500 text-xs">{lead.city}</p>
                                        </td>
                                        <td className="py-4 px-4 text-slate-300 text-sm">{lead.buyerName}</td>
                                        <td className="py-4 px-4 text-white font-mono text-sm">{formatINR(lead.offeredPrice)}</td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                        ${lead.status === 'new' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    lead.status === 'negotiating' ? 'bg-accent-gold/10 text-accent-gold border-accent-gold/20' :
                                                        lead.status === 'closed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                            'bg-slate-700/50 text-slate-400 border-slate-600'}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-slate-500 text-sm">{lead.createdAt}</td>
                                        <td className="py-4 px-4 text-right">
                                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions / Activity Feed */}
                <div className="glass-panel p-6 border border-white/5 flex flex-col h-full">
                    <h2 className="text-lg font-bold text-white mb-6">Inventory status</h2>

                    <div className="relative flex-1 flex items-center justify-center">
                        {/* Simple Donut Chart CSS */}
                        <div className="relative h-48 w-48 rounded-full border-[12px] border-slate-800 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-[12px] border-brand-500 border-r-transparent border-t-transparent -rotate-45" />
                            <div className="text-center">
                                <p className="text-3xl font-bold text-white">42</p>
                                <p className="text-xs text-slate-400 uppercase tracking-widest">Bikes</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-brand-500" />
                                <span className="text-sm text-slate-300">Published</span>
                            </div>
                            <span className="text-white font-bold">28</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-accent-gold" />
                                <span className="text-sm text-slate-300">Pending Review</span>
                            </div>
                            <span className="text-white font-bold">4</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-slate-600" />
                                <span className="text-sm text-slate-300">Sold</span>
                            </div>
                            <span className="text-white font-bold">10</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
