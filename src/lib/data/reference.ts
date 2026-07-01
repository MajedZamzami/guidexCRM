import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PipelineStage, Profile } from "@/lib/types/database";

// pipeline_stages and profiles are read-only reference data from the app's
// perspective (seeded/managed outside the product) and identical for every
// authenticated user, so they're safe to cache across requests.
export const getPipelineStages = unstable_cache(
  async (): Promise<PipelineStage[]> => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("pipeline_stages")
      .select("*")
      .order("display_order");
    return data ?? [];
  },
  ["pipeline_stages"],
  { revalidate: 60 },
);

export const getProfiles = unstable_cache(
  async (): Promise<Profile[]> => {
    const supabase = createAdminClient();
    const { data } = await supabase.from("profiles").select("*");
    return data ?? [];
  },
  ["profiles"],
  { revalidate: 60 },
);
