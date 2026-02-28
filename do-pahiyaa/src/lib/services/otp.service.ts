import { createClient } from "@supabase/supabase-js";
import { WhatsAppService } from "./whatsapp.service";
import crypto from "crypto";
import { env } from "@/lib/env";

/**
 * OTP Service to handle generation, hashing, sending, and verification.
 */
export class OTPService {
    // We use service role to bypass RLS for internal auth tables
    private static supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
    );

    private static readonly OTP_EXPIRY_MINUTES = 5;

    /**
     * Generate 6-digit random OTP
     */
    static generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Send OTP via WhatsApp
     */
    static async sendOTP(phone: string, ip: string): Promise<{ success: boolean; error?: string }> {
        try {
            const otp = this.generateOTP();
            const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
            const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60000);

            // 1. Check Rate Limit (e.g., 5 requests per hour for same phone)
            const { count } = await this.supabase
                .from("auth_otp_requests")
                .select("*", { count: "exact", head: true })
                .eq("phone", phone)
                .gt("created_at", new Date(Date.now() - 60 * 60000).toISOString());

            if (count && count >= 5) {
                return { success: false, error: "Too many OTP requests. Please try again later." };
            }

            // 2. Store OTP Hash
            const { error: dbError } = await this.supabase
                .from("auth_otp_requests")
                .insert({
                    phone,
                    otp_hash: otpHash,
                    expires_at: expiresAt.toISOString(),
                    channel: "whatsapp"
                });

            if (dbError) throw dbError;

            // 3. Send via WhatsApp
            // Template: dopahiyaa_otp
            // Schema: Body has 1 param {{1}}, Button is URL type with OTP param.
            const whatsappResult = await WhatsAppService.sendTemplate(phone, "dopahiyaa_otp", [
                {
                    type: "body",
                    parameters: [{ type: "text", text: otp }]
                },
                {
                    type: "button",
                    sub_type: "url",
                    index: "0",
                    parameters: [{ type: "text", text: otp }]
                }
            ], "en");

            console.log(`[OTP] WhatsApp API response for ${phone}:`, JSON.stringify(whatsappResult, null, 2));

            if (!whatsappResult) {
                return { success: false, error: "Failed to send WhatsApp message. Please check the number." };
            }

            // 4. Audit Log
            await this.supabase.from("auth_login_audit").insert({
                phone,
                action: "otp_sent",
                status: "success"
            });

            return { success: true };
        } catch (error: any) {
            console.error("[OTPService] Error:", error);
            return { success: false, error: error.message || "Unknown error" };
        }
    }

    /**
     * Verify OTP
     */
    static async verifyOTP(phone: string, otp: string): Promise<{ success: boolean; error?: string }> {
        try {
            const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

            // 1. Fetch latest active OTP for this phone
            const { data: request, error: fetchError } = await this.supabase
                .from("auth_otp_requests")
                .select("*")
                .eq("phone", phone)
                .is("consumed_at", null)
                .gt("expires_at", new Date().toISOString())
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (fetchError || !request) {
                return { success: false, error: "OTP expired or not found. Please request a new one." };
            }

            // 2. Check Attempts
            if (request.attempts >= request.max_attempts) {
                return { success: false, error: "Too many incorrect attempts. Please request a new OTP." };
            }

            // 3. Compare Hash
            if (request.otp_hash !== otpHash) {
                // Increment attempts
                await this.supabase
                    .from("auth_otp_requests")
                    .update({ attempts: request.attempts + 1 })
                    .eq("id", request.id);

                return { success: false, error: "Invalid OTP. Please try again." };
            }

            // 4. Mark as Consumed
            await this.supabase
                .from("auth_otp_requests")
                .update({ consumed_at: new Date().toISOString() })
                .eq("id", request.id);

            return { success: true };
        } catch (error: any) {
            console.error("[OTPService] Verification Error:", error);
            return { success: false, error: "Verification failed." };
        }
    }
}
