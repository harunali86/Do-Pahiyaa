"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { updateListingAction } from "@/app/actions/listings";
import { toast } from "sonner";

type ListingShape = {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  kms_driven: number;
  city: string;
  description?: string | null;
};

export function EditListingForm({ listing }: { listing: ListingShape }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(listing.title || "");
  const [make, setMake] = useState(listing.make || "");
  const [model, setModel] = useState(listing.model || "");
  const [year, setYear] = useState(String(listing.year || new Date().getFullYear()));
  const [price, setPrice] = useState(String(listing.price || 0));
  const [kmsDriven, setKmsDriven] = useState(String(listing.kms_driven || 0));
  const [city, setCity] = useState(listing.city || "");
  const [description, setDescription] = useState(listing.description || "");

  const canSubmit = useMemo(() => {
    return (
      title.trim().length > 2 &&
      make.trim().length > 1 &&
      model.trim().length > 1 &&
      city.trim().length > 1 &&
      Number(price) > 0
    );
  }, [title, make, model, city, price]);

  const onSubmit = () => {
    if (!canSubmit) {
      toast.error("Please fill all required fields");
      return;
    }

    startTransition(async () => {
      const result = await updateListingAction(listing.id, {
        title: title.trim(),
        make: make.trim(),
        model: model.trim(),
        year: Number(year),
        price: Number(price),
        kms_driven: Number(kmsDriven),
        city: city.trim(),
        description: description.trim(),
      });

      if (!result.success) {
        toast.error(result.error || "Update failed");
        return;
      }

      toast.success("Listing updated");
      router.push("/seller/listings");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">City</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Brand</label>
          <input value={make} onChange={(e) => setMake(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Model</label>
          <input value={model} onChange={(e) => setModel(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Year</label>
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">KMs Driven</label>
          <input type="number" value={kmsDriven} onChange={(e) => setKmsDriven(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Expected Price</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-mono focus:outline-none focus:border-brand-500/50" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Description</label>
          <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50" />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSubmit}
          disabled={isPending || !canSubmit}
          className="bg-brand-600 hover:bg-brand-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
