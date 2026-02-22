"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { unlockLeadAction } from "@/app/actions/dealer";
import { useRouter } from "next/navigation";

interface UnlockLeadButtonProps {
    leadId: string;
    creditsCost?: number;
}

export function UnlockLeadButton({ leadId, creditsCost = 1 }: UnlockLeadButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUnlock = async () => {
        setLoading(true);
        try {
            const result = await unlockLeadAction(leadId);

            if (result.success) {
                toast.success(`Lead unlocked! ${result.creditsRemaining} credits remaining.`);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to unlock lead. Please try again.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            size="sm"
            onClick={handleUnlock}
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-500/20 gap-2 h-8"
        >
            {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
                <Lock className="h-3 w-3" />
            )}
            Unlock Contact
        </Button>
    );
}
