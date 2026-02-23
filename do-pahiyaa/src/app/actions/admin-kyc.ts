"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getPendingKycReviewsAction() {
    try {
        const admin = createSupabaseAdminClient();
        const { data: profiles, error: profileError } = await admin
            .from('profiles')
            .select('*')
            .eq('role', 'dealer')
            .eq('is_verified', false)
            .order('created_at', { ascending: false });

        if (profileError) {
            console.error("Fetch pending KYC profiles error:", profileError);
            throw new Error(profileError.message);
        }

        const profileRows = profiles || [];
        const userIds = profileRows.map((profile) => profile.id);
        const docsByUserId = new Map<string, any[]>();

        if (userIds.length > 0) {
            const { data: docs, error: docsError } = await admin
                .from('kyc_documents')
                .select('id, user_id, document_type, file_url, status, rejection_reason, created_at')
                .in('user_id', userIds)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (docsError) {
                console.error("Fetch pending KYC docs error:", docsError);
                throw new Error(docsError.message);
            }

            for (const doc of docs || []) {
                const existingDocs = docsByUserId.get(doc.user_id) || [];
                existingDocs.push(doc);
                docsByUserId.set(doc.user_id, existingDocs);
            }
        }

        const data = profileRows.map((profile) => ({
            ...profile,
            kyc_documents: docsByUserId.get(profile.id) || [],
        })).filter((profile) => profile.kyc_documents.length > 0);

        return { success: true, data };
    } catch (error: any) {
        console.error("KYC fetch error:", error);
        return { success: false, error: error.message || "Failed to fetch KYC records" };
    }
}

export async function approveKycDocumentAction(documentId: string) {
    try {
        const admin = createSupabaseAdminClient();
        const { error } = await admin
            .from('kyc_documents')
            .update({
                status: 'verified',
                updated_at: new Date().toISOString()
            })
            .eq('id', documentId);

        if (error) throw new Error(error.message);

        revalidatePath('/admin/kyc');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function rejectKycDocumentAction(documentId: string, reason: string) {
    try {
        const admin = createSupabaseAdminClient();
        const { error } = await admin
            .from('kyc_documents')
            .update({
                status: 'rejected',
                rejection_reason: reason,
                updated_at: new Date().toISOString()
            })
            .eq('id', documentId);

        if (error) throw new Error(error.message);

        revalidatePath('/admin/kyc');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
