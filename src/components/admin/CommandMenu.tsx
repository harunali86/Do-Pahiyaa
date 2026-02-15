"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Command } from "cmdk";
import {
    User,
    Search,
    LayoutDashboard,
    ShieldAlert,
    Package
} from "lucide-react";

export function CommandMenu() {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-slate-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] backdrop-blur-xl p-0"
        >
            <div className="flex items-center border-b border-white/5 px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-white" />
                <Command.Input
                    placeholder="Type a command or search..."
                    className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 text-white disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>

            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden py-2 px-2">
                <Command.Empty className="py-6 text-center text-sm text-slate-500">No results found.</Command.Empty>

                <Command.Group heading="Navigation" className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 px-2">
                    <Command.Item
                        onSelect={() => runCommand(() => router.push("/admin" as Route))}
                        className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-slate-300 aria-selected:bg-brand-500/10 aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 mb-1"
                    >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                        <span className="ml-auto text-xs tracking-widest text-slate-600">G D</span>
                    </Command.Item>
                    <Command.Item
                        onSelect={() => runCommand(() => router.push("/admin/users" as Route))}
                        className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-slate-300 aria-selected:bg-brand-500/10 aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 mb-1"
                    >
                        <User className="mr-2 h-4 w-4" />
                        <span>Users</span>
                        <span className="ml-auto text-xs tracking-widest text-slate-600">G U</span>
                    </Command.Item>
                    <Command.Item
                        onSelect={() => runCommand(() => router.push("/dealer/inventory" as Route))}
                        className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-slate-300 aria-selected:bg-brand-500/10 aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 mb-1"
                    >
                        <Package className="mr-2 h-4 w-4" />
                        <span>Inventory</span>
                    </Command.Item>
                </Command.Group>

                <Command.Separator className="bg-white/5 h-px my-2" />

                <Command.Group heading="Actions" className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 px-2">
                    <Command.Item
                        onSelect={() => runCommand(() => console.log("Create user"))}
                        className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-slate-300 aria-selected:bg-brand-500/10 aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 mb-1"
                    >
                        <User className="mr-2 h-4 w-4" />
                        <span>Add New User</span>
                    </Command.Item>
                    <Command.Item
                        onSelect={() => runCommand(() => console.log("Moderation"))}
                        className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-slate-300 aria-selected:bg-brand-500/10 aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 mb-1"
                    >
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        <span>View Moderation Queue</span>
                    </Command.Item>
                </Command.Group>
            </Command.List>

            <div className="border-t border-white/5 px-4 py-2 flex justify-between items-center bg-slate-900/50">
                <span className="text-xs text-slate-500">
                    <kbd className="bg-slate-800 px-1 py-0.5 rounded border border-white/10 text-slate-400">Esc</kbd> to close
                </span>
                <span className="text-xs text-brand-500 font-bold">PRO Admin</span>
            </div>
        </Command.Dialog>
    );
}
