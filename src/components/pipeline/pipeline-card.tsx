"use client";

import { useRouter } from "next/navigation";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Company, HealthStatus } from "@/lib/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { timeAgo } from "@/lib/format";
import { Building2, History, User, Users } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  whatsapp: "WhatsApp",
  note: "Note",
  other: "Activity",
};

const BORDER_BY_HEALTH: Record<HealthStatus, string> = {
  active: "border-l-success",
  at_risk: "border-l-warning",
  cold: "border-l-muted-foreground/40",
};

function scoreColor(score: number) {
  if (score < 40) return "bg-destructive";
  if (score < 70) return "bg-warning";
  return "bg-success";
}

export function PipelineCard({
  company,
  contactCount,
  addedByName,
  lastActivityType,
  lastActivityAt,
}: {
  company: Company;
  contactCount: number;
  addedByName: string | null;
  lastActivityType: string | null;
  lastActivityAt: string | null;
}) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: company.id });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`shrink-0 cursor-grab touch-none gap-1.5 rounded-lg border-l-4 border-border bg-card py-3 active:cursor-grabbing ${
        BORDER_BY_HEALTH[company.health_status]
      } ${isDragging ? "opacity-50" : ""}`}
    >
      <CardContent className="space-y-1.5 px-3">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="size-4 shrink-0 text-muted-foreground" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/companies/${company.id}`);
            }}
            className="truncate text-left text-sm font-medium hover:underline"
          >
            {company.name}
          </button>
        </div>

        {company.industry && (
          <p className="truncate text-xs text-muted-foreground">{company.industry}</p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="size-3.5 shrink-0" />
          {contactCount}
        </div>

        {addedByName && (
          <div className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <User className="size-3.5 shrink-0" />
            Added by <span className="text-foreground">{addedByName}</span>
          </div>
        )}

        {lastActivityAt && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <History className="size-3.5 shrink-0" />
            {TYPE_LABELS[lastActivityType ?? ""] ?? "Stage Change"} · {timeAgo(lastActivityAt)}
          </div>
        )}

        {company.opportunity_score !== null && (
          <div className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Opportunity</span>
              <span>{company.opportunity_score}%</span>
            </div>
            <Progress
              value={company.opportunity_score}
              className="h-1.5"
              indicatorClassName={scoreColor(company.opportunity_score)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
