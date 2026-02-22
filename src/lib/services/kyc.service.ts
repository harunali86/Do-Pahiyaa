import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type KycDocumentType = 'gst_shop_license' | 'aadhar' | 'pan';

export interface KycUploadStatus {
    document_type: KycDocumentType;
    file?: File;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
}

export class KycService {
    private static supabase = createSupabaseBrowserClient();

    /**
     * Uploads a KYC document to storage and creates a database record
     */
    static async uploadDocument(userId: string, type: KycDocumentType, file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;
        const filePath = `kyc-documents/${fileName}`;

        // 1. Upload to Supabase Storage
        const { data: storageData, error: storageError } = await this.supabase.storage
            .from('kyc-documents')
            .upload(filePath, file);

        if (storageError) throw storageError;

        // 2. Create record in kyc_documents table
        const { error: dbError } = await this.supabase
            .from('kyc_documents')
            .insert({
                user_id: userId,
                document_type: type,
                file_url: filePath,
                status: 'pending'
            });

        if (dbError) throw dbError;

        // 3. Update profile status to pending_verification if it's the first doc
        await this.supabase
            .from('profiles')
            .update({ status: 'pending_verification' })
            .eq('id', userId)
            .eq('status', 'active');

        return storageData;
    }

    /**
     * Fetches the KYC status for a user
     */
    static async getKycStatus(userId: string) {
        const { data, error } = await this.supabase
            .from('kyc_documents')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    }

    /**
     * Admin: Approve a KYC document
     */
    static async approveDocument(documentId: string) {
        const { error } = await this.supabase
            .from('kyc_documents')
            .update({
                status: 'verified',
                updated_at: new Date().toISOString()
            })
            .eq('id', documentId);

        if (error) throw error;
    }

    /**
     * Admin: Reject a KYC document
     */
    static async rejectDocument(documentId: string, reason: string) {
        const { error } = await this.supabase
            .from('kyc_documents')
            .update({
                status: 'rejected',
                rejection_reason: reason,
                updated_at: new Date().toISOString()
            })
            .eq('id', documentId);

        if (error) throw error;
    }

    /**
     * Admin: Fetch all users with pending KYC
     */
    static async getPendingReviews() {
        const { data, error } = await this.supabase
            .from('profiles')
            .select(`
        *,
        kyc_documents (
          id,
          document_type,
          file_url,
          status,
          rejection_reason,
          created_at
        )
      `)
            .eq('status', 'pending_verification')
            .eq('role', 'dealer')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }
}
