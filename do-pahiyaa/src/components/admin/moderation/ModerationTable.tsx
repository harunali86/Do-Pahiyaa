"use client";

import { useState } from "react";
import { Search, Check, X, Eye, User, Bike, MapPin, IndianRupee, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { moderateListingAction } from "@/app/actions/admin";
import { toast } from "sonner";
import Image from "next/image";

interface ModerationTableProps {
    listings: any[];
}

export function ModerationTable({ listings: initialListings }: ModerationTableProps) {
    const [listings, setListings] = useState(initialListings || []);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [makeFilter, setMakeFilter] = useState("all");
    const [cityFilter, setCityFilter] = useState("all");

    // Get unique makes and cities for filters
    const uniqueMakes = Array.from(new Set((initialListings || []).map(l => l.make).filter(Boolean))).sort();
    const uniqueCities = Array.from(new Set((initialListings || []).map(l => l.city).filter(Boolean))).sort();

    const handleModerate = async (listingId: string, status: "published" | "rejected") => {
        setLoadingId(listingId);
        try {
            const result = await moderateListingAction(listingId, status);
            if (result.success) {
                toast.success(`Listing ${status === "published" ? "approved" : "rejected"} successfully.`);
                setListings(prev => prev.map(l => l.id === listingId ? { ...l, status } : l));
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setLoadingId(null);
        }
    };

    const filteredListings = (listings || []).filter(listing => {
        const matchesSearch =
            (listing.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (listing.seller?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (listing.id || "").includes(searchTerm);

        if (!matchesSearch) return false;

        if (statusFilter !== "all" && listing.status !== statusFilter) return false;
        if (makeFilter !== "all" && listing.make !== makeFilter) return false;
        if (cityFilter !== "all" && listing.city !== cityFilter) return false;

        return true;
    });

    return (
        <div className="space-y-6">
            <div className="glass-panel border border-white/5 overflow-hidden p-6">
                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px] bg-slate-900 border-white/10 text-white">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="published">Live</SelectItem>
                                <SelectItem value="draft">Review</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={makeFilter} onValueChange={setMakeFilter}>
                            <SelectTrigger className="w-[140px] bg-slate-900 border-white/10 text-white">
                                <SelectValue placeholder="Brand" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                <SelectItem value="all">All Brands</SelectItem>
                                {uniqueMakes.map(make => (
                                    <SelectItem key={make} value={make}>{make}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={cityFilter} onValueChange={setCityFilter}>
                            <SelectTrigger className="w-[140px] bg-slate-900 border-white/10 text-white">
                                <SelectValue placeholder="City" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                <SelectItem value="all">All Cities</SelectItem>
                                {uniqueCities.map(city => (
                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search bike, seller, or ID..."
                            className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-500/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="w-full">
                    <div className="flex bg-slate-900/50 text-xs text-slate-500 uppercase tracking-wider font-semibold border-b border-white/5 py-4">
                        <div className="w-[30%] px-6">Bike Details</div>
                        <div className="w-[20%] px-6">Seller</div>
                        <div className="w-[15%] px-6">Status</div>
                        <div className="w-[15%] px-6">Price</div>
                        <div className="w-[20%] px-6 text-right">Actions</div>
                    </div>

                    {filteredListings.length > 0 ? (
                        <div className="max-h-[640px] overflow-y-auto">
                            {filteredListings.map((listing) => (
                                <div key={listing.id} className="flex border-b border-white/5 hover:bg-white/[0.02] transition-colors items-center text-sm">
                                    <div className="w-[30%] py-4 px-6 flex items-center gap-4">
                                        <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-white/10 bg-slate-800 flex-shrink-0">
                                            {listing.images?.[0] ? (
                                                <Image
                                                    src={listing.images[0]}
                                                    alt={listing.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <Bike className="h-5 w-5 text-slate-600 absolute inset-0 m-auto" />
                                            )}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-white font-medium truncate">{listing.title}</span>
                                            <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                                                <MapPin className="h-3 w-3" /> {listing.city || "Multi-location"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-[20%] py-4 px-6">
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm text-slate-300 flex items-center gap-1 truncate">
                                                <User className="h-3 w-3" /> {listing.seller?.full_name || "Unknown"}
                                            </span>
                                            <span className="text-[10px] text-slate-500 truncate">{listing.seller?.email}</span>
                                        </div>
                                    </div>
                                    <div className="w-[15%] py-4 px-6">
                                        <Badge variant="outline" className={`
                                            uppercase text-[10px] tracking-wide border
                                            ${listing.status === 'published' ? 'text-green-400 border-green-400/20 bg-green-400/5' :
                                                listing.status === 'rejected' ? 'text-rose-400 border-rose-400/20 bg-rose-400/5' :
                                                    'text-yellow-400 border-yellow-400/20 bg-yellow-400/5'}
                                        `}>
                                            {listing.status === 'published' ? 'Live' : listing.status}
                                        </Badge>
                                    </div>
                                    <div className="w-[15%] py-4 px-6">
                                        <div className="flex items-center font-bold text-brand-400">
                                            <IndianRupee className="h-3 w-3" />
                                            <span>{Number(listing.price || 0).toLocaleString("en-IN")}</span>
                                        </div>
                                    </div>
                                    <div className="w-[20%] py-4 px-6 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                                                asChild
                                            >
                                                <a href={`/marketplace/${listing.id}`} target="_blank" rel="noopener noreferrer">
                                                    <Eye className="h-4 w-4" />
                                                </a>
                                            </Button>

                                            {listing.status !== "published" && (
                                                <Button
                                                    size="sm"
                                                    className="h-8 bg-green-600 hover:bg-green-500 text-white gap-1 px-3"
                                                    disabled={loadingId === listing.id}
                                                    onClick={() => handleModerate(listing.id, "published")}
                                                >
                                                    {loadingId === listing.id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <Check className="h-3 w-3" />
                                                    )}
                                                    Approve
                                                </Button>
                                            )}

                                            {listing.status === "published" && (
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    className="h-8 gap-1 px-3"
                                                    disabled={loadingId === listing.id}
                                                    onClick={() => handleModerate(listing.id, "rejected")}
                                                >
                                                    {loadingId === listing.id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <X className="h-3 w-3" />
                                                    )}
                                                    Take Down
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <p className="text-slate-500">No listings found matching filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
