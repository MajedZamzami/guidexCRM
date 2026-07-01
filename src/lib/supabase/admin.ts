import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

// Service-role client with no cookie/session dependency, safe to use inside
// `unstable_cache` for data that is identical for every authenticated user
// (e.g. reference tables like pipeline_stages and profiles).
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
