"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export async function getBuyerDashboardData() {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
            cookies: {
                getAll() {
                    return cookieStore.getAll().map((cookie: any) => ({
                        name: cookie.name,
                        value: cookie.value,
                    }));
                },
                setAll() { },
            },
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Not authenticated" };
        }

        // Fetch User Profile Name
        const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

        // Calculate Analytics (Placeholder until tables exist)
        const totalSaved = 0;
        const activeDeals = 0;
        const offersSent = 0;
        const auctionsWon = 0;

        return {
            success: true,
            data: {
                user: {
                    name: profile?.full_name || "User"
                },
                activeDealsList: [], // Fetch from related tables when built
                savedListings: [], // Fetch from favorites/saved table when built
                recentOffers: [], // Fetch from offers table when built
                analytics: {
                    totalSaved,
                    activeDeals,
                    offersSent,
                    auctionsWon
                }
            }
        };

    } catch (error: any) {
        console.error("Buyer Dashboard Error:", error);
        return { success: false, error: error.message };
    }
}
