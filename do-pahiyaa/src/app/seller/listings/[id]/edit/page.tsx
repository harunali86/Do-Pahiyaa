export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EditListingForm } from "@/components/seller/EditListingForm";

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/seller/listings/${id}/edit`);
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id, title, make, model, year, price, kms_driven, city, description, seller_id")
    .eq("id", id)
    .maybeSingle();

  if (!listing || listing.seller_id !== user.id) {
    notFound();
  }

  return (
    <div className="min-h-screen py-8 max-w-4xl mx-auto space-y-6">
      <Link href="/seller/listings" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to My Listings
      </Link>

      <div className="glass-panel border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Listing</h1>
          <p className="text-slate-400">Update listing details for better conversion.</p>
        </div>
        <EditListingForm
          listing={{
            id: listing.id,
            title: listing.title || "",
            make: listing.make || "",
            model: listing.model || "",
            year: Number(listing.year || new Date().getFullYear()),
            price: Number(listing.price || 0),
            kms_driven: Number(listing.kms_driven || 0),
            city: listing.city || "",
            description: listing.description || "",
          }}
        />
      </div>
    </div>
  );
}
