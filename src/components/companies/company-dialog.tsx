"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Company, HealthStatus, PipelineStage, Profile } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

function toFormState(company: Company | null | undefined, defaultStageId: string) {
  return {
    name: company?.name ?? "",
    website: company?.website ?? "",
    industry: company?.industry ?? "",
    country: company?.country ?? "",
    city: company?.city ?? "",
    employee_count: company?.employee_count ?? "",
    business_overview: company?.business_overview ?? "",
    stage_id: company?.stage_id ?? defaultStageId,
    health_status: (company?.health_status ?? "active") as HealthStatus,
    deal_value: company?.deal_value?.toString() ?? "",
    door_opener_id: company?.door_opener_id ?? "",
  };
}

type FormState = ReturnType<typeof toFormState>;

export function CompanyDialog({
  open,
  onOpenChange,
  stages,
  profiles,
  company,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: PipelineStage[];
  profiles: Profile[];
  company?: Company | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && (
          <CompanyForm
            key={company?.id ?? "new"}
            stages={stages}
            profiles={profiles}
            company={company}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CompanyForm({
  stages,
  profiles,
  company,
  onOpenChange,
}: {
  stages: PipelineStage[];
  profiles: Profile[];
  company?: Company | null;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const defaultStageId = [...stages].sort((a, b) => a.display_order - b.display_order)[0]?.id ?? "";
  const [form, setForm] = useState<FormState>(() => toFormState(company, defaultStageId));
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(company);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Company name is required");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: form.name.trim(),
      website: form.website.trim() || null,
      industry: form.industry.trim() || null,
      country: form.country.trim() || null,
      city: form.city.trim() || null,
      employee_count: form.employee_count.trim() || null,
      business_overview: form.business_overview.trim() || null,
      stage_id: form.stage_id || null,
      health_status: form.health_status,
      deal_value: form.deal_value ? Number(form.deal_value) : null,
      door_opener_id: form.door_opener_id || null,
    };

    let error;
    if (isEdit) {
      ({ error } = await supabase.from("companies").update(payload).eq("id", company!.id));
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      ({ error } = await supabase
        .from("companies")
        .insert({ ...payload, created_by: user?.id ?? null }));
    }

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(isEdit ? "Company updated" : "Company created");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit company" : "New company"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Update this company's details."
            : "Add a new company to the CRM."}
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
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={form.industry}
              onChange={(e) => update("industry", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employee_count">Employees</Label>
            <Input
              id="employee_count"
              value={form.employee_count}
              onChange={(e) => update("employee_count", e.target.value)}
              placeholder="e.g. 50-200"
            />
          </div>
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

        <div className="space-y-2">
          <Label>Door opener</Label>
          <Select
            value={form.door_opener_id || undefined}
            onValueChange={(value) => update("door_opener_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="No door opener" />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.full_name ?? "Unnamed"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="business_overview">Notes</Label>
          <Textarea
            id="business_overview"
            value={form.business_overview}
            onChange={(e) => update("business_overview", e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {isEdit ? "Save changes" : "Create company"}
        </Button>
      </DialogFooter>
    </form>
  );
}
