import { createClient } from "@/lib/supabase/server";
import { getPipelineStages, getProfiles } from "@/lib/data/reference";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";

export default async function PipelinePage() {
  const supabase = await createClient();

  const [
    { data: companies },
    allStages,
    { data: contacts },
    profiles,
    { data: interactions },
  ] = await Promise.all([
    supabase.from("companies").select("*").order("updated_at", { ascending: false }),
    getPipelineStages(),
    supabase.from("contacts").select("id, company_id, name"),
    getProfiles(),
    supabase
      .from("interactions")
      .select("id, company_id, type, occurred_at")
      .order("occurred_at", { ascending: false }),
  ]);

  const stages = allStages.filter((s) => s.is_active);

  return (
    <PipelineBoard
      companies={companies ?? []}
      stages={stages}
      contacts={contacts ?? []}
      profiles={profiles}
      interactions={interactions ?? []}
    />
  );
}
