"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Company, PipelineStage } from "@/lib/types/database";
import { PipelineColumn } from "@/components/pipeline/pipeline-column";
import { PipelineCard } from "@/components/pipeline/pipeline-card";

export function PipelineBoard({
  companies: initialCompanies,
  stages,
}: {
  companies: Company[];
  stages: PipelineStage[];
}) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const byStage = useMemo(() => {
    const map = new Map<string, Company[]>();
    for (const stage of stages) map.set(stage.id, []);
    for (const company of companies) {
      if (company.stage_id && map.has(company.stage_id)) {
        map.get(company.stage_id)!.push(company);
      }
    }
    return map;
  }, [companies, stages]);

  const activeCompany = activeId
    ? companies.find((c) => c.id === activeId) ?? null
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const companyId = String(active.id);
    const newStageId = String(over.id);
    const company = companies.find((c) => c.id === companyId);
    if (!company || company.stage_id === newStageId) return;

    const previousStageId = company.stage_id;
    setCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, stage_id: newStageId } : c)),
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("companies")
      .update({ stage_id: newStageId, last_activity_at: new Date().toISOString() })
      .eq("id", companyId);

    if (error) {
      toast.error(error.message);
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === companyId ? { ...c, stage_id: previousStageId } : c,
        ),
      );
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Pipeline</h1>
        <p className="text-sm text-muted-foreground">
          Drag companies between stages to update their pipeline position.
        </p>
      </div>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              companies={byStage.get(stage.id) ?? []}
            />
          ))}
        </div>
        <DragOverlay>
          {activeCompany ? <PipelineCard company={activeCompany} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
