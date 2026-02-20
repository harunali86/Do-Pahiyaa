"use client";
export const dynamic = "force-dynamic";

import { CheckCircle2, CreditCard, Download, ShieldCheck, Zap } from "lucide-react";

export default function SubscriptionPage() {
    const plans = [
        {
            name: "Basic",
            price: "₹1,999",
            period: "/month",
            features: ["5 Listings/month", "Basic Analytics", "Email Support", "Standard Visibility"],
            current: false,
            color: "blue"
        },
        {
            name: "Pro Dealer",
            price: "₹4,999",
            period: "/month",
            features: ["50 Listings/month", "Advanced Analytics", "Priority Support", "Featured Listings (2/mo)", "Lead Inbox Access"],
            current: true,
            popular: true,
            color: "brand"
        },
        {
            name: "Enterprise",
            price: "₹9,999",
            period: "/month",
            features: ["Unlimited Listings", "API Access", "Dedicated Account Manager", "Top Search Results", "Unlimited Leads"],
            current: false,
            color: "purple"
        }
    ];

    return (
        <div className="min-h-screen py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Subscription & Billing</h1>
                    <p className="text-slate-400">Manage your dealer plan and invoices</p>
                </div>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`relative rounded-2xl p-6 border transition-all ${plan.current
                                ? 'bg-brand-900/10 border-brand-500 ring-1 ring-brand-500/50'
                                : 'bg-slate-900/50 border-white/5 hover:border-white/10'
                            }`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-[10px] font-bold uppercase py-1 px-3 rounded-full shadow-lg shadow-brand-500/40">
                                Most Popular
                            </div>
                        )}

                        <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-3xl font-bold text-white">{plan.price}</span>
                            <span className="text-sm text-slate-500">{plan.period}</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {plan.features.map(feat => (
                                <li key={feat} className="flex items-start gap-3 text-sm text-slate-400">
                                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.current ? 'text-brand-400' : 'text-slate-600'}`} />
                                    {feat}
                                </li>
                            ))}
                        </ul>

                        <button className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 ${plan.current
                                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                                : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                            }`}>
                            {plan.current ? "Current Plan" : "Upgrade Plan"}
                        </button>
                    </div>
                ))}
            </div>

            {/* Billing History */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-white">Billing History</h3>
                    <button className="text-xs text-brand-400 hover:text-brand-300">Download All</button>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950/50 text-slate-500 font-medium">
                        <tr>
                            <th className="p-4">Invoice ID</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Download</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                        {[1, 2, 3].map(i => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-mono text-slate-400">#INV-2024-{100 + i}</td>
                                <td className="p-4">Feb {10 - i}, 2026</td>
                                <td className="p-4">₹4,999.00</td>
                                <td className="p-4"><span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-green-500/20">Paid</span></td>
                                <td className="p-4 text-right">
                                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Payment Method */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 flex justify-between items-center">
                <div className="flex gap-4 items-center">
                    <div className="p-3 bg-slate-800 rounded-lg text-white">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Payment Method</h3>
                        <p className="text-sm text-slate-400">Visa ending in 4242</p>
                    </div>
                </div>
                <button className="text-sm text-brand-400 font-bold hover:underline">Update</button>
            </div>
        </div>
    );
}
