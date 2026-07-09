import { createClient } from "@/lib/supabase/server";
import { getPipelineStages, getProfiles } from "@/lib/data/reference";
import { CompaniesView } from "@/components/companies/companies-view";

export default async function CompaniesPage() {
  const supabase = await createClient();

  const [{ data: companies }, { data: defaultProjects }, stages, profiles] = await Promise.all([
    supabase.from("companies").select("*").order("updated_at", { ascending: false }),
    supabase.from("projects").select("*").eq("is_default", true),
    getPipelineStages(),
    getProfiles(),
  ]);

  return (
    <CompaniesView
      companies={companies ?? []}
      defaultProjects={defaultProjects ?? []}
      stages={stages}
      profiles={profiles}
    />
  );
}
