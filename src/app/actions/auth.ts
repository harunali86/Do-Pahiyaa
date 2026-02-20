"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getUserRoleAction() {
    const isDemoMode = true; // Match src/proxy.ts
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    // --- DEMO MODE ROLE MOCKING ---
    if (isDemoMode && !session?.user) {
        // We check a 'demo-session' cookie set during our mock login
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const demoSession = cookieStore.get("demo-session")?.value;

        if (demoSession === 'admin') return 'admin';
        if (demoSession === 'dealer') return 'dealer';
        return 'user';
    }
    // ------------------------------

    if (!session?.user) return null;

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

    return profile?.role || "user";
}


export async function getProfileAction() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Use regular client for reads (RLS allows SELECT)
    const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (error) return { success: false, error: error.message };

    if (profile) {
        // Fetch dealer info if applicable
        let dealer = null;
        if (profile.role === "dealer") {
            const { data } = await supabase
                .from("dealers")
                .select("*")
                .eq("profile_id", user.id)
                .maybeSingle();
            dealer = data;
        }
        return { success: true, data: { profile, dealer } };
    }

    // No profile — auto-create using ADMIN client (bypasses RLS - no INSERT policy exists)
    const adminClient = createSupabaseAdminClient();

    const newProfile = {
        id: user.id,
        email: user.email || "",
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
        phone: user.user_metadata?.phone || user.phone || "",
        role: "user" as const,
        is_verified: false,
    };

    const { data: created, error: insertError } = await adminClient
        .from("profiles")
        .upsert(newProfile, { onConflict: "id" })
        .select()
        .single();

    if (insertError) return { success: false, error: insertError.message };

    return { success: true, data: { profile: created, dealer: null }, isNew: true };
}

export async function updateProfileAction(profileData: {
    full_name?: string;
    phone?: string;
}, dealerData?: {
    business_name?: string;
    gst_number?: string;
    showroom_address?: string;
}) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // RLS allows self-update
    const { error: profileError } = await supabase
        .from("profiles")
        .update({
            full_name: profileData.full_name,
            phone: profileData.phone,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    if (profileError) return { success: false, error: profileError.message };

    // Update dealer info if provided (admin client needed — no RLS insert policy for dealers either)
    if (dealerData) {
        const adminClient = createSupabaseAdminClient();

        const { data: existing } = await supabase
            .from("dealers")
            .select("profile_id")
            .eq("profile_id", user.id)
            .maybeSingle();

        if (existing) {
            const { error } = await supabase
                .from("dealers")
                .update(dealerData)
                .eq("profile_id", user.id);
            if (error) return { success: false, error: error.message };
        } else {
            const { error } = await adminClient
                .from("dealers")
                .insert({ ...dealerData, profile_id: user.id });
            if (error) return { success: false, error: error.message };
        }
    }

    return { success: true };
}

export async function changePasswordAction(newPassword: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) return { success: false, error: error.message };
    return { success: true };
}

export async function deleteAccountAction() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Use admin client to delete the auth user (cascade deletes profile via FK)
    const adminClient = createSupabaseAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(user.id);

    if (error) return { success: false, error: error.message };

    // Sign out the current session
    await supabase.auth.signOut();

    return { success: true };
}
