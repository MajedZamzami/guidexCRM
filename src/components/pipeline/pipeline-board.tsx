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
import type { Company, PipelineStage, Profile, Project } from "@/lib/types/database";
import { PipelineColumn } from "@/components/pipeline/pipeline-column";
import { PipelineCard } from "@/components/pipeline/pipeline-card";
import { ContactsList } from "@/components/pipeline/contacts-list";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CompanyDialog } from "@/components/companies/company-dialog";
import { Heart, Flame, Snowflake, Search, Plus } from "lucide-react";

export interface PipelineProjectRow {
  project: Project;
  companyId: string;
  companyName: string;
  companyIndustry: string | null;
  contactCount: number;
  addedByName: string | null;
  lastActivityType: string | null;
  lastActivityAt: string | null;
}

type ContactRow = { id: string; project_id: string; name: string };
type InteractionRow = { id: string; project_id: string; type: string; occurred_at: string };

export function PipelineBoard({
  companies,
  projects: initialProjects,
  stages,
  contacts,
  profiles,
  interactions,
}: {
  companies: Company[];
  projects: Project[];
  stages: PipelineStage[];
  contacts: ContactRow[];
  profiles: Profile[];
  interactions: InteractionRow[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const [view, setView] = useState<"deals" | "contacts">("deals");
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const companyById = useMemo(() => new Map(companies.map((c) => [c.id, c])), [companies]);
  const profileById = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);

  const contactCountByProject = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of contacts) {
      map.set(c.project_id, (map.get(c.project_id) ?? 0) + 1);
    }
    return map;
  }, [contacts]);

  const latestInteractionByProject = useMemo(() => {
    const map = new Map<string, InteractionRow>();
    for (const interaction of interactions) {
      if (!map.has(interaction.project_id)) {
        map.set(interaction.project_id, interaction);
      }
    }
    return map;
  }, [interactions]);

  const industries = useMemo(() => {
    const set = new Set(companies.map((c) => c.industry).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const q = search.trim().toLowerCase();
    return companies.filter((c) => {
      if (industry !== "all" && c.industry !== industry) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q) ||
        c.country?.toLowerCase().includes(q)
      );
    });
  }, [companies, search, industry]);

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((project) => {
      const company = companyById.get(project.company_id);
      if (industry !== "all" && company?.industry !== industry) return false;
      if (!q) return true;
      return (
        project.name.toLowerCase().includes(q) ||
        company?.name.toLowerCase().includes(q) ||
        company?.industry?.toLowerCase().includes(q) ||
        company?.country?.toLowerCase().includes(q)
      );
    });
  }, [projects, companyById, search, industry]);

  const rowsByStage = useMemo(() => {
    const map = new Map<string, PipelineProjectRow[]>();
    for (const stage of stages) map.set(stage.id, []);
    for (const project of filteredProjects) {
      if (!project.stage_id || !map.has(project.stage_id)) continue;
      const company = companyById.get(project.company_id);
      if (!company) continue;
      const latest = latestInteractionByProject.get(project.id);
      map.get(project.stage_id)!.push({
        project,
        companyId: company.id,
        companyName: company.name,
        companyIndustry: company.industry,
        contactCount: contactCountByProject.get(project.id) ?? 0,
        addedByName: project.created_by
          ? (profileById.get(project.created_by)?.full_name ?? null)
          : null,
        lastActivityType: latest?.type ?? null,
        lastActivityAt: latest?.occurred_at ?? project.last_activity_at,
      });
    }
    return map;
  }, [
    filteredProjects,
    stages,
    companyById,
    contactCountByProject,
    latestInteractionByProject,
    profileById,
  ]);

  const activeProject = activeId
    ? (projects.find((p) => p.id === activeId) ?? null)
    : null;
  const activeCompany = activeProject ? companyById.get(activeProject.company_id) : null;

  const summary = useMemo(
    () => ({
      total: projects.length,
      atRisk: projects.filter((p) => p.health_status === "at_risk").length,
      cold: projects.filter((p) => p.health_status === "cold").length,
    }),
    [projects],
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const projectId = String(active.id);
    const newStageId = String(over.id);
    const project = projects.find((p) => p.id === projectId);
    if (!project || project.stage_id === newStageId) return;

    const previousStageId = project.stage_id;
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, stage_id: newStageId } : p)),
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .update({ stage_id: newStageId, last_activity_at: new Date().toISOString() })
      .eq("id", projectId);

    if (error) {
      toast.error(error.message);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, stage_id: previousStageId } : p,
        ),
      );
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Pipeline</h1>
          <p className="text-sm text-muted-foreground">Company-first view with nested contacts</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="size-4 text-destructive" />
              {summary.total}
            </span>
            <span className="flex items-center gap-1">
              <Flame className="size-4 text-warning" />
              {summary.atRisk}
            </span>
            <span className="flex items-center gap-1">
              <Snowflake className="size-4 text-primary" />
              {summary.cold}
            </span>
          </div>
          <div className="flex rounded-md border border-border p-0.5">
            <Button
              size="sm"
              variant={view === "deals" ? "secondary" : "ghost"}
              className="h-7"
              onClick={() => setView("deals")}
            >
              Deals
            </Button>
            <Button
              size="sm"
              variant={view === "contacts" ? "secondary" : "ghost"}
              className="h-7"
              onClick={() => setView("contacts")}
            >
              Contacts
            </Button>
          </div>
          <Button size="sm" onClick={() => setAddCompanyOpen(true)}>
            <Plus className="size-4" />
            Add Company
          </Button>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search companies, industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={industry} onValueChange={setIndustry}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="All Industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {industries.map((i) => (
              <SelectItem key={i} value={i}>
                {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {view === "contacts" ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ContactsList contacts={contacts} projects={projects} companies={filteredCompanies} />
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto pb-4">
            {stages.map((stage) => (
              <PipelineColumn key={stage.id} stage={stage} rows={rowsByStage.get(stage.id) ?? []} />
            ))}
          </div>
          <DragOverlay>
            {activeProject && activeCompany ? (
              <PipelineCard
                project={activeProject}
                companyId={activeCompany.id}
                companyName={activeCompany.name}
                companyIndustry={activeCompany.industry}
                contactCount={contactCountByProject.get(activeProject.id) ?? 0}
                addedByName={null}
                lastActivityType={null}
                lastActivityAt={null}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <CompanyDialog open={addCompanyOpen} onOpenChange={setAddCompanyOpen} />
    </div>
  );
}
