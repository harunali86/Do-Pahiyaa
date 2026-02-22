import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote/rsc";
import Image from "next/image";
import Link from "next/link";
import { Bike, CheckCircle, Info } from "lucide-react";

const components = {
    // Custom Wrapper for Bike Listing Embeds
    BikeListing: ({ id, title, price, image }: { id: string, title: string, price: string, image: string }) => (
        <Link
            href={`/listings/${id}`}
            className="block my-8 p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-brand-500/50 transition-all group shadow-xl"
        >
            <div className="flex gap-4 items-center">
                <div className="w-24 h-24 relative rounded-xl overflow-hidden shrink-0">
                    <Image src={image} alt={title} fill className="object-cover" />
                </div>
                <div className="flex-1">
                    <h4 className="text-white font-bold group-hover:text-brand-400 transition-colors uppercase tracking-tight">
                        {title}
                    </h4>
                    <p className="text-brand-400 font-mono text-lg font-black">₹{price}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <Bike className="w-3 h-3" />
                        <span>Featured Listing</span>
                    </div>
                </div>
            </div>
        </Link>
    ),
    // Callouts
    Callout: ({ type = "info", children }: { type?: "info" | "warning" | "success", children: React.ReactNode }) => {
        const styles = {
            info: "bg-blue-900/10 border-blue-500/30 text-blue-300",
            warning: "bg-amber-900/10 border-amber-500/30 text-amber-300",
            success: "bg-emerald-900/10 border-emerald-500/30 text-emerald-300",
        };
        const icons = {
            info: <Info className="w-5 h-5 shrink-0" />,
            warning: <Info className="w-5 h-5 shrink-0" />,
            success: <CheckCircle className="w-5 h-5 shrink-0" />,
        };
        return (
            <div className={`flex gap-3 p-4 my-6 border rounded-xl ${styles[type]}`}>
                {icons[type]}
                <div className="text-sm font-medium leading-relaxed">{children}</div>
            </div>
        );
    },
    // Enhanced Image
    img: (props: any) => (
        <div className="my-10 relative">
            <img {...props} className="rounded-2xl border border-slate-800 shadow-2xl w-full" />
            <span className="text-xs text-slate-500 block mt-3 text-center italic">{props.alt}</span>
        </div>
    ),
    // Standard Overrides
    h2: (props: any) => <h2 {...props} className="text-2xl font-bold text-white mt-12 mb-6" />,
    h3: (props: any) => <h3 {...props} className="text-xl font-bold text-white mt-8 mb-4" />,
    p: (props: any) => <p {...props} className="text-slate-400 leading-8 mb-6 text-[17px]" />,
    ul: (props: any) => <ul {...props} className="list-disc list-inside space-y-3 mb-8 text-slate-400 ml-4" />,
    li: (props: any) => <li {...props} className="leading-7" />,
};

interface MdxContentProps {
    source: string;
}

export function MdxContent({ source }: MdxContentProps) {
    return (
        <div className="blog-content">
            <MDXRemote source={source} components={components} />
        </div>
    );
}
