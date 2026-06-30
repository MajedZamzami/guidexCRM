"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Company } from "@/lib/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { HealthBadge } from "@/components/health-badge";
import { formatCurrency, timeAgo } from "@/lib/format";
import { Building2 } from "lucide-react";

export function PipelineCard({ company }: { company: Company }) {
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
      className={`cursor-grab touch-none gap-2 border-border bg-card py-3 active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <CardContent className="space-y-2 px-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-medium">{company.name}</span>
          </div>
          <HealthBadge status={company.health_status} />
        </div>
        {company.industry && (
          <p className="truncate text-xs text-muted-foreground">{company.industry}</p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(company.deal_value)}</span>
          <span>{timeAgo(company.last_activity_at)}</span>
        </div>
        {company.next_action_title && (
          <p className="truncate rounded bg-accent px-2 py-1 text-xs text-accent-foreground">
            {company.next_action_title}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
