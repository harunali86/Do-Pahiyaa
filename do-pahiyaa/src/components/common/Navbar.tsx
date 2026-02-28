"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Menu, X, User, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { NotificationBell } from "./NotificationBell";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
import { getUserRoleAction } from "@/app/actions/auth";

const CitySelector = dynamic(
    () => import("./CitySelector").then((module) => module.CitySelector),
    { ssr: false }
);

type UserRole = "user" | "dealer" | "admin" | null;

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [userRole, setUserRole] = useState<UserRole>(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();
    const roleFetchedRef = useRef(false);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            // ---------------------------

            setUser(session?.user ?? null);

            // Fetch user role from profiles table (via Server Action)
            if (session?.user && !roleFetchedRef.current) {
                roleFetchedRef.current = true;
                const role = await getUserRoleAction();
                setUserRole(role);
            }
        };
        getUser();


        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (!session?.user) {
                setUserRole(null);
                roleFetchedRef.current = false;
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setUserRole(null);
        roleFetchedRef.current = false;
        setShowLogoutConfirm(false);
        setIsOpen(false);
        router.push("/auth/login");
    };

    // Public links (always visible)
    const publicLinks = [
        { name: "Marketplace", href: "/" },
        { name: "Sell Bike", href: "/sell" },
    ];

    // Role-specific dashboard link (Keep this for highlighting, but links are now public in menu)
    const getRoleDashboardLink = () => {
        if (userRole === "admin") {
            return { name: "Admin (Role Active)", href: "/admin", icon: ShieldCheck, color: "text-red-400" };
        }
        if (userRole === "dealer") {
            return { name: "Dealer (Role Active)", href: "/dealer/dashboard", icon: LayoutDashboard, color: "text-brand-400" };
        }
        return null;
    };

    const dashboardLink = user ? getRoleDashboardLink() : null;

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
                    <div className="hidden md:flex items-center space-x-6">
                        <CitySelector />
                        {publicLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href as Route}
                                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Role-specific dashboard link */}
                        {dashboardLink && (
                            <Link
                                href={dashboardLink.href as Route}
                                className={cn(
                                    "flex items-center gap-1.5 text-sm font-semibold transition-colors",
                                    dashboardLink.color,
                                    "hover:text-white"
                                )}
                            >
                                <dashboardLink.icon className="h-4 w-4" />
                                {dashboardLink.name}
                            </Link>
                        )}
                    </div>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <NotificationBell />

                        <Link
                            href="/sell"
                            className="rounded-full border border-brand-500/30 bg-brand-600/90 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-500 transition-colors"
                        >
                            Post Bike
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/settings/profile"
                                    className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 transition-colors border border-white/5"
                                >
                                    <User className="h-4 w-4" />
                                    <span>{user.user_metadata?.full_name?.split(' ')[0] || 'Account'}</span>
                                </Link>
                                <button
                                    onClick={handleLogoutClick}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 transition-colors border border-white/5"
                            >
                                <User className="h-4 w-4" />
                                <span>Login</span>
                            </Link>
                        )}
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
                        {publicLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href as Route}
                                className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Role-specific dashboard link (mobile) */}
                        {dashboardLink && (
                            <Link
                                href={dashboardLink.href as Route}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-md text-base font-semibold transition-colors",
                                    dashboardLink.color,
                                    "hover:bg-white/5"
                                )}
                                onClick={() => setIsOpen(false)}
                            >
                                <dashboardLink.icon className="h-4 w-4" />
                                {dashboardLink.name}
                            </Link>
                        )}

                        <div className="pt-4 border-t border-white/10">
                            <Link
                                href="/sell"
                                className="mb-2 flex w-full items-center justify-center rounded-lg border border-brand-500/30 bg-brand-600/90 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-500 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                Post Bike
                            </Link>

                            {user ? (
                                <>
                                    <Link
                                        href="/settings/profile"
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors mb-2"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <User className="h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogoutClick();
                                            setIsOpen(false);
                                        }}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/auth/login"
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-500 transition-colors shadow-lg shadow-brand-500/20"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <User className="h-4 w-4" />
                                    <span>Login / Register</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationDialog
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={confirmLogout}
                title="Log Out"
                description="Are you sure you want to log out of your account?"
                confirmText="Log Out"
                cancelText="Cancel"
                variant="danger"
            />
        </nav>
    );
}
