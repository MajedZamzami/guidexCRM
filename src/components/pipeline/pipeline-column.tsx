"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Company, PipelineStage } from "@/lib/types/database";
import { PipelineCard } from "@/components/pipeline/pipeline-card";

export function PipelineColumn({
  stage,
  companies,
}: {
  stage: PipelineStage;
  companies: Company[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-muted/30">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <span className="text-sm font-medium">{stage.name}</span>
        </div>
        <span className="text-xs text-muted-foreground">{companies.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-24 flex-1 flex-col gap-2 px-2 pb-2 transition-colors ${
          isOver ? "bg-primary/5" : ""
        }`}
      >
        {companies.map((company) => (
          <PipelineCard key={company.id} company={company} />
        ))}
      </div>
    </div>
  );
}
