import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DealerLeadFilters = {
    city?: string;
    region?: string;
    brand?: string;
    model?: string;
    lead_type?: string;
    date_range?: string;
    start_date?: string;
    end_date?: string;
};

export interface PriceAdjustment {
    ruleId: string;
    ruleName: string;
    conditionType: string;
    adjustmentType: "flat_fee" | "multiplier" | "percentage";
    amount: number;
}

export interface PriceCalculationResult {
    success: boolean;
    code?: string;
    message?: string;
    basePrice?: number;
    hasFilters?: boolean;
    perLeadPrice?: number;
    quantity?: number;
    subtotal?: number;
    bulkDiscount?: number;
    totalPrice?: number;
    minQuantity?: number;
    adjustments?: PriceAdjustment[];
}

export interface PurchaseResult {
    success: boolean;
    code?: string;
    message?: string;
    subscriptionId?: string;
    deductedCredits?: number;
    newBalance?: number;
    price?: PriceCalculationResult;
    currentPrice?: number;
}

type LegacyInput = {
    city?: string;
    region?: string;
    brand?: string;
    model?: string;
    lead_type?: string;
    leadType?: string;
    date_range?: string;
    dateRange?: string;
    start_date?: string;
    end_date?: string;
    pack_size?: number;
    quantity?: number;
    useFilters?: boolean;
};

type NormalizeOutput = {
    filters: DealerLeadFilters;
    quantity: number;
};

const normalizeText = (value?: string) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === "all" || trimmed.toLowerCase() === "any") return undefined;
    return trimmed;
};

const normalizeInput = (input: LegacyInput): NormalizeOutput => {
    const quantityRaw = Number(input.quantity ?? input.pack_size ?? 1);
    const quantity = Number.isFinite(quantityRaw) ? Math.max(1, Math.floor(quantityRaw)) : 1;

    const useFilters = input.useFilters ?? true;
    if (!useFilters) {
        return { filters: {}, quantity };
    }

    const filters: DealerLeadFilters = {
        city: normalizeText(input.city),
        region: normalizeText(input.region),
        brand: normalizeText(input.brand),
        model: normalizeText(input.model),
        lead_type: normalizeText(input.lead_type ?? input.leadType),
        date_range: normalizeText(input.date_range ?? input.dateRange),
        start_date: normalizeText(input.start_date),
        end_date: normalizeText(input.end_date),
    };

    return { filters, quantity };
};

export class PricingService {
    static async calculatePrice(input: LegacyInput): Promise<PriceCalculationResult> {
        const { filters, quantity } = normalizeInput(input);
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase.rpc("calculate_subscription_price_v3", {
            p_filters: filters,
            p_quantity: quantity,
        });

        if (error) {
            throw new Error(`Price calculation failed: ${error.message}`);
        }

        return (data || { success: false, message: "Pricing response missing" }) as PriceCalculationResult;
    }

    static async purchaseSubscription(
        dealerId: string,
        input: LegacyInput,
        expectedTotal?: number,
        idempotencyKey?: string
    ): Promise<PurchaseResult> {
        if (!dealerId) {
            throw new Error("Dealer id is required");
        }

        const { filters, quantity } = normalizeInput(input);
        const supabase = await createSupabaseServerClient();
        const generatedIdempotencyKey =
            idempotencyKey || (typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

        const { data, error } = await supabase.rpc("purchase_subscription_v3", {
            p_filters: filters,
            p_quota: quantity,
            p_expected_total: expectedTotal ?? null,
            p_idempotency_key: generatedIdempotencyKey,
        });

        if (error) {
            throw new Error(`Subscription purchase failed: ${error.message}`);
        }

        return (data || { success: false, message: "Purchase response missing" }) as PurchaseResult;
    }
}
