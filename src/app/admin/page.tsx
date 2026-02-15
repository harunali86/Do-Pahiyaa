"use client";

import dynamic from "next/dynamic";
import {
    Users,
    DollarSign,
    Activity,
    Zap,
    Clock,
    Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
const RevenueChart = dynamic(
    () => import("@/components/admin/RevenueChart").then((module) => module.RevenueChart),
    {
        ssr: false,
        loading: () => <div className="h-full w-full animate-pulse rounded-lg bg-slate-900/60" />
    }
);

const liveActivity = [
    { id: 1, action: "New Bid Placed", details: "₹1.4L on Ducati Panigale", user: "Vikram S.", time: "Just now", type: "bid" },
    { id: 2, action: "User Signup", details: "Dealer Account Verified", user: "KTM Indiranagar", time: "2m ago", type: "user" },
    { id: 3, action: "Listing Approved", details: "Royal Enfield Classic 350", user: "System", time: "5m ago", type: "system" },
    { id: 4, action: "Payment Failed", details: "Transaction #TX9921", user: "Amit K.", time: "12m ago", type: "alert" },
    { id: 5, action: "New Listing", details: "Ninja 300 (2019)", user: "SpeedBikes", time: "15m ago", type: "listing" },
];

export default function AdminDashboard() {
    return (
        <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
                    <p className="text-slate-400 text-sm">Realtime platform insights</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-400 hover:text-white transition-colors">
                        <Clock className="h-3.5 w-3.5" /> Last 24 Hours
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs text-white font-bold transition-colors shadow-lg shadow-brand-500/20">
                        <Zap className="h-3.5 w-3.5" /> Live View
                    </button>
                </div>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-brand-500/20 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-green-400 flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">+12%</span>
                    </div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-green-400 transition-colors">₹1.24 Cr</h3>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-brand-500/20 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                            <Users className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-blue-400 flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">+8%</span>
                    </div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Active Users</p>
                    <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-blue-400 transition-colors">14,204</h3>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-brand-500/20 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 rounded-lg bg-accent-gold/10 text-accent-gold">
                            <Activity className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-accent-gold flex items-center gap-1 bg-accent-gold/10 px-2 py-0.5 rounded-full border border-accent-gold/20">+24%</span>
                    </div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Site Traffic</p>
                    <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-accent-gold transition-colors">1.2M</h3>
                </div>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-900/20 to-slate-900/50 border border-brand-500/20 hover:border-brand-500/40 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-20">
                        <Globe className="h-24 w-24 text-brand-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-brand-400 text-xs font-bold uppercase tracking-wider mb-2">System Status</p>
                        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> All Systems Go
                        </h3>
                        <p className="text-slate-400 text-xs">Response time: 42ms</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Revenue Stream</h3>
                        <select className="bg-slate-950 border border-white/10 text-xs text-slate-400 rounded-md py-1 px-2 outline-none">
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <RevenueChart />
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="lg:col-span-1 p-0 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-slate-900/80 sticky top-0 z-10 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" /> Live Activity
                        </h3>
                        <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-white/5">Realtime</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[340px] scrollbar-thin scrollbar-thumb-slate-700">
                        {liveActivity.map((log) => (
                            <div key={log.id} className="flex gap-3 relative group">
                                {/* Timeline connector */}
                                <div className="absolute left-[15px] top-8 bottom-[-20px] w-px bg-white/5 group-last:hidden" />

                                <div className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border border-white/10 z-10",
                                    log.type === 'bid' ? "bg-brand-500/10 text-brand-400" :
                                        log.type === 'alert' ? "bg-red-500/10 text-red-400" :
                                            "bg-slate-800 text-slate-400"
                                )}>
                                    {log.type === 'bid' ? <DollarSign className="h-4 w-4" /> :
                                        log.type === 'alert' ? <Zap className="h-4 w-4" /> :
                                            <Activity className="h-4 w-4" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-medium text-white group-hover:text-brand-400 transition-colors cursor-pointer">{log.action}</p>
                                        <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">{log.details}</p>
                                    <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest">{log.user}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 border-t border-white/5 bg-slate-900/30 text-center">
                        <button className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors">View All Logs</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
