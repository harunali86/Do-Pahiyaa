"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";
import { createListingAction } from "@/app/actions/listings";
import { toast } from "sonner";
import {
    Camera,
    ChevronRight,
    MapPin,
    Info,
    CheckCircle2,
    Bike,
    Loader2,
    X
} from "lucide-react";
import { compressImage } from "@/lib/image-compression";

export default function NewListingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        regNumber: '',
        brand: '',
        year: new Date().getFullYear(),
        model: '',
        kmDriven: '',
        owners: '1st Owner',
        price: '',
        city: '',
        images: [] as string[]
    });

    const steps = [
        { id: 1, title: "Basics" },
        { id: 2, title: "Specs" },
        { id: 3, title: "Photos" },
        { id: 4, title: "Review" }
    ];

    const supabase = createBrowserClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        const files = Array.from(e.target.files);

        try {
            const newImages: string[] = [];
            for (const file of files) {
                // Optimize Image (Client-side Compression)
                const compressedFile = await compressImage(file, { maxWidth: 1920, maxSizeMB: 0.2 });

                const fileExt = "webp"; // Always WebP
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `user-uploads/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('listings') // Ensure this bucket exists and is public
                    .upload(filePath, compressedFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('listings')
                    .getPublicUrl(filePath);

                newImages.push(publicUrl);
            }
            setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
            toast.success("Photos uploaded successfully!");
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error("Failed to upload photos. Please try again.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                title: formData.model || `${formData.brand} ${formData.year}`, // Fallback title
                make: formData.brand,
                model: formData.model,
                year: Number(formData.year),
                kms_driven: Number(formData.kmDriven),
                price: Number(formData.price.replace(/,/g, '')), // Basic cleanup
                city: formData.city,
                images: formData.images,
                // Add missing validations/fields as per schema if strictly needed, 
                // but schema allows loose strings for most.
            };

            const result = await createListingAction(payload);
            if (result.success) {
                toast.success("Listing created successfully!");
                router.push('/seller/dashboard'); // Redirect
            } else {
                toast.error(result.error || "Failed to create listing");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        }
    };

    return (
        <div className="min-h-screen py-10 max-w-3xl mx-auto px-4">

            {/* Stepper Header */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    {steps.map(s => (
                        <div key={s.id} className="flex flex-col items-center gap-2 relative z-10 w-full">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${step >= s.id ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-500'
                                }`}>
                                {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= s.id ? 'text-white' : 'text-slate-600'
                                }`}>{s.title}</span>
                            {s.id !== 4 && (
                                <div className={`absolute top-4 left-[50%] w-full h-0.5 -z-10 ${step > s.id ? 'bg-brand-500' : 'bg-slate-800'}`}></div>
                            )}
                        </div>
                    ))}
                </div>
                <h1 className="text-2xl font-bold text-white text-center">Sell Your Superbike</h1>
                <p className="text-slate-400 text-center text-sm">Reach 10,000+ verified buyers in minutes.</p>
            </div>

            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-sm">

                {step === 1 && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300">Registration Number</label>
                            <input name="regNumber" value={formData.regNumber} onChange={handleInputChange} type="text" placeholder="KA-01-EQ-1234" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300">Brand</label>
                                <select name="brand" value={formData.brand} onChange={handleInputChange} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50 appearance-none">
                                    <option value="">Select Brand</option>
                                    <option value="Royal Enfield">Royal Enfield</option>
                                    <option value="KTM">KTM</option>
                                    <option value="Triumph">Triumph</option>
                                    <option value="Kawasaki">Kawasaki</option>
                                    <option value="Harley Davidson">Harley Davidson</option>
                                    <option value="Ducati">Ducati</option>
                                    <option value="BMW">BMW</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300">Year</label>
                                <select name="year" value={formData.year} onChange={handleInputChange} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50 appearance-none">
                                    {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300">Model Name</label>
                            <input name="model" value={formData.model} onChange={handleInputChange} type="text" placeholder="e.g. Continental GT 650 Chrome" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50" />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300">Kilometers Driven</label>
                                <input name="kmDriven" value={formData.kmDriven} onChange={handleInputChange} type="number" placeholder="e.g. 5000" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300">No. of Owners</label>
                                <select name="owners" value={formData.owners} onChange={handleInputChange} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50">
                                    <option value="1st Owner">1st Owner</option>
                                    <option value="2nd Owner">2nd Owner</option>
                                    <option value="3rd Owner">3rd Owner</option>
                                    <option value="4+ Owners">4+ Owners</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300">Expected Price (₹)</label>
                            <input name="price" value={formData.price} onChange={handleInputChange} type="number" placeholder="e.g. 350000" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-mono focus:outline-none focus:border-brand-500/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                <input name="city" value={formData.city} onChange={handleInputChange} type="text" placeholder="Enter City/Area" className="w-full bg-slate-950 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-brand-500/50" />
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 text-center py-4">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                        <div
                            onClick={() => !uploading && fileInputRef.current?.click()}
                            className={`border-2 border-dashed border-white/10 rounded-2xl p-10 bg-slate-950/30 hover:bg-slate-950/60 hover:border-brand-500/30 transition-all cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {uploading ? (
                                <Loader2 className="w-12 h-12 text-brand-500 mx-auto mb-4 animate-spin" />
                            ) : (
                                <Camera className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                            )}
                            <h3 className="text-white font-bold text-lg">{uploading ? "Uploading..." : "Click to Upload Photos"}</h3>
                            <p className="text-slate-400 text-sm mt-2">Upload up to 10 high-quality images. <br />Jpg, Png supported.</p>
                        </div>

                        {formData.images.length > 0 && (
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-4">
                                {formData.images.map((img, i) => (
                                    <div key={i} className="aspect-square bg-slate-900 rounded-lg border border-white/5 relative group bg-cover bg-center" style={{ backgroundImage: `url(${img})` }}>
                                        <button
                                            onClick={() => removeImage(i)}
                                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {formData.images.length === 0 && (
                            <div className="grid grid-cols-4 gap-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="aspect-square bg-slate-900 rounded-lg border border-white/5 opacity-50" />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6">
                        <div className="bg-slate-950 rounded-xl p-4 border border-white/5 flex gap-4">
                            <div className="w-24 h-24 bg-slate-800 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${formData.images[0] || ''})` }}></div>
                            <div>
                                <h3 className="font-bold text-white text-lg">{formData.brand} {formData.model}</h3>
                                <p className="text-brand-400 font-bold">₹{Number(formData.price).toLocaleString('en-IN')}</p>
                                <p className="text-xs text-slate-500 mt-2">{formData.city} • {formData.year} • {formData.kmDriven}km</p>
                            </div>
                        </div>
                        <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 flex gap-3 text-brand-300 text-sm">
                            <Info className="w-5 h-5 shrink-0" />
                            <p>Your listing will be reviewed by our team within 2 hours. Once approved, it will be visible to all buyers.</p>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-8 mt-8 border-t border-white/5">
                    <button
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        className={`px-6 py-2 rounded-lg font-medium text-slate-400 hover:text-white transition-colors ${step === 1 ? 'invisible' : ''}`}
                    >
                        Back
                    </button>
                    <button
                        onClick={() => {
                            if (step === 4) handleSubmit();
                            else {
                                // Basic validation before next
                                if (step === 1 && (!formData.brand || !formData.model)) {
                                    toast.error("Please fill brand and model");
                                    return;
                                }
                                if (step === 3 && formData.images.length === 0) {
                                    // Optional: Validation for images
                                    // toast.warning("It's better to add at least one photo!");
                                }
                                setStep(s => Math.min(4, s + 1));
                            }
                        }}
                        disabled={uploading}
                        className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {step === 4 ? "Publish Listing" : "Continue"}
                    </button>
                </div>

            </div>
        </div>
    );
}
