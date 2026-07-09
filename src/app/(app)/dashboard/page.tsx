import { Building2, AlertTriangle, TrendingUp, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPipelineStages } from "@/lib/data/reference";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { StageFunnelChart } from "@/components/dashboard/stage-funnel-chart";
import { RecentCompanies } from "@/components/dashboard/recent-companies";
import { formatCurrency } from "@/lib/format";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: companies }, { data: projects }, stages] = await Promise.all([
    supabase.from("companies").select("*"),
    supabase.from("projects").select("*"),
    getPipelineStages(),
  ]);

  const allCompanies = companies ?? [];
  const allProjects = projects ?? [];
  const allStages = stages;

  const totalCompanies = allCompanies.length;
  const activeDeals = allProjects.filter((p) => p.health_status === "active").length;
  const needsAttention = allProjects.filter((p) => p.health_status === "at_risk").length;
  const totalDealValue = allProjects.reduce((sum, p) => sum + (p.deal_value ?? 0), 0);

  const funnelData = allStages.map((stage) => ({
    name: stage.name,
    count: allProjects.filter((p) => p.stage_id === stage.id).length,
    color: stage.color,
  }));

  const defaultProjectByCompany = new Map(
    allProjects.filter((p) => p.is_default).map((p) => [p.company_id, p]),
  );

  const recent = [...allCompanies]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6)
    .map((company) => ({
      company,
      project: defaultProjectByCompany.get(company.id) ?? null,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of the GuideX pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total companies" value={String(totalCompanies)} icon={Building2} />
        <KpiCard label="Active deals" value={String(activeDeals)} icon={TrendingUp} />
        <KpiCard label="Needs attention" value={String(needsAttention)} icon={AlertTriangle} />
        <KpiCard label="Pipeline value" value={formatCurrency(totalDealValue)} icon={Wallet} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StageFunnelChart data={funnelData} />
        </div>
        <RecentCompanies items={recent} stages={allStages} />
      </div>
    </div>
  );
}
