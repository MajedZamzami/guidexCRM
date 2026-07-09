"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Company } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

function toFormState(company?: Company | null) {
  return {
    name: company?.name ?? "",
    website: company?.website ?? "",
    industry: company?.industry ?? "",
    country: company?.country ?? "",
    city: company?.city ?? "",
    employee_count: company?.employee_count ?? "",
    business_overview: company?.business_overview ?? "",
  };
}

type FormState = ReturnType<typeof toFormState>;

export function CompanyDialog({
  open,
  onOpenChange,
  company,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && (
          <CompanyForm
            key={company?.id ?? "new"}
            company={company}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CompanyForm({
  company,
  onOpenChange,
}: {
  company?: Company | null;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(company));
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
    };

    const { error } = isEdit
      ? await supabase.from("companies").update(payload).eq("id", company!.id)
      : await supabase.from("companies").insert(payload);

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
            : "Add a new company to the CRM. It gets a default project you can track through the pipeline."}
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
