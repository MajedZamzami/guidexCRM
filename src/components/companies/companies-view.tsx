"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Company, PipelineStage, Profile } from "@/lib/types/database";
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
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Building2,
  Copy,
  Globe,
  LayoutGrid,
  List,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  User,
} from "lucide-react";

type ViewMode = "grid" | "list";

export function CompaniesView({
  companies,
  stages,
  profiles,
}: {
  companies: Company[];
  stages: PipelineStage[];
  profiles: Profile[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState<string>("all");
  const [view, setView] = useState<ViewMode>("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState<Company | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [duplicatesOpen, setDuplicatesOpen] = useState(false);

  const stageById = useMemo(
    () => new Map(stages.map((s) => [s.id, s])),
    [stages],
  );

  const profileById = useMemo(
    () => new Map(profiles.map((p) => [p.id, p])),
    [profiles],
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

  const duplicateGroups = useMemo(() => {
    const groups = new Map<string, Company[]>();
    for (const c of companies) {
      const key = c.name.trim().toLowerCase();
      if (!key) continue;
      groups.set(key, [...(groups.get(key) ?? []), c]);
    }
    return Array.from(groups.values()).filter((group) => group.length > 1);
  }, [companies]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(company: Company) {
    setEditing(company);
    setDialogOpen(true);
  }

  function toggleSelected(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
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

  async function confirmBulkDelete() {
    const ids = Array.from(selected);
    const supabase = createClient();
    const { error } = await supabase.from("companies").delete().in("id", ids);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${ids.length} ${ids.length === 1 ? "company" : "companies"} deleted`);
      setSelected(new Set());
      router.refresh();
    }
    setBulkDeleting(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Companies</h1>
          <p className="text-sm text-muted-foreground">
            {companies.length} {companies.length === 1 ? "company" : "companies"} found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setDuplicatesOpen(true)}>
            <Copy className="size-4" />
            Duplicates
          </Button>
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add Company
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search company name, industry, website, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-border p-0.5">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="size-8"
              onClick={() => setView("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon"
              className="size-8"
              onClick={() => setView("list")}
              aria-label="List view"
            >
              <List className="size-4" />
            </Button>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <SlidersHorizontal className="size-4" />
                Filters
                {industry !== "all" && (
                  <Badge variant="secondary" className="ml-1 rounded-full px-1.5">
                    1
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="space-y-3">
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Industry</p>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="w-full">
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
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-2">
          <p className="text-sm">
            {selected.size} {selected.size === 1 ? "company" : "companies"} selected
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setBulkDeleting(true)}>
              Delete
            </Button>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="rounded-lg border border-border bg-card py-24 text-center text-muted-foreground">
          No companies found.
        </div>
      )}

      {filtered.length > 0 && view === "grid" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((company) => {
            const addedBy = company.created_by
              ? (profileById.get(company.created_by)?.full_name ?? null)
              : null;
            return (
              <Card
                key={company.id}
                className="h-48 cursor-pointer gap-3 overflow-hidden px-4 transition-colors hover:bg-accent/40"
                onClick={() => router.push(`/companies/${company.id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <Checkbox
                      checked={selected.has(company.id)}
                      onCheckedChange={(checked) => toggleSelected(company.id, checked === true)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="size-4.5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate font-medium">{company.name}</p>
                      {company.industry && (
                        <p className="truncate text-xs text-muted-foreground">
                          {company.industry}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
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
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {company.website && (
                    <p className="flex items-center gap-1.5 truncate">
                      <Globe className="size-3.5 shrink-0" />
                      <span className="truncate">{company.website}</span>
                    </p>
                  )}
                  {company.country && (
                    <p className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 shrink-0" />
                      {company.country}
                    </p>
                  )}
                  {addedBy && (
                    <p className="flex items-center gap-1.5">
                      <User className="size-3.5 shrink-0" />
                      Added by {addedBy}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && view === "list" && (
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
              {filtered.map((company) => {
                const stage = company.stage_id ? stageById.get(company.stage_id) : undefined;
                return (
                  <TableRow
                    key={company.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/companies/${company.id}`)}
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
      )}

      <CompanyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        stages={stages}
        profiles={profiles}
        company={editing}
      />

      <Dialog open={duplicatesOpen} onOpenChange={setDuplicatesOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Possible duplicates</DialogTitle>
            <DialogDescription>
              Companies that share the same name.
            </DialogDescription>
          </DialogHeader>
          {duplicateGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">No duplicate companies found.</p>
          ) : (
            <div className="max-h-96 space-y-4 overflow-y-auto">
              {duplicateGroups.map((group) => (
                <div key={group[0].id} className="space-y-1.5 rounded-lg border border-border p-3">
                  <p className="text-sm font-medium">{group[0].name}</p>
                  {group.map((company) => (
                    <button
                      key={company.id}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-xs text-muted-foreground hover:bg-accent"
                      onClick={() => {
                        setDuplicatesOpen(false);
                        router.push(`/companies/${company.id}`);
                      }}
                    >
                      <span>{company.industry || "No industry"} · {company.country || "No location"}</span>
                      <span>{formatDate(company.updated_at)}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

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

      <AlertDialog open={bulkDeleting} onOpenChange={setBulkDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selected.size} companies?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the selected companies from the CRM.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
