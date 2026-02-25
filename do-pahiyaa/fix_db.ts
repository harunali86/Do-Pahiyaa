import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
    // 1. Add column if not exists
    const { error: alterError } = await supabase.rpc('exec_sql', { 
        sql_string: `ALTER TABLE public.auth_otp_requests ADD COLUMN IF NOT EXISTS ip_address TEXT;` 
    });
    console.log("Alter Error (if any):", alterError);

    // 2. Reload schema cache using NOTIFY
    const { error: reloadError } = await supabase.rpc('exec_sql', { 
        sql_string: `NOTIFY pgrst, 'reload schema'` 
    });
    console.log("Reload Error (if any):", reloadError);
}
run();
