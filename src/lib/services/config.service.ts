import { createSupabaseServerClient } from "@/lib/supabase/server";

type ConfigKey =
    | 'lead_unlock_price'
    | 'free_listing_quota'
    | 'featured_ad_price'
    | 'dealer_listing_price'
    | 'credit_pack_10_price'
    | 'credit_pack_25_price'
    | 'credit_pack_50_price'
    | 'maintenance_mode'
    | 'auctions_enabled'
    | 'new_signups_enabled'
    | 'min_leads_purchase'
    | 'gst_rate_percent';

type PlatformConfig = {
    key: string;
    value: string;
    label: string;
    category: string;
    description: string | null;
    updated_at: string;
};

export class ConfigService {
    /**
     * Get a single config value by key.
     * Returns the parsed value or a default.
     */
    static async getConfig(key: ConfigKey, defaultValue?: string): Promise<string> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("platform_config")
            .select("value")
            .eq("key", key)
            .single();

        if (error || !data) return defaultValue || "";
        // JSONB stores values as JSON, so strip quotes for simple strings
        const raw = data.value;
        return typeof raw === "string" ? raw : JSON.stringify(raw);
    }

    /**
     * Get config value as a number.
     */
    static async getConfigNumber(key: ConfigKey, defaultValue = 0): Promise<number> {
        const val = await this.getConfig(key);
        const num = Number(val);
        return isNaN(num) ? defaultValue : num;
    }

    /**
     * Get all config entries, optionally filtered by category.
     */
    static async getAllConfig(category?: string): Promise<PlatformConfig[]> {
        const supabase = await createSupabaseServerClient();

        let query = supabase
            .from("platform_config")
            .select("key, value, label, category, description, updated_at")
            .order("category")
            .order("key");

        if (category) query = query.eq("category", category);

        const { data, error } = await query;
        if (error) throw new Error(`Config fetch failed: ${error.message}`);

        return (data || []).map(item => ({
            ...item,
            // Normalize JSONB value to string for UI display
            value: typeof item.value === "string" ? item.value : JSON.stringify(item.value),
        }));
    }

    /**
     * Update a config value (Admin only — RLS enforced).
     */
    static async setConfig(key: ConfigKey, value: string, userId: string): Promise<void> {
        const supabase = await createSupabaseServerClient();

        const { error } = await supabase
            .from("platform_config")
            .update({
                value: value,
                updated_at: new Date().toISOString(),
                updated_by: userId,
            })
            .eq("key", key);

        if (error) throw new Error(`Config update failed: ${error.message}`);
    }

    /**
     * Batch update multiple config values at once.
     */
    static async setConfigs(updates: { key: ConfigKey; value: string }[], userId: string): Promise<void> {
        const supabase = await createSupabaseServerClient();

        // Use Promise.all for parallel updates (GEMINI.md Rule 3.1)
        const results = await Promise.all(
            updates.map(({ key, value }) =>
                supabase
                    .from("platform_config")
                    .update({
                        value: value,
                        updated_at: new Date().toISOString(),
                        updated_by: userId,
                    })
                    .eq("key", key)
            )
        );

        const failed = results.find(r => r.error);
        if (failed?.error) throw new Error(`Batch config update failed: ${failed.error.message}`);
    }
}
