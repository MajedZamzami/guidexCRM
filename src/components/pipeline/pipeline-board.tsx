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
import type { Company, PipelineStage, Profile } from "@/lib/types/database";
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
import { Search, Plus } from "lucide-react";

export interface PipelineCompanyRow {
  company: Company;
  contactCount: number;
  addedByName: string | null;
  doorOpenerName: string | null;
  lastActivityType: string | null;
  lastActivityAt: string | null;
}

type ContactRow = { id: string; company_id: string; name: string };
type InteractionRow = { id: string; company_id: string; type: string; occurred_at: string };

export function PipelineBoard({
  companies: initialCompanies,
  stages,
  contacts,
  profiles,
  interactions,
}: {
  companies: Company[];
  stages: PipelineStage[];
  contacts: ContactRow[];
  profiles: Profile[];
  interactions: InteractionRow[];
}) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const [view, setView] = useState<"companies" | "contacts">("companies");
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const profileById = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);

  const contactCountByCompany = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of contacts) {
      map.set(c.company_id, (map.get(c.company_id) ?? 0) + 1);
    }
    return map;
  }, [contacts]);

  const latestInteractionByCompany = useMemo(() => {
    const map = new Map<string, InteractionRow>();
    for (const interaction of interactions) {
      if (!map.has(interaction.company_id)) {
        map.set(interaction.company_id, interaction);
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

  const rowsByStage = useMemo(() => {
    const map = new Map<string, PipelineCompanyRow[]>();
    for (const stage of stages) map.set(stage.id, []);
    for (const company of filteredCompanies) {
      if (!company.stage_id || !map.has(company.stage_id)) continue;
      const latest = latestInteractionByCompany.get(company.id);
      map.get(company.stage_id)!.push({
        company,
        contactCount: contactCountByCompany.get(company.id) ?? 0,
        addedByName: company.created_by
          ? (profileById.get(company.created_by)?.full_name ?? null)
          : null,
        doorOpenerName: company.door_opener_id
          ? (profileById.get(company.door_opener_id)?.full_name ?? null)
          : null,
        lastActivityType: latest?.type ?? null,
        lastActivityAt: latest?.occurred_at ?? company.last_activity_at,
      });
    }
    return map;
  }, [filteredCompanies, stages, contactCountByCompany, latestInteractionByCompany, profileById]);

  const activeCompany = activeId
    ? (companies.find((c) => c.id === activeId) ?? null)
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
    <div className="flex h-full min-w-0 flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Pipeline</h1>
          <p className="text-sm text-muted-foreground">Company-first view with nested contacts</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex rounded-md border border-border p-0.5">
            <Button
              size="sm"
              variant={view === "companies" ? "secondary" : "ghost"}
              className="h-7"
              onClick={() => setView("companies")}
            >
              Companies
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
          <ContactsList contacts={contacts} companies={filteredCompanies} />
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="scrollbar-thin flex min-h-0 flex-1 gap-3 overflow-x-auto pb-4">
            {stages.map((stage) => (
              <PipelineColumn key={stage.id} stage={stage} rows={rowsByStage.get(stage.id) ?? []} />
            ))}
          </div>
          <DragOverlay>
            {activeCompany ? (
              <PipelineCard
                company={activeCompany}
                contactCount={contactCountByCompany.get(activeCompany.id) ?? 0}
                addedByName={null}
                doorOpenerName={null}
                lastActivityType={null}
                lastActivityAt={null}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <CompanyDialog
        open={addCompanyOpen}
        onOpenChange={setAddCompanyOpen}
        stages={stages}
        profiles={profiles}
      />
    </div>
  );
}
