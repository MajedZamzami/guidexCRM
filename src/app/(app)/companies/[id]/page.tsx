import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPipelineStages } from "@/lib/data/reference";
import { CompanyDetailView } from "@/components/company-detail/company-detail-view";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: company }, stages, { data: projects }] = await Promise.all([
    supabase.from("companies").select("*").eq("id", id).single(),
    getPipelineStages(),
    supabase.from("projects").select("*").eq("company_id", id).order("is_default", { ascending: false }),
  ]);

  if (!company) {
    notFound();
  }

  return <CompanyDetailView company={company} stages={stages} projects={projects ?? []} />;
}
