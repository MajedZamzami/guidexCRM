"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type {
  BuyingCommitteeRole,
  Comment,
  Company,
  CompanyFile,
  CompanyTeamMember,
  Contact,
  FollowUp,
  Interaction,
  PipelineStage,
  Profile,
} from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { HealthBadge } from "@/components/health-badge";
import { CompanyDialog } from "@/components/companies/company-dialog";
import { PrimaryContactCard } from "@/components/company-detail/primary-contact-card";
import { CommunicationTrackerCard } from "@/components/company-detail/communication-tracker-card";
import { BuyingCommitteeCard } from "@/components/company-detail/buying-committee-card";
import { CollaborationCard } from "@/components/company-detail/collaboration-card";
import { FilesCard } from "@/components/company-detail/files-card";
import { formatCurrency } from "@/lib/format";
import { ArrowLeft, Pencil, Trash2, Globe, Link2, MapPin } from "lucide-react";

type RoleWithContact = BuyingCommitteeRole & { contact: Contact | null };
type InteractionWithContact = Interaction & { contact: { name: string } | null };

export function CompanyDetailView({
  company,
  stages,
  contacts,
  roles,
  interactions,
  teamMembers,
  profiles,
  followUps,
  comments,
  files,
}: {
  company: Company;
  stages: PipelineStage[];
  contacts: Contact[];
  roles: RoleWithContact[];
  interactions: InteractionWithContact[];
  teamMembers: CompanyTeamMember[];
  profiles: Profile[];
  followUps: FollowUp[];
  comments: Comment[];
  files: CompanyFile[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const stage = stages.find((s) => s.id === company.stage_id);
  const createdByProfile = profiles.find((p) => p.id === company.created_by);

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("companies").delete().eq("id", company.id);
    setDeleting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Company deleted");
    router.push("/companies");
  }

  return (
    <div className="space-y-4">
      <Link
        href="/companies"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Companies
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{company.name}</h1>
          <p className="text-sm text-muted-foreground">{company.industry || "—"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Company Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
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
              <HealthBadge status={company.health_status} />
            </div>
            {company.country && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" />
                {[company.city, company.country].filter(Boolean).join(", ")}
              </p>
            )}
            {company.website && (
              <a
                href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Globe className="size-4" />
                {company.website}
              </a>
            )}
            {company.linkedin_url && (
              <a
                href={company.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Link2 className="size-4" />
                LinkedIn
              </a>
            )}
            <div className="grid grid-cols-2 gap-3 pt-1 text-muted-foreground">
              {company.employee_count && (
                <div>
                  <p className="text-xs">Employees</p>
                  <p className="text-foreground">{company.employee_count}</p>
                </div>
              )}
              {company.deal_value !== null && (
                <div>
                  <p className="text-xs">Deal value</p>
                  <p className="text-foreground">{formatCurrency(company.deal_value)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Business Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {company.business_overview || "No notes yet."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PrimaryContactCard companyId={company.id} companyName={company.name} contacts={contacts} />
        <CommunicationTrackerCard
          companyId={company.id}
          contacts={contacts}
          interactions={interactions}
        />
        <BuyingCommitteeCard
          companyId={company.id}
          companyName={company.name}
          contacts={contacts}
          roles={roles}
        />
        <FilesCard companyId={company.id} files={files} />
      </div>

      <CollaborationCard
        companyId={company.id}
        createdAt={company.created_at}
        createdByName={createdByProfile?.full_name ?? "Unknown"}
        contactMethod={company.contact_method}
        teamMembers={teamMembers}
        profiles={profiles}
        followUps={followUps}
        comments={comments}
      />

      <CompanyDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        stages={stages}
        profiles={profiles}
        company={company}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {company.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the company and all its contacts, interactions, and
              files. This action cannot be undone.
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
