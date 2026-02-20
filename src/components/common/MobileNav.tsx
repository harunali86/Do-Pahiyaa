"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Search,
    PlusCircle,
    Gavel,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function MobileNav() {
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true); // eslint-disable-line
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!isMounted) return null;

    // Hide on admin/dealer routes to avoid clutter
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/dealer")) {
        return null;
    }

    const navItems = [
        { href: "/", icon: Home, label: "Home" },
        { href: "/search", icon: Search, label: "Buy" },
        { href: "/sell", icon: PlusCircle, label: "Sell", highlight: true },
        { href: "/auctions", icon: Gavel, label: "Auctions" },
        { href: "/buyer/dashboard", icon: User, label: "Profile" },
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
            <nav className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl px-6 py-3 flex justify-between items-center max-w-sm mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    if (item.highlight) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative -top-8 bg-brand-600 hover:bg-brand-500 text-white rounded-full p-4 shadow-lg shadow-brand-500/30 border-4 border-slate-950 transition-transform active:scale-95"
                            >
                                <Icon className="w-6 h-6" />
                            </Link>
                        )
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-colors",
                                isActive ? "text-brand-400" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive && "fill-current/20")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
