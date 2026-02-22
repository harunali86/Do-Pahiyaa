import Link from "next/link";
import Image from "next/image";
import { BlogService } from "@/lib/services/blog.service";
import { Calendar, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export const metadata = {
    title: "Bike Reviews, Tips & News | Do-Pahiyaa Blog",
    description: "Read the latest updates on used bikes, maintenance tips, and industry news from the Do-Pahiyaa team.",
};

export default async function BlogPage() {
    const posts = await BlogService.getLatestPosts(20);

    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-brand-900/20 to-slate-950 py-20 px-4">
                <div className="max-w-7xl mx-auto text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                        Do-Pahiyaa <span className="text-brand-400">Insights</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Expert advice on buying used bikes, maintenance guides, and market trends.
                    </p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-4">
                {posts.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
                        <h3 className="text-xl text-slate-300 font-semibold">No posts found</h3>
                        <p className="text-slate-500 mt-2">Check back later for updates!</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post: any) => (
                            <Link
                                key={post.id}
                                href={`/blog/${post.slug}`}
                                className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-brand-500/50 transition-all hover:shadow-2xl hover:shadow-brand-500/10 flex flex-col"
                            >
                                {/* Image */}
                                <div className="aspect-video relative bg-slate-800 overflow-hidden">
                                    <Image
                                        src={post.cover_image || "/images/blog-placeholder.jpg"}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {post.category && (
                                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-brand-300 border border-white/10">
                                            {post.category.name}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {post.published_at ? format(new Date(post.published_at), 'MMM d, yyyy') : 'Draft'}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {post.author?.full_name || "Team"}
                                        </div>
                                    </div>

                                    <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-brand-400 transition-colors">
                                        {post.title}
                                    </h2>

                                    <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center text-brand-400 text-sm font-medium group-hover:gap-2 transition-all">
                                        Read Article <ArrowRight className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
