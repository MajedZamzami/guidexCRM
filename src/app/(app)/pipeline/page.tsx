import { createClient } from "@/lib/supabase/server";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";

export default async function PipelinePage() {
  const supabase = await createClient();

  const [{ data: companies }, { data: stages }] = await Promise.all([
    supabase.from("companies").select("*").order("updated_at", { ascending: false }),
    supabase
      .from("pipeline_stages")
      .select("*")
      .eq("is_active", true)
      .order("display_order"),
  ]);

  return <PipelineBoard companies={companies ?? []} stages={stages ?? []} />;
}
