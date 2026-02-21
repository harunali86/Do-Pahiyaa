import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dopahiyaa.com";

type ListingRow = {
    id: string;
    updated_at: string;
};

type BlogPostRow = {
    slug: string;
    updated_at: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
        { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
        { url: `${baseUrl}/sell`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
        { url: `${baseUrl}/auctions`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
        { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
        { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return staticRoutes;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    const [{ data: listings }, { data: posts }] = await Promise.all([
        supabase
            .from("listings")
            .select("id, updated_at")
            .eq("status", "published")
            .limit(5000),
        supabase
            .from("blog_posts")
            .select("slug, updated_at")
            .eq("status", "published"),
    ]);

    const listingRoutes = ((listings || []) as ListingRow[]).map((listing) => ({
        url: `${baseUrl}/listings/${listing.id}`,
        lastModified: new Date(listing.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }));

    const blogRoutes = ((posts || []) as BlogPostRow[]).map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.6,
    }));

    const cities = [
        "mumbai", "delhi", "bangalore", "hyderabad", "chennai",
        "kolkata", "pune", "ahmedabad", "jaipur", "lucknow",
        "surat", "kanpur", "nagpur", "indore", "thane",
        "bhopal", "patna", "vadodara", "ghaziabad", "ludhiana",
    ];

    const cityRoutes = cities.map((city) => ({
        url: `${baseUrl}/buy-used-bikes/${city}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.8,
    }));

    return [...staticRoutes, ...listingRoutes, ...blogRoutes, ...cityRoutes];
}
