"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BarChart3,
    Users,
    ShieldAlert,
    Gavel,
    SlidersHorizontal,
    Flag,
    KeyRound,
    Settings,
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminLinks: Array<{ name: string; href: string; icon: typeof LayoutDashboard }> = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Revenue", href: "/admin/revenue", icon: BarChart3 },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Roles", href: "/admin/roles", icon: KeyRound },
    { name: "KYC Review", href: "/admin/kyc", icon: ShieldAlert },
    { name: "CRM (Leads)", href: "/admin/leads", icon: Users },
    { name: "Pricing Engine", href: "/admin/pricing", icon: SlidersHorizontal },
    { name: "Lead Packs", href: "/admin/leads/subscriptions", icon: ShieldAlert }, // Reusing ShieldAlert or similar
    { name: "Feature Flags", href: "/admin/feature-flags", icon: Flag },
    { name: "Moderation", href: "/admin/moderation", icon: ShieldAlert },
    { name: "Live Auctions", href: "/admin/auctions", icon: Gavel },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-slate-950/80 backdrop-blur-xl h-[calc(100vh-4rem)] sticky top-16">
            <div className="p-6">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                    <ShieldAlert className="h-5 w-5" />
                    <span className="text-sm font-bold">Admin Mode</span>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
                {adminLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.name}
                            href={link.href as Route}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                                isActive
                                    ? "bg-slate-800 text-white border border-white/5 shadow-lg"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-brand-400" : "text-slate-500 group-hover:text-slate-300")} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5">
                <button className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                    <LogOut className="h-5 w-5" />
                    Exit Admin
                </button>
            </div>
        </div>
    );
}
