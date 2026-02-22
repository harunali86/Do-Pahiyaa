import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogService } from "@/lib/services/blog.service";
import { format } from "date-fns";
import { MdxContent } from "@/components/blog/MdxContent";
import { ArrowLeft, Calendar, User, Tag, Share2 } from "lucide-react";

interface Props {
    params: { slug: string };
}

// 1. Dynamic Metadata (Max SEO)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = await BlogService.getPostBySlug(params.slug);
    if (!post) return {};

    const baseUrl = "https://dopahiyaa.com"; // Replace with config

    return {
        title: post.meta_title || `${post.title} | Do-Pahiyaa Insights`,
        description: post.meta_description || post.excerpt,
        alternates: {
            canonical: `${baseUrl}/blog/${post.slug}`,
        },
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: [post.cover_image || "/images/blog-og-default.jpg"],
            url: `${baseUrl}/blog/${post.slug}`,
            type: "article",
            publishedTime: post.published_at,
            authors: [post.author?.full_name || "Do-Pahiyaa Team"],
            siteName: "Do-Pahiyaa",
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt,
            images: [post.cover_image || "/images/blog-og-default.jpg"],
        }
    };
}

export default async function BlogPostPage({ params }: Props) {
    const post = await BlogService.getPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    // 2. AEO-Focused JSON-LD (Answer Engine Optimization)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        image: post.cover_image ? [post.cover_image] : [],
        datePublished: post.published_at,
        dateModified: post.updated_at,
        author: [{
            "@type": "Person",
            name: post.author?.full_name || "Do-Pahiyaa Team",
            url: "https://dopahiyaa.com"
        }],
        publisher: {
            "@type": "Organization",
            name: "Do-Pahiyaa",
            logo: {
                "@type": "ImageObject",
                url: "https://dopahiyaa.com/logo.png"
            }
        },
        description: post.excerpt,
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://dopahiyaa.com/blog/${post.slug}`
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Header / Hero Section */}
            <div className="relative w-full h-[50vh] min-h-[400px]">
                {post.cover_image ? (
                    <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        className="object-cover brightness-[0.4]"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-slate-900" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end pb-12">
                    <div className="max-w-4xl mx-auto px-4 w-full">
                        <Link href="/blog" className="inline-flex items-center text-slate-400 hover:text-white transition-colors gap-2 text-sm font-bold mb-8 group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Insights
                        </Link>

                        {post.category && (
                            <div className="inline-block bg-brand-500 text-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-6">
                                {post.category.name}
                            </div>
                        )}

                        <h1 className="text-3xl md:text-6xl font-black text-white leading-tight tracking-tighter mb-8">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-brand-500 overflow-hidden relative">
                                    {post.author?.avatar_url ? (
                                        <Image src={post.author.avatar_url} alt={post.author.full_name} fill className="object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-bold leading-none mb-1">{post.author?.full_name || "Team"}</span>
                                    <span className="text-slate-500 text-xs">Principal Author</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 border-l border-slate-800 pl-6 py-2">
                                <Calendar className="w-4 h-4 text-brand-500" />
                                <span className="font-bold">{format(new Date(post.published_at || new Date()), 'MMM d, yyyy')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Post Content */}
            <article className="max-w-4xl mx-auto px-4 mt-16">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        <MdxContent source={typeof post.content === 'string' ? post.content : JSON.stringify(post.content)} />

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-16 pt-8 border-t border-slate-900 flex flex-wrap gap-2">
                                {post.tags.map((t: any) => (
                                    <span key={t.tag.slug} className="bg-slate-900/50 text-slate-500 px-4 py-2 rounded-xl text-sm font-bold border border-slate-800/50 hover:text-brand-400 transition-colors cursor-pointer">
                                        #{t.tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Social Share */}
                    <aside className="w-full lg:w-48 shrink-0">
                        <div className="sticky top-24 space-y-8">
                            <div className="space-y-4">
                                <h4 className="text-white font-bold text-sm uppercase tracking-widest text-slate-500">Share</h4>
                                <div className="flex lg:flex-col gap-3">
                                    <button className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-500/50 transition-all">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </article>
        </div>
    );
}
