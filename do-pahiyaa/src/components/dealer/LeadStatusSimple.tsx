"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { updateLeadStatusAction } from "@/app/actions/leads";
import { Loader2 } from "lucide-react";

interface Props {
    leadId: string;
    currentStatus: string;
}

export function LeadStatusSimple({ leadId, currentStatus }: Props) {
    const [status, setStatus] = useState(currentStatus);
    const [loading, setLoading] = useState(false);

    const handleValueChange = async (val: string) => {
        setStatus(val); // Optimistic update
        setLoading(true);

        try {
            const res = await updateLeadStatusAction(leadId, val);
            if (!res.success) throw new Error(res.error);
            toast.success("Status updated");
        } catch (error: any) {
            toast.error(error.message);
            setStatus(currentStatus); // Revert
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-[140px] relative">
            {loading && <Loader2 className="h-3 w-3 animate-spin absolute right-2 top-3 z-10 text-slate-400" />}
            <Select value={status} onValueChange={handleValueChange} disabled={loading}>
                <SelectTrigger className={`h-8 text-xs border-0 font-medium ${status === 'new' ? 'bg-blue-500/10 text-blue-400' :
                        status === 'unlocked' ? 'bg-purple-500/10 text-purple-400' :
                            status === 'contacted' ? 'bg-orange-500/10 text-orange-400' :
                                status === 'converted' ? 'bg-green-500/10 text-green-400' :
                                    'bg-slate-800 text-slate-400'
                    }`}>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="unlocked">Unlocked</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
