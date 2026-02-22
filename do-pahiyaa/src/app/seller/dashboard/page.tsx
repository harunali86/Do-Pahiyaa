"use client";

import Link from "next/link";
import Image from "next/image";
import {
    PlusCircle,
    BarChart3,
    Eye,
    MessageCircle,
    MoreVertical,
    CheckCircle2
} from "lucide-react";

import { useEffect, useState } from "react";
import { getSellerDashboardData } from "@/app/actions/seller";
import { Loader2 } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { defaultBlurDataURL } from "@/lib/image";

export default function SellerDashboard() {
    const [listings, setListings] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState({ totalViews: 0, activeLeads: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const res = await getSellerDashboardData();
            if (res.success && res.data) {
                setListings(res.data.listings);
                setAnalytics(res.data.analytics);
            }
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
    return (
        <div className="min-h-screen py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Seller Hub</h1>
                    <p className="text-slate-400">Manage your listings and deals</p>
                </div>
                <Link
                    href="/sell"
                    className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
                >
                    <PlusCircle className="w-5 h-5" /> Post New Ad
                </Link>
            </div>

            {/* Analytics Items */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 md:col-span-1 bg-slate-900/50 border border-white/5 p-5 rounded-2xl">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Views</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-white">{analytics.totalViews}</span>
                        <span className="text-green-500 text-xs font-bold mb-1.5 flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Tracking</span>
                    </div>
                </div>
                <div className="col-span-2 md:col-span-1 bg-slate-900/50 border border-white/5 p-5 rounded-2xl">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Active Leads</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-white">{analytics.activeLeads}</span>
                        <span className="text-brand-500 text-xs font-bold mb-1.5">Potential Buyers</span>
                    </div>
                </div>
            </div>

            {/* Listings Management */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Your Inventory</h2>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-lg bg-white/5 text-xs text-white border border-white/10">Active (1)</span>
                        <span className="px-3 py-1 rounded-lg bg-transparent text-xs text-slate-500 hover:text-white transition-colors cursor-pointer">Drafts (0)</span>
                        <span className="px-3 py-1 rounded-lg bg-transparent text-xs text-slate-500 hover:text-white transition-colors cursor-pointer">Sold (5)</span>
                    </div>
                </div>

                <div className="divide-y divide-white/5">
                    {listings.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            You have no listings yet. Post an ad to get started.
                        </div>
                    ) : listings.map((item) => {
                        const imageUrl = item.images?.[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80';
                        return (
                            <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6 hover:bg-white/[0.02] transition-colors group">
                                {/* Image */}
                                <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden shrink-0 border border-white/10">
                                    <Image
                                        src={imageUrl}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                        placeholder="blur"
                                        blurDataURL={defaultBlurDataURL}
                                    />
                                    <div className="absolute top-2 left-2">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase backdrop-blur-md ${item.status === 'published' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors">{item.title}</h3>
                                            <button className="text-slate-500 hover:text-white rounded-lg p-1 hover:bg-white/10 transition-colors">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <p className="text-xl font-bold text-brand-400 mt-1">{formatINR(item.price)}</p>
                                    </div>

                                    <div className="flex items-center gap-6 mt-4 text-sm text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <Eye className="w-4 h-4" />
                                            <span>0 views</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MessageCircle className="w-4 h-4" />
                                            <span>0 inquiries</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex sm:flex-col gap-2 justify-end">
                                    <button className="flex-1 sm:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-sm font-medium transition-colors">
                                        Edit Listing
                                    </button>
                                    <button className="flex-1 sm:flex-none px-4 py-2 bg-brand-600/10 hover:bg-brand-600/20 text-brand-400 border border-brand-500/20 rounded-lg text-sm font-medium transition-colors">
                                        Promote
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
