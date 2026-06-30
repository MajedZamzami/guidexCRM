import { createClient } from "@/lib/supabase/server";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";

export default async function PipelinePage() {
  const supabase = await createClient();

  const [
    { data: companies },
    { data: stages },
    { data: contacts },
    { data: profiles },
    { data: interactions },
  ] = await Promise.all([
    supabase.from("companies").select("*").order("updated_at", { ascending: false }),
    supabase
      .from("pipeline_stages")
      .select("*")
      .eq("is_active", true)
      .order("display_order"),
    supabase.from("contacts").select("id, company_id, name"),
    supabase.from("profiles").select("*"),
    supabase
      .from("interactions")
      .select("id, company_id, type, occurred_at")
      .order("occurred_at", { ascending: false }),
  ]);

  return (
    <PipelineBoard
      companies={companies ?? []}
      stages={stages ?? []}
      contacts={contacts ?? []}
      profiles={profiles ?? []}
      interactions={interactions ?? []}
    />
  );
}
