"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export async function getSellerDashboardData() {
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

        // Fetch User's Listings
        const { data: listings, error: listingsError } = await supabase
            .from("listings")
            .select(`
                id,
                title,
                price,
                status,
                images,
                created_at,
                make,
                model
            `)
            .eq("seller_id", user.id)
            .order("created_at", { ascending: false });

        if (listingsError) throw listingsError;

        // Calculate Analytics
        const totalViews = 0; // Placeholder until views tracking table is implemented
        const activeLeads = 0; // Placeholder until leads table is implemented

        return {
            success: true,
            data: {
                listings: listings || [],
                analytics: {
                    totalViews,
                    activeLeads,
                }
            }
        };

    } catch (error: any) {
        console.error("Seller Dashboard Error:", error);
        return { success: false, error: error.message };
    }
}
