import Link from "next/link";
import type { Company, PipelineStage } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HealthBadge } from "@/components/health-badge";
import { timeAgo } from "@/lib/format";

export function RecentCompanies({
  companies,
  stages,
}: {
  companies: Company[];
  stages: PipelineStage[];
}) {
  const stageById = new Map(stages.map((s) => [s.id, s]));

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recently updated</CardTitle>
        <Link href="/companies" className="text-xs text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-1">
        {companies.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No companies yet.
          </p>
        )}
        {companies.map((company) => {
          const stage = company.stage_id ? stageById.get(company.stage_id) : undefined;
          return (
            <div
              key={company.id}
              className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-accent/50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{company.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {stage?.name ?? "No stage"} · {timeAgo(company.updated_at)}
                </p>
              </div>
              <HealthBadge status={company.health_status} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
