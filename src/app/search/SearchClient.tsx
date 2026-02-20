"use client";

import { useState, useRef, useEffect } from "react";
import { Filter, Map as MapIcon, List, Check, Search, X } from "lucide-react";
import ListingCard from "@/components/marketplace/ListingCard";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface SearchClientProps {
    initialListings: any[];
    searchParams?: { [key: string]: string | string[] | undefined };
    availableBrands?: string[];
    availableCities?: string[];
    isCityPage?: boolean;
    cityName?: string;
}

function AutocompleteFilter({
    label,
    options,
    paramKey,
    selectedValue,
    onSelect,
    placeholder,
}: {
    label: string;
    options: string[];
    paramKey: string;
    selectedValue?: string;
    onSelect: (key: string, value: string) => void;
    placeholder: string;
}) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const filteredOptions = options.filter((opt) =>
        opt.toLowerCase().includes(query.toLowerCase())
    );

    const handleSelect = (value: string) => {
        onSelect(paramKey, value);
        setQuery("");
        setIsOpen(false);
    };

    const handleClear = () => {
        onSelect(paramKey, ""); // Clear filter
        setQuery("");
    };

    return (
        <div ref={wrapperRef} className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</h3>

            {/* Selected Tag */}
            {selectedValue && (
                <div className="flex items-center gap-2 bg-brand-500/15 text-brand-400 px-3 py-1.5 rounded-lg text-sm font-medium border border-brand-500/20">
                    <span>{selectedValue}</span>
                    <button
                        onClick={handleClear}
                        className="hover:text-brand-300 transition-colors"
                        aria-label={`Clear ${label} filter`}
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all"
                />
            </div>

            {/* Dropdown Suggestions */}
            {isOpen && filteredOptions.length > 0 && (
                <div className="bg-slate-900 border border-white/10 rounded-lg max-h-48 overflow-y-auto shadow-xl shadow-black/30 animate-in fade-in-0 zoom-in-95 duration-150">
                    {filteredOptions.map((option) => (
                        <button
                            key={option}
                            onClick={() => handleSelect(option)}
                            className={cn(
                                "w-full text-left px-3 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center justify-between",
                                selectedValue === option
                                    ? "text-brand-400 bg-brand-500/5"
                                    : "text-slate-300"
                            )}
                        >
                            <span>{option}</span>
                            {selectedValue === option && (
                                <Check className="w-3.5 h-3.5 text-brand-400" />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {isOpen && query && filteredOptions.length === 0 && (
                <p className="text-xs text-slate-500 px-1">No matches found</p>
            )}
        </div>
    );
}

export default function SearchClient({
    initialListings,
    searchParams,
    availableBrands = [],
    availableCities = [],
    isCityPage = false,
    cityName = ""
}: SearchClientProps) {
    const [viewMode, setViewMode] = useState<"list" | "map">("list");
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const router = useRouter();

    const selectedBrand = (searchParams?.brand || searchParams?.make || "") as string;
    const selectedCity = (isCityPage ? cityName : (searchParams?.city || "")) as string;

    // Combine DB options with common defaults for richer suggestions
    const defaultBrands = ["Royal Enfield", "KTM", "Honda", "Yamaha", "Bajaj", "TVS", "Ather", "Ola Electric", "Hero", "Suzuki"];
    const defaultCities = ["Mumbai", "Delhi", "Bengaluru", "Pune", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow"];

    const allBrands = [...new Set([...availableBrands, ...defaultBrands])].sort();
    const allCities = [...new Set([...availableCities, ...defaultCities])].sort();

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(window.location.search);

        // If on a city page, we don't want to change the URL to /search unless it's a global search
        const targetPath = isCityPage ? window.location.pathname : "/search";

        if (!value || params.get(key) === value) {
            params.delete(key);
        } else {
            params.set(key, value);
        }

        router.push(`${targetPath}?${params.toString()}`);
    };

    const activeFilterCount = [selectedBrand, !isCityPage && selectedCity].filter(Boolean).length;

    const renderFilterSidebar = () => (
        <div className="space-y-8">
            {/* Brand Filter */}
            <AutocompleteFilter
                label="Brand"
                options={allBrands}
                paramKey="brand"
                selectedValue={selectedBrand}
                onSelect={handleFilterChange}
                placeholder="Search brand..."
            />

            {/* City Filter - Hide if already on city page */}
            {!isCityPage && (
                <AutocompleteFilter
                    label="City"
                    options={allCities}
                    paramKey="city"
                    selectedValue={selectedCity}
                    onSelect={handleFilterChange}
                    placeholder="Search city..."
                />
            )}

            {/* Clear All Filters */}
            {activeFilterCount > 0 && (
                <button
                    onClick={() => router.push(isCityPage ? window.location.pathname : "/search")}
                    className="w-full py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg transition-colors border border-red-500/10"
                >
                    Clear All Filters ({activeFilterCount})
                </button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen pb-20">
            {/* Search Header */}
            <div className={cn(
                "sticky top-16 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-4 mb-8",
                isCityPage && "relative top-0 bg-transparent border-none mb-4"
            )}>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">
                            {isCityPage ? `Top Picks in ${cityName}` : "Find Your Ride"}
                        </h2>
                        <p className="text-slate-400 text-sm">
                            Showing {initialListings.length} results
                            {selectedBrand && <span className="text-brand-400"> · {selectedBrand}</span>}
                            {!isCityPage && selectedCity && <span className="text-emerald-400"> · {selectedCity}</span>}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setShowMobileFilters((prev) => !prev)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors border border-white/5 md:hidden relative"
                        >
                            <Filter className="h-4 w-4" /> Filters
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        <div className="flex bg-slate-800 rounded-lg p-1 border border-white/5">
                            <button
                                onClick={() => setViewMode("list")}
                                aria-label="Switch to list view"
                                aria-pressed={viewMode === "list"}
                                className={cn(
                                    "p-2 rounded-md transition-all",
                                    viewMode === "list" ? "bg-slate-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                                )}
                            >
                                <List className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("map")}
                                aria-label="Switch to map view"
                                aria-pressed={viewMode === "map"}
                                className={cn(
                                    "p-2 rounded-md transition-all",
                                    viewMode === "map" ? "bg-slate-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                                )}
                            >
                                <MapIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl p-6 overflow-y-auto lg:hidden animate-in slide-in-from-bottom-10 duration-200">
                    <div className="flex items-center justify-between mb-8 sticky top-0 bg-slate-950/95 pb-4 border-b border-white/10 z-10 -mx-6 px-6 pt-2">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Filter className="h-5 w-5 text-brand-500" /> Filters
                        </h2>
                        <button
                            onClick={() => setShowMobileFilters(false)}
                            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                            <span className="sr-only">Close</span>
                            <Check className="h-5 w-5" />
                        </button>
                    </div>
                    {renderFilterSidebar()}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Desktop Sidebar Filters */}
                <div className="hidden lg:block lg:col-span-1 sticky top-36 h-fit bg-slate-900/20 p-6 rounded-2xl border border-white/5">
                    {renderFilterSidebar()}
                </div>

                {/* Results Grid */}
                <div className="lg:col-span-3">
                    {viewMode === "list" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {initialListings.length > 0 ? (
                                initialListings.map((listing) => (
                                    <ListingCard key={listing.id} listing={listing} />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 text-slate-500">
                                    No listings found. Try adjusting your filters.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-[600px] rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center relative overflow-hidden">
                            <p className="text-slate-500">Map View Coming Soon</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
