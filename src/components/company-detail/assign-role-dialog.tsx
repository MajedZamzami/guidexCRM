"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { CommitteeRole, Contact } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

const ROLES: { value: CommitteeRole; label: string }[] = [
  { value: "decision_maker", label: "Decision Maker" },
  { value: "budget_holder", label: "Budget Holder" },
  { value: "champion", label: "Champion" },
  { value: "blocker", label: "Blocker" },
  { value: "other", label: "Other" },
];

export function AssignRoleDialog({
  open,
  onOpenChange,
  projectId,
  contacts,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  contacts: Contact[];
}) {
  const router = useRouter();
  const [contactId, setContactId] = useState(contacts[0]?.id ?? "");
  const [role, setRole] = useState<CommitteeRole>("decision_maker");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contactId) {
      toast.error("Add a contact first");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("buying_committee_roles").insert({
      project_id: projectId,
      contact_id: contactId,
      role,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Role assigned");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assign role</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Contact</Label>
              <Select value={contactId || undefined} onValueChange={setContactId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as CommitteeRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || contacts.length === 0}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Assign role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
