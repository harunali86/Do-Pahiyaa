"use client";

import { useState } from "react";
import {
    Upload,
    CheckCircle2,
    AlertCircle,
    FileText,
    CreditCard,
    Building2,
    Loader2
} from "lucide-react";
import { KycService, KycDocumentType } from "@/lib/services/kyc.service";
import { toast } from "sonner";

interface DealerKycFormProps {
    userId: string;
    onComplete: () => void;
}

export default function DealerKycForm({ userId, onComplete }: DealerKycFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = useState<{
        gst_shop_license: File | null;
        aadhar: File | null;
        pan: File | null;
    }>({
        gst_shop_license: null,
        aadhar: null,
        pan: null
    });

    const [uploadStatus, setUploadStatus] = useState<{
        gst_shop_license: 'pending' | 'success' | 'error';
        aadhar: 'pending' | 'success' | 'error';
        pan: 'pending' | 'success' | 'error';
    }>({
        gst_shop_license: 'pending',
        aadhar: 'pending',
        pan: 'pending'
    });

    const handleFileChange = (type: keyof typeof files, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!files.gst_shop_license || !files.aadhar || !files.pan) {
            toast.error("Please upload all 3 mandatory documents");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Upload GST/Shop License
            await KycService.uploadDocument(userId, 'gst_shop_license', files.gst_shop_license);
            setUploadStatus(prev => ({ ...prev, gst_shop_license: 'success' }));

            // 2. Upload Aadhar
            await KycService.uploadDocument(userId, 'aadhar', files.aadhar);
            setUploadStatus(prev => ({ ...prev, aadhar: 'success' }));

            // 3. Upload PAN
            await KycService.uploadDocument(userId, 'pan', files.pan);
            setUploadStatus(prev => ({ ...prev, pan: 'success' }));

            toast.success("All documents uploaded successfully!");
            onComplete();
        } catch (error: any) {
            console.error(error);
            toast.error("Upload failed: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">Mandatory Business Verification</h2>
                <p className="text-xs text-slate-400">Please upload clear copies of the following documents to activate your dealer account.</p>
            </div>

            <div className="space-y-4">
                {/* GST / Shop License */}
                <div className="p-4 rounded-xl border border-white/10 bg-slate-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-brand-400 font-bold text-sm">
                            <Building2 className="w-4 h-4" />
                            Business Proof
                        </div>
                        {uploadStatus.gst_shop_license === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </div>
                    <label className="block">
                        <span className="text-[11px] text-slate-400 block mb-2 uppercase tracking-tight">Shop License or GST Registration</span>
                        <div className="relative group cursor-pointer">
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileChange('gst_shop_license', e)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                required
                            />
                            <div className="border-2 border-dashed border-white/5 group-hover:border-brand-500/50 rounded-lg p-3 text-center transition-all bg-slate-950/30">
                                {files.gst_shop_license ? (
                                    <span className="text-xs text-white truncate block">{files.gst_shop_license.name}</span>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                                        <Upload className="w-4 h-4" />
                                        <span>Choose file or drag & drop</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </label>
                </div>

                {/* Aadhar Card */}
                <div className="p-4 rounded-xl border border-white/10 bg-slate-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-brand-400 font-bold text-sm">
                            <CreditCard className="w-4 h-4" />
                            Identity Proof
                        </div>
                        {uploadStatus.aadhar === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </div>
                    <label className="block">
                        <span className="text-[11px] text-slate-400 block mb-2 uppercase tracking-tight">Aadhar Card (Front & Back merged)</span>
                        <div className="relative group cursor-pointer">
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileChange('aadhar', e)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                required
                            />
                            <div className="border-2 border-dashed border-white/5 group-hover:border-brand-500/50 rounded-lg p-3 text-center transition-all bg-slate-950/30">
                                {files.aadhar ? (
                                    <span className="text-xs text-white truncate block">{files.aadhar.name}</span>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                                        <Upload className="w-4 h-4" />
                                        <span>Choose file or drag & drop</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </label>
                </div>

                {/* PAN Card */}
                <div className="p-4 rounded-xl border border-white/10 bg-slate-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-brand-400 font-bold text-sm">
                            <FileText className="w-4 h-4" />
                            Tax Proof
                        </div>
                        {uploadStatus.pan === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </div>
                    <label className="block">
                        <span className="text-[11px] text-slate-400 block mb-2 uppercase tracking-tight">PAN Card</span>
                        <div className="relative group cursor-pointer">
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileChange('pan', e)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                required
                            />
                            <div className="border-2 border-dashed border-white/5 group-hover:border-brand-500/50 rounded-lg p-3 text-center transition-all bg-slate-950/30">
                                {files.pan ? (
                                    <span className="text-xs text-white truncate block">{files.pan.name}</span>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                                        <Upload className="w-4 h-4" />
                                        <span>Choose file or drag & drop</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Verifying & Uploading...
                        </>
                    ) : (
                        "Submit for Approval"
                    )}
                </button>
                <p className="text-[10px] text-center text-slate-500 mt-4 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Admin normally reviews documents within 24-48 hours.
                </p>
            </div>
        </form>
    );
}
