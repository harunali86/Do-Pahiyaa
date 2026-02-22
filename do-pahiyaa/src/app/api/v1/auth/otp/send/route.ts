import { NextRequest, NextResponse } from "next/server";
import { OTPService } from "@/lib/services/otp.service";

/**
 * API Route to send OTP via WhatsApp
 * POST /api/auth/otp/send
 */
export async function POST(req: NextRequest) {
    try {
        const { phone } = await req.json();

        if (!phone || phone.length < 10) {
            return NextResponse.json({ error: "Valid phone number required" }, { status: 400 });
        }

        const ip = req.headers.get("x-forwarded-for") || "unknown";

        const result = await OTPService.sendOTP(phone, ip);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 429 });
        }

        return NextResponse.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        console.error("[OTP_SEND_API] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
