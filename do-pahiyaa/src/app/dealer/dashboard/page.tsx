export const dynamic = "force-dynamic";
import {
    TrendingUp,
    Users,
    Package,
    ArrowUpRight,
    MoreHorizontal,
    Lock,
    Unlock,
    CreditCard,
    Zap
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { LeadService } from "@/lib/services/lead.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import BuyCreditsButton from "@/components/dealer/BuyCreditsButton";
import RealtimeLeadsList from "@/components/dealer/RealtimeLeadsList";
import { LeadPerformanceChart } from "@/components/dealer/LeadPerformanceChart";
import { CreditUsageChart } from "@/components/dealer/CreditUsageChart";
import { DashboardCharts } from "@/components/dealer/DashboardCharts";

export default async function DealerDashboard() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Fetch Real Data
    const statsData = await LeadService.getDashboardStats(user.id).catch(() => null);
    const leadsResult = await LeadService.getDealerLeads(user.id).catch(() => ({ leads: [], metadata: { total: 0, page: 1, totalPages: 0 } }));

    // Normalize Supabase joins
    const leads = (leadsResult.leads as any[]).map((l: any) => ({
        ...l,
        listing: Array.isArray(l.listing) ? l.listing[0] ?? null : l.listing,
        buyer: Array.isArray(l.buyer) ? l.buyer[0] ?? null : l.buyer,
    }));

    if (!statsData) {
        return <div className="p-8 text-white">Loading Dashboard... (Or Profile not found)</div>;
    }

    const stats = [
        {
            label: "Lead Credits",
            value: statsData.credits.toString(),
            change: "Balance",
            icon: CreditCard,
            color: "text-accent-gold",
            bg: "bg-accent-gold/10"
        },
        {
            label: "Total Leads",
            value: statsData.totalLeads.toString(),
            change: "+12% this week",
            icon: Users,
            color: "text-brand-400",
            bg: "bg-brand-500/10"
        },
        {
            label: "Active Listings",
            value: statsData.activeListings.toString(),
            change: "Inventory",
            icon: Package,
            color: "text-blue-400",
            bg: "bg-blue-500/10"
        },
        {
            label: "Plan Status",
            value: statsData.subscription === 'active' ? 'Pro Plan' : 'Free Tier',
            change: statsData.subscription === 'active' ? 'Active' : 'Upgrade',
            icon: Zap,
            color: statsData.subscription === 'active' ? "text-green-400" : "text-slate-400",
            bg: statsData.subscription === 'active' ? "bg-green-500/10" : "bg-slate-500/10"
        },
    ];

    return (
        <div className="p-6 md:p-8 space-y-8 w-full min-h-screen bg-mesh">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dealer Console</h1>
                    <p className="text-slate-400">Overview of your performance and leads</p>
                </div>
                <div className="flex items-center gap-3">
                    <BuyCreditsButton />
                    <Link href="/seller/listings/new" className="px-5 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/5 flex items-center gap-2">
                        <Package className="h-4 w-4" /> New Listing
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="glass-card p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                            <div className="flex justify-between items-start">
                                <div className={`p-3.5 rounded-2xl ${stat.bg} ring-1 ring-white/5`}>
                                    <Icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${stat.change.includes('Upgrade') ? 'bg-brand-500/20 text-brand-400 border-brand-500/20' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                                    {stat.change}
                                </span>
                            </div>
                            <div className="mt-6">
                                <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                                <p className="text-slate-400 text-sm font-medium mt-1">{stat.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Colored Circle Reports (Charts) */}
            <DashboardCharts
                leadStats={statsData.leadStats || []}
                inventoryStats={statsData.inventoryStats || []}
            />

            {/* Charts & Analytics Section */}
            <div className="w-full">
                <LeadPerformanceChart />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Leads Table */}
                <div className="lg:col-span-2 glass-panel p-6 border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-brand-500/10">
                                <Users className="h-5 w-5 text-brand-400" />
                            </div>
                            <h2 className="text-lg font-bold text-white">Recent Inquiries</h2>
                        </div>
                        <Link href="/dealer/leads" className="text-brand-400 text-sm font-medium hover:text-brand-300 transition-colors flex items-center gap-1">
                            View All <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <RealtimeLeadsList initialLeads={leads} dealerId={user.id} />
                </div>

                {/* Credit Usage & Quick Actions */}
                <div className="flex flex-col gap-6">
                    <CreditUsageChart />

                    <div className="glass-panel p-6 border border-white/5 flex-1">
                        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <button className="w-full p-3 rounded-xl bg-slate-800/50 border border-white/5 text-left hover:bg-slate-800 transition-colors flex items-center justify-between group">
                                <span className="text-sm text-slate-300 group-hover:text-white">Profile Settings</span>
                                <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-white" />
                            </button>
                            <button className="w-full p-3 rounded-xl bg-slate-800/50 border border-white/5 text-left hover:bg-slate-800 transition-colors flex items-center justify-between group">
                                <span className="text-sm text-slate-300 group-hover:text-white">Support Ticket</span>
                                <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-white" />
                            </button>
                            <button className="w-full p-3 rounded-xl bg-slate-800/50 border border-white/5 text-left hover:bg-slate-800 transition-colors flex items-center justify-between group">
                                <span className="text-sm text-slate-300 group-hover:text-white">API Access</span>
                                <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
