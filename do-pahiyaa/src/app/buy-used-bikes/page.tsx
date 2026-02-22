import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

const featuredCities = [
  "mumbai",
  "pune",
  "bangalore",
  "hyderabad",
  "delhi",
  "chennai",
  "ahmedabad",
  "kolkata",
];

export default function BuyUsedBikesIndexPage() {
  return (
    <div className="max-w-6xl mx-auto py-10 space-y-8">
      <section className="text-center">
        <h1 className="text-4xl font-black text-white mb-3">Buy Used Bikes by City</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Explore city-specific bike listings with verified sellers, transparent pricing, and lead unlock options.
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {featuredCities.map((city) => (
          <Link
            key={city}
            href={`/buy-used-bikes/${city}`}
            className="group bg-slate-900/50 border border-white/10 hover:border-brand-500/40 rounded-2xl p-5 transition-all"
          >
            <div className="flex items-center gap-2 text-brand-400 mb-3">
              <MapPin className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">City Market</span>
            </div>
            <h2 className="text-white text-xl font-bold capitalize">{city}</h2>
            <p className="text-sm text-slate-400 mt-2">Browse verified two-wheeler listings in {city}.</p>
            <div className="mt-4 inline-flex items-center gap-2 text-brand-400 text-sm font-semibold">
              View Listings <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
