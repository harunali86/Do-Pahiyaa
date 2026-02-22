"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ShieldCheck, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import VerifyDealerButton from "@/components/admin/VerifyDealerButton";
import { UserActions } from "@/components/admin/UserActions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface UsersClientProps {
    initialUsers: any[];
    metadata: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(date);
};

export function UsersClient({ initialUsers, metadata }: UsersClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Sync local state with URL params
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const activeTab = searchParams.get("role") || "all";

    const updateParam = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        // Reset page on filter change
        if (key !== "page") {
            params.set("page", "1");
        }
        router.push(`?${params.toString()}`);
    }, [router, searchParams]);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (searchParams.get("search") || "")) {
                updateParam("search", searchTerm);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, searchParams, updateParam]);

    const handleTabChange = (val: string) => {
        updateParam("role", val);
    };

    const handlePageChange = (newPage: number) => {
        updateParam("page", newPage.toString());
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">User Governance</h1>
                    <p className="text-slate-400">Manage access, verification, and roles</p>
                </div>
                {/* Add User - Could be a modal later */}
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors shadow-lg">
                    <UserPlus className="h-4 w-4" /> Add User
                </button>
            </div>

            <div className="glass-panel border border-white/5 overflow-hidden p-6">

                {/* Tabs & Search */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full md:w-auto">
                        <TabsList className="bg-slate-900 border border-white/10">
                            <TabsTrigger value="all">All Users</TabsTrigger>
                            <TabsTrigger value="dealer">Dealers</TabsTrigger>
                            <TabsTrigger value="user">Buyers</TabsTrigger>
                            <TabsTrigger value="admin">Admins</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-500/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900/50 text-xs text-slate-500 uppercase tracking-wider font-semibold border-b border-white/5">
                                <th className="py-3 px-6">Name / Contact</th>
                                <th className="py-3 px-6">Role</th>
                                <th className="py-3 px-6">Status</th>
                                <th className="py-3 px-6">Info</th>
                                <th className="py-3 px-6">Joined</th>
                                <th className="py-3 px-6 text-right">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {initialUsers.map((user) => {
                                const isDealer = user.role === 'dealer';
                                const dealerData = user.dealers?.[0] || user.dealers; // Handle array or single object join
                                let status = user.is_verified ? 'Active' : 'Pending';

                                if (isDealer && dealerData?.subscription_status) {
                                    status = dealerData.subscription_status;
                                }

                                if (user.is_blocked) status = "Blocked";

                                return (
                                    <tr key={user.id} className={`group hover:bg-white/[0.02] transition-colors ${user.is_blocked ? 'opacity-50 bg-red-900/5' : ''}`}>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-sm font-bold text-white uppercase border border-white/10">
                                                    {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <p className={`font-medium ${user.is_blocked ? 'text-red-400 line-through' : 'text-white'}`}>
                                                        {user.full_name || "Unknown User"}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{user.email || user.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                                                ${user.role === 'dealer' ? 'bg-accent-gold/10 text-accent-gold border-accent-gold/20' :
                                                    user.role === 'seller' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        user.role === 'admin' ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' :
                                                            'bg-slate-700/50 text-slate-400 border-slate-600'}`}>
                                                {user.role === 'dealer' && <ShieldCheck className="h-3 w-3" />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge variant="outline" className={`
                                                uppercase text-[10px] tracking-wide border
                                                ${status === 'Active' || status === 'active' || status === 'verified' ? 'text-green-400 border-green-400/20 bg-green-400/5' :
                                                    status === 'Blocked' ? 'text-red-400 border-red-400/20 bg-red-400/5' :
                                                        'text-yellow-400 border-yellow-400/20 bg-yellow-400/5'}
                                            `}>
                                                {status}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-400">
                                            {isDealer && dealerData ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1 text-xs text-white">
                                                        <span className="text-slate-500">Credits:</span> {dealerData.credits_balance}
                                                    </div>
                                                    {dealerData.business_name && (
                                                        <div className="text-xs truncate max-w-[120px]" title={dealerData.business_name}>
                                                            {dealerData.business_name}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-600">-</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td className="py-4 px-6 text-right flex justify-end gap-2 items-center">
                                            {user.role === 'dealer' && !user.is_blocked && (
                                                <VerifyDealerButton dealerId={user.id} currentStatus={status || 'pending'} />
                                            )}

                                            {/* Control Dropdown */}
                                            <UserActions
                                                userId={user.id}
                                                isBlocked={user.is_blocked || false}
                                                userName={user.full_name || user.email || 'User'}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {initialUsers.length === 0 && (
                        <div className="py-20 text-center">
                            <p className="text-slate-500">No users found.</p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between mt-6 border-t border-white/5 pt-4">
                    <p className="text-xs text-slate-500">
                        Showing <span className="text-white font-medium">{Math.min(metadata.total, (metadata.page - 1) * metadata.limit + 1)}</span> to <span className="text-white font-medium">{Math.min(metadata.total, metadata.page * metadata.limit)}</span> of <span className="text-white font-medium">{metadata.total}</span> users
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(metadata.page - 1)}
                            disabled={metadata.page <= 1}
                            className="p-2 rounded-lg bg-slate-900 border border-white/10 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-400 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handlePageChange(metadata.page + 1)}
                            disabled={metadata.page >= metadata.totalPages}
                            className="p-2 rounded-lg bg-slate-900 border border-white/10 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-400 hover:text-white transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
