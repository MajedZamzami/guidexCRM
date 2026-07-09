"use client";

import { useState } from "react";
import { Users, Plus } from "lucide-react";
import type { BuyingCommitteeRole, Contact } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssignRoleDialog } from "@/components/company-detail/assign-role-dialog";

type RoleWithContact = BuyingCommitteeRole & { contact: Contact | null };

const ROLE_LABELS: Record<string, string> = {
  decision_maker: "Decision Maker",
  budget_holder: "Budget Holder",
  champion: "Champion",
  blocker: "Blocker",
  other: "Other",
};

export function BuyingCommitteeCard({
  projectId,
  companyName,
  contacts,
  roles,
}: {
  projectId: string;
  companyName: string;
  contacts: Contact[];
  roles: RoleWithContact[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="size-4 text-primary" />
          Buying Committee ({roles.length})
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Assign Role
        </Button>
      </CardHeader>
      <CardContent>
        {roles.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No buying committee roles assigned yet
            </p>
            <p className="text-xs text-muted-foreground">
              Assign roles like Decision Maker, Champion, or Blocker to contacts linked to{" "}
              {companyName}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2"
              >
                <span className="text-sm font-medium">{role.contact?.name ?? "Unknown"}</span>
                <Badge variant="outline">{ROLE_LABELS[role.role] ?? role.role}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <AssignRoleDialog
        open={open}
        onOpenChange={setOpen}
        projectId={projectId}
        contacts={contacts}
      />
    </Card>
  );
}
