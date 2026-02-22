"use client";

import {
    LayoutDashboard,
    Heart,
    Gavel,
    Unlock,
    TrendingUp,
    Users,
    Bike,
    ShieldCheck
} from "lucide-react";

interface DashboardStatsProps {
    profile: any;
    favoritesCount: number;
    bidsCount: number;
    leadsCount: number;
}

export default function DashboardStats({ profile, favoritesCount, bidsCount, leadsCount }: DashboardStatsProps) {
    const isDealer = profile?.role === 'dealer' || profile?.role === 'admin';

    const stats = [
        {
            label: "My Favorites",
            value: favoritesCount,
            icon: Heart,
            color: "text-red-400",
            bg: "bg-red-500/10"
        },
        {
            label: "Active Bids",
            value: bidsCount,
            icon: Gavel,
            color: "text-amber-400",
            bg: "bg-amber-500/10"
        },
        {
            label: "Unlocked Leads",
            value: leadsCount,
            icon: Unlock,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            hidden: !isDealer
        },
        {
            label: "Verification Status",
            value: profile?.is_verified ? "Verified" : (profile?.status === 'pending_verification' ? "Pending" : "Not Verified"),
            icon: ShieldCheck,
            color: profile?.is_verified ? "text-green-400" : "text-slate-400",
            bg: profile?.is_verified ? "bg-green-500/10" : "bg-slate-500/10",
            hidden: !isDealer
        }
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.filter(s => !s.hidden).map((stat) => (
                    <div key={stat.label} className="glass-panel p-6 border border-white/5 bg-slate-900/40 relative overflow-hidden group hover:border-white/10 transition-all">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>

                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <stat.icon className="w-16 h-16" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Welcome Cards for New Users */}
            {!isDealer && favoritesCount === 0 && (
                <div className="bg-brand-600/10 border border-brand-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 justify-between">
                    <div className="space-y-4 text-center md:text-left">
                        <h2 className="text-2xl font-bold text-white">Find your dream bike today!</h2>
                        <p className="text-slate-400 max-w-md">Browse through {profile?.city || "your city"}&apos;s best deals on verified bikes. Start bidding or unlock leads to grow your garage.</p>
                        <button
                            onClick={() => window.location.href = '/buy-used-bikes'}
                            className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-500/20"
                        >
                            Explore Marketplace
                        </button>
                    </div>
                    <div className="w-48 h-48 bg-slate-950 rounded-2xl flex items-center justify-center border border-white/5 relative overflow-hidden">
                        <Bike className="w-24 h-24 text-brand-500/20" />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-600/10 to-transparent" />
                    </div>
                </div>
            )}
        </div>
    );
}
