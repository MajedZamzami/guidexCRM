"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Company, PipelineStage } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { HealthBadge } from "@/components/health-badge";
import { CompanyDialog } from "@/components/companies/company-dialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { MoreHorizontal, Plus, Search } from "lucide-react";

export function CompaniesView({
  companies,
  stages,
}: {
  companies: Company[];
  stages: PipelineStage[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState<Company | null>(null);

  const stageById = useMemo(
    () => new Map(stages.map((s) => [s.id, s])),
    [stages],
  );

  const industries = useMemo(() => {
    const set = new Set(companies.map((c) => c.industry).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [companies]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return companies.filter((c) => {
      if (industry !== "all" && c.industry !== industry) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q) ||
        c.country?.toLowerCase().includes(q) ||
        c.website?.toLowerCase().includes(q)
      );
    });
  }, [companies, search, industry]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(company: Company) {
    setEditing(company);
    setDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    const supabase = createClient();
    const { error } = await supabase.from("companies").delete().eq("id", deleting.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Company deleted");
      router.refresh();
    }
    setDeleting(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Companies</h1>
          <p className="text-sm text-muted-foreground">
            {companies.length} {companies.length === 1 ? "company" : "companies"}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          New company
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={industry} onValueChange={setIndustry}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All industries</SelectItem>
            {industries.map((i) => (
              <SelectItem key={i} value={i}>
                {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Health</TableHead>
              <TableHead>Deal value</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No companies found.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((company) => {
              const stage = company.stage_id ? stageById.get(company.stage_id) : undefined;
              return (
                <TableRow
                  key={company.id}
                  className="cursor-pointer"
                  onClick={() => openEdit(company)}
                >
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {company.industry || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {company.country || "—"}
                  </TableCell>
                  <TableCell>
                    {stage ? (
                      <Badge
                        variant="outline"
                        style={{ borderColor: stage.color, color: stage.color }}
                      >
                        {stage.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <HealthBadge status={company.health_status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatCurrency(company.deal_value)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(company.updated_at)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(company)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleting(company)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <CompanyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        stages={stages}
        company={editing}
      />

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the company from the CRM. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
