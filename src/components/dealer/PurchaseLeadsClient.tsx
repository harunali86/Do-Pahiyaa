"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Filter, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { calculateDynamicPrice, purchaseFilterPack } from "@/app/actions/pricing";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PurchaseLeadsClientProps {
    availableCities: string[];
    availableBrands: string[];
    availableModels: string[];
    availableRegions: string[];
    availableLeadTypes: string[];
    availableDateRanges: string[];
    currentCredits: number;
}

type PricePreview = {
    success: boolean;
    message?: string;
    minQuantity?: number;
    basePrice?: number;
    perLeadPrice?: number;
    quantity?: number;
    subtotal?: number;
    bulkDiscount?: number;
    totalPrice?: number;
    adjustments?: { ruleName: string; amount: number; adjustmentType: string }[];
};

const isValueActive = (value?: string) => Boolean(value && value !== "all");

export function PurchaseLeadsClient({
    availableCities,
    availableBrands,
    availableModels,
    availableRegions,
    availableLeadTypes,
    availableDateRanges,
    currentCredits,
}: PurchaseLeadsClientProps) {
    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);

    const [useFilters, setUseFilters] = useState(true);
    const [city, setCity] = useState<string>("all");
    const [region, setRegion] = useState<string>("all");
    const [brand, setBrand] = useState<string>("all");
    const [model, setModel] = useState<string>("all");
    const [leadType, setLeadType] = useState<string>("all");
    const [dateRange, setDateRange] = useState<string>("all");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(10);

    const [priceData, setPriceData] = useState<PricePreview | null>(null);
    const [minQuantity, setMinQuantity] = useState<number>(1);

    const activeFiltersCount = useMemo(() => {
        if (!useFilters) return 0;
        return [
            isValueActive(city),
            isValueActive(region),
            isValueActive(brand),
            isValueActive(model),
            isValueActive(leadType),
            isValueActive(dateRange) || Boolean(startDate || endDate),
        ].filter(Boolean).length;
    }, [useFilters, city, region, brand, model, leadType, dateRange, startDate, endDate]);

    const payload = useMemo(() => ({
        useFilters,
        city: city === "all" ? undefined : city,
        region: region === "all" ? undefined : region,
        brand: brand === "all" ? undefined : brand,
        model: model === "all" ? undefined : model,
        lead_type: leadType === "all" ? undefined : leadType,
        date_range: dateRange === "all" ? undefined : dateRange,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        quantity,
    }), [useFilters, city, region, brand, model, leadType, dateRange, startDate, endDate, quantity]);

    useEffect(() => {
        const fetchPrice = async () => {
            setCalculating(true);
            try {
                const result = await calculateDynamicPrice(payload) as PricePreview;
                if (result.success) {
                    setPriceData(result);
                    setMinQuantity(result.minQuantity || 1);
                } else {
                    setPriceData(result);
                    if (result.minQuantity) setMinQuantity(result.minQuantity);
                }
            } catch (error) {
                toast.error("Failed to calculate price");
            } finally {
                setCalculating(false);
            }
        };

        const timer = setTimeout(fetchPrice, 250);
        return () => clearTimeout(timer);
    }, [payload]);

    const canPurchase = Boolean(
        priceData?.success &&
        typeof priceData.totalPrice === "number" &&
        quantity >= minQuantity &&
        currentCredits >= (priceData.totalPrice || 0)
    );

    const purchaseFilters = useMemo(() => {
        if (!useFilters) return {};
        return {
            ...(city !== "all" ? { city } : {}),
            ...(region !== "all" ? { region } : {}),
            ...(brand !== "all" ? { brand } : {}),
            ...(model !== "all" ? { model } : {}),
            ...(leadType !== "all" ? { lead_type: leadType } : {}),
            ...(dateRange !== "all" ? { date_range: dateRange } : {}),
            ...(startDate ? { start_date: startDate } : {}),
            ...(endDate ? { end_date: endDate } : {}),
        };
    }, [useFilters, city, region, brand, model, leadType, dateRange, startDate, endDate]);

    const handlePurchase = async () => {
        if (!priceData?.success || typeof priceData.totalPrice !== "number") return;
        if (quantity < minQuantity) {
            toast.error(`Minimum quantity is ${minQuantity}`);
            return;
        }
        if (currentCredits < priceData.totalPrice) {
            toast.error("Insufficient credits. Please top up wallet.");
            return;
        }

        const confirmed = confirm(
            `Confirm purchase of ${quantity} leads for ${priceData.totalPrice} credits?`
        );
        if (!confirmed) return;

        setLoading(true);
        try {
            const result = await purchaseFilterPack(
                purchaseFilters,
                quantity,
                priceData.totalPrice
            );

            if (result.success) {
                toast.success("Purchase successful. Leads will be allocated in real-time.");
                window.location.href = "/dealer/leads/subscriptions";
            } else {
                toast.error(result.message || "Purchase failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Card className="glass-panel p-6 border-white/10 bg-slate-900/50">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Filter className="h-5 w-5 text-brand-400" />
                        Configure Lead Purchase
                    </h2>

                    <div className="mb-5 flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-white/10">
                        <div>
                            <p className="text-sm font-medium text-white">Use Filters</p>
                            <p className="text-xs text-slate-400">Disable for unfiltered lead purchase</p>
                        </div>
                        <button
                            onClick={() => setUseFilters((prev) => !prev)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${useFilters
                                    ? "bg-brand-600 text-white"
                                    : "bg-slate-700 text-slate-300"
                                }`}
                        >
                            {useFilters ? "Enabled" : "Disabled"}
                        </button>
                    </div>

                    {useFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">City</label>
                                <Select value={city} onValueChange={setCity}>
                                    <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                                        <SelectValue placeholder="Any City" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-white/10 text-white">
                                        <SelectItem value="all">Any City</SelectItem>
                                        {availableCities.map((item) => (
                                            <SelectItem key={item} value={item}>{item}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Region</label>
                                <Select value={region} onValueChange={setRegion}>
                                    <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                                        <SelectValue placeholder="Any Region" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-white/10 text-white">
                                        <SelectItem value="all">Any Region</SelectItem>
                                        {availableRegions.map((item) => (
                                            <SelectItem key={item} value={item}>{item}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Brand</label>
                                <Select value={brand} onValueChange={setBrand}>
                                    <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                                        <SelectValue placeholder="Any Brand" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-white/10 text-white">
                                        <SelectItem value="all">Any Brand</SelectItem>
                                        {availableBrands.map((item) => (
                                            <SelectItem key={item} value={item}>{item}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Model</label>
                                <Select value={model} onValueChange={setModel}>
                                    <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                                        <SelectValue placeholder="Any Model" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-white/10 text-white">
                                        <SelectItem value="all">Any Model</SelectItem>
                                        {availableModels.map((item) => (
                                            <SelectItem key={item} value={item}>{item}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Lead Type</label>
                                <Select value={leadType} onValueChange={setLeadType}>
                                    <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                                        <SelectValue placeholder="Any Lead Type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-white/10 text-white">
                                        <SelectItem value="all">Any Lead Type</SelectItem>
                                        {availableLeadTypes.map((item) => (
                                            <SelectItem key={item} value={item}>{item}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Date Range</label>
                                <Select value={dateRange} onValueChange={setDateRange}>
                                    <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                                        <SelectValue placeholder="Any Date Range" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-white/10 text-white">
                                        <SelectItem value="all">Any Date Range</SelectItem>
                                        {availableDateRanges.map((item) => (
                                            <SelectItem key={item} value={item}>{item}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Start Date (optional)</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-slate-800 border border-white/10 rounded-md p-2 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">End Date (optional)</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-slate-800 border border-white/10 rounded-md p-2 text-white"
                                />
                            </div>
                        </div>
                    )}

                    <div className="mt-6 space-y-2">
                        <label className="text-sm font-medium text-slate-400">Quantity</label>
                        <input
                            type="number"
                            min={minQuantity}
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value || 0))}
                            className="w-full md:w-48 bg-slate-800 border border-white/10 rounded-md p-2 text-white"
                        />
                        <p className="text-xs text-slate-500">Minimum quantity: {minQuantity}</p>
                    </div>
                </Card>

                <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-4 flex gap-3 text-sm text-blue-200">
                    <Info className="h-5 w-5 text-blue-400 shrink-0" />
                    <p>
                        Active filters: <span className="font-bold">{activeFiltersCount}</span>.
                        Leads are assigned in real-time to matching active subscriptions and quota is decremented automatically.
                    </p>
                </div>
            </div>

            <div className="lg:col-span-1">
                <Card className="glass-panel p-6 border-white/10 bg-slate-900 sticky top-24">
                    <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>

                    {calculating ? (
                        <div className="py-8 flex justify-center">
                            <Loader2 className="h-8 w-8 text-brand-400 animate-spin" />
                        </div>
                    ) : !priceData ? (
                        <p className="text-slate-500 text-center">Configure purchase to see price.</p>
                    ) : !priceData.success ? (
                        <div className="space-y-2">
                            <p className="text-sm text-red-400">{priceData.message || "Unable to calculate price"}</p>
                            {priceData.minQuantity ? (
                                <p className="text-xs text-slate-500">Minimum quantity required: {priceData.minQuantity}</p>
                            ) : null}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-slate-400">
                                    <span>Base Price</span>
                                    <span>{priceData.basePrice} Credits</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Per Lead</span>
                                    <span>{priceData.perLeadPrice} Credits</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Subtotal</span>
                                    <span>{priceData.subtotal} Credits</span>
                                </div>
                                {(priceData.adjustments || []).map((adj, index) => (
                                    <div key={index} className="flex justify-between text-accent-gold">
                                        <span>{adj.ruleName}</span>
                                        <span>{adj.amount >= 0 ? "+" : ""}{adj.amount}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between text-green-400">
                                    <span>Bulk Discount</span>
                                    <span>-{priceData.bulkDiscount || 0}</span>
                                </div>
                                <div className="border-t border-white/10 my-2 pt-2 flex justify-between text-white font-bold text-lg">
                                    <span>Total Cost</span>
                                    <span>{priceData.totalPrice} Credits</span>
                                </div>
                            </div>

                            <div className="bg-slate-800 rounded p-3 text-xs text-slate-400 flex justify-between">
                                <span>Wallet Balance</span>
                                <span className={canPurchase ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                                    {currentCredits} Credits
                                </span>
                            </div>

                            <Button
                                onClick={handlePurchase}
                                disabled={loading || !canPurchase}
                                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold h-12"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5" />
                                        Confirm Purchase
                                    </div>
                                )}
                            </Button>

                            {!canPurchase ? (
                                <p className="text-xs text-red-400 text-center mt-2">
                                    Insufficient balance or invalid quantity. Top-up at{" "}
                                    <a href="/dealer/credits" className="underline">Add Funds</a>.
                                </p>
                            ) : null}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
