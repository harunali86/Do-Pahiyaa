import { ListingService } from "@/lib/services/listing.service";
import SearchClient from "../../search/SearchClient";
import { Metadata } from "next";
import { MapPin, Trophy, ShieldCheck } from "lucide-react";

interface Props {
    params: { city: string };
}

// 1. Dynamic Metadata for GEO-SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const city = decodeURIComponent(params.city);
    const cityName = city.charAt(0).toUpperCase() + city.slice(1);

    return {
        title: `Used Bikes for Sale in ${cityName} | Verified Pre-owned Superbikes`,
        description: `Explore the best collection of verified pre-owned superbikes in ${cityName}. 100+ checks, transparent pricing, and instant transfers at Do-Pahiyaa.`,
        alternates: {
            canonical: `https://dopahiyaa.com/buy-used-bikes/${params.city}`,
        },
        openGraph: {
            title: `Buy Second Hand Bikes in ${cityName} | Do-Pahiyaa`,
            description: `Get the best deals on premium used bikes in ${cityName}. Verified sellers and certified bikes.`,
            url: `https://dopahiyaa.com/buy-used-bikes/${params.city}`,
        }
    };
}

export default async function CityLandingPage({ params }: Props) {
    const city = decodeURIComponent(params.city);
    const cityName = city.charAt(0).toUpperCase() + city.slice(1);

    // Fetch listings for this city
    const [listingsResult, filterOptions] = await Promise.all([
        ListingService.getListings({ city }).catch(() => ({ listings: [], metadata: { total: 0, page: 1, totalPages: 0 } })),
        ListingService.getFilterOptions().catch(() => ({ makes: [], cities: [] })),
    ]);

    // Normalize for SearchClient
    const listings = listingsResult.listings.map((l: any) => ({
        ...l,
        imageUrl: l.images?.[0] || "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
        kms: l.kms_driven,
        ownerType: l.is_company_listing ? 'Certified' : 'Individual',
        postedBy: l.seller?.full_name || "Verified Seller",
        rating: 4.8
    }));

    // 2. CollectionPage & Breadcrumb JSON-LD (Max SEO/AEO)
    const jsonLd: any = [
        {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": `Used Bikes for Sale in ${cityName}`,
            "description": `Browse premium second hand motorcycles available in ${cityName}.`,
            "mainEntity": {
                "@type": "ItemList",
                "itemListElement": listings.slice(0, 10).map((l, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "url": `https://dopahiyaa.com/listings/${l.id}`,
                    "name": l.title
                }))
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dopahiyaa.com" },
                { "@type": "ListItem", "position": 2, "name": "Buy Used Bikes", "item": "https://dopahiyaa.com/buy-used-bikes" },
                { "@type": "ListItem", "position": 3, "name": cityName, "item": `https://dopahiyaa.com/buy-used-bikes/${params.city}` }
            ]
        }
    ];

    return (
        <main className="min-h-screen bg-slate-950">
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* City Hero */}
            <div className="relative pt-32 pb-16 px-4 border-b border-white/5 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="max-w-7xl mx-auto relative">
                    <div className="flex items-center gap-3 text-brand-500 font-bold text-sm uppercase tracking-widest mb-4">
                        <MapPin className="w-4 h-4" />
                        <span>Featured Market: {cityName}</span>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-6 uppercase">
                        Used Bikes in <span className="text-brand-500">{cityName}</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed">
                        Discover premium, certified pre-owned superbikes in {cityName}.
                        Rigorous 100-point inspection and instant ownership transfer guaranteed.
                    </p>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap gap-8 mt-12">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-brand-500" />
                            <div className="text-xs">
                                <span className="text-white font-bold block">100% Verified</span>
                                <span className="text-slate-500 uppercase tracking-tighter">Physical Inspection</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Trophy className="w-6 h-6 text-brand-500" />
                            <div className="text-xs">
                                <span className="text-white font-bold block">Best Price</span>
                                <span className="text-slate-500 uppercase tracking-tighter">In {cityName} Market</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Interface */}
            <div className="py-12">
                <SearchClient
                    initialListings={listings}
                    searchParams={{ city }}
                    availableBrands={filterOptions.makes as string[]}
                    availableCities={filterOptions.cities as string[]}
                    isCityPage={true}
                    cityName={cityName}
                />
            </div>

            {/* Local Footer Content for SEO */}
            <div className="max-w-7xl mx-auto px-4 pb-24 border-t border-white/5 pt-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-sm">
                    <div>
                        <h3 className="text-white font-bold mb-4 uppercase tracking-widest text-xs opacity-50">Why buy in {cityName}?</h3>
                        <p className="text-slate-400 leading-relaxed">
                            {cityName} has one of the fastest growing superbike communities in India.
                            Buying locally through Do-Pahiyaa ensures you can physically inspect the bike
                            at our partner dealer points across the city.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-4 uppercase tracking-widest text-xs opacity-50">Popular Brands in {cityName}</h3>
                        <p className="text-slate-400 leading-relaxed">
                            Our data shows that Kawasaki, Triumph, and Harley Davidson are the most sought-after
                            brands for pre-owned superbikes in {cityName}.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-4 uppercase tracking-widest text-xs opacity-50">Transfer Process</h3>
                        <p className="text-slate-400 leading-relaxed">
                            We handle all RTO documentation for {cityName} registrations, ensuring a
                            hassle-free ownership transfer for both buyers and sellers.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
