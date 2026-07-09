"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Company, PipelineStage, Project } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HealthBadge } from "@/components/health-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProjectDialog } from "@/components/company-detail/project-dialog";
import { formatCurrency } from "@/lib/format";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";

export function ProjectDetailView({
  company,
  project,
  stages,
}: {
  company: Company;
  project: Project;
  stages: PipelineStage[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const stage = stages.find((s) => s.id === project.stage_id);

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("projects").delete().eq("id", project.id);
    setDeleting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Project deleted");
    router.push(`/companies/${company.id}`);
  }

  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/companies" className="hover:text-foreground">
          Companies
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/companies/${company.id}`} className="hover:text-foreground">
          {company.name}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{project.name}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="text-sm text-muted-foreground">{company.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
          {!project.is_default && (
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            {stage && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs"
                style={{ borderColor: stage.color, color: stage.color }}
              >
                <span className="size-1.5 rounded-full" style={{ backgroundColor: stage.color }} />
                {stage.name}
              </span>
            )}
            <HealthBadge status={project.health_status} />
          </div>

          {project.deal_value !== null && (
            <div>
              <p className="text-xs text-muted-foreground">Deal value</p>
              <p className="text-foreground">{formatCurrency(project.deal_value)}</p>
            </div>
          )}

          {project.opportunity_score !== null && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Opportunity score</span>
                <span>{project.opportunity_score}%</span>
              </div>
              <Progress value={project.opportunity_score} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <ProjectDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        companyId={company.id}
        stages={stages}
        project={project}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {project.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this project. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
