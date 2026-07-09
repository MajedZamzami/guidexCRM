import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPipelineStages, getProfiles } from "@/lib/data/reference";
import { ProjectDetailView } from "@/components/company-detail/project-detail-view";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}) {
  const { id, projectId } = await params;
  const supabase = await createClient();

  const [
    { data: company },
    { data: project },
    stages,
    { data: contacts },
    { data: roles },
    { data: interactions },
    { data: teamMembers },
    profiles,
    { data: followUps },
    { data: comments },
    { data: files },
  ] = await Promise.all([
    supabase.from("companies").select("*").eq("id", id).single(),
    supabase.from("projects").select("*").eq("id", projectId).eq("company_id", id).single(),
    getPipelineStages(),
    supabase.from("contacts").select("*").eq("project_id", projectId).order("is_primary", { ascending: false }),
    supabase.from("buying_committee_roles").select("*, contact:contacts(*)").eq("project_id", projectId),
    supabase
      .from("interactions")
      .select("*, contact:contacts(name)")
      .eq("project_id", projectId)
      .order("occurred_at", { ascending: false })
      .limit(30),
    supabase.from("company_team_members").select("*").eq("project_id", projectId),
    getProfiles(),
    supabase.from("follow_ups").select("*").eq("project_id", projectId).order("due_date"),
    supabase.from("comments").select("*").eq("project_id", projectId).order("created_at"),
    supabase.from("files").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
  ]);

  if (!company || !project) {
    notFound();
  }

  return (
    <ProjectDetailView
      company={company}
      project={project}
      stages={stages}
      contacts={contacts ?? []}
      roles={roles ?? []}
      interactions={interactions ?? []}
      teamMembers={teamMembers ?? []}
      profiles={profiles}
      followUps={followUps ?? []}
      comments={comments ?? []}
      files={files ?? []}
    />
  );
}
