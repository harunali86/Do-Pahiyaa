"use client";
export const dynamic = "force-dynamic";

import { useTransition, useState } from "react";
import { Send, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { sendBroadcastAction } from "@/app/actions/admin";

export default function AdminNotificationPage() {
    const [isPending, startTransition] = useTransition();
    const [segment, setSegment] = useState("dealers");
    const [template, setTemplate] = useState("seasonal_sale");

    // Mock Estimator
    const getEstimate = () => {
        const costPerMsg = 0.80;
        let users = 0;
        if (segment === 'all') users = 1250;
        if (segment === 'dealers') users = 150;
        if (segment === 'buyers') users = 1100;
        if (segment === 'sellers') users = 340;
        return { users, cost: (users * costPerMsg).toFixed(2) };
    }

    const { users, cost } = getEstimate();

    const handleSend = (formData: FormData) => {
        startTransition(async () => {
            const result = await sendBroadcastAction(formData);
            if (result.success && "sent" in result && "failed" in result) {
                toast.success(`Broadcast Sent! (${result.sent} success, ${result.failed} failed)`);
            } else {
                toast.error("error" in result ? result.error : "Broadcast Failed");
            }
        });
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Send className="w-8 h-8 text-brand-400" />
                    Marketing Broadcast
                </h1>
                <p className="text-slate-400 mt-2">Send WhatsApp Template messages to user segments.</p>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Control Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <form action={handleSend} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Target Audience</label>
                            <select
                                name="segment"
                                value={segment}
                                onChange={(e) => setSegment(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500"
                            >
                                <option value="dealers">Dealers Only</option>
                                <option value="buyers">Buyers Only</option>
                                <option value="sellers">Sellers (with Listings)</option>
                                <option value="all">All Users (Careful!)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Template</label>
                            <select
                                name="template"
                                value={template}
                                onChange={(e) => setTemplate(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500"
                            >
                                <option value="seasonal_sale">Seasonal Sale (Marketing)</option>
                                <option value="feature_update">Feature Update (Utility)</option>
                                <option value="general_alert">General Alert</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Custom Variable (&lcub;&lcub;1&rcub;&rcub;)</label>
                            <input
                                name="variable1"
                                placeholder="e.g. 50% Off (Optional)"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                disabled={isPending}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {isPending ? "Broadcasting..." : "Send Broadcast Now"}
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Estimator Stats */}
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-emerald-400" />
                            Reach Estimation
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-slate-800">
                                <span className="text-slate-400">Target Users</span>
                                <span className="text-2xl font-mono text-white">~{users}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-slate-800">
                                <span className="text-slate-400">Cost per Msg</span>
                                <span className="text-white">₹0.80</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-slate-300 font-bold">Total Cost</span>
                                <span className="text-3xl font-mono text-emerald-400">₹{cost}</span>
                            </div>
                        </div>

                        {segment === 'all' && (
                            <div className="mt-6 bg-amber-900/20 border border-amber-500/20 rounded-lg p-4 flex gap-3 text-amber-200">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                <p className="text-sm">You are about to message the entire database. This action cannot be undone.</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Template Preview</h3>
                        <div className="bg-[#0b141a] p-4 rounded-lg relative overflow-hidden">
                            {/* WhatsApp Background Doodle style could go here */}
                            <div className="bg-[#202c33] p-3 rounded-lg rounded-tl-none max-w-[85%] self-start text-white text-sm leading-relaxed shadow-sm">
                                <h4 className="font-bold mb-1 text-xs text-slate-400">
                                    {template === 'seasonal_sale' ? '📢 SALE ALERT' : 'ℹ️ UPDATE'}
                                </h4>
                                <p>Hello {"{{name}}"},</p>
                                <p className="mt-2">Don&apos;t miss out! We are offering {"{{1}}"} on all premium bikes this week.</p>
                                <p className="mt-2">Tap below to check it out! 🏍️</p>
                                <span className="text-[10px] text-slate-500 block text-right mt-1">12:45 PM</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
