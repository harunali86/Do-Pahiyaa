"use client";
export const dynamic = "force-dynamic";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";
import { createListingAction } from "@/app/actions/listings";
import { toast } from "sonner";
import {
    Camera,
    CheckCircle2,
    Loader2,
    X,
    ArrowLeft,
    ShieldCheck,
    FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { compressImage } from "@/lib/image-compression";

export default function NewInventoryPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        regNumber: '',
        brand: '',
        year: new Date().getFullYear().toString(),
        model: '',
        variant: '',
        kmDriven: '',
        owners: '1st Owner',
        price: '',
        city: '',
        insuranceValid: 'no',
        description: '',
        images: [] as string[]
    });

    const steps = [
        { id: 1, title: "Identity", icon: FileText },
        { id: 2, title: "Specs & History", icon: ShieldCheck },
        { id: 3, title: "Photos", icon: Camera },
        { id: 4, title: "Review", icon: CheckCircle2 }
    ];

    const supabase = createBrowserClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        const files = Array.from(e.target.files);

        try {
            const newImages: string[] = [];
            for (const file of files) {
                // 1. Optimize Image (Client-side Compression)
                const compressedFile = await compressImage(file, { maxWidth: 1920, maxSizeMB: 0.2 });

                const fileExt = "webp"; // Always WebP after compression
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `dealer-uploads/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('listings')
                    .upload(filePath, compressedFile); // Upload compressed file

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('listings')
                    .getPublicUrl(filePath);

                newImages.push(publicUrl);
            }
            setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
            toast.success("Photos uploaded!");
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error("Upload failed");
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
                title: `${formData.brand} ${formData.model} ${formData.variant}`.trim(),
                make: formData.brand,
                model: formData.model,
                year: Number(formData.year),
                kms_driven: Number(formData.kmDriven),
                price: Number(formData.price.replace(/,/g, '')),
                city: formData.city,
                description: formData.description || `Verified ${formData.year} ${formData.brand} ${formData.model} available in ${formData.city}.`,
                images: formData.images,
                specs: {
                    reg_number: formData.regNumber,
                    variant: formData.variant,
                    owners: formData.owners,
                    insurance_valid: formData.insuranceValid === 'yes',
                    source: 'manual', // Explicitly mark as manual entry
                    type: 'dealer_stock'
                }
            };

            const result = await createListingAction(payload);

            if (result.success) {
                toast.success("Inventory added successfully!");
                router.push('/dealer/inventory');
            } else {
                toast.error(result.error || "Failed to create listing");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        }
    };

    return (
        <div className="min-h-screen py-8 px-4 w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild className="text-slate-400 hover:text-white hover:bg-white/10">
                    <Link href="/dealer/inventory"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Add New Inventory</h1>
                    <p className="text-slate-400 text-sm">Enter comprehensive details for your stock</p>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 -z-10 rounded-full"></div>
                {steps.map((s) => {
                    const Icon = s.icon;
                    const isActive = step >= s.id;
                    const isCurrent = step === s.id;
                    return (
                        <div key={s.id} className="flex flex-col items-center gap-2 bg-slate-950 px-2 z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isActive ? 'bg-brand-600 border-brand-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'
                                } ${isCurrent ? 'ring-4 ring-brand-500/20' : ''}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-600'}`}>
                                {s.title}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 bg-slate-900/50">
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Registration Number</Label>
                                <Input
                                    name="regNumber"
                                    value={formData.regNumber}
                                    onChange={handleInputChange}
                                    placeholder="KA-01-AB-1234"
                                    className="bg-slate-800 border-white/10 uppercase"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Brand / Make</Label>
                                <Select value={formData.brand} onValueChange={(val) => handleSelectChange('brand', val)}>
                                    <SelectTrigger className="bg-slate-800 border-white/10">
                                        <SelectValue placeholder="Select Brand" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['Hero', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'Yamaha', 'Suzuki', 'KTM', 'Jawa'].map(b => (
                                            <SelectItem key={b} value={b}>{b}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Model Name</Label>
                                <Input
                                    name="model"
                                    value={formData.model}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Splendor Plus"
                                    className="bg-slate-800 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Variant (Optional)</Label>
                                <Input
                                    name="variant"
                                    value={formData.variant}
                                    onChange={handleInputChange}
                                    placeholder="e.g. i3s Drum Self"
                                    className="bg-slate-800 border-white/10"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Manufacturing Year</Label>
                                <Select value={formData.year} onValueChange={(val) => handleSelectChange('year', val)}>
                                    <SelectTrigger className="bg-slate-800 border-white/10">
                                        <SelectValue placeholder="Select Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Kilometers Driven</Label>
                                <Input
                                    name="kmDriven"
                                    type="number"
                                    value={formData.kmDriven}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 15000"
                                    className="bg-slate-800 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Owner Serial</Label>
                                <Select value={formData.owners} onValueChange={(val) => handleSelectChange('owners', val)}>
                                    <SelectTrigger className="bg-slate-800 border-white/10">
                                        <SelectValue placeholder="Select Owner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1st Owner">1st Owner</SelectItem>
                                        <SelectItem value="2nd Owner">2nd Owner</SelectItem>
                                        <SelectItem value="3rd Owner">3rd Owner</SelectItem>
                                        <SelectItem value="4+ Owners">4+ Owners</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Insurance Valid?</Label>
                                <Select value={formData.insuranceValid} onValueChange={(val) => handleSelectChange('insuranceValid', val)}>
                                    <SelectTrigger className="bg-slate-800 border-white/10">
                                        <SelectValue placeholder="Inusrance Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">Yes, Active</SelectItem>
                                        <SelectItem value="no">Expired / No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>City</Label>
                                <Input
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Pune"
                                    className="bg-slate-800 border-white/10"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Asking Price (₹)</Label>
                                <Input
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 65000"
                                    className="bg-slate-800 border-white/10 text-lg font-bold text-brand-400"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 bg-slate-950/30 text-center hover:border-brand-500/30 transition-colors">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                            <Button
                                type="button"
                                onClick={() => !uploading && fileInputRef.current?.click()}
                                disabled={uploading}
                                variant="outline"
                                className="h-auto py-8 px-8 flex flex-col gap-2 border-none hover:bg-transparent"
                            >
                                {uploading ? (
                                    <Loader2 className="h-10 w-10 text-brand-500 animate-spin" />
                                ) : (
                                    <Camera className="h-10 w-10 text-slate-500" />
                                )}
                                <span className="text-lg font-bold text-white">Click to Upload Photos</span>
                                <span className="text-slate-500 font-normal">Supports JPG, PNG (Max 5MB)</span>
                            </Button>
                        </div>

                        {formData.images.length > 0 && (
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                                {formData.images.map((img, i) => (
                                    <div key={i} className="aspect-square relative group rounded-lg overflow-hidden border border-white/10">
                                        <img src={img} alt="" className="w-full h-full object-cover" />
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
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6">
                        <div className="flex gap-6 items-start p-4 bg-slate-950 rounded-xl border border-white/5">
                            <div className="w-32 h-24 bg-slate-800 rounded-lg overflow-hidden shrink-0">
                                {formData.images[0] ? (
                                    <img src={formData.images[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-white">{formData.brand} {formData.model}</h3>
                                <p className="text-sm text-slate-400">{formData.variant}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded text-xs font-bold uppercase">{formData.owners}</span>
                                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs">{formData.year}</span>
                                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs">{formData.kmDriven} km</span>
                                </div>
                                <h2 className="text-2xl font-bold text-brand-400 mt-2">₹{Number(formData.price).toLocaleString('en-IN')}</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-slate-800/50 rounded-lg">
                                <span className="text-slate-500 block text-xs uppercase">Registration</span>
                                <span className="text-white font-medium">{formData.regNumber || 'N/A'}</span>
                            </div>
                            <div className="p-3 bg-slate-800/50 rounded-lg">
                                <span className="text-slate-500 block text-xs uppercase">Insurance</span>
                                <span className="text-white font-medium">{formData.insuranceValid === 'yes' ? 'Valid' : 'Expired'}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Add any specific details about condition, accessories etc."
                                className="bg-slate-800 border-white/10"
                            />
                        </div>
                    </div>
                )}

                <div className="flex justify-between pt-8 mt-8 border-t border-white/5">
                    <Button
                        variant="ghost"
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        disabled={step === 1}
                        className="text-slate-400 hover:text-white"
                    >
                        Back
                    </Button>
                    <Button
                        onClick={() => {
                            if (step === 4) handleSubmit();
                            else {
                                // Basic validation
                                if (step === 1 && (!formData.brand || !formData.model)) {
                                    toast.error("Please enter Brand and Model");
                                    return;
                                }
                                setStep(s => Math.min(4, s + 1));
                            }
                        }}
                        className="bg-brand-600 hover:bg-brand-500 min-w-[120px]"
                    >
                        {step === 4 ? "Add to Inventory" : "Next Step"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
