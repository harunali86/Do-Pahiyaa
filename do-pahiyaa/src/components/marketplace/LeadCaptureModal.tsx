"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

interface LeadCaptureModalProps {
    listingId: string;
    listingTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function LeadCaptureModal({ listingId, listingTitle, isOpen, onClose }: LeadCaptureModalProps) {
    const [message, setMessage] = useState("Hi, I'm interested in this bike. Is it still available?");
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [isUnlocked, setIsUnlocked] = useState(false);

    const router = useRouter();

    const checkUnlockStatus = useCallback(async () => {
        try {
            setCheckingStatus(true);
            const res = await fetch(`/api/v1/leads/check-unlock?listingId=${listingId}`);
            const { data } = await res.json();
            setIsUnlocked(!!data?.unlocked);
        } catch (error) {
            console.error("Failed to check unlock status", error);
        } finally {
            setCheckingStatus(false);
        }
    }, [listingId]);

    // 1. Check if Buyer has already paid for this listing
    useEffect(() => {
        if (isOpen) {
            checkUnlockStatus();
        }
    }, [isOpen, checkUnlockStatus]);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // 1. Create Razorpay Order
            const res = await fetch("/api/v1/payments/buyer-unlock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listingId, action: "create" }),
            });

            if (res.status === 401) {
                toast.error("Please log in to unlock seller contact details.");
                router.push(`/auth/login?next=${encodeURIComponent(`/listings/${listingId}`)}`);
                onClose();
                return;
            }

            const { data: order } = await res.json();

            if (!order?.id) throw new Error("Could not initiate payment. Try again.");

            // ... rest of the code remains ...
            // 2. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Do Pahiyaa",
                description: `Unlock Contact: ${listingTitle}`,
                order_id: order.id,
                handler: async (response: any) => {
                    try {
                        const verifyRes = await fetch("/api/v1/payments/buyer-unlock", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                listingId,
                                action: "verify",
                                paymentDetails: response,
                            }),
                        });
                        const { success } = await verifyRes.json();
                        if (success) {
                            toast.success("Payment successful! Direct contact unlocked.");
                            setIsUnlocked(true);
                        } else {
                            toast.error("Payment verification failed.");
                        }
                    } catch (err: any) {
                        toast.error(err.message);
                    }
                },
                theme: { color: "#D97706" }, // brand-600
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/v1/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listingId, message }),
            });

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error("Please login to send an inquiry.");
                } else {
                    throw new Error(result.error?.message || "Failed to send inquiry");
                }
                return;
            }

            toast.success("Inquiry sent! The seller will contact you shortly.");
            onClose();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            {/* Load Razorpay SDK */}
            {/* eslint-disable-next-line @next/next/no-sync-scripts */}
            <script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-1">Contact Seller</h3>
                    <p className="text-sm text-slate-400">
                        Inquiry for <span className="text-brand-400 font-medium">{listingTitle}</span>
                    </p>
                </div>

                {checkingStatus ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
                        <p className="text-sm text-slate-500">Checking contact availability...</p>
                    </div>
                ) : !isUnlocked ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl">
                            <h4 className="text-brand-400 font-semibold mb-1">Direct Contact Locked</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                To protect our sellers from spam, we charge a small one-time verification fee of ₹49 per bike. You&apos;ll get direct access to the seller&apos;s contact details.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all shadow-lg shadow-brand-900/20 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>Pay ₹49 to Unlock Contact</>
                                )}
                            </button>
                            <p className="text-[10px] text-center text-slate-600">
                                🔒 Secure Payment powered by Razorpay
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                                Your Message
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full h-32 px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none transition-all"
                                placeholder="Write your message here..."
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin text-slate-900" />
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Send Inquiry
                                </>
                            )}
                        </button>

                        <p className="text-[10px] text-center text-slate-500 mt-2">
                            Seller will receive your phone number and email instantly.
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
