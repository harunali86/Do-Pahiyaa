"use client";

import { useState } from "react";
import {
    CheckCircle2,
    MapPin,
    Phone,
    Mail,
    ShieldCheck,
    CreditCard,
    Lock
} from "lucide-react";
import Image from "next/image";

export default function DealPage({ params }: { params: { id: string } }) {
    const [step, setStep] = useState(2); // Mock: Step 2 (Unlock Contact)

    return (
        <div className="min-h-screen py-8 max-w-5xl mx-auto">

            {/* Deal Header */}
            <div className="mb-8 p-6 rounded-2xl bg-glass-gradient border border-white/10 flex flex-col md:flex-row gap-6 items-center">
                <div className="relative w-full md:w-32 h-24 rounded-xl overflow-hidden shadow-2xl border border-white/20">
                    <Image
                        src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=2940&auto=format&fit=crop"
                        alt="Bike"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <span className="bg-brand-500/20 text-brand-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-brand-500/30">Active Deal</span>
                        <span className="text-slate-500 text-xs">ID: #DL-{params.id}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Royal Enfield Continental GT 650</h1>
                    <p className="text-slate-400 text-sm">Seller: Vikram Motors • Bangalore</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column: Workflow */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Lead Unlock Section (Hybrid Model Core) */}
                    <div className={`p-6 rounded-2xl border transition-all ${step === 2 ? 'bg-slate-900/80 border-brand-500 shadow-brand-500/10 shadow-2xl relative overflow-hidden' : 'bg-slate-950 border-white/5 opacity-50'
                        }`}>
                        {/* Shine effect for active step */}
                        {step === 2 && <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-3xl -z-0 rounded-full" />}

                        <div className="flex items-start gap-4 relative z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${step > 2 ? 'bg-green-500 text-white' : step === 2 ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-500'
                                }`}>
                                {step > 2 ? <CheckCircle2 className="w-6 h-6" /> : "1"}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-white mb-2">Unlock Seller Contact</h2>
                                <p className="text-slate-400 text-sm mb-6 max-w-md">
                                    Pay a small token fee to verify seriousness. This amount is 100% refundable if the inspection fails.
                                </p>

                                {step === 2 && (
                                    <div className="bg-slate-950 border border-white/10 rounded-xl p-5 mb-6">
                                        <div className="flex justify-between items-center mb-4 text-sm">
                                            <span className="text-slate-400">Platform Verification Fee</span>
                                            <span className="text-white font-mono">₹ 149.00</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-4 text-sm">
                                            <span className="text-slate-400">GST (18%)</span>
                                            <span className="text-white font-mono">₹ 26.82</span>
                                        </div>
                                        <div className="h-px bg-white/10 my-4" />
                                        <div className="flex justify-between items-center text-lg font-bold">
                                            <span className="text-white">Total Payable</span>
                                            <span className="text-brand-400 font-mono">₹ 175.82</span>
                                        </div>

                                        <button
                                            onClick={() => setStep(3)}
                                            className="w-full mt-6 bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-brand-500/20 active:scale-95 transition-all flex justify-center items-center gap-2"
                                        >
                                            <Lock className="w-4 h-4" /> Pay to Unlock
                                        </button>
                                        <p className="text-[10px] text-center text-slate-500 mt-3 flex items-center justify-center gap-1">
                                            <ShieldCheck className="w-3 h-3" /> Secure Payment via Razorpay
                                        </p>
                                    </div>
                                )}

                                {step > 2 && (
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex gap-4">
                                        <div className="flex-1 space-y-1">
                                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Seller Phone</div>
                                            <div className="text-white font-mono text-lg flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-green-400" /> +91 98765 43210
                                            </div>
                                        </div>
                                        <div className="w-px bg-white/10" />
                                        <div className="flex-1 space-y-1">
                                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Chat Access</div>
                                            <div className="text-brand-400 font-bold text-sm flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" /> Enabled
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Token Payment Section */}
                    <div className={`p-6 rounded-2xl border transition-all ${step === 3 ? 'bg-slate-900/80 border-brand-500 shadow-brand-500/10 shadow-2xl relative overflow-hidden' : 'bg-slate-950 border-white/5 opacity-50'
                        }`}>
                        <div className="flex items-start gap-4 relative z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${step > 3 ? 'bg-green-500 text-white' : step === 3 ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-500'
                                }`}>
                                {step > 3 ? <CheckCircle2 className="w-6 h-6" /> : "2"}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-white mb-2">Book with Token</h2>
                                <p className="text-slate-400 text-sm mb-4">
                                    Pay ₹5,000 token to mark the bike as &quot;Reserved&quot; and freeze the price.
                                </p>

                                {step === 3 && (
                                    <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                                        Proceed to Token
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sidebar Timeline */}
                <div className="space-y-6">
                    <div className="bg-glass-gradient border border-white/10 rounded-2xl p-6">
                        <h3 className="font-bold text-white mb-6">Deal Timeline</h3>
                        <div className="space-y-6 relative">
                            <div className="absolute left-3.5 top-2 bottom-2 w-px bg-white/10" /> {/* Timeline Line */}

                            <TimelineItem
                                status="completed"
                                title="Offer Accepted"
                                date="Today, 10:30 AM"
                                desc="Seller accepted your offer of ₹3.15 L"
                            />
                            <TimelineItem
                                status="current"
                                title="Unlock Contact"
                                date="Pending Action"
                                desc="Pay fee to reveal contact details"
                            />
                            <TimelineItem
                                status="upcoming"
                                title="Token Payment"
                                date="Next Step"
                                desc="Reserve the bike"
                            />
                            <TimelineItem
                                status="upcoming"
                                title="Deal Closure"
                                date="Final Step"
                                desc="Ownership transfer"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TimelineItem({ title, date, desc, status }: { title: string, date: string, desc: string, status: 'completed' | 'current' | 'upcoming' }) {
    return (
        <div className="flex gap-4 relative z-10">
            <div className={`w-8 h-8 rounded-full border-4 shrink-0 flex items-center justify-center transition-colors ${status === 'completed' ? 'bg-green-500 border-slate-950 text-white' :
                status === 'current' ? 'bg-brand-500 border-slate-950 text-white' :
                    'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                {status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                {status === 'current' && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
            </div>
            <div className={status === 'upcoming' ? 'opacity-50' : 'opacity-100'}>
                <h4 className={`text-sm font-bold ${status === 'current' ? 'text-brand-400' : 'text-white'}`}>{title}</h4>
                <p className="text-[10px] text-slate-500">{date}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </div>
        </div>
    )
}
