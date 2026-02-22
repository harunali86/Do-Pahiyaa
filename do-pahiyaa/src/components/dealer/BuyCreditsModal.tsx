"use client";

import { useState } from "react";
import { X, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Script from "next/script";

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface BuyCreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CREDIT_PACKAGES = [
    { credits: 100, label: "Starter" },
    { credits: 250, label: "Pro" },
    { credits: 500, label: "Enterprise" },
];

export default function BuyCreditsModal({ isOpen, onClose }: BuyCreditsModalProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    const handlePurchase = async (pkg: typeof CREDIT_PACKAGES[0]) => {
        setLoading(true);
        try {
            // 1. Create Order
            const res = await fetch("/api/v1/billing/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leadQuantity: pkg.credits }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error?.message || "Failed to create order");
            const { order } = data.data;

            if (!res.ok) throw new Error("Failed to create order");

            // 2. Open Razorpay
            const options = {
                key: order.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                currency: order.currency,
                name: "Do Pahiyaa",
                description: `${pkg.credits} Lead Credits`,
                order_id: order.orderId,
                handler: async function (response: any) {
                    // 3. Verify Payment
                    const verifyRes = await fetch("/api/v1/billing/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }),
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyRes.ok && verifyData.success) {
                        toast.success("Payment Successful! Credits added.");
                        onClose();
                        router.refresh();
                    } else {
                        toast.error(verifyData.error?.message || "Payment verification failed.");
                    }
                },
                prefill: {
                    name: "Dealer Name",
                    email: "dealer@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#f97316"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            {/* Load Razorpay Script dynamically */}
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-accent-gold" />
                    Top-up Credits
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                    Unlock more leads to grow your business.
                </p>

                <div className="space-y-4">
                    {CREDIT_PACKAGES.map((pkg) => (
                        <div key={pkg.credits} className="flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-brand-500/50 hover:bg-white/[0.02] transition-all cursor-pointer group"
                            onClick={() => handlePurchase(pkg)}
                        >
                            <div>
                                <h4 className="font-bold text-white text-lg">{pkg.credits} Credits</h4>
                                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{pkg.label}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-300">Dynamic Pricing</p>
                                <button className="mt-2 text-xs font-medium text-brand-400 group-hover:text-brand-300">
                                    Buy Now &rarr;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {loading && (
                    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center rounded-2xl">
                        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                    </div>
                )}
            </div>
        </div>
    );
}
