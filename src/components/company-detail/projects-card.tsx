"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { PipelineStage, Project } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HealthBadge } from "@/components/health-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { FolderKanban, MoreHorizontal, Plus } from "lucide-react";

export function ProjectsCard({
  companyId,
  projects,
  stages,
}: {
  companyId: string;
  projects: Project[];
  stages: PipelineStage[];
}) {
  const router = useRouter();
  const stageById = new Map(stages.map((s) => [s.id, s]));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(project: Project) {
    setEditing(project);
    setDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    const supabase = createClient();
    const { error } = await supabase.from("projects").delete().eq("id", deleting.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Project deleted");
      router.refresh();
    }
    setDeleting(null);
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <FolderKanban className="size-4 text-primary" />
          Projects ({projects.length})
        </CardTitle>
        <Button size="sm" variant="outline" onClick={openCreate}>
          <Plus className="size-4" />
          Add project
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {projects.length === 0 && (
          <p className="text-sm text-muted-foreground">No projects yet.</p>
        )}
        {projects.map((project) => {
          const stage = project.stage_id ? stageById.get(project.stage_id) : undefined;
          return (
            <div
              key={project.id}
              className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
            >
              <Link
                href={`/companies/${companyId}/projects/${project.id}`}
                className="min-w-0 flex-1 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{project.name}</span>
                  {project.is_default && (
                    <Badge variant="secondary" className="text-[10px]">
                      Default
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {stage && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5"
                      style={{ borderColor: stage.color, color: stage.color }}
                    >
                      {stage.name}
                    </span>
                  )}
                  <HealthBadge status={project.health_status} />
                  {project.deal_value !== null && <span>{formatCurrency(project.deal_value)}</span>}
                </div>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 shrink-0">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(project)}>
                    Edit / Rename
                  </DropdownMenuItem>
                  {!project.is_default && (
                    <DropdownMenuItem variant="destructive" onClick={() => setDeleting(project)}>
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </CardContent>

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        companyId={companyId}
        stages={stages}
        project={editing}
      />

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this project. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
