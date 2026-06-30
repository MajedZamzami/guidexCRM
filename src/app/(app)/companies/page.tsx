import { createClient } from "@/lib/supabase/server";
import { CompaniesView } from "@/components/companies/companies-view";

export default async function CompaniesPage() {
  const supabase = await createClient();

  const [{ data: companies }, { data: stages }] = await Promise.all([
    supabase.from("companies").select("*").order("updated_at", { ascending: false }),
    supabase.from("pipeline_stages").select("*").order("display_order"),
  ]);

  return <CompaniesView companies={companies ?? []} stages={stages ?? []} />;
}
