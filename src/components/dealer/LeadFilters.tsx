"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { useState, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LeadFiltersProps = {
    activeTab: "market" | "myleads";
};

export function LeadFilters({ activeTab }: LeadFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initial state from URL
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [make, setMake] = useState(searchParams.get("make") || "");
    const [city, setCity] = useState(searchParams.get("city") || "");
    const [status, setStatus] = useState(searchParams.get("status") || "all");
    const [dateFilter, setDateFilter] = useState(searchParams.get("date") || "all");
    const tab = activeTab;

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        // Sync Tab
        params.set("tab", tab);

        // Apply filters based on tab
        if (tab === "market") {
            if (make && make !== "all") params.set("make", make); else params.delete("make");
            if (city) params.set("city", city); else params.delete("city");
            // Clear irrelevant
            params.delete("status");
            params.delete("search");
        } else {
            if (search) params.set("search", search); else params.delete("search");
            if (status && status !== 'all') params.set("status", status); else params.delete("status");
            if (dateFilter && dateFilter !== 'all') params.set("date", dateFilter); else params.delete("date");
            // Clear irrelevant
            params.delete("make");
            params.delete("city");
        }

        router.replace(`?${params.toString()}`, { scroll: false });
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            applyFilters();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Trigger update on select changes immediately
    useEffect(() => {
        applyFilters();
    }, [make, city, status, dateFilter, tab]);

    const handleClear = () => {
        setSearch("");
        setMake("");
        setCity("");
        setStatus("all");
        setDateFilter("all");
        router.replace(`?tab=${tab}`);
    };

    const handleTabChange = (nextTab: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", nextTab);

        if (nextTab === "market") {
            params.delete("status");
            params.delete("search");
            params.delete("date");
        } else {
            params.delete("make");
            params.delete("city");
        }

        router.replace(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="space-y-4">
            {/* Tab Switcher - Controlled here to sync with URL */}
            <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="bg-slate-900 border border-white/10 p-1 w-full md:w-auto">
                    <TabsTrigger value="market" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white px-6">Buy Leads</TabsTrigger>
                    <TabsTrigger value="myleads" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white px-6">My Unlocked Leads</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-slate-900 border border-white/5">
                {tab === "market" ? (
                    <>
                        <div className="relative flex-1">
                            <Input
                                placeholder="City (e.g. Pune)"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="bg-slate-800 border-white/10"
                            />
                        </div>
                        <div className="w-full md:w-[200px]">
                            <Select value={make} onValueChange={setMake}>
                                <SelectTrigger className="bg-slate-800 border-white/10">
                                    <SelectValue placeholder="Filter by Make" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Makes</SelectItem>
                                    <SelectItem value="Hero">Hero</SelectItem>
                                    <SelectItem value="Honda">Honda</SelectItem>
                                    <SelectItem value="TVS">TVS</SelectItem>
                                    <SelectItem value="Bajaj">Bajaj</SelectItem>
                                    <SelectItem value="Royal Enfield">Royal Enfield</SelectItem>
                                    <SelectItem value="Yamaha">Yamaha</SelectItem>
                                    <SelectItem value="KTM">KTM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search buyer name, phone or bike..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 bg-slate-800 border-white/10"
                            />
                        </div>
                        <div className="w-full md:w-[200px]">
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="bg-slate-800 border-white/10">
                                    <SelectValue placeholder="Filter Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="unlocked">Unlocked</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="converted">Converted</SelectItem>
                                    <SelectItem value="lost">Lost</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full md:w-[200px]">
                            <Select value={dateFilter} onValueChange={setDateFilter}>
                                <SelectTrigger className="bg-slate-800 border-white/10">
                                    <SelectValue placeholder="Filter by Date" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="last7days">Last 7 Days</SelectItem>
                                    <SelectItem value="last30days">Last 30 Days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                )}

                {(search || make || city || (status && status !== 'all') || (dateFilter && dateFilter !== 'all')) && (
                    <Button variant="ghost" onClick={handleClear} className="text-slate-400 hover:text-white">
                        <X className="h-4 w-4 mr-2" /> Clear
                    </Button>
                )}
            </div>
        </div>
    );
}
