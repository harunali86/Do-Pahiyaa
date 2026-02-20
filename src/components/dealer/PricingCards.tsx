"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { createOrderAction, verifyPaymentAction } from "@/app/actions/billing";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface PricingProps {
    leadPrice: number;
    minQty: number;
    gstRate: number;
    razorpayKeyId: string;
}

export function PricingCards({ leadPrice, minQty, gstRate, razorpayKeyId }: PricingProps) {
    const [customQty, setCustomQty] = useState<string>(""); // Keep as string for better input handling
    const [loading, setLoading] = useState(false);
    const [userProfile, setUserProfile] = useState<{ name?: string, email?: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createSupabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from("profiles").select("full_name, email").eq("id", user.id).single();
                setUserProfile({ name: profile?.full_name, email: user.email });
            }
        };
        fetchUser();
    }, []);

    const handlePurchase = async (qty: number) => {
        if (qty < minQty) {
            toast.error(`Minimum purchase is ${minQty} leads.`);
            return;
        }

        setLoading(true);
        try {
            // 1. Create Order
            const { success, order, error } = await createOrderAction(qty);

            if (!success || !order) {
                throw new Error(error || "Failed to create order");
            }

            // 2. Open Razorpay
            const options = {
                key: razorpayKeyId,
                amount: order.orderId ? undefined : order.amount * 100, // If orderId provided, amount is handled by order_id
                currency: "INR",
                name: "Do Pahiyaa Dealer Credits",
                description: `Purchase ${qty} Leads`,
                order_id: order.orderId, // Razorpay Order ID from backend
                handler: async function (response: any) {
                    // 3. Verify Payment
                    const verifyRes = await verifyPaymentAction(
                        response.razorpay_order_id,
                        response.razorpay_payment_id,
                        response.razorpay_signature
                    );

                    if (verifyRes.success) {
                        toast.success(`Success! Added ${qty} credits to your balance.`);
                        router.refresh();
                    } else {
                        toast.error("Payment verification failed. Contact support.");
                    }
                },
                prefill: {
                    name: userProfile?.name || "Dealer",
                    email: userProfile?.email || "dealer@example.com",
                    contact: ""
                },
                theme: {
                    color: "#f97316" // Brand orange
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                toast.error(response.error.description || "Payment Failed");
            });
            rzp.open();

        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = (qty: number) => {
        const base = qty * leadPrice;
        const gst = (base * gstRate) / 100;
        return Math.round(base + gst);
    };

    const PACKAGES = [
        { qty: 100, label: "Starter Pack", recommended: false },
        { qty: 250, label: "Growth Pack", recommended: true },
        { qty: 500, label: "Pro Dealer", recommended: false },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PACKAGES.map((pkg) => (
                <Card key={pkg.qty} className={`relative border-white/10 bg-slate-900/50 backdrop-blur-sm hover:border-brand-500/50 transition-all ${pkg.recommended ? 'border-brand-500 shadow-lg shadow-brand-500/10' : ''}`}>
                    {pkg.recommended && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white hover:bg-brand-600">
                            Most Popular
                        </Badge>
                    )}
                    <CardHeader>
                        <CardTitle className="text-xl text-white">{pkg.label}</CardTitle>
                        <div className="flex items-baseline gap-1 mt-2">
                            <span className="text-3xl font-bold text-white">₹{calculateTotal(pkg.qty).toLocaleString()}</span>
                            <span className="text-sm text-slate-400">incl. GST</span>
                        </div>
                        <p className="text-brand-400 font-medium text-sm flex items-center gap-1">
                            <Zap className="h-3 w-3" /> {pkg.qty} Leads
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="text-xs text-slate-400 space-y-1">
                            <div className="flex justify-between">
                                <span>Base Price ({pkg.qty} x ₹{leadPrice})</span>
                                <span>₹{(pkg.qty * leadPrice).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>GST ({gstRate}%)</span>
                                <span>₹{((pkg.qty * leadPrice * gstRate) / 100).toLocaleString()}</span>
                            </div>
                        </div>
                        <ul className="space-y-2 pt-4 border-t border-white/5">
                            <li className="flex items-center gap-2 text-sm text-slate-300">
                                <Check className="h-4 w-4 text-brand-500" /> Never expires
                            </li>
                            <li className="flex items-center gap-2 text-sm text-slate-300">
                                <Check className="h-4 w-4 text-brand-500" /> Instant unlock
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full bg-brand-600 hover:bg-brand-500"
                            onClick={() => handlePurchase(pkg.qty)}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buy Now"}
                        </Button>
                    </CardFooter>
                </Card>
            ))}

            {/* Custom Quantity Card */}
            <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm flex flex-col">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Custom Amount</CardTitle>
                    <p className="text-sm text-slate-400">Enter quantity manually</p>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs text-slate-400">Number of Leads (Min {minQty})</label>
                        <Input
                            type="number"
                            placeholder="e.g. 150"
                            className="bg-slate-800 border-white/10 text-white"
                            value={customQty}
                            onChange={(e) => setCustomQty(e.target.value)}
                            min={minQty}
                        />
                    </div>
                    {Number(customQty) >= minQty && (
                        <div className="p-3 bg-slate-800/50 rounded-lg text-xs space-y-1">
                            <div className="flex justify-between text-slate-300">
                                <span>Total Payable:</span>
                                <span className="text-white font-bold">₹{calculateTotal(Number(customQty)).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                                <span>(Base: ₹{Number(customQty) * leadPrice} + GST: ₹{Math.round(Number(customQty) * leadPrice * gstRate / 100)})</span>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="mt-auto">
                    <Button
                        variant="secondary"
                        className="w-full border-brand-500/20 text-brand-400 hover:bg-brand-500/10 hover:text-brand-300"
                        onClick={() => handlePurchase(Number(customQty))}
                        disabled={loading || Number(customQty) < minQty}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Proceed to Pay"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
