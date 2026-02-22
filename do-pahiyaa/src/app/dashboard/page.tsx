"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Heart,
    Gavel,
    Unlock,
    Settings,
    Loader2,
    TrendingUp,
    Bike
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import ListingCard from "@/components/marketplace/ListingCard";
import DashboardBidsTab from "@/components/dashboard/DashboardBidsTab";
import DashboardLeadsTab from "@/components/dashboard/DashboardLeadsTab";
import DashboardStats from "@/components/dashboard/DashboardStats";

type DashboardTab = "overview" | "bids" | "favorites" | "leads" | "listings" | "settings";

export default function UnifiedDashboardPage() {
    const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [bids, setBids] = useState<any[]>([]);
    const [unlockedLeads, setUnlockedLeads] = useState<any[]>([]);

    useEffect(() => {
        const loadDashboard = async () => {
            setIsLoading(true);
            const supabase = createSupabaseBrowserClient();

            // 1. Get Session & Profile
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                window.location.href = "/auth/login";
                return;
            }
            setUser(session.user);

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            setProfile(profileData);

            // 2. Fetch Dashboard Data based on role
            try {
                const [favoritesResult, bidsResult] = await Promise.all([
                    supabase
                        .from("favorites")
                        .select(`
                            id,
                            created_at,
                            listing:listings(
                                id,
                                title,
                                price,
                                city,
                                make,
                                model,
                                images,
                                status,
                                is_company_listing,
                                kms_driven,
                                year,
                                ownerType
                            )
                        `)
                        .eq("user_id", session.user.id)
                        .order("created_at", { ascending: false }),
                    supabase
                        .from("bids")
                        .select(`
                            *,
                            auction:auctions(
                                id,
                                status,
                                end_time,
                                listing:listings(id, title, images)
                            )
                        `)
                        .eq("bidder_id", session.user.id)
                        .order("created_at", { ascending: false }),
                ]);

                if (favoritesResult.error) throw favoritesResult.error;
                if (bidsResult.error) throw bidsResult.error;

                setFavorites(favoritesResult.data || []);
                setBids(bidsResult.data || []);

                if (profileData?.role === 'dealer' || profileData?.role === 'admin' || profileData?.role === 'super_admin') {
                    const { data: leads, error: leadsError } = await supabase
                        .from("unlock_events")
                        .select(`
                            id,
                            created_at,
                            lead:leads(
                                id,
                                status,
                                buyer:profiles(full_name, email, phone),
                                listing:listings(id, title, city, price, images)
                            )
                        `)
                        .eq("dealer_id", session.user.id)
                        .order("created_at", { ascending: false });

                    if (leadsError) throw leadsError;
                    setUnlockedLeads(leads || []);
                }
            } catch (error) {
                console.error("Dashboard data fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
        );
    }

    const tabs: { id: DashboardTab; label: string; icon: any; hidden?: boolean }[] = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "favorites", label: "My Favorites", icon: Heart },
        { id: "bids", label: "My Bids", icon: Gavel },
        { id: "leads", label: "Unlocked Leads", icon: Unlock, hidden: profile?.role !== 'dealer' && profile?.role !== 'admin' && profile?.role !== 'super_admin' },
        { id: "listings", label: "My Listings", icon: Bike, hidden: profile?.role !== 'dealer' && profile?.role !== 'admin' && profile?.role !== 'super_admin' },
        { id: "settings", label: "Profile Settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            Namaste, {profile?.full_name?.split(' ')[0]}!
                        </h1>
                        <p className="text-slate-400 mt-1">
                            {profile?.role === 'dealer' ? "Dealer Dashboard" : "Buyer Dashboard"} — Track your bikes and leads.
                        </p>
                    </div>
                    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-brand-500/20 border border-brand-500/20 flex items-center justify-center font-bold text-xl text-brand-400">
                            {profile?.full_name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-white font-bold">{profile?.full_name}</p>
                            <p className="text-slate-500 text-xs">{profile?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex overflow-x-auto pb-4 scrollbar-hide gap-2 border-b border-white/5">
                    {tabs.filter(t => !t.hidden).map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${isActive
                                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {activeTab === "overview" && (
                        <DashboardStats
                            profile={profile}
                            favoritesCount={favorites.length}
                            bidsCount={bids.length}
                            leadsCount={unlockedLeads.length}
                        />
                    )}

                    {activeTab === "favorites" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {favorites.length === 0 ? (
                                <div className="col-span-full py-20 text-center opacity-40">
                                    <Heart className="w-16 h-16 mx-auto mb-4" />
                                    <p className="text-xl font-bold">No favorite bikes yet</p>
                                    <p className="text-sm mt-2">Explore the marketplace and heart the ones you love!</p>
                                </div>
                            ) : (
                                favorites.map((fav) => (
                                    <ListingCard key={fav.id} listing={fav.listing} />
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "bids" && <DashboardBidsTab bids={bids} />}
                    {activeTab === "leads" && <DashboardLeadsTab leads={unlockedLeads} />}

                    {/* Placeholder for Listings & Settings */}
                    {(activeTab === "listings" || activeTab === "settings") && (
                        <div className="py-20 text-center opacity-40">
                            <TrendingUp className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-xl font-bold">Coming Soon</p>
                            <p className="text-sm mt-2">We are refining this section for the best experience.</p>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}
