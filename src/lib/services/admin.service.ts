import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { WhatsAppService } from "./whatsapp.service";

export class AdminService {
    /**
     * Get aggregate dashboard stats (Revenue, Users, Traffic, etc.)
     */
    static async getDashboardStats() {
        const admin = createSupabaseAdminClient();

        // Parallel fetching of core metrics
        const [
            revenueResult,
            usersResult,
            listingsResult,
            leadsResult
        ] = await Promise.all([
            // 1. Total Revenue (aggregated in DB)
            admin.rpc("admin_total_revenue"),

            // 2. Active Users count
            admin.from("profiles").select("id", { count: "exact", head: true }),

            // 3. Published Listings
            admin.from("listings").select("id", { count: "exact", head: true }).eq("status", "published"),

            // 4. Total Leads
            admin.from("leads").select("id", { count: "exact", head: true })
        ]);

        let totalRevenue = Number(revenueResult.data || 0);
        if (revenueResult.error) {
            const { data: revenueRows } = await admin
                .from("transactions")
                .select("amount")
                .eq("status", "success");
            totalRevenue = (revenueRows || []).reduce((acc, curr) => acc + Number(curr.amount), 0);
        }

        return {
            totalRevenue,
            activeUsers: usersResult.count || 0,
            publishedListings: listingsResult.count || 0,
            totalLeads: leadsResult.count || 0,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get live activity feed based on recent database events.
     */
    static async getLiveActivity(limit = 10) {
        const admin = createSupabaseAdminClient();

        // For activity feed, we combine multiple sources
        const [
            recentLeads,
            recentListings,
            recentTransactions
        ] = await Promise.all([
            admin.from("leads")
                .select("id, created_at, buyer:profiles(full_name), listing:listings(title)")
                .order("created_at", { ascending: false })
                .limit(limit),
            admin.from("listings")
                .select("id, created_at, title, seller:profiles(full_name)")
                .order("created_at", { ascending: false })
                .limit(limit),
            admin.from("transactions")
                .select("id, created_at, amount, dealer_id") // Should ideally join profile
                .order("created_at", { ascending: false })
                .limit(limit)
        ]);

        // Transform and Merge
        const activity: any[] = [];

        (recentLeads.data || []).forEach((item: any) => {
            const listing = Array.isArray(item.listing) ? item.listing[0] : item.listing;
            const buyer = Array.isArray(item.buyer) ? item.buyer[0] : item.buyer;
            activity.push({
                id: `lead_${item.id}`,
                action: "New Inquiry",
                details: `For "${listing?.title || 'Bike'}"`,
                user: buyer?.full_name || "Buyer",
                time: item.created_at,
                type: "lead"
            });
        });

        (recentListings.data || []).forEach((item: any) => {
            const seller = Array.isArray(item.seller) ? item.seller[0] : item.seller;
            activity.push({
                id: `listing_${item.id}`,
                action: "New Listing",
                details: item.title,
                user: seller?.full_name || "Seller",
                time: item.created_at,
                type: "listing"
            });
        });

        (recentTransactions.data || []).forEach(item => {
            activity.push({
                id: `txn_${item.id}`,
                action: "Credits Purchased",
                details: `₹${item.amount} added to wallet`,
                user: "Dealer", // Need join for profile name
                time: item.created_at,
                type: "payment"
            });
        });

        return activity
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .slice(0, limit);
    }

    /**
     * Send Marketing Broadcast to a segment of users.
     */
    static async sendBroadcast(segment: 'all' | 'dealers' | 'buyers' | 'sellers', templateName: string, variables: string[] = []) {
        const admin = createSupabaseAdminClient();
        let query = admin.from("profiles").select("id, phone, full_name, role");

        // Filter by Segment
        if (segment === 'dealers') {
            query = query.eq("role", "dealer");
        } else if (segment === 'buyers') {
            query = query.eq("role", "user"); // Role is user
        } else if (segment === 'sellers') {
            // Fetch sellers (users with at least 1 listing)
            // This requires a join or two-step process. 
            // Simple way: Get all profiles, then filter by those present in 'listings' table? No, inefficient.
            // Better: Get distinct seller_ids from listings, then fetch profiles.
            const { data: sellers } = await admin.from("listings").select("seller_id");
            const sellerIds = [...new Set((sellers || []).map(s => s.seller_id))];
            query = query.in("id", sellerIds);
        }

        const { data: users, error } = await query;

        if (error || !users) throw new Error("Failed to fetch users for broadcast");

        const targetUsers = users.filter(u => u.phone && u.phone.length >= 10);
        console.log(`[Broadcast] Sending '${templateName}' to ${targetUsers.length} ${segment}...`);

        // Batch Send (Limit concurrency if needed, but for now simple loop)
        let successCount = 0;
        let failCount = 0;

        for (const user of targetUsers) {
            // Replace first variable with Name if requested
            const finalVars = [...variables];
            if (variables[0] === "{{name}}") finalVars[0] = user.full_name || "Valued Customer";

            // Construct Component
            const components = [{
                type: "body",
                parameters: finalVars.map(v => ({ type: "text", text: v }))
            }];

            const sent = await WhatsAppService.sendTemplate(user.phone!, templateName, components);
            if (sent) successCount++;
            else failCount++;
        }

        return { success: true, sent: successCount, failed: failCount, total: targetUsers.length };
    }

    /**
     * Get Paginated Users with optionally Dealer info.
     * Supports Search (Name/Email/Phone) and Role Filter.
     */
    static async getPaginatedUsers(params: { page?: number; limit?: number; search?: string; role?: string }) {
        const admin = createSupabaseAdminClient();
        const page = params.page || 1;
        const limit = Math.min(params.limit || 20, 100);
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = admin
            .from("profiles")
            .select(`
                *,
                dealers(business_name, subscription_status, credits_balance)
            `, { count: "exact" });

        // Apply Role Filter
        if (params.role && params.role !== 'all') {
            query = query.eq('role', params.role);
        }

        // Apply Search (ILIKE) on multiple columns
        if (params.search) {
            const term = params.search;
            query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`);
        }

        // Apply Order & Range LAST
        query = query
            .order("created_at", { ascending: false })
            .range(from, to);


        const { data, error, count } = await query;

        if (error) throw new Error(error.message);

        return {
            users: data || [],
            metadata: {
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit)
            }
        };
    }

    /**
     * Get monthly revenue aggregation for charts.
     */
    static async getMonthlyRevenue() {
        const admin = createSupabaseAdminClient();
        const { data, error } = await admin.rpc("admin_revenue_by_month");

        if (error) {
            console.error("Failed to fetch monthly revenue:", error);
            return [];
        }

        return data || [];
    }
}
