import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ConfigService } from "@/lib/services/config.service";
import { WhatsAppService } from "@/lib/services/whatsapp.service";

// Lean select constants — only fetch what's needed (GEMINI.md Rule 3.1: No N+1)
const LEAD_LIST_SELECT = `
    id, message, status, created_at,
    listing:listings(id, title, city, make, model),
    buyer:profiles(full_name, email)
`;

const LEAD_DETAIL_SELECT = `
    id, message, status, created_at,
    listing:listings(id, title, city, make, model, price, images),
    buyer:profiles(id, full_name, email, phone)
`;

export class LeadService {
    /**
     * Capture a new lead from a buyer.
     * Uses UNIQUE constraint (listing_id, buyer_id) for duplicate prevention at DB level.
     */
    static async createInquiry(buyerId: string, listingId: string, message: string) {
        const supabase = await createSupabaseServerClient();

        // Single upsert instead of check-then-insert (eliminates race condition)
        const { data, error } = await supabase
            .from("leads")
            .insert({
                listing_id: listingId,
                buyer_id: buyerId,
                message,
                status: "new",
            })
            .select("id, status, created_at")
            .single();

        if (error) {
            if (error.code === "23505") {
                throw new Error("You have already submitted an inquiry for this bike.");
            }
            throw new Error(`Lead capture failed: ${error.message}`);
        }

        // Fetch full listing details for Allocation Engine
        const { data: listing } = await supabase
            .from("listings")
            .select("city, make, model, year, specs")
            .eq("id", listingId)
            .single();

        // Trigger notification to listing owner (fire-and-forget)
        this.notifyListingOwner(supabase, listingId, buyerId).catch(() => { });

        // Trigger Real-time Allocation to Subscribers (fire-and-forget)
        if (listing && data?.id) {
            this.allocateLead(data.id, listing, data.created_at).catch(e => console.error("Allocation Error:", e));
        }

        return data;
    }

    /**
     * Notify listing owner about a new inquiry.
     */
    private static async notifyListingOwner(supabase: any, listingId: string, buyerId: string) {
        // Get listing owner and buyer name in parallel
        const [listingResult, buyerResult] = await Promise.all([
            supabase.from("listings").select("seller_id, title").eq("id", listingId).single(),
            supabase.from("profiles").select("full_name").eq("id", buyerId).single(),
        ]);

        if (!listingResult.data) return;

        const buyerName = buyerResult.data?.full_name || "Someone";
        const listingTitle = listingResult.data.title;

        await supabase.from("notifications").insert({
            user_id: listingResult.data.seller_id,
            title: "New Inquiry Received! 🔔",
            message: `${buyerName} is interested in your listing "${listingTitle}".`,
            type: "lead_new",
        });
    }

    /**
     * Allocate a new lead to dealers with matching active subscriptions.
     * Matches if LeadAttributes (City, Make, Model) contains SubscriptionFilters.
     */
    static async allocateLead(
        leadId: string,
        listing: { city: string; make: string; model: string; year: number; specs?: Record<string, any> | null },
        createdAt?: string
    ) {
        const admin = createSupabaseAdminClient();
        const region = await this.resolveRegionForCity(admin, listing.city);

        // 1. Construct Lead Attributes JSON
        const leadAttributes = {
            city: listing.city,
            region,
            brand: listing.make,
            make: listing.make,
            model: listing.model,
            lead_type: listing.specs?.lead_type || "buy_used"
        };

        // 2. Allocate via server-side matcher RPC (faster + transactional)
        const { data, error } = await admin.rpc("allocate_new_lead_v2", {
            p_lead_id: leadId,
            p_lead_attributes: leadAttributes,
            p_lead_created_at: createdAt || new Date().toISOString(),
        });

        if (error) {
            console.error("Allocation RPC failed:", error);
            return;
        }

        const allocated = Array.isArray(data?.allocated) ? data.allocated : [];
        for (const item of allocated) {
            if (item?.dealerId) {
                this.sendUnlockNotifications(admin, leadId, item.dealerId).catch(() => { });
            }
        }
    }

    private static async resolveRegionForCity(admin: any, city?: string) {
        if (!city) return null;
        const { data } = await admin
            .from("city_region_map")
            .select("region")
            .eq("city", city)
            .eq("is_active", true)
            .maybeSingle();
        return data?.region || null;
    }

