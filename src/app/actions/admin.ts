"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdminAccess } from "@/lib/auth/authorization";
import { AdminService } from "@/lib/services/admin.service";
import { revalidatePath } from "next/cache";

async function logAudit(
    adminClient: any,
    actorId: string,
    action: string,
    entityType: string,
    entityId?: string | null,
    oldData?: Record<string, any> | null,
    newData?: Record<string, any> | null
) {
    await adminClient.from("audit_logs").insert({
        actor_id: actorId,
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        old_data: oldData || null,
        new_data: newData || null,
    });
}

async function requireAdminContext() {
    const supabase = await createSupabaseServerClient();
    const auth = await requireAdminAccess(supabase);
    if (!auth.ok) return { ok: false as const, error: auth.error };
    return {
        ok: true as const,
        user: auth.user,
        supabase,
        adminClient: createSupabaseAdminClient(),
    };
}

export async function verifyDealerAction(dealerId: string) {
    const ctx = await requireAdminContext();
    if (!ctx.ok) return { success: false, error: ctx.error };

    const { data: oldProfile } = await ctx.adminClient
        .from("profiles")
        .select("id, is_verified")
        .eq("id", dealerId)
        .maybeSingle();

    const { error: profileError } = await ctx.adminClient
        .from("profiles")
        .update({ is_verified: true })
        .eq("id", dealerId);

    if (profileError) return { success: false, error: profileError.message };

    await logAudit(
        ctx.adminClient,
        ctx.user.id,
        "VERIFY_DEALER",
        "profile",
        dealerId,
        oldProfile || null,
        { is_verified: true }
    );

    revalidatePath('/admin/users');
    return { success: true };
}

export async function moderateListingAction(listingId: string, status: "published" | "rejected", reason?: string) {
    const ctx = await requireAdminContext();
    if (!ctx.ok) return { success: false, error: ctx.error };

    // 2. Update listing status
    const { data: beforeListing } = await ctx.adminClient
        .from("listings")
        .select("id, status")
        .eq("id", listingId)
        .maybeSingle();

    const { data: listing, error: updateError } = await ctx.adminClient
        .from("listings")
        .update({ status })
        .eq("id", listingId)
        .select("seller_id, title")
        .single();

    if (updateError || !listing) {
        console.error("ModerateListingError:", updateError);
        return { success: false, error: "Failed to update listing status." };
    }

    // 2. Notify Seller
    const title = status === "published" ? "Listing Approved! 🚀" : "Listing Rejected ⚠️";
    const message = status === "published"
        ? `Your listing "${listing.title}" is now live on the marketplace.`
        : `Your listing "${listing.title}" was rejected. ${reason ? `Reason: ${reason}` : "Please review our guidelines."}`;

    await ctx.adminClient.from("notifications").insert({
        user_id: listing.seller_id,
        title,
        message,
        type: status === "published" ? "success" : "warning"
    });

    await logAudit(
        ctx.adminClient,
        ctx.user.id,
        "MODERATE_LISTING",
        "listing",
        listingId,
        beforeListing || null,
        { status, reason: reason || null }
    );

    revalidatePath("/admin/moderation");
    revalidatePath("/marketplace");
    return { success: true };
}

export async function toggleBlockUserAction(userId: string, shouldBlock: boolean) {
    const ctx = await requireAdminContext();
    if (!ctx.ok) return { success: false, error: ctx.error };

    try {
        const { data: oldProfile } = await ctx.adminClient
            .from("profiles")
            .select("id, is_blocked")
            .eq("id", userId)
            .maybeSingle();

        if (shouldBlock) {
            // Ban for 100 years
            const { error: banError } = await ctx.adminClient.auth.admin.updateUserById(userId, {
                ban_duration: "876600h"
            });
            if (banError) throw banError;
        } else {
            // Unban
            const { error: unbanError } = await ctx.adminClient.auth.admin.updateUserById(userId, {
                ban_duration: "none"
            });
            if (unbanError) throw unbanError;
        }

        // Update Profile Status (for UI)
        const { error: profileError } = await ctx.adminClient
            .from('profiles')
            .update({ is_blocked: shouldBlock })
            .eq('id', userId);

        if (profileError) throw profileError;

        await logAudit(
            ctx.adminClient,
            ctx.user.id,
            shouldBlock ? "BLOCK_USER" : "UNBLOCK_USER",
            "profile",
            userId,
            oldProfile || null,
            { is_blocked: shouldBlock }
        );

        revalidatePath('/admin/users');
        return { success: true, message: shouldBlock ? "User blocked" : "User unlocked" };

    } catch (error: any) {
        console.error("Block User Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteUserAction(userId: string) {
    const ctx = await requireAdminContext();
    if (!ctx.ok) return { success: false, error: ctx.error };

    try {
        const { data: oldProfile } = await ctx.adminClient
            .from("profiles")
            .select("id, full_name, email, role")
            .eq("id", userId)
            .maybeSingle();

        // Delete from Auth (Cascade should handle profile if set up, but let's see)
        const { error: deleteError } = await ctx.adminClient.auth.admin.deleteUser(userId);

        if (deleteError) throw deleteError;

        await logAudit(
            ctx.adminClient,
            ctx.user.id,
            "DELETE_USER",
            "profile",
            userId,
            oldProfile || null,
            null
        );

        revalidatePath('/admin/users');
        return { success: true, message: "User deleted permanently" };
    } catch (error: any) {
        console.error("Delete User Error:", error);
        return { success: false, error: error.message };
    }
}


export async function sendBroadcastAction(formData: FormData) {
    const ctx = await requireAdminContext();
    if (!ctx.ok) return { success: false, error: ctx.error };

    // 2. Extract Data
    const segment = formData.get("segment") as 'all' | 'dealers' | 'buyers';
    const templateName = formData.get("template") as string;
    const variable1 = formData.get("variable1") as string;

    if (!segment || !templateName) {
        return { success: false, error: "Missing required fields" };
    }

    try {
        const variables = variable1 ? [variable1] : [];
        const result = await AdminService.sendBroadcast(segment, templateName, variables);

        await logAudit(
            ctx.adminClient,
            ctx.user.id,
            "SEND_BROADCAST",
            "notification",
            null,
            null,
            { segment, templateName }
        );

        revalidatePath("/admin/notifications");
        return result;
    } catch (error: any) {
        console.error("Broadcast Action Error:", error);
        return { success: false, error: error.message || "Failed to send broadcast" };
    }
}
