"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { HealthStatus, PipelineStage, Project } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

function toFormState(project?: Project | null, defaultStageId?: string) {
  return {
    name: project?.name ?? "",
    stage_id: project?.stage_id ?? defaultStageId ?? "",
    health_status: (project?.health_status ?? "active") as HealthStatus,
    deal_value: project?.deal_value?.toString() ?? "",
    opportunity_score: project?.opportunity_score?.toString() ?? "",
  };
}

type FormState = ReturnType<typeof toFormState>;

export function ProjectDialog({
  open,
  onOpenChange,
  companyId,
  stages,
  project,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  stages: PipelineStage[];
  project?: Project | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && (
          <ProjectForm
            key={project?.id ?? "new"}
            companyId={companyId}
            stages={stages}
            project={project}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProjectForm({
  companyId,
  stages,
  project,
  onOpenChange,
}: {
  companyId: string;
  stages: PipelineStage[];
  project?: Project | null;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(project, stages[0]?.id));
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(project);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: form.name.trim(),
      stage_id: form.stage_id || null,
      health_status: form.health_status,
      deal_value: form.deal_value ? Number(form.deal_value) : null,
      opportunity_score: form.opportunity_score ? Number(form.opportunity_score) : null,
    };

    const { error } = isEdit
      ? await supabase.from("projects").update(payload).eq("id", project!.id)
      : await supabase.from("projects").insert({ ...payload, company_id: companyId });

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(isEdit ? "Project updated" : "Project created");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit project" : "New project"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Update this project's details."
            : "Track another deal for this company through the pipeline."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Stage</Label>
            <Select
              value={form.stage_id || undefined}
              onValueChange={(value) => update("stage_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="No stage" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Health</Label>
            <Select
              value={form.health_status}
              onValueChange={(value) => update("health_status", value as HealthStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deal_value">Deal value (USD)</Label>
            <Input
              id="deal_value"
              type="number"
              min="0"
              value={form.deal_value}
              onChange={(e) => update("deal_value", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="opportunity_score">Opportunity score (0-100)</Label>
            <Input
              id="opportunity_score"
              type="number"
              min="0"
              max="100"
              value={form.opportunity_score}
              onChange={(e) => update("opportunity_score", e.target.value)}
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {isEdit ? "Save changes" : "Create project"}
        </Button>
      </DialogFooter>
    </form>
  );
}
