"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import { Menu, X, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeRole, setActiveRole] = useState<"buyer" | "dealer" | "admin">("buyer");

    const navLinks: Array<{
        name: string;
        href: string;
        role: "buyer" | "dealer" | "admin";
    }> = [
            { name: "Marketplace", href: "/", role: "buyer" },
            { name: "Sell Bike", href: "/sell", role: "buyer" },
            { name: "Auctions", href: "/auctions", role: "buyer" },
            { name: "Dealer Dashboard", href: "/dealer/dashboard", role: "dealer" },
            { name: "Inventory", href: "/dealer/inventory", role: "dealer" },
            { name: "Live Leads", href: "/dealer/leads", role: "dealer" },
            { name: "Admin Panel", href: "/admin", role: "admin" }
        ];

    const filteredLinks = navLinks.filter(
        (link) => link.role === activeRole || link.role === "buyer"
    );

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="glass-panel mt-4 flex h-16 items-center justify-between px-4">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-500 to-accent-gold" />
                            <span className="text-xl font-bold tracking-tight text-white">Do <span className="text-brand-400">Pahiyaa</span></span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        {filteredLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href as Route}
                                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Role Switcher (Demo Only) */}
                        <div className="hidden lg:flex bg-slate-800/50 rounded-full p-1 border border-white/5">
                            {(["buyer", "dealer", "admin"] as const).map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setActiveRole(role)}
                                    className={cn(
                                        "px-3 py-1 text-xs font-medium rounded-full transition-all capitalize",
                                        activeRole === role
                                            ? "bg-brand-600 text-white shadow-lg"
                                            : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>

                        <button
                            aria-label="Open notifications"
                            className="p-2 text-slate-300 hover:text-white transition-colors relative"
                        >
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-gold ring-2 ring-slate-900" />
                        </button>

                        <Link
                            href="/sell"
                            className="rounded-full border border-brand-500/30 bg-brand-600/90 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-500 transition-colors"
                        >
                            Post Bike
                        </Link>

                        <Link
                            href="/auth/login"
                            className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 transition-colors border border-white/5"
                        >
                            <User className="h-4 w-4" />
                            <span>Login</span>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-slate-300 hover:text-white p-2"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-24 left-4 right-4 z-40">
                    <div className="glass-panel p-4 space-y-2">
                        {/* Mobile Role Switcher */}
                        <div className="flex justify-center bg-slate-800/50 rounded-lg p-1 mb-4 border border-white/5">
                            {(["buyer", "dealer", "admin"] as const).map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setActiveRole(role)}
                                    className={cn(
                                        "flex-1 py-1.5 text-xs font-medium rounded-md transition-all capitalize",
                                        activeRole === role
                                            ? "bg-brand-600 text-white shadow-lg"
                                            : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>

                        {filteredLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href as Route}
                                className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-white/10">
                            <Link
                                href="/sell"
                                className="mb-2 flex w-full items-center justify-center rounded-lg border border-brand-500/30 bg-brand-600/90 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-500 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                Post Bike
                            </Link>
                            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-500 transition-colors shadow-lg shadow-brand-500/20">
                                <User className="h-4 w-4" />
                                <span>Login / Register</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
