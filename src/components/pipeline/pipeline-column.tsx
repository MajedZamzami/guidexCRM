"use client";

import { useDroppable } from "@dnd-kit/core";
import type { PipelineStage } from "@/lib/types/database";
import { PipelineCard } from "@/components/pipeline/pipeline-card";
import type { PipelineProjectRow } from "@/components/pipeline/pipeline-board";

export function PipelineColumn({
  stage,
  rows,
}: {
  stage: PipelineStage;
  rows: PipelineProjectRow[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div className="flex h-full w-72 shrink-0 flex-col rounded-lg bg-muted/30">
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <span className="text-sm font-medium">{stage.name}</span>
        </div>
        <span className="text-xs text-muted-foreground">{rows.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex flex-1 min-h-0 flex-col gap-2 overflow-y-auto px-2 pb-2 transition-colors ${
          isOver ? "bg-primary/5" : ""
        }`}
      >
        {rows.map((row) => (
          <PipelineCard
            key={row.project.id}
            project={row.project}
            companyId={row.companyId}
            companyName={row.companyName}
            companyIndustry={row.companyIndustry}
            contactCount={row.contactCount}
            addedByName={row.addedByName}
            lastActivityType={row.lastActivityType}
            lastActivityAt={row.lastActivityAt}
          />
        ))}
      </div>
    </div>
  );
}
