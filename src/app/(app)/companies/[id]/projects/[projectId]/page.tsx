import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPipelineStages } from "@/lib/data/reference";
import { ProjectDetailView } from "@/components/company-detail/project-detail-view";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}) {
  const { id, projectId } = await params;
  const supabase = await createClient();

  const [{ data: company }, { data: project }, stages] = await Promise.all([
    supabase.from("companies").select("*").eq("id", id).single(),
    supabase.from("projects").select("*").eq("id", projectId).eq("company_id", id).single(),
    getPipelineStages(),
  ]);

  if (!company || !project) {
    notFound();
  }

  return <ProjectDetailView company={company} project={project} stages={stages} />;
}
