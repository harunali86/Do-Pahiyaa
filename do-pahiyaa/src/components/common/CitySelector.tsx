"use client";

import { MapPin } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const CITIES = [
    "All India",
    "Pune",
    "Mumbai",
    "Bengaluru",
    "Delhi",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Ahmedabad",
];

export function CitySelector() {
    const [city, setCity] = useState("All India");

    const handleCityChange = (value: string) => {
        setCity(value);
        localStorage.setItem("user_city", value);
        document.cookie = `user_city=${value}; path=/; max-age=31536000`; // 1 year expiry
        window.location.reload();
    };

    return (
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
            <MapPin className="h-3 w-3 text-brand-400" />
            <Select value={city} onValueChange={handleCityChange}>
                <SelectTrigger className="h-6 gap-1 border-0 bg-transparent p-0 text-xs font-medium text-slate-300 focus:ring-0 data-[placeholder]:text-slate-300 w-[80px]">
                    <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                    {CITIES.map((c) => (
                        <SelectItem key={c} value={c} className="focus:bg-brand-600 focus:text-white cursor-pointer text-xs">
                            {c}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
