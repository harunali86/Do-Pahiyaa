"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { defaultBlurDataURL, imageQuality, imageSizes } from "@/lib/image";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
    mainImage: string;
    title: string;
}

export default function ImageGallery({ mainImage, title }: ImageGalleryProps) {
    const staticAngleShots = [
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1531327431456-837da4b1d562?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1558981806-ec527fa84f3d?auto=format&fit=crop&w=1200&q=80"
    ];

    const images = [
        mainImage,
        ...staticAngleShots
    ];

    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-900 border border-white/10 group">
                <div key={activeIndex} className="relative h-full w-full">
                    <Image
                        src={images[activeIndex]}
                        alt={`${title} - View ${activeIndex + 1}`}
                        fill
                        priority={activeIndex === 0}
                        placeholder="blur"
                        blurDataURL={defaultBlurDataURL}
                        sizes={imageSizes.galleryMain}
                        quality={imageQuality.galleryMain}
                        className="h-full w-full object-cover"
                    />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <button
                    aria-label="View previous image"
                    onClick={() => setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>

                <button
                    aria-label="View next image"
                    onClick={() => setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={cn(
                            "relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition-all",
                            activeIndex === idx ? "border-brand-500 ring-2 ring-brand-500/20" : "border-transparent opacity-60 hover:opacity-100"
                        )}
                    >
                        <Image
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            fill
                            sizes={imageSizes.galleryThumb}
                            quality={imageQuality.galleryThumb}
                            placeholder="blur"
                            blurDataURL={defaultBlurDataURL}
                            className="h-full w-full object-cover"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