    /**
     * Dealer unlocks a lead to view contact details.
     * Uses optimistic locking via credits_balance check (GEMINI.md Rule 4.1).
     */
    static async unlockLead(dealerId: string, leadId: string) {
        const supabase = await createSupabaseServerClient();

        // 1. Get dynamic unlock price from admin config
        const unlockCost = await ConfigService.getConfigNumber("lead_unlock_price", 1);

        // 2. Verify Dealer & Credits (single query)
        let { data: dealer, error: dealerError } = await supabase
            .from("dealers")
            .select("credits_balance, subscription_status")
            .eq("profile_id", dealerId)
            .single();

        // 2b. Auto-create dealer if missing (Self-healing for onboarding)
        if (!dealer || dealerError) {
            const { data: newDealer, error: createError } = await supabase
                .from("dealers")
                .insert({
                    profile_id: dealerId,
                    credits_balance: 500, // Onboarding bonus
                    business_name: "My Dealership",
                })
                .select("credits_balance, subscription_status")
                .single();

            if (createError) throw new Error("Failed to initialize dealer account: " + createError.message);
            dealer = newDealer;
        }

        if (dealer.credits_balance < unlockCost) {
            throw new Error(`Insufficient credits. Need ${unlockCost}, have ${dealer.credits_balance}.`);
        }

        // 3. Check idempotency — already unlocked?
        const { data: existingUnlock } = await supabase
            .from("unlock_events")
            .select("id")
            .eq("lead_id", leadId)
            .eq("dealer_id", dealerId)
            .maybeSingle();

        if (existingUnlock) {
            return { success: true, message: "Already unlocked", alreadyUnlocked: true };
        }

        // 4. Optimistic credit deduction (GEMINI.md Rule 4.1)
        const { data: updated, error: deductError } = await supabase
            .from("dealers")
            .update({ credits_balance: dealer.credits_balance - unlockCost })
            .eq("profile_id", dealerId)
            .eq("credits_balance", dealer.credits_balance) // Optimistic lock
            .select("credits_balance")
            .single();

        if (deductError || !updated) {
            throw new Error("Credit deduction failed — concurrent update detected. Please retry.");
        }

        // 5. Record unlock event
        const { error: unlockError } = await supabase
            .from("unlock_events")
            .insert({ lead_id: leadId, dealer_id: dealerId, cost_credits: unlockCost });

        if (unlockError) {
            // Rollback credit (best effort)
            await supabase
                .from("dealers")
                .update({ credits_balance: dealer.credits_balance })
                .eq("profile_id", dealerId);
            throw new Error("Unlock failed. Credits refunded.");
        }

        // 6. Update lead status
        await supabase
            .from("leads")
            .update({ status: "unlocked" })
            .eq("id", leadId);

        // 7. Send WhatsApp Notifications (Fire-and-forget)
        this.sendUnlockNotifications(supabase, leadId, dealerId).catch(e => console.error("Notification Error:", e));

        return { success: true, creditsRemaining: updated.credits_balance, cost: unlockCost };
    }

    /**
     * Get leads for a dealer's listings.
     * Single query with JOIN — no N+1 (GEMINI.md Rule 3.1).
     */
    static async getDealerLeads(dealerId: string, params?: { page?: number; limit?: number }) {
        const supabase = await createSupabaseServerClient();
        const page = params?.page || 1;
        const limit = Math.min(params?.limit || 20, 100);
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await supabase
            .from("leads")
            .select(LEAD_LIST_SELECT, { count: "exact" })
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) throw new Error(error.message);

