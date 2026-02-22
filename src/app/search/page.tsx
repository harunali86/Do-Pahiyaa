import { ListingService } from "@/lib/services/listing.service";
import SearchClient from "./SearchClient";

interface SearchPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams;

    // Extract filters
    const filters: any = {};
    if (params.city) filters.city = params.city as string;
    if (params.brand) filters.make = params.brand as string;
    if (params.make) filters.make = params.make as string;
    if (params.query) filters.query = params.query as string;
    if (params.minPrice) filters.minPrice = Number(params.minPrice);
    if (params.maxPrice) filters.maxPrice = Number(params.maxPrice);

    // Fetch Listings + Filter Options in parallel
    const [listingsResult, filterOptions] = await Promise.all([
        ListingService.getListings(filters).catch(() => ({ listings: [], metadata: { total: 0, page: 1, totalPages: 0 } })),
        ListingService.getFilterOptions().catch(() => ({ makes: [], cities: [] })),
    ]);

    // Normalize
    const listings = listingsResult.listings.map((l: any) => ({
        ...l,
        seller: Array.isArray(l.seller) ? l.seller[0] ?? null : l.seller,
        imageUrl: l.images?.[0] || "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
        kms: l.kms_driven,
        ownerType: l.seller?.role === 'dealer' ? 'Dealer' : 'Individual',
        specs: l.specs || {},
        condition: "Good",
        postedBy: l.seller?.full_name || "Seller",
        rating: 4.8
    }));

    return (
        <SearchClient
            initialListings={listings}
            searchParams={params}
            availableBrands={filterOptions.makes as string[]}
            availableCities={filterOptions.cities as string[]}
        />
    );
}
