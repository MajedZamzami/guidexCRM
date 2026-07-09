"use client";

import { useRouter } from "next/navigation";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Project } from "@/lib/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HealthBadge } from "@/components/health-badge";
import { timeAgo } from "@/lib/format";
import { Building2, Users } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  whatsapp: "WhatsApp",
  note: "Note",
  other: "Activity",
};

export function PipelineCard({
  project,
  companyId,
  companyName,
  companyIndustry,
  contactCount,
  addedByName,
  lastActivityType,
  lastActivityAt,
}: {
  project: Project;
  companyId: string;
  companyName: string;
  companyIndustry: string | null;
  contactCount: number;
  addedByName: string | null;
  lastActivityType: string | null;
  lastActivityAt: string | null;
}) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: project.id });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`shrink-0 cursor-grab touch-none gap-2 border-border bg-card py-3 active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <CardContent className="space-y-2 px-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="size-4 shrink-0 text-muted-foreground" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/companies/${companyId}/projects/${project.id}`);
              }}
              className="truncate text-left text-sm font-medium hover:underline"
            >
              {project.name}
            </button>
          </div>
          <HealthBadge status={project.health_status} />
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/companies/${companyId}`);
          }}
          className="truncate text-left text-xs text-primary hover:underline"
        >
          {companyName}
        </button>
        {companyIndustry && (
          <p className="truncate text-xs text-muted-foreground">{companyIndustry}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {contactCount}
          </span>
          {addedByName && <span className="truncate">Added by {addedByName}</span>}
        </div>
        {lastActivityAt && (
          <p className="text-xs text-muted-foreground">
            {TYPE_LABELS[lastActivityType ?? ""] ?? "Stage Change"} · {timeAgo(lastActivityAt)}
          </p>
        )}
        {project.opportunity_score !== null && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Opportunity</span>
              <span>{project.opportunity_score}%</span>
            </div>
            <Progress value={project.opportunity_score} className="h-1.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
