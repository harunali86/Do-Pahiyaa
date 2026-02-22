"use client";

import { useState } from "react";
import { Plus, Trash2, Settings2, Percent, Filter } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PricingRule {
    id: string;
    name: string;
    description: string;
    condition_type: string;
    condition_value: string;
    adjustment_type: string;
    adjustment_value: number;
    is_active: boolean;
    priority: number;
}

interface LeadPricingConfig {
    id: boolean;
    base_lead_price: number;
    filtered_lead_surcharge: number;
    filtered_lead_multiplier: number;
    min_purchase_qty: number;
    filter_city_enabled: boolean;
    filter_region_enabled: boolean;
    filter_brand_enabled: boolean;
    filter_model_enabled: boolean;
    filter_lead_type_enabled: boolean;
    filter_date_range_enabled: boolean;
}

interface BulkDiscount {
    id: string;
    min_quantity: number;
    max_quantity: number | null;
    discount_type: "flat" | "percentage";
    discount_value: number;
    is_active: boolean;
    priority: number;
}

interface PricingRulesClientProps {
    rules: PricingRule[];
    config: LeadPricingConfig | null;
    bulkDiscounts: BulkDiscount[];
}

const DEFAULT_CONFIG: LeadPricingConfig = {
    id: true,
    base_lead_price: 1,
    filtered_lead_surcharge: 0,
    filtered_lead_multiplier: 1,
    min_purchase_qty: 10,
    filter_city_enabled: true,
    filter_region_enabled: true,
    filter_brand_enabled: true,
    filter_model_enabled: true,
    filter_lead_type_enabled: true,
    filter_date_range_enabled: true,
};

const RULE_CONDITION_OPTIONS = [
    { value: "city", label: "City" },
    { value: "region", label: "Region" },
    { value: "brand", label: "Brand" },
    { value: "model", label: "Model" },
    { value: "lead_type", label: "Lead Type" },
    { value: "date_range", label: "Date Range" },
    { value: "filtered", label: "Filtered (Any Filter)" },
    { value: "unfiltered", label: "Unfiltered (No Filter)" },
];

const RULE_ADJUSTMENT_OPTIONS = [
    { value: "flat_fee", label: "Flat Fee (+/-)" },
    { value: "multiplier", label: "Multiplier (x)" },
    { value: "percentage", label: "Percentage (+/- %)" },
];

