import {
    Users,
    DollarSign,
    Activity,
    Zap,
    Clock,
    Globe,
    ArrowUpRight,
    TrendingUp,
    Bike
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminRevenueChart } from "@/components/admin/AdminRevenueChart";
import { SystemHealthGauge } from "@/components/admin/SystemHealthGauge";
import { UserGrowthChart } from "@/components/admin/UserGrowthChart";
import { AdminService } from "@/lib/services/admin.service";
import { formatINR } from "@/lib/utils";

export default async function AdminDashboard() {
    const [stats, liveActivity] = await Promise.all([
        AdminService.getDashboardStats(),
        AdminService.getLiveActivity(10),
    ]);

    return (
        <div className="p-6 md:p-8 space-y-8 w-full min-h-screen bg-mesh">
            {/* Header */}
            <div className="flex justify-between items-center bg-slate-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Command Center</h1>
                    <p className="text-slate-400 text-sm">Realtime platform insights</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-400 hover:text-white transition-colors">
                        <Clock className="h-3.5 w-3.5" /> Last 24 Hours
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-600/10 border border-brand-500/20 text-xs text-brand-400 font-bold">
                        <Zap className="h-3.5 w-3.5 animate-pulse" /> Live System
                    </div>
                </div>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-5 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 rounded-xl bg-green-500/10 text-green-400 ring-1 ring-white/5">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-green-400 flex items-center gap-1 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">Live</span>
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-white mt-2 group-hover:text-green-400 transition-colors">
                        {formatINR(stats.totalRevenue)}
                    </h3>
                </div>
                <div className="glass-card p-5 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-white/5">
                            <Users className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-blue-400 flex items-center gap-1 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">Active</span>
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Users</p>
                    <h3 className="text-3xl font-bold text-white mt-2 group-hover:text-blue-400 transition-colors">
                        {stats.activeUsers.toLocaleString()}
                    </h3>
                </div>
                <div className="glass-card p-5 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 rounded-xl bg-accent-gold/10 text-accent-gold ring-1 ring-white/5">
                            <Bike className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Live Inventory</p>
                    <h3 className="text-3xl font-bold text-white mt-2 group-hover:text-accent-gold transition-colors">
                        {stats.publishedListings}
                    </h3>
                </div>
                <div className="glass-card p-5 relative overflow-hidden group bg-gradient-to-br from-brand-900/20 to-slate-900/50 border-brand-500/20">
                    <div className="absolute -right-6 -top-6 p-3 opacity-10 rotate-12">
                        <Globe className="h-32 w-32 text-brand-500" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                            <p className="text-brand-400 text-xs font-bold uppercase tracking-wider">Inquiries Tracked</p>
                        </div>
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            {stats.totalLeads.toLocaleString()}
                        </h3>
                        <p className="text-slate-400 text-xs mt-1 font-mono">Platform Health: Optimal</p>
                    </div>
                </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2">
                    <AdminRevenueChart />
                </div>
                {/* System Health */}
                <div className="lg:col-span-1">
                    <SystemHealthGauge />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Growth */}
                <div className="lg:col-span-2">
                    <UserGrowthChart />
                </div>

                {/* Live Activity Feed */}
                <div className="lg:col-span-1 glass-panel p-0 flex flex-col overflow-hidden h-full">
                    <div className="p-4 border-b border-white/5 bg-slate-900/50 sticky top-0 z-10 flex justify-between items-center backdrop-blur-sm">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Activity className="h-4 w-4 text-brand-400" /> System Logs
                        </h3>
                        <span className="text-[10px] text-slate-400 font-mono">Recent</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-5 max-h-[300px] scrollbar-thin scrollbar-thumb-white/10">
                        {liveActivity.length > 0 ? liveActivity.map((log) => (
                            <div key={log.id} className="flex gap-4 relative group">
                                <div className="absolute left-[14px] top-8 bottom-[-24px] w-px bg-white/5 group-last:hidden" />

                                <div className={cn(
                                    "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border border-white/5 z-10 shadow-lg",
                                    log.type === 'payment' ? "bg-green-500/10 text-green-400" :
                                        log.type === 'listing' ? "bg-blue-500/10 text-blue-400" :
                                            "bg-slate-800 text-slate-400"
                                )}>
                                    {log.type === 'payment' ? <DollarSign className="h-3.5 w-3.5" /> :
                                        log.type === 'listing' ? <Bike className="h-3.5 w-3.5" /> :
                                            <Activity className="h-3.5 w-3.5" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">{log.action}</p>
                                        <span className="text-[10px] text-slate-500 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                                            {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{log.details}</p>
                                    <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest font-bold">{log.user}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10">
                                <p className="text-slate-500 text-xs">No recent activity detected.</p>
                            </div>
                        )}
                    </div>
                    <div className="p-3 border-t border-white/5 bg-slate-900/30 text-center text-xs text-slate-500">
                        Real-time synchronization enabled
                    </div>
                </div>
            </div>
        </div>
    );
}
