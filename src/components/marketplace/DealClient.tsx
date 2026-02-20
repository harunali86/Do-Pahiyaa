"use client";

import { useState } from "react";
import {
    CheckCircle2,
    ShieldCheck,
    Lock,
    Phone
} from "lucide-react";
import Image from "next/image";
import { formatINR } from "@/lib/utils";

export default function DealClient({ initialDeal }: { initialDeal: any }) {
    // Determine step based on status
    const getInitialStep = (status: string) => {
        switch (status) {
            case 'contact_locked': return 2;
            case 'contact_unlocked': return 3;
            case 'token_paid': return 4;
            default: return 2;
        }
    };

    const [step, setStep] = useState(getInitialStep(initialDeal.status));

    const dealTitle = initialDeal.listing?.title || "Premium Superbike";
    const sellerName = initialDeal.listing?.seller_name || "Verified Seller";
    const dealId = initialDeal.id.slice(0, 8);

    return (
        <>
            {/* Deal Header */}
            <div className="mb-8 p-6 rounded-2xl bg-glass-gradient border border-white/10 flex flex-col md:flex-row gap-6 items-center">
                <div className="relative w-full md:w-32 h-24 rounded-xl overflow-hidden shadow-2xl border border-white/20">
                    <Image
                        src={initialDeal.listing?.images?.[0] || "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=400"}
                        alt="Bike"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <span className="bg-brand-500/20 text-brand-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-brand-500/30">Active Deal</span>
                        <span className="text-slate-500 text-xs">ID: #DL-{dealId}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">{dealTitle}</h1>
                    <p className="text-slate-400 text-sm">Seller: {sellerName}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Unlock Contact */}
                    <div className={`p-6 rounded-2xl border transition-all ${step === 2 ? 'bg-slate-900/80 border-brand-500 shadow-brand-500/10 shadow-2xl overflow-hidden' : 'bg-slate-950 border-white/5 opacity-50'}`}>
                        <div className="flex items-start gap-4 z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${step > 2 ? 'bg-green-500 text-white' : step === 2 ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                {step > 2 ? <CheckCircle2 className="w-6 h-6" /> : "1"}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-white mb-2">Unlock Seller Contact</h2>
                                <p className="text-slate-400 text-sm mb-6 max-w-md">
                                    Secure the seller&apos;s verified contact details and start the inspection process.
                                </p>

                                {step === 2 && (
                                    <div className="bg-slate-950 border border-white/10 rounded-xl p-5 mb-6 max-w-sm">
                                        <div className="flex justify-between items-center mb-4 text-sm font-bold">
                                            <span className="text-white">Amount to Pay</span>
                                            <span className="text-brand-400 font-mono">₹ 175.00</span>
                                        </div>
                                        <button onClick={() => setStep(3)} className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2">
                                            <Lock className="w-4 h-4" /> Pay to Unlock
                                        </button>
                                    </div>
                                )}

                                {step > 2 && (
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex gap-4">
                                        <div className="flex-1">
                                            <div className="text-[10px] uppercase font-bold text-slate-500">Seller Phone</div>
                                            <div className="text-white font-mono text-lg flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-green-400" /> +91 Verified
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-glass-gradient border border-white/10 rounded-2xl p-6">
                        <h3 className="font-bold text-white mb-6">Deal Progress</h3>
                        {/* Timeline items would go here */}
                        <p className="text-xs text-slate-500">Step {step} of 4</p>
                    </div>
                </div>
            </div>
        </>
    );
}
