import { createClient } from "@/lib/supabase/server";
import { getPipelineStages, getProfiles } from "@/lib/data/reference";
import { CompaniesView } from "@/components/companies/companies-view";

export default async function CompaniesPage() {
  const supabase = await createClient();

  const [{ data: companies }, stages, profiles] = await Promise.all([
    supabase.from("companies").select("*").order("updated_at", { ascending: false }),
    getPipelineStages(),
    getProfiles(),
  ]);

  return (
    <CompaniesView
      companies={companies ?? []}
      stages={stages}
      profiles={profiles}
    />
  );
}
