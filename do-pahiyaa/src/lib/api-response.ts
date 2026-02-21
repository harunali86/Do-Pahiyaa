import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Standardized API Response Format (GEMINI.md Rule 2.2)
 * { success: boolean, data: any, error?: { code: string, message: string } }
 */

export function apiSuccess(data: any, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 500, code?: string) {
    return NextResponse.json(
        { success: false, error: { code: code || `ERR_${status}`, message } },
        { status }
    );
}

/**
 * Global error handler for API routes.
 * Catches Zod validation errors, known app errors, and unknown errors.
 * Never exposes raw stack traces (GEMINI.md Rule 2.2).
 */
export function handleApiError(error: unknown) {
    if (error instanceof z.ZodError) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid input",
                    details: error.errors.map(e => ({ path: e.path.join("."), message: e.message })),
                },
            },
            { status: 400 }
        );
    }

    if (error instanceof Error) {
        // Known application errors (thrown from services)
        const isClientError = [
            "Unauthorized", "Insufficient credits", "already submitted",
            "Dealer profile not found", "Listing not found"
        ].some(msg => error.message.includes(msg));

        return apiError(error.message, isClientError ? 400 : 500);
    }

    // Unknown error — never expose internals
    return apiError("An unexpected error occurred", 500, "INTERNAL_ERROR");
}
