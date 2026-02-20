export const dynamic = "force-dynamic";
"use client";

import { useState, useEffect } from "react";
import {
    CheckCircle2,
    XCircle,
    Eye,
    Clock,
    ShieldCheck,
    ExternalLink,
    AlertCircle,
    Building2,
    Loader2,
    FileText
} from "lucide-react";
import { KycService } from "@/lib/services/kyc.service";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminKycReviewPage() {
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchPendingReviews();
    }, []);

    const fetchPendingReviews = async () => {
        setIsLoading(true);
        try {
            const data = await KycService.getPendingReviews();
            setPendingUsers(data || []);
        } catch (error: any) {
            toast.error("Failed to fetch pending reviews");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveDoc = async (docId: string) => {
        setIsProcessing(true);
        try {
            await KycService.approveDocument(docId);
            toast.success("Document approved");
            // Refresh local state or re-fetch
            fetchPendingReviews();
        } catch (error: any) {
            toast.error("Approval failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRejectDoc = async (docId: string) => {
        if (!rejectionReason) {
            toast.error("Please provide a rejection reason");
            return;
        }
        setIsProcessing(true);
        try {
            await KycService.rejectDocument(docId, rejectionReason);
            toast.success("Document rejected");
            setRejectionReason("");
            fetchPendingReviews();
        } catch (error: any) {
            toast.error("Rejection failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const getDocLabel = (type: string) => {
        switch (type) {
            case 'gst_shop_license': return 'GST / Shop License';
            case 'aadhar': return 'Aadhar Card';
            case 'pan': return 'PAN Card';
            default: return type;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-brand-400" />
                        KYC Verification Hub
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Review and approve mandatory business documents for Indian dealers.</p>
                </div>
                <div className="bg-slate-900/50 border border-white/10 px-4 py-2 rounded-lg text-sm font-medium text-slate-300">
                    <span className="text-brand-400 font-bold">{pendingUsers.length}</span> Pending Requests
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List of Pending Dealers */}
                <div className="lg:col-span-1 glass-panel border border-white/5 overflow-hidden flex flex-col h-[700px]">
                    <div className="p-4 border-b border-white/5 bg-slate-900/50 font-bold text-xs uppercase tracking-widest text-slate-500">
                        Pending Dealers
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <p className="text-xs">Loading requests...</p>
                            </div>
                        ) : pendingUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30 px-6 text-center">
                                <CheckCircle2 className="h-10 w-10" />
                                <p className="text-sm font-medium">All clear! No pending KYC requests.</p>
                            </div>
                        ) : (
                            pendingUsers.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className={`w-full text-left p-4 rounded-xl transition-all border ${selectedUser?.id === user.id
                                            ? 'bg-brand-500/10 border-brand-500/50 shadow-lg shadow-brand-500/5'
                                            : 'bg-slate-900/30 border-white/5 hover:border-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-10 w-10 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-brand-400">
                                            {user.full_name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white truncate w-32">{user.full_name}</p>
                                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {format(new Date(user.created_at), 'dd MMM, HH:mm')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {user.kyc_documents?.map((doc: any) => (
                                            <span
                                                key={doc.id}
                                                className={`text-[9px] px-1.5 py-0.5 rounded border ${doc.status === 'verified' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                                        doc.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                            'bg-slate-800 border-white/10 text-slate-400'
                                                    }`}
                                            >
                                                {getDocLabel(doc.document_type).split(' ')[0]}
                                            </span>
                                        ))}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Review Detail Area */}
                <div className="lg:col-span-2 glass-panel border border-white/5 h-[700px] flex flex-col relative overflow-hidden">
                    {selectedUser ? (
                        <>
                            <div className="p-6 border-b border-white/5 bg-slate-900/50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center font-bold text-xl text-brand-400">
                                        {selectedUser.full_name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white leading-tight">{selectedUser.full_name}</h2>
                                        <p className="text-slate-400 text-sm">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-widest">
                                        Pending Verification
                                    </span>
                                    <p className="text-[10px] text-slate-600">ID: {selectedUser.id.substring(0, 8)}...</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {['gst_shop_license', 'aadhar', 'pan'].map((type) => {
                                        const doc = selectedUser.kyc_documents.find((d: any) => d.document_type === type);
                                        return (
                                            <div key={type} className="p-5 rounded-2xl border border-white/5 bg-slate-900/30 flex flex-col gap-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tight">{getDocLabel(type)}</h3>
                                                    {doc?.status === 'verified' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                                </div>

                                                {doc ? (
                                                    <>
                                                        <div className="aspect-square rounded-xl bg-slate-950 border border-white/5 flex flex-col items-center justify-center gap-3 relative group overflow-hidden">
                                                            <FileText className="h-10 w-10 text-slate-800 group-hover:text-brand-400/50 transition-colors" />
                                                            <a
                                                                href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kyc-documents/${doc.file_url}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="absolute inset-0 bg-brand-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                            >
                                                                <Eye className="h-6 w-6 text-white" />
                                                            </a>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleApproveDoc(doc.id)}
                                                                disabled={isProcessing || doc.status === 'verified'}
                                                                className="flex-1 py-2 rounded-lg bg-green-600/10 hover:bg-green-600/20 text-green-500 text-xs font-bold transition-all disabled:opacity-30 border border-green-500/20"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const reason = prompt("Enter rejection reason:");
                                                                    if (reason) {
                                                                        setRejectionReason(reason);
                                                                        handleRejectDoc(doc.id);
                                                                    }
                                                                }}
                                                                disabled={isProcessing}
                                                                className="flex-1 py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-500 text-xs font-bold transition-all disabled:opacity-30 border border-red-500/20"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="aspect-square rounded-xl border border-white/5 bg-red-500/5 flex flex-col items-center justify-center gap-2 text-red-500/30">
                                                        <AlertCircle className="h-8 w-8" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Missing</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="p-6 rounded-2xl bg-slate-900/50 border border-brand-500/10">
                                    <h4 className="flex items-center gap-2 text-white font-bold text-sm mb-4">
                                        <Building2 className="h-4 w-4 text-brand-400" />
                                        Dealer Verification Policy
                                    </h4>
                                    <ul className="space-y-2 text-xs text-slate-400">
                                        <li className="flex items-start gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 mt-1.5" />
                                            Ensure Business Proof matches the shop name and address.
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 mt-1.5" />
                                            Identity proof must be clear and government-issued.
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 mt-1.5" />
                                            Profile becomes &apos;Active&apos; automatically only after ALL 3 documents are verified.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gap-4 opacity-30">
                            <ShieldCheck className="h-20 w-20" />
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Select a dealer to review</h3>
                                <p className="text-sm max-w-xs mx-auto">Inspect mandatory business proofs to secure the high-trust marketplace environment.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
