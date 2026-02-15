"use client";

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

// Mock Data for Dashboard
const activeDeals = [
    {
        id: 1,
        bike: "Royal Enfield Continental GT 650",
        price: "₹3.15 Lakh",
        status: "Inspection Scheduled",
        step: 3, // 1: Offer, 2: Token, 3: Inspection, 4: Done
        date: "12 Feb 2026",
        image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=2940&auto=format&fit=crop"
    }
];

const savedListings = [
    {
        id: 101,
        title: "KTM Duke 390 (2024)",
        price: "₹2.85 Lakh",
        location: "Indiranagar, Bangalore",
        image: "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?q=80&w=2940&auto=format&fit=crop"
    },
    {
        id: 102,
        title: "Triumph Speed 400",
        price: "₹2.45 Lakh",
        location: "Koramangala, Bangalore",
        image: "https://images.unsplash.com/photo-1622185135505-2d795043df06?q=80&w=2940&auto=format&fit=crop"
    }
];

export default function BuyerDashboard() {
    return (
        <div className="min-h-screen py-8 space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
                    <p className="text-slate-400">Welcome back, Rohan</p>
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
                <StatCard icon={Package} label="Active Deals" value="1" />
                <StatCard icon={Heart} label="Saved Bikes" value="12" />
                <StatCard icon={MessageSquare} label="Offers Sent" value="3" />
                <StatCard icon={Tag} label="Auctions Won" value="0" />
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
                            {activeDeals.map((deal) => (
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

                                        {/* Stepper Mock */}
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
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-medium">Kawasaki Ninja 300</td>
                                        <td className="p-4">₹2.65 L</td>
                                        <td className="p-4"><span className="text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded text-xs font-bold">Countered</span></td>
                                        <td className="p-4 text-right"><button className="text-brand-400 text-xs font-bold hover:underline">View</button></td>
                                    </tr>
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-medium">Dominar 400</td>
                                        <td className="p-4">₹1.80 L</td>
                                        <td className="p-4"><span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded text-xs font-bold">Rejected</span></td>
                                        <td className="p-4 text-right"><button className="text-slate-500 text-xs font-bold hover:underline">Archive</button></td>
                                    </tr>
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
                            {savedListings.map(item => (
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
