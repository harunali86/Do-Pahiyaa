
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function resetPassword() {
    console.log("Resetting admin password...");

    // 1. Get User ID
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    // Find admin user
    const adminUser = users?.find(u => u.email === "admin@gmail.com");

    if (!adminUser) {
        console.log("Admin user not found. Creating...");
        const { data, error } = await supabase.auth.admin.createUser({
            email: "admin@gmail.com",
            password: "password123",
            email_confirm: true,
            user_metadata: { full_name: "Admin User", role: "admin" }
        });
        if (error) console.error("Create failed:", error);
        else console.log("Created admin@gmail.com with password: password123");
    } else {
        const { error } = await supabase.auth.admin.updateUserById(
            adminUser.id,
            { password: "password123" }
        );
        if (error) console.error("Update failed:", error);
        else console.log("Reset password for admin@gmail.com to: password123");
    }

    process.exit(0);
}

resetPassword();
