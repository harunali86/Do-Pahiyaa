"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Camera,
    ChevronRight,
    MapPin,
    Info,
    CheckCircle2,
    Bike
} from "lucide-react";

export default function NewListingPage() {
    const [step, setStep] = useState(1);
    const steps = [
        { id: 1, title: "Basics" },
        { id: 2, title: "Specs" },
        { id: 3, title: "Photos" },
        { id: 4, title: "Review" }
    ];

    return (
        <div className="min-h-screen py-10 max-w-3xl mx-auto">

            {/* Stepper Header */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    {steps.map(s => (
                        <div key={s.id} className="flex flex-col items-center gap-2 relative z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${step >= s.id ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-500'
                                }`}>
                                {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= s.id ? 'text-white' : 'text-slate-600'
                                }`}>{s.title}</span>
                        </div>
                    ))}
                    {/* Line */}
                    <div className="absolute top-14 left-0 w-full h-0.5 bg-slate-800 -z-0 hidden"></div>
                    {/* Note: positioning absolute line across flex items is tricky, simplifying for demo */}
                </div>
                <h1 className="text-2xl font-bold text-white text-center">Sell Your Superbike</h1>
                <p className="text-slate-400 text-center text-sm">Reach 10,000+ verified buyers in minutes.</p>
            </div>

            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-8 backdrop-blur-sm">

                {step === 1 && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300">Registration Number</label>
                            <input type="text" placeholder="KA-01-EQ-1234" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300">Brand</label>
                                <select className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50 appearance-none">
                                    <option>Select Brand</option>
                                    <option>Royal Enfield</option>
                                    <option>KTM</option>
                                    <option>Triumph</option>
                                    <option>Kawasaki</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300">Year</label>
                                <select className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50 appearance-none">
                                    <option>2024</option>
                                    <option>2023</option>
                                    <option>2022</option>
                                    <option>2021</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300">Model Name</label>
                            <input type="text" placeholder="e.g. Continental GT 650 Chrome" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50" />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300">Kilometers Driven</label>
                                <input type="number" placeholder="e.g. 5000" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300">No. of Owners</label>
                                <select className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50">
                                    <option>1st Owner</option>
                                    <option>2nd Owner</option>
                                    <option>3rd Owner</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300">Expected Price (₹)</label>
                            <input type="text" placeholder="e.g. 3,50,000" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-mono focus:outline-none focus:border-brand-500/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                <input type="text" placeholder="Enter City/Area" className="w-full bg-slate-950 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-brand-500/50" />
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 text-center py-10">
                        <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 bg-slate-950/30 hover:bg-slate-950/60 hover:border-brand-500/30 transition-all cursor-pointer">
                            <Camera className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                            <h3 className="text-white font-bold text-lg">Click to Upload Photos</h3>
                            <p className="text-slate-400 text-sm mt-2">Upload up to 10 high-quality images. <br />Drag & drop supported.</p>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="aspect-square bg-slate-900 rounded-lg border border-white/5 animate-pulse" />
                            ))}
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6">
                        <div className="bg-slate-950 rounded-xl p-4 border border-white/5 flex gap-4">
                            <div className="w-24 h-24 bg-slate-800 rounded-lg"></div>
                            <div>
                                <h3 className="font-bold text-white text-lg">Royal Enfield Continental GT 650</h3>
                                <p className="text-brand-400 font-bold">₹3,50,000</p>
                                <p className="text-xs text-slate-500 mt-2">Bangalore • 2023 • 5000km</p>
                            </div>
                        </div>
                        <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 flex gap-3 text-brand-300 text-sm">
                            <Info className="w-5 h-5 shrink-0" />
                            <p>Your listing will be reviewed by our team within 2 hours. Once approved, it will be visible to all buyers.</p>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-8 mt-8 border-t border-white/5">
                    <button
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        className={`px-6 py-2 rounded-lg font-medium text-slate-400 hover:text-white transition-colors ${step === 1 ? 'invisible' : ''}`}
                    >
                        Back
                    </button>
                    <button
                        onClick={() => {
                            if (step === 4) alert("Listing Submitted!");
                            else setStep(s => Math.min(4, s + 1));
                        }}
                        className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-500/20 transition-all active:scale-95"
                    >
                        {step === 4 ? "Publish Listing" : "Continue"}
                    </button>
                </div>

            </div>
        </div>
    );
}
