"use client";

import { useState } from "react";
import { X, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface LeadCaptureModalProps {
    listingId: string;
    listingTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function LeadCaptureModal({ listingId, listingTitle, isOpen, onClose }: LeadCaptureModalProps) {
    const [message, setMessage] = useState("Hi, I'm interested in this bike. Is it still available?");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listingId, message }),
            });

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error("Please login to send an inquiry.");
                    // Redirect to login logic could go here
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <h3 className="text-xl font-bold text-white mb-1">Contact Seller</h3>
                <p className="text-sm text-slate-400 mb-6">
                    Send an inquiry for <span className="text-brand-400 font-medium">{listingTitle}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full h-32 px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
                            placeholder="Write your message here..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Send Inquiry
                            </>
                        )}
                    </button>

                    <p className="text-xs text-center text-slate-500 mt-4">
                        By sending this, you agree to share your contact details with the seller.
                    </p>
                </form>
            </div>
        </div>
    );
}
