"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Bell, Info, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getNotificationsAction, markAsReadAction, markAllAsReadAction } from "@/app/actions/notifications";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Notification = {
    id: string;
    title: string;
    message: string | null;
    type: 'info' | 'success' | 'warning' | 'error';
    is_read: boolean;
    link?: string | null;
    created_at: string;
};

// Lean select — only columns we render (GEMINI.md Rule 3.1)
const NOTIF_SELECT = "id, title, message, type, is_read, link, created_at";

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const userIdRef = useRef<string | null>(null);
    const supabase = createSupabaseBrowserClient();

    const fetchNotifications = useCallback(async () => {
        const data = await getNotificationsAction();
        if (data) {
            setNotifications(data as Notification[]);
            setUnreadCount(data.filter((n: any) => !n.is_read).length);
        }
    }, []);

    const markAsRead = useCallback(async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        // Server Action
        await markAsReadAction(id);
    }, []);

    const markAllAsRead = useCallback(async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        // Server Action
        await markAllAsReadAction();
    }, []);

    useEffect(() => {
        const initialFetchTimer = window.setTimeout(() => {
            void fetchNotifications();
        }, 0);

        const channel = supabase
            .channel('notifications-bell')
            .on(
                'postgres_changes' as any,
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                () => {
                    void fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            window.clearTimeout(initialFetchTimer);
            supabase.removeChannel(channel);
        };
    }, [fetchNotifications, supabase]);

    // Close dropdown on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (!(e.target as Element).closest('.notification-bell-container')) {
                setIsOpen(false);
            }
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [isOpen]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <div className="relative notification-bell-container">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-300 hover:text-white transition-colors relative"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-slate-900" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-white/10 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                        <h3 className="font-semibold text-white text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs text-brand-400 hover:text-brand-300">
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                No notifications yet
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={cn(
                                            "p-4 hover:bg-white/5 transition-colors flex gap-3 items-start cursor-pointer",
                                            !n.is_read ? "bg-brand-500/5" : ""
                                        )}
                                        onClick={() => !n.is_read && markAsRead(n.id)}
                                    >
                                        <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between gap-2">
                                                <p className={cn("text-sm font-medium", !n.is_read ? "text-white" : "text-slate-400")}>
                                                    {n.title}
                                                </p>
                                                <span className="text-[10px] text-slate-600 whitespace-nowrap">
                                                    {new Date(n.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {n.message && (
                                                <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                                            )}
                                            {n.link && (
                                                <Link href={n.link} className="text-xs text-brand-400 hover:underline inline-block mt-1">
                                                    View Details →
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-white/5 bg-white/5 text-center">
                        <Link href="/notifications" className="text-xs text-slate-400 hover:text-white transition-colors">
                            View All
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
