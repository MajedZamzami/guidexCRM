import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPipelineStages, getProfiles } from "@/lib/data/reference";
import { CompanyDetailView } from "@/components/company-detail/company-detail-view";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: company },
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
    getPipelineStages(),
    supabase.from("contacts").select("*").eq("company_id", id).order("is_primary", { ascending: false }),
    supabase.from("buying_committee_roles").select("*, contact:contacts(*)").eq("company_id", id),
    supabase
      .from("interactions")
      .select("*, contact:contacts(name)")
      .eq("company_id", id)
      .order("occurred_at", { ascending: false })
      .limit(30),
    supabase.from("company_team_members").select("*").eq("company_id", id),
    getProfiles(),
    supabase.from("follow_ups").select("*").eq("company_id", id).order("due_date"),
    supabase.from("comments").select("*").eq("company_id", id).order("created_at"),
    supabase.from("files").select("*").eq("company_id", id).order("created_at", { ascending: false }),
  ]);

  if (!company) {
    notFound();
  }

  return (
    <CompanyDetailView
      company={company}
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
