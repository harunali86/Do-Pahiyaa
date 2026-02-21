"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getNotificationsAction() {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from('notifications')
        .select("id, title, message, type, is_read, link, created_at")
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

    return data || [];
}

export async function markAsReadAction(id: string) {
    const supabase = await createSupabaseServerClient();

    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

export async function markAllAsReadAction() {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
}
