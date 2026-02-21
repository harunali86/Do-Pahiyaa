"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import {
    Heart,
    Clock,
    MessageSquare,
    Package,
    ChevronRight,
    TrendingUp,
    Tag
} from "lucide-react";

import { useEffect, useState } from "react";
import { getBuyerDashboardData } from "@/app/actions/buyer";
import { Loader2 } from "lucide-react";

export default function BuyerDashboard() {
    const [data, setData] = useState<{
        user: { name: string };
        activeDealsList: any[];
        savedListings: any[];
        recentOffers: any[];
        analytics: {
            totalSaved: number;
            activeDeals: number;
            offersSent: number;
            auctionsWon: number;
        }
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const res = await getBuyerDashboardData();
            if (res.success && res.data) {
                setData(res.data);
            }
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-500 w-8 h-8" /></div>;
    return (
        <div className="min-h-screen py-8 space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
                    <p className="text-slate-400">Welcome back, {data?.user.name}</p>
                </div>
                <Link
                    href="/search"
                    className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
                >
                    <TrendingUp className="w-5 h-5" /> Browse Bikes
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Package} label="Active Deals" value={data?.analytics.activeDeals.toString() || "0"} />
                <StatCard icon={Heart} label="Saved Bikes" value={data?.analytics.totalSaved.toString() || "0"} />
                <StatCard icon={MessageSquare} label="Offers Sent" value={data?.analytics.offersSent.toString() || "0"} />
                <StatCard icon={Tag} label="Auctions Won" value={data?.analytics.auctionsWon.toString() || "0"} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Column: Deals & Activity */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Active Deals Section */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Active Deals</h2>
                            <Link href="/buyer/deals" className="text-sm text-brand-400 hover:text-brand-300">View All</Link>
                        </div>

                        <div className="space-y-4">
                            {data?.activeDealsList.length === 0 ? (
                                <p className="text-slate-400 p-4 border border-white/5 rounded-2xl">No active deals right now. Start making offers!</p>
                            ) : data?.activeDealsList.map((deal) => (
                                <div key={deal.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 hover:border-brand-500/20 transition-all group">
                                    <div className="relative w-full sm:w-32 h-32 sm:h-auto rounded-xl overflow-hidden shrink-0">
                                        <Image
                                            src={deal.image}
                                            alt={deal.bike}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="flex-1 py-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-white text-lg">{deal.bike}</h3>
                                                <p className="text-brand-400 font-bold">{deal.price}</p>
                                            </div>
                                            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">{deal.date}</span>
                                        </div>

                                        <div className="mt-4">
                                            <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mb-1">
                                                <span className={deal.step >= 1 ? "text-brand-400" : ""}>Offer</span>
                                                <span className={deal.step >= 2 ? "text-brand-400" : ""}>Token</span>
                                                <span className={deal.step >= 3 ? "text-brand-400" : ""}>Inspect</span>
                                                <span className={deal.step >= 4 ? "text-brand-400" : ""}>Deal</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-brand-500 rounded-full transition-all duration-1000"
                                                    style={{ width: `${(deal.step / 4) * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2">Next: <span className="text-white">{deal.status}</span></p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Recent Offers Table (Mock) */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">Recent Offers</h2>
                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-900/80 text-slate-500 border-b border-white/5">
                                    <tr>
                                        <th className="p-4 font-medium">Bike</th>
                                        <th className="p-4 font-medium">Your Offer</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-slate-300">
                                    {data?.recentOffers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-4 text-center text-slate-400">No recent offers.</td>
                                        </tr>
                                    ) : (
                                        data?.recentOffers.map((offer) => (
                                            <tr key={offer.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 font-medium">{offer.bike}</td>
                                                <td className="p-4">{offer.price}</td>
                                                <td className="p-4"><span className="text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded text-xs font-bold">{offer.status}</span></td>
                                                <td className="p-4 text-right"><button className="text-brand-400 text-xs font-bold hover:underline">View</button></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                </div>

                {/* Sidebar Column: Saved & Watchlist */}
                <aside className="space-y-8">
                    <div className="bg-glass-gradient border border-white/10 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-white">Saved Listings</h3>
                            <Link href="/buyer/saved" className="text-xs text-brand-400 hover:underline">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {data?.savedListings.length === 0 ? (
                                <p className="text-slate-400 text-sm">No saved listings yet.</p>
                            ) : data?.savedListings.map(item => (
                                <div key={item.id} className="flex gap-3 items-center group cursor-pointer">
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1">{item.title}</h4>
                                        <p className="text-xs text-slate-400">{item.price}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{item.location}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-2 rounded-lg border border-white/10 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                            Manage Watchlist
                        </button>
                    </div>
                </aside>

            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="bg-slate-900/50 border border-white/5 p-4 rounded-xl flex items-center gap-4 hover:border-brand-500/30 transition-all">
            <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400 shrink-0">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-2xl font-bold text-white leading-none">{value}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
        </div>
    );
}
