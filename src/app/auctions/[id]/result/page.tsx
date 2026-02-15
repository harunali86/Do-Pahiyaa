"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Trophy,
    Download,
    ArrowRight,
    CheckCircle2,
    Share2
} from "lucide-react";
import Image from "next/image";

export default function AuctionResultPage() {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        // Small delay to ensure client-side mount before confetti
        const timer = setTimeout(() => setShowConfetti(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 relative overflow-hidden">

            {/* Confetti Background (CSS Simulation) */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none">
                    {/* Add simpler confetti CSS or just rely on the vibe for now */}
                    <div className="absolute top-10 left-[20%] w-3 h-3 bg-red-500/50 rounded-full animate-bounce" />
                    <div className="absolute top-20 right-[20%] w-3 h-3 bg-blue-500/50 rounded-full animate-bounce delay-100" />
                    <div className="absolute top-40 left-[50%] w-4 h-4 bg-yellow-500/50 rounded-full animate-bounce delay-200" />
                </div>
            )}

            <div className="w-full max-w-lg text-center relative z-10">

                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-yellow-500/40 animate-slide-up">
                    <Trophy className="w-12 h-12 text-white" />
                </div>

                <h1 className="text-4xl font-black text-white mb-2 animate-fade-in">YOU WON!</h1>
                <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                    Congratulations! You are the highest bidder for the <strong className="text-white">Ducati Panigale V4</strong>.
                </p>

                <div className="bg-glass-gradient border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl mb-8 text-left">
                    <div className="flex gap-4 items-center mb-6 border-b border-white/5 pb-6">
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 relative">
                            <Image src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=2940&auto=format&fit=crop" alt="Bike" fill className="object-cover" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Ducati Panigale V4</h3>
                            <p className="text-xs text-slate-500">Auction #AUC-9921</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Winning Bid</span>
                            <span className="text-white font-bold text-lg">₹ 14,50,000</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Buyer Premium (5%)</span>
                            <span className="text-slate-300">₹ 72,500</span>
                        </div>
                        <div className="flex justify-between items-center text-sm pt-4 border-t border-white/5">
                            <span className="text-white font-bold">Total Payable</span>
                            <span className="text-brand-400 font-mono font-bold text-xl">₹ 15,22,500</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 flex-col sm:flex-row">
                    <button className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/20 active:scale-95 transition-all flex justify-center items-center gap-2">
                        <Download className="w-5 h-5" /> Download Invoice
                    </button>
                    <Link href="/buyer/dashboard" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3.5 rounded-xl transition-all flex justify-center items-center gap-2">
                        Go to Dashboard
                    </Link>
                </div>

                <p className="text-[10px] text-slate-500 mt-6 max-w-xs mx-auto">
                    A confirmation email has been sent to your registered email address. Settlement must be completed within 48 hours.
                </p>

            </div>
        </div>
    );
}
