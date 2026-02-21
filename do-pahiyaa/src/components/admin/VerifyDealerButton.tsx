"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";
import { verifyDealerAction } from "@/app/actions/admin";
import { toast } from "sonner";

export default function VerifyDealerButton({ dealerId, currentStatus }: { dealerId: string, currentStatus: string }) {
    const [loading, setLoading] = useState(false);

    if (currentStatus === 'verified') return null;

    const handleVerify = async () => {
        setLoading(true);
        try {
            const res = await verifyDealerAction(dealerId);
            if (res.success) {
                toast.success("Dealer verified successfully");
            } else {
                toast.error(res.error || "Failed to verify");
            }
        } catch (e) {
            toast.error("Error verifying dealer");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs border-green-500/50 text-green-400 hover:bg-green-500/10"
            onClick={handleVerify}
            disabled={loading}
        >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3 mr-1" />}
            Verify
        </Button>
    );
}
