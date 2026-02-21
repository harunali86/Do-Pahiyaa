"use client";

import { useEffect, useState } from "react";
import { User, Mail, MapPin, Loader2, Save, Building2, Phone, Shield, Trash2, Lock, Eye, EyeOff, AlertTriangle, Check } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { getProfileAction, updateProfileAction, changePasswordAction, deleteAccountAction } from "@/app/actions/auth";

type SettingsTab = "general" | "security" | "danger";

export default function ProfileSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [dealerProfile, setDealerProfile] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<SettingsTab>("general");
    const router = useRouter();

    // Security state
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // Delete state
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const result = await getProfileAction();

                if (!result.success) {
                    toast.error(result.error || "Failed to load profile");
                    if (result.error === "Not authenticated") {
                        router.push("/auth/login");
                    }
                    return;
                }

                setProfile(result.data?.profile);
                setDealerProfile(result.data?.dealer || {});

                if ((result as any).isNew) {
                    toast.success("Profile initialized! Please complete your details.");
                }
            } catch (error) {
                console.error("Profile load error:", error);
                toast.error("An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.id) {
            toast.error("Profile not loaded. Please refresh the page.");
            return;
        }

        setSaving(true);
        try {
            const isDealer = profile.role === "dealer";
            const result = await updateProfileAction(
                { full_name: profile.full_name, phone: profile.phone },
                isDealer ? {
                    business_name: dealerProfile?.business_name,
                    gst_number: dealerProfile?.gst_number,
                    showroom_address: dealerProfile?.showroom_address,
                } : undefined
            );

            if (!result.success) {
                toast.error(result.error || "Failed to save changes");
                return;
            }

            toast.success("Profile updated successfully!");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setChangingPassword(true);
        try {
            const result = await changePasswordAction(newPassword);
            if (!result.success) {
                toast.error(result.error || "Failed to change password");
                return;
            }
            toast.success("Password changed successfully!");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast.error(error.message || "Failed to change password");
        } finally {
            setChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== "DELETE") {
            toast.error('Please type "DELETE" to confirm');
            return;
        }

        setDeleting(true);
        try {
            const result = await deleteAccountAction();
            if (!result.success) {
                toast.error(result.error || "Failed to delete account");
                return;
            }
            toast.success("Account deleted. Goodbye!");
            router.push("/");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete account");
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-500 w-8 h-8" /></div>;

    const isDealer = profile?.role === "dealer";
    const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";

    const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
        { id: "general", label: "General Profile", icon: <User className="w-4 h-4" /> },
        { id: "security", label: "Security", icon: <Lock className="w-4 h-4" /> },
        { id: "danger", label: "Danger Zone", icon: <Trash2 className="w-4 h-4" /> },
    ];

    return (
        <div className="container mx-auto max-w-4xl py-12 px-4">
            <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
            <p className="text-slate-400 mb-8">Manage your profile, preferences, and account security.</p>

            <div className="grid gap-8 md:grid-cols-[240px_1fr]">
                {/* Sidebar Navigation */}
                <nav className="space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full text-left px-4 py-2.5 rounded-lg font-medium flex items-center gap-3 transition-all ${activeTab === tab.id
                                    ? tab.id === "danger"
                                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                        : "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                                    : tab.id === "danger"
                                        ? "text-red-400/60 hover:bg-red-500/5 hover:text-red-400"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Main Content Area */}
                <div className="space-y-6">

                    {/* =================== GENERAL TAB =================== */}
                    {activeTab === "general" && (
                        <form onSubmit={handleSave} className="space-y-8">
                            {/* Public Profile Section */}
                            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
                                <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-brand-500/30 to-brand-600/20 flex items-center justify-center text-brand-400 border-2 border-brand-500/20 shadow-lg shadow-brand-500/10">
                                        <span className="text-2xl font-bold">
                                            {profile?.full_name?.charAt(0)?.toUpperCase() || <User className="h-8 w-8" />}
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{profile?.full_name || "Your Name"}</h2>
                                        <p className="text-sm text-slate-500">{profile?.email}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isAdmin ? "bg-red-500/15 text-red-400 border border-red-500/20" :
                                                    isDealer ? "bg-blue-500/15 text-blue-400 border border-blue-500/20" :
                                                        "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                                }`}>
                                                {isAdmin && <Shield className="w-3 h-3 mr-1" />}
                                                {isDealer && <Building2 className="w-3 h-3 mr-1" />}
                                                {profile?.role}
                                            </span>
                                            {profile?.is_verified && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                                    <Check className="w-3 h-3 mr-1" /> Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="text-slate-300">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            value={profile?.full_name || ""}
                                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                            className="bg-slate-950/50 border-white/10 text-white"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                            <Input
                                                id="email"
                                                value={profile?.email || ""}
                                                disabled
                                                className="pl-10 bg-slate-900/50 border-white/5 text-slate-400 cursor-not-allowed"
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-500">Email cannot be changed.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                            <Input
                                                id="phone"
                                                value={profile?.phone || ""}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                className="pl-10 bg-slate-950/50 border-white/10 text-white"
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Member Since</Label>
                                        <div className="py-2.5 px-3 bg-slate-900/50 rounded-md border border-white/5 text-slate-400 text-sm">
                                            {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dealer Section */}
                            {isDealer && (
                                <div className="glass-panel p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                        <Building2 className="w-32 h-32" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Building2 className="w-5 h-5 text-blue-400" />
                                            Dealership Details
                                        </h3>
                                        <p className="text-sm text-slate-400">This information is displayed on your listings.</p>
                                    </div>
                                    <div className="grid gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="bizName" className="text-slate-300">Showroom / Business Name</Label>
                                            <Input
                                                id="bizName"
                                                value={dealerProfile?.business_name || ""}
                                                onChange={(e) => setDealerProfile({ ...dealerProfile, business_name: e.target.value })}
                                                className="bg-slate-950/50 border-white/10 text-white"
                                                placeholder="e.g. Royal Auto Consultants"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gst" className="text-slate-300">GST Number (Optional)</Label>
                                            <Input
                                                id="gst"
                                                value={dealerProfile?.gst_number || ""}
                                                onChange={(e) => setDealerProfile({ ...dealerProfile, gst_number: e.target.value })}
                                                className="bg-slate-950/50 border-white/10 text-white font-mono"
                                                placeholder="29ABCDE1234F1Z5"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="address" className="text-slate-300">Showroom Address</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                                <Input
                                                    id="address"
                                                    value={dealerProfile?.showroom_address || ""}
                                                    onChange={(e) => setDealerProfile({ ...dealerProfile, showroom_address: e.target.value })}
                                                    className="pl-10 bg-slate-950/50 border-white/10 text-white"
                                                    placeholder="Complete address with pincode"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Save Button */}
                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {saving ? "Saving..." : "Save Profile"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* =================== SECURITY TAB =================== */}
                    {activeTab === "security" && (
                        <div className="space-y-8">
                            {/* Change Password */}
                            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Lock className="w-5 h-5 text-brand-400" />
                                        Change Password
                                    </h3>
                                    <p className="text-sm text-slate-400 mt-1">Update your password to keep your account secure.</p>
                                </div>

                                <form onSubmit={handleChangePassword} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword" className="text-slate-300">New Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                            <Input
                                                id="newPassword"
                                                type={showPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="pl-10 pr-10 bg-slate-950/50 border-white/10 text-white"
                                                placeholder="Min 6 characters"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-slate-300">Confirm New Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                            <Input
                                                id="confirmPassword"
                                                type={showPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="pl-10 bg-slate-950/50 border-white/10 text-white"
                                                placeholder="Re-enter password"
                                            />
                                        </div>
                                        {confirmPassword && newPassword !== confirmPassword && (
                                            <p className="text-xs text-red-400">Passwords do not match</p>
                                        )}
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={changingPassword || newPassword.length < 6 || newPassword !== confirmPassword}
                                            className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                            {changingPassword ? "Updating..." : "Update Password"}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Session Info */}
                            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-emerald-400" />
                                    Account Security
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Login Method</p>
                                        <p className="text-white font-medium">Email & Password</p>
                                    </div>
                                    <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Account Status</p>
                                        <p className="text-emerald-400 font-medium flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            Active
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* =================== DANGER ZONE TAB =================== */}
                    {activeTab === "danger" && (
                        <div className="space-y-6">
                            <div className="glass-panel p-6 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle className="w-6 h-6 text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-red-400">Delete Account</h3>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Permanently delete your account and all associated data. This action <strong className="text-red-400">cannot be undone</strong>.
                                        </p>
                                        <ul className="mt-3 space-y-1.5 text-sm text-slate-500">
                                            <li className="flex items-center gap-2"><Trash2 className="w-3.5 h-3.5 text-red-400/60" /> All your listings will be removed</li>
                                            <li className="flex items-center gap-2"><Trash2 className="w-3.5 h-3.5 text-red-400/60" /> All your leads and messages will be deleted</li>
                                            {isDealer && <li className="flex items-center gap-2"><Trash2 className="w-3.5 h-3.5 text-red-400/60" /> Your dealership profile will be permanently removed</li>}
                                            <li className="flex items-center gap-2"><Trash2 className="w-3.5 h-3.5 text-red-400/60" /> You will lose access to all credits and subscriptions</li>
                                        </ul>
                                    </div>
                                </div>

                                {!showDeleteModal ? (
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 font-bold border border-red-500/20 hover:bg-red-500/20 transition-all"
                                    >
                                        I want to delete my account
                                    </button>
                                ) : (
                                    <div className="space-y-4 p-4 bg-red-950/30 rounded-xl border border-red-500/30 animate-in fade-in-0 duration-200">
                                        <p className="text-sm text-red-300 font-medium">
                                            Type <code className="bg-red-500/20 px-2 py-0.5 rounded font-mono text-red-400 font-bold">DELETE</code> to confirm:
                                        </p>
                                        <Input
                                            value={deleteConfirmation}
                                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                                            placeholder="Type DELETE here"
                                            className="bg-red-950/50 border-red-500/30 text-red-300 placeholder:text-red-500/30 font-mono"
                                        />
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(""); }}
                                                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleDeleteAccount}
                                                disabled={deleteConfirmation !== "DELETE" || deleting}
                                                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                {deleting ? "Deleting..." : "Delete Forever"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
