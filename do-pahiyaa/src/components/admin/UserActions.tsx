"use client";

import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ShieldAlert, Trash2, CheckCircle, Ban, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { toggleBlockUserAction, deleteUserAction } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

interface UserActionsProps {
    userId: string;
    isBlocked: boolean;
    userName: string;
}

export function UserActions({ userId, isBlocked, userName }: UserActionsProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleBlockToggle = async () => {
        if (!confirm(`Are you sure you want to ${isBlocked ? "unblock" : "block"} ${userName}?`)) return;

        setLoading(true);
        try {
            const result = await toggleBlockUserAction(userId, !isBlocked);
            if (result.success) {
                toast.success(result.message);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update user status");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`⚠️ DANGER: Are you sure you want to PERMANENTLY DELETE ${userName}? This action cannot be undone.`)) return;

        setLoading(true);
        try {
            const result = await deleteUserAction(userId);
            if (result.success) {
                toast.success("User deleted successfully");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete user");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-slate-300">
                <DropdownMenuItem
                    className="focus:bg-white/10 focus:text-white cursor-pointer gap-2"
                    onClick={handleBlockToggle}
                >
                    {isBlocked ? (
                        <>
                            <CheckCircle className="h-4 w-4 text-green-400" /> Unblock User
                        </>
                    ) : (
                        <>
                            <Ban className="h-4 w-4 text-orange-400" /> Block User
                        </>
                    )}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem
                    className="focus:bg-red-500/20 focus:text-red-400 text-red-500 cursor-pointer gap-2"
                    onClick={handleDelete}
                >
                    <Trash2 className="h-4 w-4" /> Delete User
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