export function PricingRulesClient({ rules: initialRules, config: initialConfig, bulkDiscounts: initialBulkDiscounts }: PricingRulesClientProps) {
    const [rules, setRules] = useState<PricingRule[]>(initialRules);
    const [config, setConfig] = useState<LeadPricingConfig>(initialConfig || DEFAULT_CONFIG);
    const [bulkDiscounts, setBulkDiscounts] = useState<BulkDiscount[]>(initialBulkDiscounts);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [configSaving, setConfigSaving] = useState(false);
    const supabase = createSupabaseBrowserClient();

    // Form State
    const [formData, setFormData] = useState<Partial<PricingRule>>({
        name: "",
        description: "",
        condition_type: "city",
        condition_value: "",
        adjustment_type: "flat_fee",
        adjustment_value: 0,
        is_active: true,
        priority: 0
    });

    const [bulkForm, setBulkForm] = useState({
        min_quantity: 10,
        max_quantity: "",
        discount_type: "flat" as "flat" | "percentage",
        discount_value: 0,
        priority: 0,
        is_active: true,
    });

    const requiresConditionValue = !["filtered", "unfiltered"].includes(formData.condition_type || "");

    const handleConfigChange = (key: keyof LeadPricingConfig, value: LeadPricingConfig[keyof LeadPricingConfig]) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
    };

    const handleSaveConfig = async () => {
        if (config.min_purchase_qty < 1) {
            toast.error("Minimum purchase quantity must be at least 1");
            return;
        }

        setConfigSaving(true);
        try {
            const payload = {
                ...config,
                id: true,
                updated_at: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from("lead_pricing_config")
                .upsert(payload, { onConflict: "id" })
                .select()
                .single();

            if (error) throw error;
            setConfig(data as LeadPricingConfig);
            toast.success("Pricing config updated");
        } catch (error: any) {
            toast.error(error.message || "Failed to update pricing config");
        } finally {
            setConfigSaving(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || (requiresConditionValue && !formData.condition_value)) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                condition_value: requiresConditionValue
                    ? formData.condition_value
                    : "any",
            };

            const { data, error } = await supabase
                .from("pricing_rules")
                .insert([payload])
                .select()
                .single();

            if (error) throw error;

            setRules([data, ...rules]);
            setIsDialogOpen(false);
            setFormData({
                name: "",
                description: "",
                condition_type: "city",
                condition_value: "",
                adjustment_type: "flat_fee",
                adjustment_value: 0,
                is_active: true,
                priority: 0
            });
            toast.success("Rule created successfully");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBulkDiscount = async () => {
        if (bulkForm.min_quantity < 1) {
            toast.error("Minimum quantity must be at least 1");
            return;
        }
        if (bulkForm.max_quantity && Number(bulkForm.max_quantity) < bulkForm.min_quantity) {
            toast.error("Max quantity cannot be less than min quantity");
            return;
        }
        if (bulkForm.discount_value <= 0) {
            toast.error("Discount value must be greater than 0");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                min_quantity: bulkForm.min_quantity,
                max_quantity: bulkForm.max_quantity ? Number(bulkForm.max_quantity) : null,
                discount_type: bulkForm.discount_type,
                discount_value: bulkForm.discount_value,
                priority: bulkForm.priority,
                is_active: bulkForm.is_active,
            };

            const { data, error } = await supabase
                .from("pricing_bulk_discounts")
                .insert([payload])
                .select()
                .single();

            if (error) throw error;

            setBulkDiscounts((prev) => [data as BulkDiscount, ...prev]);
            setIsBulkDialogOpen(false);
            setBulkForm({
                min_quantity: 10,
                max_quantity: "",
                discount_type: "flat",
                discount_value: 0,
                priority: 0,
                is_active: true,
            });
            toast.success("Bulk discount created");
        } catch (error: any) {
            toast.error(error.message || "Failed to create bulk discount");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this rule?")) return;

        try {
            const { error } = await supabase.from("pricing_rules").delete().eq("id", id);
            if (error) throw error;
            setRules(rules.filter(r => r.id !== id));
            toast.success("Rule deleted");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("pricing_rules")
                .update({ is_active: !currentStatus })
                .eq("id", id);

            if (error) throw error;

            setRules(rules.map(r => r.id === id ? { ...r, is_active: !currentStatus } : r));
            toast.success(`Rule ${!currentStatus ? 'activated' : 'deactivated'}`);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleToggleBulk = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("pricing_bulk_discounts")
                .update({ is_active: !currentStatus })
                .eq("id", id);

            if (error) throw error;

            setBulkDiscounts((prev) => prev.map((item) => (
                item.id === id ? { ...item, is_active: !currentStatus } : item
            )));
            toast.success(`Bulk discount ${!currentStatus ? "activated" : "deactivated"}`);
        } catch (error: any) {
            toast.error(error.message || "Failed to update bulk discount");
        }
    };

    const handleDeleteBulk = async (id: string) => {
        if (!confirm("Delete this bulk discount?")) return;
        try {
            const { error } = await supabase.from("pricing_bulk_discounts").delete().eq("id", id);
            if (error) throw error;
            setBulkDiscounts((prev) => prev.filter((item) => item.id !== id));
            toast.success("Bulk discount deleted");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete bulk discount");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-white">Lead Pricing Control Center</h2>
                <p className="text-slate-400">Manage global rates, filter surcharges, dynamic rules, and bulk discounts.</p>
            </div>

            <Card className="glass-panel p-6 border-white/10 bg-slate-900/50">
                <div className="flex items-center gap-2 mb-4">
                    <Settings2 className="h-5 w-5 text-brand-400" />
                    <h3 className="text-lg font-bold text-white">Global Pricing Config</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="space-y-2">
                        <Label className="text-slate-300">Base Lead Price</Label>
                        <Input
                            type="number"
                            min={0}
                            step={0.01}
                            value={config.base_lead_price}
                            onChange={(e) => handleConfigChange("base_lead_price", Number(e.target.value))}
                            className="bg-slate-900 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-300">Filtered Surcharge</Label>
                        <Input
                            type="number"
                            min={0}
                            step={0.01}
                            value={config.filtered_lead_surcharge}
                            onChange={(e) => handleConfigChange("filtered_lead_surcharge", Number(e.target.value))}
                            className="bg-slate-900 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-300">Filtered Multiplier</Label>
                        <Input
                            type="number"
                            min={0}
                            step={0.01}
                            value={config.filtered_lead_multiplier}
                            onChange={(e) => handleConfigChange("filtered_lead_multiplier", Number(e.target.value))}
                            className="bg-slate-900 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-300">Minimum Purchase Qty</Label>
                        <Input
                            type="number"
                            min={1}
                            step={1}
                            value={config.min_purchase_qty}
                            onChange={(e) => handleConfigChange("min_purchase_qty", Number(e.target.value))}
                            className="bg-slate-900 border-white/10 text-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
                    {[
                        { key: "filter_city_enabled", label: "City Filter" },
                        { key: "filter_region_enabled", label: "Region Filter" },
                        { key: "filter_brand_enabled", label: "Brand Filter" },
                        { key: "filter_model_enabled", label: "Model Filter" },
                        { key: "filter_lead_type_enabled", label: "Lead Type Filter" },
                        { key: "filter_date_range_enabled", label: "Date Range Filter" },
                    ].map((item) => (
                        <label key={item.key} className="flex items-center justify-between gap-2 rounded-md border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-slate-300">
                            <span>{item.label}</span>
                            <input
                                type="checkbox"
                                checked={Boolean(config[item.key as keyof LeadPricingConfig])}
                                onChange={(e) => handleConfigChange(item.key as keyof LeadPricingConfig, e.target.checked)}
                                className="h-4 w-4 accent-brand-500"
                            />
                        </label>
                    ))}
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSaveConfig} disabled={configSaving}>
                        {configSaving ? "Saving..." : "Save Global Config"}
                    </Button>
                </div>
            </Card>

            <Card className="glass-panel p-6 border-white/10 bg-slate-900/50">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                        <Percent className="h-5 w-5 text-brand-400" />
                        <h3 className="text-lg font-bold text-white">Bulk Discounts</h3>
                    </div>
                    <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="secondary" className="gap-2">
                                <Plus className="h-4 w-4" /> Add Bulk Tier
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-panel border-white/10 text-white">
                            <DialogHeader>
                                <DialogTitle>Add Bulk Discount</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Min Quantity</Label>
                                        <Input
                                            type="number"
                                            value={bulkForm.min_quantity}
                                            onChange={(e) => setBulkForm((prev) => ({ ...prev, min_quantity: Number(e.target.value) }))}
                                            className="bg-slate-900 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Max Quantity (optional)</Label>
                                        <Input
                                            type="number"
                                            value={bulkForm.max_quantity}
                                            onChange={(e) => setBulkForm((prev) => ({ ...prev, max_quantity: e.target.value }))}
                                            className="bg-slate-900 border-white/10 text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Discount Type</Label>
                                        <Select
                                            value={bulkForm.discount_type}
                                            onValueChange={(value: "flat" | "percentage") => setBulkForm((prev) => ({ ...prev, discount_type: value }))}
                                        >
                                            <SelectTrigger className="bg-slate-900 border-white/10 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                                <SelectItem value="flat">Flat</SelectItem>
                                                <SelectItem value="percentage">Percentage</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Discount Value</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            value={bulkForm.discount_value}
                                            onChange={(e) => setBulkForm((prev) => ({ ...prev, discount_value: Number(e.target.value) }))}
                                            className="bg-slate-900 border-white/10 text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-300">Priority</Label>
                                    <Input
                                        type="number"
                                        value={bulkForm.priority}
                                        onChange={(e) => setBulkForm((prev) => ({ ...prev, priority: Number(e.target.value) }))}
                                        className="bg-slate-900 border-white/10 text-white"
                                    />
                                </div>

                                <Button onClick={handleSaveBulkDiscount} disabled={loading} className="w-full">
                                    {loading ? "Saving..." : "Create Bulk Discount"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="overflow-x-auto border border-white/5 rounded-lg">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900/60 text-slate-400">
                            <tr>
                                <th className="px-4 py-3">Range</th>
                                <th className="px-4 py-3">Discount</th>
                                <th className="px-4 py-3">Priority</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-200">
                            {bulkDiscounts.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3">
                                        {item.min_quantity} - {item.max_quantity ?? "∞"}
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                        {item.discount_type === "flat" ? "₹" : ""}{item.discount_value}
                                        {item.discount_type === "percentage" ? "%" : ""}
                                    </td>
                                    <td className="px-4 py-3">{item.priority}</td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant="outline"
                                            className={`cursor-pointer ${item.is_active ? "text-green-400 border-green-400/20" : "text-slate-500 border-slate-500/20"}`}
                                            onClick={() => handleToggleBulk(item.id, item.is_active)}
                                        >
                                            {item.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBulk(item.id)}>
                                            <Trash2 className="h-4 w-4 text-red-400" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {bulkDiscounts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-slate-500">
                                        No bulk discount tiers configured.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card className="glass-panel p-6 border-white/10 bg-slate-900/50">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-brand-400" />
                        <h3 className="text-lg font-bold text-white">Dynamic Pricing Rules</h3>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> Add Rule
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-panel border-white/10 text-white">
                            <DialogHeader>
                                <DialogTitle>Add New Pricing Rule</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Rule Name</Label>
                                    <Input
                                        className="bg-slate-900 border-white/10 text-white"
                                        placeholder="e.g. Mumbai premium"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Description</Label>
                                    <Input
                                        className="bg-slate-900 border-white/10 text-white"
                                        placeholder="Optional"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Condition Type</Label>
                                        <Select
                                            value={formData.condition_type}
                                            onValueChange={(val) => setFormData({ ...formData, condition_type: val })}
                                        >
                                            <SelectTrigger className="bg-slate-900 border-white/10 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                                {RULE_CONDITION_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Condition Value</Label>
                                        <Input
                                            className="bg-slate-900 border-white/10 text-white"
                                            placeholder={requiresConditionValue ? "e.g. Mumbai" : "Auto"}
                                            value={requiresConditionValue ? formData.condition_value : "any"}
                                            onChange={(e) => setFormData({ ...formData, condition_value: e.target.value })}
                                            disabled={!requiresConditionValue}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Adjustment Type</Label>
                                        <Select
                                            value={formData.adjustment_type}
                                            onValueChange={(val) => setFormData({ ...formData, adjustment_type: val })}
                                        >
                                            <SelectTrigger className="bg-slate-900 border-white/10 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                                {RULE_ADJUSTMENT_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Adjustment Value</Label>
                                        <Input
                                            type="number"
                                            className="bg-slate-900 border-white/10 text-white"
                                            value={formData.adjustment_value}
                                            onChange={(e) => setFormData({ ...formData, adjustment_value: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-300">Priority</Label>
                                    <Input
                                        type="number"
                                        className="bg-slate-900 border-white/10 text-white"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                                    />
                                </div>

                                <Button onClick={handleSave} disabled={loading} className="w-full">
                                    {loading ? "Saving..." : "Create Rule"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="overflow-x-auto border border-white/5 rounded-lg">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 text-xs text-slate-500 uppercase font-semibold border-b border-white/5">
                            <tr>
                                <th className="py-3 px-4">Rule Name</th>
                                <th className="py-3 px-4">Condition</th>
                                <th className="py-3 px-4">Adjustment</th>
                                <th className="py-3 px-4">Priority</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                            {rules.map((rule) => (
                                <tr key={rule.id} className="hover:bg-white/[0.02]">
                                    <td className="py-4 px-4">
                                        <p className="font-medium text-white">{rule.name}</p>
                                        {rule.description ? <p className="text-xs text-slate-500 mt-1">{rule.description}</p> : null}
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-400 font-mono">
                                            {rule.condition_type}: {rule.condition_value}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`font-bold ${rule.adjustment_type === "multiplier" ? "text-accent-gold" : "text-green-400"}`}>
                                            {rule.adjustment_type === "multiplier" ? "x" : rule.adjustment_type === "percentage" ? "%" : "+"}
                                            {rule.adjustment_value}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">{rule.priority}</td>
                                    <td className="py-4 px-4">
                                        <Badge
                                            variant="outline"
                                            className={`cursor-pointer ${rule.is_active ? "text-green-400 border-green-400/20" : "text-slate-500 border-slate-500/20"}`}
                                            onClick={() => handleToggle(rule.id, rule.is_active)}
                                        >
                                            {rule.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(rule.id)}
                                            className="hover:bg-red-500/10"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-400" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {rules.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-10 text-center text-slate-500">
                                        No pricing rules defined.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
