"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Eye, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import Link from "next/link";
import { publishListingAction } from "@/app/actions/listings";

interface InventoryActionsProps {
    listingId: string;
    isDraft?: boolean;
}

export default function InventoryActions({ listingId, isDraft }: InventoryActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this listing?")) return;

        setIsDeleting(true);
        try {
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', listingId);

            if (error) throw error;

            toast.success("Listing deleted successfully");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete listing");
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            const result = await publishListingAction(listingId);
            if (!result.success) throw new Error(result.error);

            toast.success("Listing published successfully!");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to publish listing");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                    <span className="sr-only">Open menu</span>
                    {isDeleting || isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-slate-200">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                {isDraft && (
                    <>
                        <DropdownMenuItem
                            className="bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 hover:text-brand-300 cursor-pointer mb-1"
                            onClick={handlePublish}
                            disabled={isPublishing}
                        >
                            <Zap className="mr-2 h-4 w-4" /> Publish Listing
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                    </>
                )}

                <DropdownMenuItem asChild className="hover:bg-white/5 cursor-pointer">
                    <Link href={`/listings/${listingId}`}>
                        <Eye className="mr-2 h-4 w-4" /> View Live
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-white/5 cursor-pointer">
                    <Link href={`/seller/listings/${listingId}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit Details
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer focus:text-red-300 focus:bg-red-500/10"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Listing
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
