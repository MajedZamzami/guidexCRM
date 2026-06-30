import { Building2, AlertTriangle, TrendingUp, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { StageFunnelChart } from "@/components/dashboard/stage-funnel-chart";
import { RecentCompanies } from "@/components/dashboard/recent-companies";
import { formatCurrency } from "@/lib/format";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: companies }, { data: stages }] = await Promise.all([
    supabase.from("companies").select("*"),
    supabase.from("pipeline_stages").select("*").order("display_order"),
  ]);

  const allCompanies = companies ?? [];
  const allStages = stages ?? [];

  const totalCompanies = allCompanies.length;
  const activeDeals = allCompanies.filter((c) => c.health_status === "active").length;
  const needsAttention = allCompanies.filter((c) => c.health_status === "at_risk").length;
  const totalDealValue = allCompanies.reduce((sum, c) => sum + (c.deal_value ?? 0), 0);

  const funnelData = allStages.map((stage) => ({
    name: stage.name,
    count: allCompanies.filter((c) => c.stage_id === stage.id).length,
    color: stage.color,
  }));

  const recent = [...allCompanies]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);

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
        <RecentCompanies companies={recent} stages={allStages} />
      </div>
    </div>
  );
}
