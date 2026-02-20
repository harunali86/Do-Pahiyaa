"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    MessageSquare,
    BarChart3,
    Settings,
    LogOut,
    PlusCircle
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

const dealerLinks: Array<{ name: string; href: string; icon: typeof LayoutDashboard }> = [
    { name: "Overview", href: "/dealer/dashboard", icon: LayoutDashboard },
    { name: "Inventory", href: "/dealer/inventory", icon: Package },
    { name: "Lead Inbox", href: "/dealer/leads", icon: MessageSquare },
    { name: "Analytics", href: "/dealer/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dealer/settings", icon: Settings },
];

export default function DealerSidebar() {
    const pathname = usePathname();

    const [balance, setBalance] = useState<number | null>(null);
    const supabase = createBrowserClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    useEffect(() => {
        const fetchBalance = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('dealers').select('credits_balance').eq('profile_id', user.id).single();
                if (data) setBalance(data.credits_balance);
            }
        };
        fetchBalance();
    }, []);

    return (
        <div className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-slate-950/50 backdrop-blur-xl h-[calc(100vh-4rem)] sticky top-16">
            <div className="p-6">
                <button className="flex items-center justify-center gap-2 w-full bg-brand-600 hover:bg-brand-500 text-white rounded-xl py-3 font-medium shadow-lg shadow-brand-500/20 active:scale-95 transition-all">
                    <PlusCircle className="h-5 w-5" />
                    Add Listing
                </button>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
                {dealerLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.name}
                            href={link.href as Route}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                isActive
                                    ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive ? "text-brand-400" : "text-slate-500")} />
                            {link.name}
                            {link.name === "Lead Inbox" && (
                                <span className="ml-auto bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    3
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5">
                <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5 mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-400 font-medium">Balance</span>
                        <Link href="/dealer/credits" className="text-xs text-brand-400 font-bold hover:text-brand-300 transition-colors">
                            Add Funds
                        </Link>
                    </div>
                    <p className="text-xl font-bold text-white">₹{balance !== null ? balance.toLocaleString() : "..."}</p>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                        <div className="bg-brand-500 h-1.5 rounded-full w-3/4 shadow-[0_0_10px_rgba(20,184,166,0.45)]" />
                    </div>
                </div>

                <button className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
