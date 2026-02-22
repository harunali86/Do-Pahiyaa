import { NextRequest } from "next/server";

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 Minute
const MAX_REQUESTS = {
    PUBLIC: 60,
    AUTH: 100,
    API: 120
};

// Simple in-memory store for demo/MVP (Note: In Vercel Edge, this state isn't shared across regions/invocations perfectly, but sufficient for basic flood protection per instance)
// For robust distributed rate limiting on free tier, we'd use Upstash Redis (Free Tier) or Supabase Table.
// Let's us Supabase Edge Function logic or just simple IP tracking here if we want zero external dep complexity.
// Actually, for "Industry Grade" on Supabase, we can just use a simple robust map if we accept node instance reset.
// Let's stick to a robust simple implementation.

const ipRequests = new Map<string, { count: number; startTime: number }>();

async function distributedRateLimit(
    supabase: any,
    key: string,
    type: 'PUBLIC' | 'AUTH' | 'API'
) {
    const limit = MAX_REQUESTS[type];
    const windowSeconds = Math.floor(RATE_LIMIT_WINDOW / 1000);

    const { data, error } = await supabase.rpc("check_rate_limit", {
        p_key: key,
        p_limit: limit,
        p_window_seconds: windowSeconds,
    });

    if (error) {
        return { success: true, degraded: true, reason: error.message };
    }

    const result = (data || {}) as { success?: boolean; limit?: number; remaining?: number; reset?: string };
    return {
        success: Boolean(result.success),
        limit: result.limit ?? limit,
        remaining: result.remaining ?? 0,
        reset: result.reset ?? null,
        degraded: false,
    };
}

export async function rateLimit(
    request: NextRequest,
    type: 'PUBLIC' | 'AUTH' | 'API' = 'PUBLIC',
    options?: { distributed?: boolean; supabase?: any }
) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const key = `${type}:${ip}`;

    if (options?.distributed && options.supabase) {
        return distributedRateLimit(options.supabase, key, type);
    }

    const now = Date.now();
    const limit = MAX_REQUESTS[type];

    // Clean up old entries periodically (simple garbage collection)
    if (Math.random() < 0.01) { // 1% chance to clean up
        for (const [key, data] of ipRequests.entries()) {
            if (now - data.startTime > RATE_LIMIT_WINDOW) {
                ipRequests.delete(key);
            }
        }
    }

    const record = ipRequests.get(key);

    if (!record) {
        ipRequests.set(key, { count: 1, startTime: now });
        return { success: true };
    }

    if (now - record.startTime > RATE_LIMIT_WINDOW) {
        // Reset window
        ipRequests.set(key, { count: 1, startTime: now });
        return { success: true };
    }

    if (record.count >= limit) {
        return { success: false, limit, remaining: 0, reset: record.startTime + RATE_LIMIT_WINDOW };
    }

    record.count += 1;
    return { success: true, limit, remaining: limit - record.count, reset: record.startTime + RATE_LIMIT_WINDOW };
}