        return {
            leads: data || [],
            metadata: { total: count || 0, page, totalPages: Math.ceil((count || 0) / limit) },
        };
    }

    /**
     * Dashboard stats — SINGLE query batch instead of 4 separate calls.
     * (GEMINI.md Rule 3.1: No N+1)
     */
    static async getDashboardStats(dealerId: string) {
        const supabase = await createSupabaseServerClient();

        // Parallel queries (Promise.all instead of sequential)
        const [
            dealerResult,
            leadsStatusResult,
            listingsStatusResult
        ] = await Promise.all([
            // 1. Dealer Info
            supabase
                .from("dealers")
                .select("credits_balance, subscription_status")
                .eq("profile_id", dealerId)
                .single(),

            // 2. Leads Breakdown (Leads on my listings)
            supabase
                .from("leads")
                .select("status, listing!inner(seller_id)")
                .eq("listing.seller_id", dealerId),

            // 3. Inventory Breakdown
            supabase
                .from("listings")
                .select("status")
                .eq("seller_id", dealerId)
        ]);

        // Group Leads
        const leadCounts: Record<string, number> = {};
        (leadsStatusResult.data || []).forEach((l: any) => {
            leadCounts[l.status] = (leadCounts[l.status] || 0) + 1;
        });
        const leadStats = Object.keys(leadCounts).map(status => ({ status, count: leadCounts[status] }));

        // Group Inventory
        const inventoryCounts: Record<string, number> = {};
        (listingsStatusResult.data || []).forEach((l: any) => {
            inventoryCounts[l.status] = (inventoryCounts[l.status] || 0) + 1;
        });
        const inventoryStats = Object.keys(inventoryCounts).map(status => ({ status, count: inventoryCounts[status] }));

        const totalLeads = (leadsStatusResult.data || []).length;
        const activeListings = (listingsStatusResult.data || []).filter((l: any) => l.status === 'published').length;

        return {
            credits: dealerResult.data?.credits_balance || 0,
            subscription: dealerResult.data?.subscription_status || "inactive",
            totalLeads,
            activeListings,
            leadStats,
            inventoryStats
        };
    }
    /**
     * Get daily lead analytics for the last 30 days.
     * Returns: { date: string, leads: number, conversions: number }[]
     */
    static async getLeadAnalytics(dealerId: string) {
        const supabase = await createSupabaseServerClient();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data, error } = await supabase
            .from("leads")
            .select("created_at, status, listing!inner(seller_id)")
            .eq("listing.seller_id", dealerId)
            .gte("created_at", thirtyDaysAgo.toISOString())
            .order("created_at", { ascending: true });

        if (error) return [];

        // Group by Date
        const statsMap = new Map<string, { leads: number; conversions: number }>();

        // Initialize last 30 days with 0
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            statsMap.set(dateStr, { leads: 0, conversions: 0 });
        }

        data.forEach((lead: any) => {
            const dateStr = new Date(lead.created_at).toISOString().split('T')[0];
            const current = statsMap.get(dateStr) || { leads: 0, conversions: 0 };

            current.leads++;
            if (lead.status === 'unlocked' || lead.status === 'converted' || lead.status === 'contacted') {
                current.conversions++;
            }
            statsMap.set(dateStr, current);
        });

        // Convert to array and sort by date
        return Array.from(statsMap.entries())
            .map(([date, stats]) => ({ date, ...stats }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }


    /**
     * Get accessible unlocked leads for the dealer.
     * Includes filtering by status or search.
     */
    static async getUnlockedLeads(dealerId: string, filters?: { status?: string; search?: string }) {
        const admin = createSupabaseAdminClient();

        // Step 1: Get unlock events
        const { data: events, error } = await admin
            .from('unlock_events')
            .select('id, created_at, lead_id')
            .eq('dealer_id', dealerId)
            .order('created_at', { ascending: false });

        if (error || !events?.length) {
            if (error) console.error("getUnlockedLeads error:", error);
            return [];
        }

        // Step 2: Get lead details with buyer & listing info
        const leadIds = events.map((e: any) => e.lead_id);
        let leadQuery = admin
            .from('leads')
            .select('id, created_at, status, buyer_id, listing_id')
            .in('id', leadIds);

        if (filters?.status && filters.status !== 'all') {
            leadQuery = leadQuery.eq('status', filters.status);
        }

        const { data: leads } = await leadQuery;

        if (!leads?.length) return [];

        // Step 3: Get profiles and listings
        const buyerIds = [...new Set(leads.map((l: any) => l.buyer_id))];
        const listingIds = [...new Set(leads.map((l: any) => l.listing_id))];

        const [{ data: buyers }, { data: listings }] = await Promise.all([
            admin.from('profiles').select('id, full_name, phone, email').in('id', buyerIds),
            admin.from('listings').select('id, title, make, city, price, images').in('id', listingIds),
        ]);

        // Step 4: Assemble & Filter by Search (Case insensitive partial match)
        const buyerMap = Object.fromEntries((buyers || []).map((b: any) => [b.id, b]));
        const listingMap = Object.fromEntries((listings || []).map((l: any) => [l.id, l]));

        let results = events.map((e: any) => {
            const lead = leads.find(l => l.id === e.lead_id);
            if (!lead) return null;
            return {
                ...e,
                lead: {
                    ...lead,
                    buyer: buyerMap[lead.buyer_id] || {},
                    listing: listingMap[lead.listing_id] || {},
                }
            };
        }).filter(Boolean);

        // Apply Client-side Search (since we are joining data manually)
        if (filters?.search) {
            const lowerSearch = filters.search.toLowerCase();
            results = results.filter((item: any) => {
                const l = item.lead;
                const buyerName = l.buyer?.full_name?.toLowerCase() || '';
                const bikeName = l.listing?.title?.toLowerCase() || '';
                return buyerName.includes(lowerSearch) || bikeName.includes(lowerSearch);
            });
        }

        return results;
    }

    /**
     * Get marketplace leads (not yet unlocked).
     * Includes filtering by Make, City.
     */
    static async getMarketplaceLeads(dealerId: string, filters?: { make?: string; city?: string }) {
        const admin = createSupabaseAdminClient();

        // Get already unlocked lead IDs
        const { data: unlocked } = await admin.from('unlock_events').select('lead_id').eq('dealer_id', dealerId);
        const unlockedIds = unlocked?.map((u: any) => u.lead_id) || [];

        // Get available leads
        let query = admin
            .from('leads')
            .select('id, created_at, status, listing_id')
            .neq('buyer_id', dealerId) // Don't show my own leads? (Buyer can't be dealer, usually)
            .order('created_at', { ascending: false });

        if (unlockedIds.length > 0) {
            query = query.not('id', 'in', `(${unlockedIds.join(',')})`);
        }

        const { data: leads, error } = await query;
        if (error) console.error("getMarketplaceLeads error:", error);
        if (!leads?.length) return [];

        // Get listing details to filter by Make/City
        const listingIds = [...new Set(leads.map((l: any) => l.listing_id))];
        let listingQuery = admin
            .from('listings')
            .select('id, title, make, city, price, images')
            .in('id', listingIds);

        if (filters?.make && filters.make !== 'all') {
            listingQuery = listingQuery.ilike('make', `%${filters.make}%`);
        }
        if (filters?.city && filters.city !== 'all') {
            listingQuery = listingQuery.ilike('city', `%${filters.city}%`);
        }

        const { data: listings } = await listingQuery;

        // If filters removed all listings, return empty
        if (!listings?.length) return [];

        const listingMap = Object.fromEntries(listings.map((l: any) => [l.id, l]));

        // Filter leads that correspond to fetched listings
        return leads.map((l: any) => {
            const listing = listingMap[l.listing_id];
            if (!listing) return null; // Filtered out
            return {
                ...l,
                listing
            };
        }).filter(Boolean);
    }
    /**
     * ADMIN: Get ALL leads with full details (Buyer, Listing, Seller, Unlock Status).
     * Used for the Industry-Grade CRM view.
     */
    static async getAllAdminLeads(params?: { page?: number; limit?: number; search?: string; status?: string; make?: string; city?: string }) {
        const admin = createSupabaseAdminClient();
        const page = params?.page || 1;
        const limit = Math.min(params?.limit || 20, 100);
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = admin
            .from("leads")
            .select(`
                *,
                buyer:profiles!buyer_id(id, full_name, email, phone),
                listing:listings!inner(id, title, price, city, make, model, seller_id),
                unlock_events(id, dealer_id, unlocked_at, dealer:dealers(business_name))
            `, { count: "exact" });

        // Apply Status Filter
        if (params?.status && params.status !== 'all') {
            query = query.eq('status', params.status);
        }

        // Apply Make Filter (on joined listing)
        if (params?.make && params.make !== 'all') {
            query = query.ilike('listing.make', `%${params.make}%`);
        }

        // Apply City Filter (on joined listing)
        if (params?.city && params.city !== 'all') {
            query = query.ilike('listing.city', `%${params.city}%`);
        }

        // Apply Search (Complex due to joins - best effort on top-level or use separate search index)
        // Note: Supabase basic OR across text search on joined tables is tricky. 
        // We focus on searching Lead ID or Status here, or need a materialized view for fast full-text search.
        // For P0, we'll implement a basic search on Buyer Name (via another inner join filter?) 
        // Actually, filtering by joined column in OR is hard. 
        // Strategy: If search is present, we might rely on client-side for the *page* or accepts that search is limited to exact ID or Status.
        // BETTER: Use `!inner` on profiles to search buyer name.
        if (params?.search) {
            // This is a simplification. True global search requires a dedicated RPC or Flattened View.
            // We will try to filter by ID if it looks like a UUID, else ignore to prevent 500s.
            if (params.search.match(/^[0-9a-f]{8}-[0-9a-f]{4}-/)) {
                query = query.eq('id', params.search);
            }
        }

        const { data: leads, error, count } = await query
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) {
            console.error("Admin GetAllLeads Error:", error);
            return { leads: [], metadata: { total: 0, page: 1, totalPages: 0 } };
        }

        // 2. Fetch Sellers (Listing Owners) manually if needed, or rely on listing.seller_id
        // To get Seller Name, we need another join or separate fetch. 
        // Let's do a quick separate fetch for seller profiles to keep the main query clean-ish
        const sellerIds = [...new Set(leads.map(l => l.listing?.seller_id).filter(Boolean))];
        const { data: sellers } = await admin
            .from("profiles")
            .select("id, full_name, email")
            .in("id", sellerIds);

        const sellerMap = new Map(sellers?.map(s => [s.id, s]) || []);

        // 3. Transform Data for UI
        const results = leads.map(lead => {
            const sellerKey = lead.listing?.seller_id;
            const seller = sellerMap.get(sellerKey);
            const unlockedBy = lead.unlock_events?.[0]; // Assuming 1 unlock per lead for now, or take first

            return {
                id: lead.id,
                status: lead.status, // new, unlocked, contacted, converted, closed
                message: lead.message,
                created_at: lead.created_at,
                buyer: {
                    name: lead.buyer?.full_name || "Unknown",
                    phone: lead.buyer?.phone || "N/A",
                    email: lead.buyer?.email
                },
                listing: {
                    title: lead.listing?.title || "Unknown Bike",
                    price: lead.listing?.price || 0,
                    city: lead.listing?.city,
                    make: lead.listing?.make,
                    model: lead.listing?.model,
                    seller_name: seller?.full_name || "Unknown Seller"
                },
                unlocked_by: unlockedBy ? {
                    dealer_name: unlockedBy.dealer?.business_name || "Unknown Dealer",
                    at: unlockedBy.unlocked_at
                } : null
            };
        });

        return {
            leads: results,
            metadata: {
                total: count || 0,
                page,
                totalPages: Math.ceil((count || 0) / limit)
            }
        };
    }

    /**
     * Helper to send WhatsApp notifications on unlock.
     */
    private static async sendUnlockNotifications(supabase: any, leadId: string, dealerId: string) {
        // Fetch all necessary details
        const { data: lead } = await supabase
            .from("leads")
            .select(`
                buyer:profiles!buyer_id(full_name, phone),
                listing:listings(title, model)
            `)
            .eq("id", leadId)
            .single();

        const { data: dealerProfile } = await supabase
            .from("profiles")
            .select("full_name, phone")
            .eq("id", dealerId)
            .single();

        const { data: dealerStats } = await supabase
            .from("dealers")
            .select("business_name")
            .eq("profile_id", dealerId)
            .single();

        if (!lead || !dealerProfile) return;

        const buyerPhone = lead.buyer?.phone;
        const dealerPhone = dealerProfile.phone;
        const dealerName = dealerStats?.business_name || dealerProfile.full_name;
        const bikeName = lead.listing?.title || "Bike";

        // Notify Dealer
        if (dealerPhone) {
            await WhatsAppService.sendLeadUnlockNotification(dealerPhone, lead.buyer?.full_name || "Buyer", bikeName);
        }

        // Notify Buyer
        if (buyerPhone) {
            await WhatsAppService.sendBuyerNotification(buyerPhone, dealerName, bikeName);
        }
    }
}
