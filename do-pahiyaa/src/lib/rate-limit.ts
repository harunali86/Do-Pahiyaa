import { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client
// Note: Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your .env
const redis = Redis.fromEnv();

// Create multiple ratelimiters based on the GEMINI.md Constitution Rule 5.1
export const RateLimiters = {
    // Public: 60 req/min
    public: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        analytics: true,
    }),
    // Authenticated: 100 req/min
    auth: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "1 m"),
        analytics: true,
    }),
    // Purchases / Unlocks: 60 req/min (Business Exception to Global Rule 5.1)
    purchase: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        analytics: true,
    }),
};

export async function rateLimit(
    request: NextRequest,
    type: 'public' | 'auth' | 'purchase' = 'public'
) {
    try {
        // Identify user by IP (from headers, as request.ip is edge-only)
        let ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
        // Clean up multiple IPs if proxied
        ip = ip.split(",")[0].trim();

        const identifier = `${type}:${ip}`;

        // Fallback to in-memory if Redis is not configured properly yet
        if (!process.env.UPSTASH_REDIS_REST_URL) {
            console.warn("⚠️ Upstash Redis not configured. Using fallback local limiter.");
            return { success: true };
        }

        const limiter = RateLimiters[type];
        const { success, limit, remaining, reset } = await limiter.limit(identifier);

        return { success, limit, remaining, reset, degraded: false };
    } catch (error: any) {
        console.error("Rate Limiter Failed, allowing traffic (degraded mode):", error);
        // Fail open in case of Redis outage
        return { success: true, degraded: true, reason: error.message };
    }
}
