import { createSupabaseServerClient } from "@/lib/supabase/server";

export class BlogService {
    /**
     * Get latest published blog posts.
     */
    static async getLatestPosts(limit = 10) {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("blog_posts")
            .select(`
                id, title, slug, excerpt, cover_image, published_at,
                author:profiles(full_name, avatar_url),
                category:blog_categories(name, slug)
            `)
            .eq("status", "published")
            .order("published_at", { ascending: false })
            .limit(limit);

        if (error) {
            console.error("Error fetching latest posts:", error);
            return [];
        }

        return data;
    }

    /**
     * Get a single post by slug.
     */
    static async getPostBySlug(slug: string) {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("blog_posts")
            .select(`
                *,
                author:profiles(full_name, avatar_url),
                category:blog_categories(name, slug),
                tags:blog_post_tags(tag:blog_tags(name, slug))
            `)
            .eq("slug", slug)
            .eq("status", "published")
            .single();

        if (error) {
            console.error(`Error fetching post by slug ${slug}:`, error);
            return null;
        }

        // Increment views (fire and forget)
        supabase.rpc("increment_post_views", { post_id: data.id });

        return data;
    }

    /**
     * Get all categories.
     */
    static async getCategories() {
        const supabase = await createSupabaseServerClient();
        const { data } = await supabase.from("blog_categories").select("*").order("name");
        return data || [];
    }

    /**
     * Search posts by query.
     */
    static async searchPosts(query: string) {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("blog_posts")
            .select(`
                id, title, slug, excerpt, cover_image, published_at,
                category:blog_categories(name, slug)
            `)
            .eq("status", "published")
            .ilike("title", `%${query}%`)
            .limit(10);

        if (error) return [];
        return data;
    }
}
