export function isAdminRole(role?: string | null) {
    return role === "admin" || role === "super_admin";
}

export function isDealerOrAdminRole(role?: string | null) {
    return role === "dealer" || isAdminRole(role);
}

export async function getCurrentUserAndRole(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user: null, role: null };

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    return { user, role: profile?.role || null };
}

export async function requireAdminAccess(supabase: any) {
    const { user, role } = await getCurrentUserAndRole(supabase);

    if (!user) {
        return { ok: false as const, status: 401, error: "Unauthorized", user: null, role: null };
    }

    if (!isAdminRole(role)) {
        return { ok: false as const, status: 403, error: "Admin access required", user, role };
    }

    return { ok: true as const, status: 200, error: null, user, role };
}
